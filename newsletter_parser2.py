import os
from datetime import datetime
import re
import psycopg2
from psycopg2.extras import RealDictCursor
from bs4 import BeautifulSoup

class NewsletterParser:
    def __init__(self, db_url: str):
        """Initialize database connection."""
        self.conn = psycopg2.connect(db_url)
        self.cursor = self.conn.cursor(cursor_factory=RealDictCursor)

    def parse_file(self, filepath: str) -> None:
        """
        1) Derive 'issue_number' from filename (like "1215.html" => 1215).
        2) Insert one row in 'newsletter_issues' for that number.
        3) Parse 'Knowledge Base', 'Fine Tuning', 'Release Notes', 'Alignment'
           as single-row sections in 'column_content'.
        4) Skip hallucination.
        """
        try:
            # e.g. "1215.html" => "1215" => 1215
            base = os.path.basename(filepath)
            name_no_ext = os.path.splitext(base)[0]
            issue_number = int(name_no_ext)

            # Read the HTML
            with open(filepath, 'r', encoding='utf-8') as f:
                html_content = f.read()

            soup = BeautifulSoup(html_content, 'html.parser')

            # Insert row in newsletter_issues
            self._insert_newsletter_issue(issue_number, soup)

            # Parse each section
            self._parse_knowledge_base(soup, issue_number)
            self._parse_fine_tuning(soup, issue_number)
            self._parse_release_notes(soup, issue_number)
            self._parse_alignment(soup, issue_number)
            # skipping hallucination on purpose

            self.conn.commit()
            print(f"Successfully parsed {filepath} for issue #{issue_number}")

        except Exception as e:
            self.conn.rollback()
            print(f"Error parsing newsletter: {e}")
            raise

    # --------------------------------------------------------------------------
    # 1) Insert newsletter_issues row
    # --------------------------------------------------------------------------
    def _insert_newsletter_issue(self, issue_number: int, soup: BeautifulSoup) -> None:
        """
        Insert into 'newsletter_issues':
          (issue_number, publication_date, headline, subheadline, editors_note)
        """
        # Example: might read <meta property="article:published_time">
        # but let's default to now
        pub_date = datetime.now()
        headline = self._get_headline(soup)
        subheadline = self._get_subheadline(soup)
        editors_note = self._get_editors_note(soup)

        query = """
        INSERT INTO newsletter_issues
        (issue_number, publication_date, headline, subheadline, editors_note)
        VALUES (%s, %s, %s, %s, %s)
        """
        self.cursor.execute(query, (issue_number, pub_date, headline, subheadline, editors_note))

    def _get_headline(self, soup: BeautifulSoup) -> str:
        """
        1) If <h1 class='handwriting'> is found, use that.
        2) Else if <title> is found, use that.
        3) Else 'Untitled'
        """
        h1 = soup.find('h1', class_='handwriting')
        if h1:
            return h1.get_text(strip=True)

        title_tag = soup.find('title')
        if title_tag:
            return title_tag.get_text(strip=True)

        return "Untitled"

    def _get_subheadline(self, soup: BeautifulSoup) -> str:
        """
        1) If <p class='subtitle'> is found, use that.
        2) Else if <meta name='description'>, use that.
        3) Else empty string
        """
        sub_p = soup.find('p', class_='subtitle')
        if sub_p:
            return sub_p.get_text(strip=True)

        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc and meta_desc.get('content'):
            return meta_desc['content'].strip()

        return ""

    def _get_editors_note(self, soup: BeautifulSoup) -> str:
        """
        1) Find a <p> whose text includes 'hello, and happy sunday' ignoring case
        2) If found, return the stripped text
        3) Else ''
        """
        maybe = soup.find('p', text=re.compile(r"hello, and happy sunday", re.IGNORECASE))
        if maybe:
            return maybe.get_text(strip=True)
        return ""

    # --------------------------------------------------------------------------
    # 2) Insert into column_content
    # --------------------------------------------------------------------------
    def _insert_column_content(self, issue_number: int, section_name: str,
                               preview_text: str, full_text: str) -> None:
        """
        Insert exactly one row for that section into 'column_content'.
        """
        q = """
        INSERT INTO column_content
        (issue_number, section_name, preview_text, full_text)
        VALUES (%s, %s, %s, %s)
        """
        self.cursor.execute(q, (issue_number, section_name, preview_text, full_text))

    # --------------------------------------------------------------------------
    # 3) Knowledge Base
    # --------------------------------------------------------------------------
    def _parse_knowledge_base(self, soup: BeautifulSoup, issue_number: int) -> None:
        """
        We search for an <h2> containing 'Knowledge base' ignoring case.
        Then gather all <p> until next heading. 
        Insert one row into column_content with preview/full_text = aggregated <p>.
        """
        kb_heading = self._find_h2_with_text(soup, r"knowledge base")
        if not kb_heading:
            return

        preview_list = []
        full_list = []

        current = kb_heading.find_next_sibling()
        while current:
            # If next heading is found, we break
            if self._is_new_section_heading(current, r"(Fine[\-\s]?tuning|Release notes|Alignment|Hallucination)"):
                break

            if current.name == 'p':
                # store entire paragraph as HTML
                preview_list.append(str(current))
                full_list.append(str(current))

            current = current.find_next_sibling()

        if preview_list:
            combined_preview = "  ".join(preview_list)
            combined_full = "".join(full_list)

            self._insert_column_content(issue_number, "Knowledge Base",
                                        combined_preview, combined_full)

    # --------------------------------------------------------------------------
    # 4) Fine Tuning
    # --------------------------------------------------------------------------
    def _parse_fine_tuning(self, soup: BeautifulSoup, issue_number: int) -> None:
        """
        Same approach: find <h2> with "Fine tuning" or "Fine-tuning",
        gather all <p> until next heading, then one row in column_content.
        """
        ft_heading = self._find_h2_with_text(soup, r"fine[\-\s]?tuning")
        if not ft_heading:
            return

        preview_list = []
        full_list = []

        current = ft_heading.find_next_sibling()
        while current:
            if self._is_new_section_heading(current, r"(Release notes|Alignment|Knowledge base|Hallucination)"):
                break

            if current.name == 'p':
                preview_list.append(str(current))
                full_list.append(str(current))

            current = current.find_next_sibling()

        if preview_list:
            combined_preview = "  ".join(preview_list)
            combined_full = "".join(full_list)

            self._insert_column_content(issue_number, "Fine Tuning",
                                        combined_preview, combined_full)

    # --------------------------------------------------------------------------
    # 5) Release Notes
    # --------------------------------------------------------------------------
    def _parse_release_notes(self, soup: BeautifulSoup, issue_number: int) -> None:
        rn_heading = self._find_h2_with_text(soup, r"release notes")
        if not rn_heading:
            return

        content_list = []
        current = rn_heading.find_next_sibling()
        while current:
            if self._is_new_section_heading(current, r"(Alignment|Fine[\-\s]?tuning|Knowledge base|Hallucination)"):
                break
            content_list.append(str(current))
            current = current.find_next_sibling()

        if content_list:
            big_html = "".join(content_list)
            # We'll store 'preview_text' as None and 'full_text' as entire HTML
            self._insert_column_content(issue_number, "Release Notes",
                                        preview_text=None,
                                        full_text=big_html)

    # --------------------------------------------------------------------------
    # 6) Alignment
    # --------------------------------------------------------------------------
    def _parse_alignment(self, soup: BeautifulSoup, issue_number: int) -> None:
        align_heading = self._find_h2_with_text(soup, r"alignment")
        if not align_heading:
            return

        content_list = []
        current = align_heading.find_next_sibling()
        while current:
            # if we see an <hr> or new heading, break
            if current.name == 'hr' or self._is_new_section_heading(current, r"(Release notes|Fine[\-\s]?tuning|Knowledge base|Hallucination)"):
                break
            content_list.append(str(current))
            current = current.find_next_sibling()

        if content_list:
            big_html = "".join(content_list)
            self._insert_column_content(issue_number, "Alignment", None, big_html)

    # --------------------------------------------------------------------------
    # Utility: find <h2> with text
    # --------------------------------------------------------------------------
    def _find_h2_with_text(self, soup: BeautifulSoup, pattern: str):
        """
        We'll gather all <h2> tags, call get_text(" ", strip=True), 
        and do a re.search(..., ignorecase).
        E.g. if <h2><hr class="something">Knowledge base</h2>, we'll 
        get "Knowledge base" as text.
        """
        all_h2 = soup.find_all("h2")
        for h2 in all_h2:
            text_content = h2.get_text(" ", strip=True)
            if re.search(pattern, text_content, re.IGNORECASE):
                return h2
        return None

    def _is_new_section_heading(self, node, pattern: str) -> bool:
        """
        Check if this node or its children contain a heading 
        that matches 'pattern' (like "Fine Tuning", "Release notes", etc.).
        """
        # We search inside node for <h2> or <strong> with that text
        if node.find(["h2", "strong"], string=re.compile(pattern, re.IGNORECASE)):
            return True
        return False

    def close(self):
        """Close DB connection."""
        self.cursor.close()
        self.conn.close()
