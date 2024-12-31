'use client'

import React, { useState, useRef, useEffect } from 'react';

interface FieldReportProps {
  issue: {
    headline: string;
    subheadline: string;
    publication_date: string;
    editors_note: string;
    cover_image: string;
  };
  releaseNotes?: {
    full_text: string;
  };
}

export function FieldReportSection({ issue, releaseNotes }: FieldReportProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = (event: Event) => {
      if (!contentRef.current) return;
      const scrollTop = contentRef.current.scrollTop;
      const threshold = 200;
      setIsScrolled(scrollTop > threshold);
      
      // Find the parent header and control its visibility
      const sectionCard = contentRef.current.closest('.group');
      if (sectionCard) {
        const header = sectionCard.querySelector('[data-header]');
        if (header) {
          header.classList.toggle('opacity-0', !isScrolled);
        }
      }
    };

    const element = contentRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, [isScrolled]);

  return (
    <div 
      ref={contentRef}
      className="relative h-full overflow-y-auto"
    >
      <div className="space-y-6">
        <img 
          src={issue.cover_image}
          alt="Cover"
          className="w-full aspect-[1.91/1] object-cover rounded-2xl"
        />
        
        <div className="space-y-4">
          <h1 className="font-serif text-2xl text-white">
            {issue.headline}
          </h1>
          
          <h2 className="text-sm text-slate-300">
            {issue.subheadline}
          </h2>
          
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>{issue.publication_date}</span>
          </div>
          
          <div 
            className="text-sm text-slate-400 italic"
            dangerouslySetInnerHTML={{ __html: issue.editors_note }}
          />
        </div>

        {releaseNotes && (
          <div className="pt-8 space-y-6">
            <h2 className="font-serif text-2xl text-white mb-6">
              Release notes
            </h2>
            <div dangerouslySetInnerHTML={{ __html: releaseNotes.full_text }} />
          </div>
        )}
      </div>
    </div>
  );
}