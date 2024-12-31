"use client";

import React, { useState, useEffect } from "react";
import { SectionCard } from "./section-card";

/**
 * Types for your DB rows
 */
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

/**
 * We define each known section_name from your DB and how 
 * to display it in the UI. (title, category, colorAccent, etc.)
 */
const sectionNameMap = {
  "Knowledge Base": {
    cardTitle: "Knowledge Base",
    category: "New in Every",
    colorAccent: "rgb(168, 85, 247)",
    className: "lg:col-span-3",
    renderMode: "html" as const,
  },
  "Release Notes": {
    cardTitle: "Release Notes",
    category: "Field Report",
    colorAccent: "rgb(34, 197, 94)",
    className: "lg:col-span-6",
    renderMode: "html" as const,
  },
  "Fine Tuning": {
    cardTitle: "Fine Tuning",
    category: "Market Signals",
    colorAccent: "rgb(234, 179, 8)",
    className: "lg:col-span-3",
    renderMode: "html" as const,
  },
  "Hallucination": {
    cardTitle: "Hallucination",
    category: "Imagine",
    colorAccent: "rgb(244, 63, 94)",
    className: "lg:col-span-6",
    renderMode: "image" as const,
  },
  "Alignment": {
    cardTitle: "Alignment",
    category: "Refresh",
    colorAccent: "rgb(74, 158, 255)",
    className: "lg:col-span-6",
    renderMode: "html" as const,
  },
} as const;

type SectionName = keyof typeof sectionNameMap;

interface ContentProviderProps {
  currentIssue: number;
}

export function ContentProvider({ currentIssue }: ContentProviderProps) {
  // We'll fetch data from /api/content?issue=...
  const [columnContent, setColumnContent] = useState<ColumnContent[]>([]);
  // We'll fetch but ignore the newsletterIssue for now
  // (we do not display headline/subheadline anywhere)
  const [newsletterIssue, setNewsletterIssue] = useState<NewsletterIssue | null>(null);

  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/content?issue=${currentIssue}`);
        const data = await response.json();
        
        if (response.ok) {
          // We store them, but do not actually display the newsletterIssue 
          setColumnContent(data.columnContent || []);
          setNewsletterIssue(data.newsletterIssue || null);
        } else {
          console.error("Failed to fetch content:", data.error);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [currentIssue]);

  // Toggles preview vs. full text for each section
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  /**
   * We'll map over the keys in sectionNameMap and see if there's 
   * any columnContent for that section. If so, display a card.
   */
  const orderedSections: SectionName[] = [
    "Knowledge Base",
    "Release Notes",
    "Fine Tuning",
    "Hallucination",
    "Alignment",
  ];

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-12">
      {orderedSections.map((sectionName) => {
        const config = sectionNameMap[sectionName];
        if (!config) return null;

        // All rows for this section
        const rows = columnContent.filter(
          (c) => c.section_name === sectionName && c.issue_number === currentIssue
        );
        if (rows.length === 0) {
          return null;
        }

        return (
          <SectionCard
            key={sectionName}
            title={config.cardTitle}
            category={config.category}
            colorAccent={config.colorAccent}
            className={config.className}
            scrollable
            onMaximize={() => toggleSection(sectionName)}
          >
            {/* Release Notes => special heading 'Release notes' */}
            {sectionName === "Release Notes" && (
              <div className="space-y-6">
                <h2 className="font-serif text-2xl text-white mb-6">Release notes</h2>
                {rows.map((item) => (
                  <div
                    key={item.id}
                    dangerouslySetInnerHTML={{
                      __html: expandedSections[sectionName]
                        ? item.full_text
                        : item.preview_text || item.full_text,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Hallucination => interpret full_text as image URL */}
            {config.renderMode === "image" && sectionName === "Hallucination" && (
              <div className="space-y-4">
                {rows.map((item) => (
                  <div key={item.id}>
                    <img
                      src={item.full_text}
                      alt="Hallucination"
                      className="w-full aspect-[1.91/1] object-cover rounded-2xl"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Normal HTML (Knowledge Base, Fine Tuning, Alignment) */}
            {config.renderMode === "html" &&
              sectionName !== "Release Notes" && (
                <div className="space-y-4">
                  {rows.map((item) => (
                    <div key={item.id}>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: expandedSections[sectionName]
                            ? item.full_text
                            : item.preview_text || item.full_text,
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
          </SectionCard>
        );
      })}
    </div>
  );
}
