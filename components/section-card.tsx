'use client'

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import { cn } from "@/lib/utils"

interface SectionCardProps {
  title: string
  className?: string
  children: React.ReactNode
  showNavigation?: boolean
  scrollable?: boolean;
  maxHeight?: string;
}

export function SectionCard({ title, className, children, showNavigation = true, scrollable = false, maxHeight = "500px" }: SectionCardProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      <Card className={cn(
        "group h-full rounded-xl transition-all duration-200 flex flex-col",
        "shadow-md hover:shadow-lg",
        maxHeight && `max-h-[${maxHeight}]`,
        className
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 pb-4">
          <CardTitle className="font-serif text-2xl tracking-tight">{title}</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground/60 hover:text-muted-foreground transition-colors duration-200" 
            onClick={() => setIsOpen(true)}
          >
            <Maximize2 className="h-4 w-4" />
            <span className="sr-only">Expand {title}</span>
          </Button>
        </CardHeader>
        <div className="h-px bg-border mx-6" />
        <CardContent className={cn("p-6 flex-grow", scrollable ? "max-h-[400px] overflow-y-auto" : "line-clamp-[12]")}>
          {children}
        </CardContent>
        {showNavigation && (
          <CardFooter className="flex items-center justify-between border-t p-6 text-sm text-muted-foreground/80">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground/60 hover:text-muted-foreground transition-colors duration-200"
            >
              <ChevronLeft className="mr-2 h-3 w-3" />
              Newer
            </Button>
            <span className="text-xs font-medium">Current Issue</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground/60 hover:text-muted-foreground transition-colors duration-200"
            >
              Older
              <ChevronRight className="ml-2 h-3 w-3" />
            </Button>
          </CardFooter>
        )}
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl tracking-tight">{title}</DialogTitle>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    </>
  )
}