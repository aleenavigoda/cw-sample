'use client'

import React, { useState, useEffect } from 'react';
import { SectionCard } from './section-card';

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

interface ContentProviderProps {
  currentIssue: number;
}

export function ContentProvider({ currentIssue }: ContentProviderProps) {
  const [columnContent, setColumnContent] = useState<ColumnContent[]>([]);
  const [newsletterIssue, setNewsletterIssue] = useState<NewsletterIssue | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/content?issue=${currentIssue}`);
        const data = await response.json();
        
        if (response.ok) {
          setColumnContent(data.columnContent);
          setNewsletterIssue(data.newsletterIssue);
        } else {
          console.error('Failed to fetch content:', data.error);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [currentIssue]);

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-12">
      {/* Knowledge Base Section */}
      <SectionCard 
        title="Knowledge Base"
        className="lg:col-span-3"
        category="New in Every"
        author="our writers"
        colorAccent="rgb(168, 85, 247)"
        scrollable
      >
        <div className="space-y-8">
          {columnContent
            .filter(content => content.section_name === 'Knowledge Base' && content.issue_number === currentIssue)
            .map((content) => (
              <div 
                key={content.id} 
                className="space-y-2"
                dangerouslySetInnerHTML={{ __html: content.preview_text || '' }}
              />
            ))}
        </div>
      </SectionCard>

      {/* Field Report Section */}
      <SectionCard 
        className="lg:col-span-6"
        category="Field Report"
        colorAccent="rgb(34, 197, 94)"
        scrollable
      >
        {newsletterIssue && (
          <div className="space-y-8">
            <img 
              src={newsletterIssue.cover_image}
              alt="Cover"
              className="w-full aspect-[1.91/1] object-cover rounded-2xl"
            />
            
            <div className="space-y-4">
              <h1 className="font-serif text-2xl text-white">
                {newsletterIssue.headline}
              </h1>
              
              <h2 className="text-sm text-slate-300">
                {newsletterIssue.subheadline}
              </h2>
              
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>{newsletterIssue.publication_date}</span>
              </div>
              
              <div 
                className="text-sm text-slate-400 italic"
                dangerouslySetInnerHTML={{ __html: newsletterIssue.editors_note }}
              />
            </div>

            {/* Release Notes Section */}
            <div className="pt-8 space-y-6">
              {columnContent
                .filter(content => content.section_name === 'Release Notes')
                .map((content) => (
                  <div key={content.id}>
                    <h2 className="font-serif text-2xl text-white mb-6">
                      Release notes
                    </h2>
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: content.full_text 
                      }} 
                    />
                  </div>
                ))}
            </div>
          </div>
        )}
      </SectionCard>

      {/* Fine Tuning Section */}
      <SectionCard 
        title="Fine Tuning"
        className="lg:col-span-3"
        category="Market Signals"
        colorAccent="rgb(234, 179, 8)"
        scrollable
        onMaximize={() => toggleSection('Fine Tuning')}
      >
        <div className="space-y-6">
          {columnContent
            .filter(content => content.section_name === 'Fine Tuning')
            .map((content) => (
              <div key={content.id} className="space-y-2">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: expandedSections['Fine Tuning'] ? content.full_text : (content.preview_text || content.full_text)
                  }} 
                />
              </div>
            ))}
        </div>
      </SectionCard>

      {/* Hallucination Section */}
      <SectionCard 
        title="Hallucination"
        className="lg:col-span-6"
        category="Imagine"
        colorAccent="rgb(244, 63, 94)"
        scrollable
        onMaximize={() => toggleSection('Hallucination')}
      >
        <div className="space-y-4">
          {columnContent
            .filter(content => content.section_name === 'Hallucination')
            .map((content) => (
              <div key={content.id}>
                <img 
                  src={content.full_text} 
                  alt="Hallucination"
                  className="w-full aspect-[1.91/1] object-cover rounded-2xl"
                />
              </div>
            ))}
        </div>
      </SectionCard>

      {/* Alignment Section */}
      <SectionCard 
        title="Alignment"
        className="lg:col-span-6"
        category="Refresh"
        colorAccent="rgb(74, 158, 255)"
        scrollable
        onMaximize={() => toggleSection('Alignment')}
      >
        <div className="prose prose-invert prose-sm max-w-none">
          {columnContent
            .filter(content => content.section_name === 'Alignment')
            .map((content) => (
              <div key={content.id}>
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: expandedSections['Alignment'] ? content.full_text : (content.preview_text || content.full_text)
                  }} 
                />
              </div>
            ))}
        </div>
      </SectionCard>
    </div>
  );
}