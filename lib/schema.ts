import { pgTable, serial, integer, text, varchar, timestamp } from 'drizzle-orm/pg-core';

export const newsletterIssues = pgTable('newsletter_issues', {
  issueNumber: integer('issue_number').primaryKey(),
  publicationDate: varchar('publication_date'),
  headline: text('headline'),
  subheadline: text('subheadline'),
  editorsNote: text('editors_note'),
  coverImage: text('cover_image')
});

export const columnContent = pgTable('column_content', {
  id: serial('id').primaryKey(),
  issueNumber: integer('issue_number').references(() => newsletterIssues.issueNumber),
  sectionName: varchar('section_name'),
  previewText: text('preview_text'),
  fullText: text('full_text')
});