"use client";

import React from "react";
import { ContentProvider } from "@/components/content-provider";

/**
 * This is your main Next.js 13 App Router page. 
 * It calls <ContentProvider> which handles fetching from the API
 * and rendering the 5 sections.
 */
export default function Page() {
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
              <div className="w-2 h-2 rounded-full bg-[#4A9EFF]/30" />
              <span className="text-slate-600">Issue 1222</span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-600">December 2024</span>
            </nav>
          </div>
        </header>

        {/*
          We'll drop in our <ContentProvider> for the layout of columns.
          Pass in the issue number you want to display from your DB.
        */}
        <ContentProvider currentIssue={1222} />
      </div>
    </main>
  );
}
