import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { cn } from "@/lib/cn";
import { ChevronDown } from "lucide-react";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

interface AccordionItemProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerLabel: React.ReactNode;
  children: React.ReactNode;
  count?: number;
}

function AccordionItem({ open, onOpenChange, triggerLabel, children, count }: AccordionItemProps) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border bg-muted/50 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted">
        <div className="flex items-center gap-2">
          {triggerLabel}
          {count != null && count > 0 && (
            <span className="rounded-full bg-muted-foreground/20 px-2 py-0.5 text-xs font-normal">
              {count}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="pt-2">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent, AccordionItem };
