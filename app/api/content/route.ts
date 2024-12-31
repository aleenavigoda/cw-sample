import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { newsletterIssues, columnContent } from '@/lib/schema';

/**
 * This route fetches:
 *  - newsletterIssue (but we won't display it in the UI)
 *  - columnContent
 * for a given ?issue=XXXX
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const issueParam = searchParams.get('issue');

  if (!issueParam) {
    return NextResponse.json(
      { error: 'Issue number is required' },
      { status: 400 }
    );
  }

  try {
    const issueNum = parseInt(issueParam);

    // 1) Fetch the newsletterIssue row, if needed
    // We won't display it, but we'll fetch it so the route remains flexible
    const issue = await db
      .select()
      .from(newsletterIssues)
      .where(eq(newsletterIssues.issueNumber, issueNum))
      .limit(1);

    // 2) Fetch the columnContent rows
    const content = await db
      .select()
      .from(columnContent)
      .where(eq(columnContent.issueNumber, issueNum));

    if (!issue || issue.length === 0) {
      return NextResponse.json(
        { error: `Newsletter issue ${issueNum} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      // We'll return it if you ever change your mind and want to display it
      newsletterIssue: issue[0],
      columnContent: content,
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
