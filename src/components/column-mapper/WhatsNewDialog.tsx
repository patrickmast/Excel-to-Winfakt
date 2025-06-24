import React from 'react';
import {
  PM7Dialog,
  PM7DialogContent,
  PM7DialogHeader,
  PM7DialogTitle,
} from "pm7-ui-style-guide";
import { Sparkles, X } from "lucide-react";
import { whatsNewData } from '@/data/whatsNewData';

interface WhatsNewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WhatsNewDialog: React.FC<WhatsNewDialogProps> = ({
  isOpen,
  onOpenChange,
}) => {
  return (
    <PM7Dialog open={isOpen} onOpenChange={onOpenChange}>
      <PM7DialogContent className="!max-w-[750px]">
        <PM7DialogHeader className="flex-shrink-0 px-6 py-4 border-b relative">
          <PM7DialogTitle className="flex items-center gap-2 pr-8">
            <Sparkles className="h-5 w-5" />
            What's New - Excel to Winfakt
          </PM7DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </PM7DialogHeader>
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] px-6 py-4">
          <div className="space-y-6">
            {whatsNewData.map((update, updateIndex) => (
              <section key={updateIndex}>
                <h2 className="text-lg font-semibold mb-3">
                  {update.version} - {update.date}
                </h2>
                
                <div className="space-y-4">
                  {update.categories.map((category, categoryIndex) => (
                    <div key={categoryIndex}>
                      <h3 className="text-base font-semibold text-primary mb-2">
                        {category.icon && <span>{category.icon} </span>}
                        {category.title}
                      </h3>
                      
                      <div className="space-y-3">
                        {category.items.map((item, itemIndex) => (
                          <div key={itemIndex}>
                            <h4 className="font-medium mb-1">{item.title}</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                              {item.description.map((desc, descIndex) => (
                                <li key={descIndex}>{desc}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
            
            <section className="border-t pt-4">
              <p className="text-sm text-muted-foreground italic text-center">
                Excel to Winfakt - Jouw betrouwbare partner voor dataconversie
              </p>
            </section>
          </div>
        </div>
      </PM7DialogContent>
    </PM7Dialog>
  );
};