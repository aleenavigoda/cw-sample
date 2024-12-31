'use client'

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import { cn } from "@/lib/utils"

interface SectionCardProps {
  title?: string
  className?: string
  children: React.ReactNode
  showNavigation?: boolean
  scrollable?: boolean
  maxHeight?: string
  category?: string
  author?: string
  colorAccent?: string
  onMaximize?: () => void
}

export function SectionCard({ 
  title, 
  className, 
  children, 
  showNavigation = true, 
  scrollable = false, 
  maxHeight = "500px",
  category,
  author,
  colorAccent = "rgb(74, 158, 255)",
  onMaximize
}: SectionCardProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      <Card className={cn(
        "group bg-gradient-to-b from-[#0A0F1E] to-[#0D1326] rounded-3xl transition-all duration-300 flex flex-col overflow-hidden",
        "hover:shadow-lg hover:shadow-[#4A9EFF]/10",
        "relative border border-slate-800/50",
        "after:absolute after:inset-0 after:rounded-3xl after:p-[1px] after:bg-gradient-to-b after:from-slate-700/20 after:to-slate-800/20 after:-z-10",
        maxHeight && `max-h-[${maxHeight}]`,
        className
      )}>
        <CardHeader className="p-6 pb-4">
          {category && (
            <div 
              data-header
              className={cn(
                "flex items-center gap-2 mb-2 transition-opacity duration-200",
                category === "Field Report" && "opacity-0"
              )}
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: colorAccent }}
              />
              <p className="text-xs uppercase tracking-wider text-slate-400">
                {category}
              </p>
            </div>
          )}
          <div className="space-y-3">
            <CardTitle className="font-serif text-2xl bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
              {title}
            </CardTitle>
            {author && (
              <p className="text-sm text-slate-400 flex items-center gap-2">
                <span className="inline-block w-4 h-[1px] bg-slate-700"/>
                Words by {author}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className={cn(
          "p-6 flex-grow space-y-4 text-slate-300 relative",
          scrollable ? "max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent" : ""
        )}>
          {children}
        </CardContent>
        {showNavigation && (
          <CardFooter className="flex items-center justify-between border-t border-slate-800/50 p-6 text-sm">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl"
            >
              <ChevronLeft className="mr-2 h-3 w-3" />
              Newer
            </Button>
            <span className="text-xs bg-slate-800/50 px-3 py-1 rounded-full text-slate-400">
              Current Issue
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl"
            >
              Older
              <ChevronRight className="ml-2 h-3 w-3" />
            </Button>
          </CardFooter>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-4 right-4 text-slate-500 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-slate-800/50 transition-all duration-200 rounded-xl"
          onClick={() => {
            setIsOpen(true);
            onMaximize?.();
          }}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl bg-[#0A0F1E] text-white border-slate-800 rounded-3xl">
          <DialogHeader>
            {category && (
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: colorAccent }}
                />
                <p className="text-xs uppercase tracking-wider text-slate-400">
                  {category}
                </p>
              </div>
            )}
            <DialogTitle className="font-serif text-2xl bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
              {title}
            </DialogTitle>
            {author && (
              <p className="text-sm text-slate-400 flex items-center gap-2">
                <span className="inline-block w-4 h-[1px] bg-slate-700"/>
                Words by {author}
              </p>
            )}
          </DialogHeader>
          <div className="text-slate-300">
            {children}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}