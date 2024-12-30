from bs4 import BeautifulSoup
import re

def test_knowledge_base_parsing(html_file):
    """Test parser for Knowledge Base section only."""
    print("Starting Knowledge Base extraction test...")
    
    # Read HTML file
    with open(html_file, 'r', encoding='utf-8') as file:
        content = file.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # Find the Knowledge Base section
    kb_section = soup.find(['h2', 'strong'], string=re.compile('Knowledge base', re.I))
    if not kb_section:
        print("Could not find Knowledge Base section")
        return
    
    print("Found Knowledge Base section, looking for articles...")
    
    # Get all content until next section
    kb_articles = []
    current_section = kb_section.find_parent()
    end_markers = ['Fine tuning', 'Release notes']
    
    while current_section:
        # Stop if we hit the next section
        if any(marker in current_section.text for marker in end_markers):
            break
            
        # Look for article links within this section
        article_links = current_section.find_all('a', href=True)
        
        for link in article_links:
            # Only process links that look like article links
            if '/p/' in link['href'] or 'every.to' in link['href']:
                # Get parent paragraph for full context
                parent_p = link.find_parent('p')
                if not parent_p:
                    continue
                
                # Find author (usually in em/italic tag after "by")
                author_span = parent_p.find(['em', 'span'], string=re.compile('by', re.I))
                
                title = link.text.strip().strip('"')
                author = author_span.text.replace('by', '').strip() if author_span else None
                url = link['href']
                summary = parent_p.text.strip()
                
                if title and author:
                    print("\nFound article:")
                    print(f"Title: {title}")
                    print(f"Author: {author}")
                    print(f"URL: {url}")
                    print(f"Summary: {summary[:100]}...")
                    
                    kb_articles.append({
                        'title': title,
                        'author': author,
                        'summary': summary,
                        'preview_text': title,
                        'full_text': summary,
                        'url': url,
                    })
        
        current_section = current_section.find_next_sibling()
    
    print(f"\nTotal articles found: {len(kb_articles)}")
    return kb_articles

# Test the parser
if __name__ == "__main__":
    file_path = "/Users/aleenavigoda/Downloads/1222.html"  # Update with your file path
    articles = test_knowledge_base_parsing(file_path)