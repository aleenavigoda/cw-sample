'use client'

import { SectionCard } from "@/components/section-card"
import { FieldReportSection } from "@/components/field-report-section"
import { useEffect, useState } from "react"

interface ColumnContent {
  id: number;
  issue_number: number;
  section_name: string;
  preview_text: string | null;
  full_text: string;
}

interface NewsletterIssue {
  issue_number: number;
  publication_date: string;
  headline: string;
  subheadline: string;
  editors_note: string;
  cover_image: string;
}

function Page() {
  const [columnContent, setColumnContent] = useState<ColumnContent[]>([]);
  const [newsletterIssue, setNewsletterIssue] = useState<NewsletterIssue | null>(null);
  
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/content?issue=1222');
        const data = await response.json();
        
        if (response.ok) {
          console.log('Fetched content:', data);
          setColumnContent(data.columnContent);
          setNewsletterIssue(data.newsletterIssue);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };

    fetchContent();
  }, []);

  return (
    <main className="min-h-screen bg-[#f6f8fa] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(74,158,255,0.1),rgba(255,255,255,0))]">
      <div className="mx-auto max-w-7xl p-4 md:p-8 space-y-12">
        <header className="space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="font-serif text-4xl text-slate-900">Context Window</h1>
              <p className="text-xs uppercase tracking-wider text-[#4A9EFF]/70">
                Dispatches from the frontiers of AI
              </p>
            </div>
            <nav className="flex items-center gap-3 text-sm bg-white/50 backdrop-blur-sm px-4 py-2 rounded-2xl border border-slate-200/50">
              <div className="w-2 h-2 rounded-full bg-[#4A9EFF]/30"/>
              <span className="text-slate-600">Issue 1222</span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-600">December 2024</span>
            </nav>
          </div>
        </header>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-12">
          {/* Knowledge Base Section */}
          <SectionCard 
            title="Knowledge Base" 
            className="lg:col-span-3"
            category="New in Every"
            author="our writers"
            colorAccent="rgb(168, 85, 247)"
          >
            <div className="space-y-8">
              {columnContent
                .find(content => content.section_name === 'Knowledge Base' && content.preview_text)
                ?.preview_text && (
                  <div 
                    className="space-y-2"
                    dangerouslySetInnerHTML={{ 
                      __html: columnContent.find(c => c.section_name === 'Knowledge Base')?.preview_text || ''
                    }}
                  />
                )}
            </div>
          </SectionCard>

          {newsletterIssue && (
            <SectionCard 
              className="lg:col-span-6"
              category="Field Report"
              colorAccent="rgb(34, 197, 94)"
              scrollable
            >
              <FieldReportSection 
                issue={newsletterIssue}
                releaseNotes={columnContent.find(c => c.section_name === 'Release Notes')}
              />
            </SectionCard>
          )}

          <SectionCard 
            title="Fine Tuning"
            className="lg:col-span-3"
            category="Market Signals"
            colorAccent="rgb(234, 179, 8)"
          >
            <div className="space-y-6">
              {columnContent
                .filter(content => content.section_name === 'Fine Tuning')
                .map(content => (
                  <div 
                    key={content.id}
                    className="space-y-2"
                    dangerouslySetInnerHTML={{ __html: content.preview_text || '' }}
                  />
                ))}
            </div>
          </SectionCard>

          <SectionCard 
            title="Hallucination"
            className="lg:col-span-6"
            category="Imagine"
            colorAccent="rgb(244, 63, 94)"
          >
            <div className="space-y-4">
              {columnContent
                .filter(content => content.section_name === 'Hallucination')
                .map(content => (
                  <img 
                    key={content.id}
                    src={content.full_text}
                    alt="Hallucination"
                    className="w-full aspect-[1.91/1] object-cover rounded-2xl"
                  />
                ))}
            </div>
          </SectionCard>

          <SectionCard 
            title="Alignment"
            className="lg:col-span-6"
            category="Refresh"
            colorAccent="rgb(74, 158, 255)"
            scrollable
          >
            <div className="prose prose-invert prose-sm max-w-none">
              {columnContent
                .filter(content => content.section_name === 'Alignment')
                .map(content => (
                  <div 
                    key={content.id}
                    dangerouslySetInnerHTML={{ __html: content.full_text }}
                  />
                ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  )
}

export default Page