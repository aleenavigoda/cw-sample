import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await db.execute(
      'SELECT * FROM newsletter_content ORDER BY publication_date DESC LIMIT 1'
    );
    
    // Type check the result rows
    if (!Array.isArray(result.rows) || result.rows.length === 0) {
      return NextResponse.json(
        { error: 'No content found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' }, 
      { status: 500 }
    );
  }
}