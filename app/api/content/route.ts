import { db } from '@/lib/db';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { pgTable, serial, integer, text, varchar } from 'drizzle-orm/pg-core';

// Schema definitions
const newsletterIssues = pgTable('newsletter_issues', {
  issueNumber: integer('issue_number').primaryKey(),
  publicationDate: varchar('publication_date'),
  headline: text('headline'),
  subheadline: text('subheadline'),
  editorsNote: text('editors_note'),
  coverImage: text('cover_image')
});

const columnContent = pgTable('column_content', {
  id: serial('id').primaryKey(),
  issueNumber: integer('issue_number'),
  sectionName: varchar('section_name'),
  previewText: text('preview_text'),
  fullText: text('full_text')
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const issueNumber = searchParams.get('issue');

  if (!issueNumber) {
    return NextResponse.json({ error: 'Issue number is required' }, { status: 400 });
  }

  try {
    const issueNum = parseInt(issueNumber);

    // Fetch newsletter issue
    const issue = await db
      .select()
      .from(newsletterIssues)
      .where(eq(newsletterIssues.issueNumber, issueNum))
      .limit(1);

    // Fetch column content
    const content = await db
      .select()
      .from(columnContent)
      .where(eq(columnContent.issueNumber, issueNum));

    if (!issue || issue.length === 0) {
      return NextResponse.json(
        { error: 'Newsletter issue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      newsletterIssue: issue[0],
      columnContent: content
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}