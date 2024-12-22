'use client'

import { SectionCard } from "@/components/section-card"
import { format } from 'date-fns'
import { useEffect, useState } from 'react'

type NewsletterContent = {
  publication_date: string;
  last_week: string;
  release_notes: string;
  fine_tuning: string;
  hallucination: string | null;
  alignment: string;
}

export default function Home() {
  const [content, setContent] = useState<NewsletterContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        setContent(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching content:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="font-serif text-4xl font-bold">Context Window</h1>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-[auto_1fr]">
          {/* Last Week Section */}
          <SectionCard 
            title="Last Week" 
            className="lg:col-span-3"
          >
            <div className="space-y-4">
              <h3 className="font-serif text-lg">What we published this week</h3>
              <div className="space-y-2 text-sm">
                {content?.last_week}
              </div>
            </div>
          </SectionCard>

          {/* Release Notes Section */}
          <SectionCard 
            title={content ? format(new Date(content.publication_date), "MMMM d, yyyy") : ""} 
            className="lg:col-span-6"
            scrollable
          >
            <div className="space-y-4">
              <div className="aspect-video w-full bg-gray-100"></div>
              <div className="space-y-2">
                {content?.release_notes}
              </div>
            </div>
          </SectionCard>

          {/* Fine Tuning Section */}
          <SectionCard 
            title="Fine Tuning" 
            className="lg:col-span-3"
          >
            <div className="space-y-2 text-sm">
              {content?.fine_tuning}
            </div>
          </SectionCard>

          {/* Hallucination Section */}
          <SectionCard 
            title="Hallucination" 
            className="lg:col-span-6"
          >
            <div className="aspect-video w-full bg-gray-100">
              {content?.hallucination && (
                <img 
                  src={content.hallucination} 
                  alt="Hallucination"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </SectionCard>

          {/* Alignment Section */}
          <SectionCard 
            title="Alignment" 
            className="lg:col-span-6"
          >
            <div className="text-sm text-muted-foreground">
              {content?.alignment}
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  )
}