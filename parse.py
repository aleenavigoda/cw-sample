from newsletter_parser2 import NewsletterParser

DB_URL = "postgresql://neondb_owner:Nw1CRabkmK0S@ep-misty-tree-a6j247my.us-west-2.aws.neon.tech/neondb?sslmode=require"

parser = NewsletterParser(DB_URL)
try:
    parser.parse_file("/Users/aleenavigoda/Downloads/1215.html")
except Exception as e:
    print(f"Error: {str(e)}")
finally:
    parser.close()
