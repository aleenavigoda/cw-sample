'use client'

import React, { useState, useRef, useEffect } from 'react';

export function FieldReportSection() {
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
      {/* Initial View with HED/DEK */}
      <div className="space-y-6">
        {/* Cover Image */}
        <img 
          src="/api/placeholder/800/400"
          alt="Cover"
          className="w-full aspect-[1.91/1] object-cover rounded-2xl"
        />
        
        {/* HED (Headline) */}
        <div className="space-y-4">
          <h1 className="font-serif text-2xl text-white">
            How to Win at AI and Influence People
          </h1>
          
          {/* DEK (Subheadline) */}
          <h2 className="text-sm text-slate-300">
            Plus: Introducing 'TLDR'
          </h2>
          
          {/* Date and social section */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>December 15, 2024</span>
            <div className="flex items-center gap-2">
              <span>11</span>
            </div>
          </div>
          
          {/* Editor's note */}
          <p className="text-sm text-slate-400 italic">
            Hello, and happy Sunday! Tech companies are racing toward the end of the year by seemingly 
            launching all of their AI products at once. (Merry Shipmas, I guess.) Between OpenAI, Google, 
            Meta, Anthropic, and others, at least 15 products were released last week along with major 
            updates to Google's NotebookLM and Apple's AI-powered operating system.
          </p>
        </div>
      </div>

      {/* Release Notes Section */}
      <div className="pt-8 space-y-6">
        <h2 className="font-serif text-2xl text-white">
          Release notes
        </h2>
        <h3 className="font-serif text-xl text-white">
          Google ships the future—with training wheels
        </h3>
        
        <div className="space-y-4">
          <p className="text-slate-300">
            If you blinked, you missed that Google is gaining on OpenAI—fast. This week brought 
            (a confusingly large number) of releases centered around Gemini 2.0, the company's 
            next-generation AI model.
          </p>
          <p className="text-slate-300">
            Flash 1.5 was faster and cheaper than Gemini 1.5 Pro but not as good on any 
            benchmarks. Now Gemini 2.0 Flash is better than 1.5 Pro by almost every metric:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li>Cheaper than 1.5 Pro</li>
            <li>Twice the speed of 1.5 Pro</li>
            <li>Significantly better performance across benchmarks than 1.5 Pro</li>
          </ul>
        </div>
      </div>
    </div>
  );
}