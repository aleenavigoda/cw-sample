'use client'

import { SectionCard } from "@/components/section-card"
import { FieldReportSection } from "@/components/field-report-section"
// At the top of page.tsx, make sure the paths match your project structure

function Page() {
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
              <span className="text-slate-600">Issue 17</span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-600">December 2024</span>
            </nav>
          </div>
        </header>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-12">
          <SectionCard 
            title="Knowledge Base" 
            className="lg:col-span-3"
            category="New in Every"
            author="our writers"
            colorAccent="rgb(168, 85, 247)"
          >
            <div className="space-y-8">
              <div className="space-y-2">
                <h4 className="font-medium text-lg text-white">How to Build a Truly Useful AI Product</h4>
                <p className="text-sm text-slate-300 line-clamp-3">
                  Building an AI startup is like playing a video game at twice the speed while your competitors have access to all your cheat codes...
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-lg text-white">The Secret to Building Really AI Products</h4>
                <p className="text-sm text-slate-300 line-clamp-3">
                  We're used to AI products with obvious utility like a code completion AI...
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard 
            className="lg:col-span-6"
            category="Field Report"
            colorAccent="rgb(34, 197, 94)"
            scrollable
          >
            <FieldReportSection />
          </SectionCard>

          <SectionCard 
            title="Fine Tuning"
            className="lg:col-span-3"
            category="Market Signals"
            colorAccent="rgb(234, 179, 8)"
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-lg font-medium text-white">Google unveiled Willow</h4>
                <p className="text-sm text-slate-300">
                  A quantum computing chip that can complete calculations in minutes that would take supercomputers billions...
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-medium text-white">Tencent launched Hunyuan</h4>
                <p className="text-sm text-slate-300">
                  An open-source AI video generation model, just days before OpenAI released Sora...
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard 
            title="Hallucination"
            className="lg:col-span-6"
            category="Imagine"
            colorAccent="rgb(244, 63, 94)"
          >
            <div className="space-y-4">
              <img 
                src="/api/placeholder/800/400"
                alt="Hallucination"
                className="w-full aspect-[1.91/1] object-cover rounded-2xl"
              />
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
              <p>
                Stop trying so hard. Last week I discovered life's greatest irony in a coffee shop at 2 p.m...
              </p>
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  )
}

export default Page