import os
from datetime import datetime
from bs4 import BeautifulSoup
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Optional
import re

class NewsletterParser:
    def __init__(self, db_url: str):
        """Initialize database connection."""
        self.conn = psycopg2.connect(db_url)
        self.cursor = self.conn.cursor(cursor_factory=RealDictCursor)

    def parse_file(self, filepath: str) -> None:
        """Parse HTML file and insert everything into DB."""
        try:
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()

            soup = BeautifulSoup(content, 'html.parser')

            # Insert row into newsletter_issues
            issue_data = {
                'issue_number': 1,   # or dynamically set
                'publication_date': datetime.now(),
                'headline': self._get_headline(soup),
                'subheadline': self._get_subheadline(soup),
                'editors_note': self._get_editors_note(soup),
            }
            issue_id = self._insert_issue(issue_data)

            # Parse sections
            self._parse_knowledge_base(soup, issue_id)
            self._parse_fine_tuning(soup, issue_id)
            self._parse_release_notes(soup, issue_id)
            self._parse_hallucination(soup, issue_id)
            self._parse_alignment(soup, issue_id)

            self.conn.commit()
            print(f"Successfully parsed {filepath}")

        except Exception as e:
            self.conn.rollback()
            print(f"Error parsing newsletter: {str(e)}")
            raise

    # --------------------------------------------------------------------------
    # Utility functions
    # --------------------------------------------------------------------------
    def _get_headline(self, soup: BeautifulSoup) -> str:
        """Extract the main headline from <h1> or <title> as fallback."""
        h1 = soup.find('h1', {'class': 'handwriting'})
        if h1:
            return h1.get_text(strip=True)
        title_tag = soup.find('title')
        return title_tag.get_text(strip=True) if title_tag else "Untitled"

    def _get_subheadline(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract subheadline from <p class='subtitle'> or <meta>."""
        sub_p = soup.find('p', {'class': 'subtitle'})
        if sub_p:
            return sub_p.get_text(strip=True)
        meta_desc = soup.find('meta', attrs={'name':'description'})
        return meta_desc['content'].strip() if meta_desc and meta_desc.get('content') else None

    def _get_editors_note(self, soup: BeautifulSoup) -> str:
        """Heuristic to find an editor's note."""
        # Example: find <p> that starts with "Hello, and happy Sunday"
        maybe = soup.find('p', string=re.compile(r'^hello, and happy sunday', re.IGNORECASE))
        return maybe.get_text(strip=True) if maybe else ""

    def _insert_issue(self, data: Dict) -> int:
        """Insert into 'newsletter_issues' and return new ID."""
        q = """
        INSERT INTO newsletter_issues
        (issue_number, publication_date, headline, subheadline, editors_note)
        VALUES
        (%(issue_number)s, %(publication_date)s, %(headline)s, %(subheadline)s, %(editors_note)s)
        RETURNING id;
        """
        self.cursor.execute(q, data)
        return self.cursor.fetchone()['id']

    def _insert_entry(self,
                      issue_id: int,
                      section_type: str,
                      title: Optional[str]=None,
                      author: Optional[str]=None,
                      preview_text: Optional[str]=None,
                      full_text: Optional[str]=None,
                      url: Optional[str]=None,
                      display_order: int=1):
        """Insert a row into 'newsletter_entries' with the given fields."""
        q = """
        INSERT INTO newsletter_entries
        (issue_id, section_type, title, author, preview_text, full_text, url, display_order)
        VALUES
        (%(issue_id)s, %(section_type)s, %(title)s, %(author)s, 
         %(preview_text)s, %(full_text)s, %(url)s, %(display_order)s);
        """
        params = {
            'issue_id': issue_id,
            'section_type': section_type,
            'title': title,
            'author': author,
            'preview_text': preview_text,
            'full_text': full_text,
            'url': url,
            'display_order': display_order
        }
        self.cursor.execute(q, params)

    # --------------------------------------------------------------------------
    # Knowledge Base
    # --------------------------------------------------------------------------
    def _parse_knowledge_base(self, soup: BeautifulSoup, issue_id: int) -> None:
        """
        For each 'article':
          - preview_text => e.g. "“How to Be More Agentic” by Cate Hall"
          - full_text => entire <p> in HTML
        """
        kb_heading = soup.find(['h2', 'strong'], string=re.compile('Knowledge base', re.I))
        if not kb_heading:
            return

        display_order = 1
        current = kb_heading.find_next_sibling()

        while current:
            # Stop if next heading is found
            if current.find(['h2', 'strong'], 
                            string=re.compile('(Fine tuning|Release notes|Hallucination|Alignment)', re.I)):
                break

            if current.name == 'p':
                # The entire paragraph HTML as full_text:
                full_paragraph_html = str(current)

                # Then we find a <strong> that might contain the article title
                # Example HTML snippet:
                # <p><a ...><strong>“How to Be More Agentic”</strong></a> <em>by </em><strong><em>Cate Hall</em></strong>:
                # ...
                # We'll do a simple approach:
                link_strongs = current.find_all('strong')
                if link_strongs:
                    # We assume first <strong> is the article title in quotes
                    # and possibly the second <strong> is the author name. 
                    # But the HTML snippet has <em>by</em> in between.
                    # We'll parse it as we go:
                    # We'll also look for " by ... " in the text
                    # or we can do a simpler approach: we see if there's a <strong><em> inside
                    # that might be the author. 

                    # We'll find the anchor with <strong> text
                    a_tags = current.find_all('a')
                    # We only parse each link that has <strong> text
                    for a_tag in a_tags:
                        # Title
                        strong_inside_link = a_tag.find('strong')
                        if strong_inside_link:
                            title_text = strong_inside_link.get_text(strip=True)
                        else:
                            title_text = a_tag.get_text(strip=True)

                        # Now find an <em> that says "by" 
                        # then next <strong><em> might have the actual name:
                        # Or we can do a simpler approach with regex on the entire paragraph text:
                        paragraph_text = current.get_text(" ", strip=True)
                        # e.g. “How to Be More Agentic” by Cate Hall:
                        author_match = re.search(r'\bby\s+([^:]+)', paragraph_text, re.IGNORECASE)
                        if author_match:
                            author_text = author_match.group(1).strip()
                        else:
                            author_text = "Unknown"

                        # preview_text => e.g. "“How to Be More Agentic” by Cate Hall"
                        preview = f'{title_text} by {author_text}'

                        # Insert entry
                        self._insert_entry(
                            issue_id=issue_id,
                            section_type='knowledge_base',
                            title=title_text,
                            author=author_text,
                            preview_text=preview,
                            full_text=full_paragraph_html,  # entire paragraph w/ HTML
                            url=a_tag.get('href', ''),
                            display_order=display_order
                        )
                        display_order += 1

            current = current.find_next_sibling()

    # --------------------------------------------------------------------------
    # Fine Tuning
    # --------------------------------------------------------------------------
    def _parse_fine_tuning(self, soup: BeautifulSoup, issue_id: int) -> None:
        """
        For each bullet:
          - preview_text => bolded <strong> snippet
          - full_text => entire <p> in HTML
        """
        ft_heading = soup.find(['h2', 'strong'], string=re.compile('Fine tuning', re.I))
        if not ft_heading:
            return

        display_order = 1
        current = ft_heading.find_next_sibling()

        while current:
            # stop if next heading
            if current.find(['h2', 'strong'], 
                            string=re.compile('(Release notes|Hallucination|Alignment|Knowledge base)', re.I)):
                break

            if current.name == 'p':
                full_paragraph_html = str(current)

                # Find <strong> tags for the "preview"
                strong_tags = current.find_all('strong')
                if strong_tags:
                    for st in strong_tags:
                        snippet = st.get_text(strip=True)

                        # Insert
                        self._insert_entry(
                            issue_id=issue_id,
                            section_type='fine_tuning',
                            preview_text=snippet,   # bold snippet
                            full_text=full_paragraph_html,  # entire paragraph in HTML
                            display_order=display_order
                        )
                        display_order += 1

            current = current.find_next_sibling()

    # --------------------------------------------------------------------------
    # Release Notes (optional simple approach)
    # --------------------------------------------------------------------------
    def _parse_release_notes(self, soup: BeautifulSoup, issue_id: int) -> None:
        rn_heading = soup.find(['h2', 'strong'], string=re.compile('Release notes', re.I))
        if not rn_heading:
            return

        content_html_fragments = []
        current = rn_heading.find_next_sibling()

        while current:
            if current.find(['h2', 'strong'], 
                            string=re.compile('(Hallucination|Alignment|Fine tuning|Knowledge base)', re.I)):
                break
            content_html_fragments.append(str(current))
            current = current.find_next_sibling()

        if content_html_fragments:
            full_section_html = "\n".join(content_html_fragments)
            # preview_text is optional; 
            self._insert_entry(
                issue_id=issue_id,
                section_type='release_notes',
                preview_text="Release Notes",
                full_text=full_section_html,
                display_order=1
            )

    # --------------------------------------------------------------------------
    # Hallucination (optional simple approach)
    # --------------------------------------------------------------------------
    def _parse_hallucination(self, soup: BeautifulSoup, issue_id: int) -> None:
        h_heading = soup.find(['h2', 'strong'], string=re.compile('Hallucination', re.I))
        if not h_heading:
            return

        content_html_fragments = []
        current = h_heading.find_next_sibling()
        while current:
            if current.find(['h2', 'strong'], 
                            string=re.compile('(Alignment|Release notes|Fine tuning|Knowledge base)', re.I)):
                break
            content_html_fragments.append(str(current))
            current = current.find_next_sibling()

        if content_html_fragments:
            full_section_html = "\n".join(content_html_fragments)
            self._insert_entry(
                issue_id=issue_id,
                section_type='hallucination',
                preview_text="Hallucination",
                full_text=full_section_html,
                display_order=1
            )

    # --------------------------------------------------------------------------
    # Alignment (optional simple approach)
    # --------------------------------------------------------------------------
    def _parse_alignment(self, soup: BeautifulSoup, issue_id: int) -> None:
        a_heading = soup.find(['h2', 'strong'], string=re.compile('Alignment', re.I))
        if not a_heading:
            return

        content_html_fragments = []
        current = a_heading.find_next_sibling()
        while current:
            if current.name == 'hr' or current.find(['h2', 'strong'], 
                                                   string=re.compile('(Hallucination|Release notes|Fine tuning|Knowledge base)', re.I)):
                break
            content_html_fragments.append(str(current))
            current = current.find_next_sibling()

        if content_html_fragments:
            full_section_html = "\n".join(content_html_fragments)
            self._insert_entry(
                issue_id=issue_id,
                section_type='alignment',
                preview_text="Alignment",
                full_text=full_section_html,
                display_order=1
            )

    def close(self):
        """Close the DB connection."""
        self.cursor.close()
        self.conn.close()
