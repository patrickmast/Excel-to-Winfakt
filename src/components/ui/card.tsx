import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface CardGroupProps {
  description?: string;
  number?: number;
  nextCard?: { description: string; number: number; };
  isExpanded?: boolean;
  onToggle?: () => void;
}

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CardGroupProps
>(({ className, description, number, nextCard, isExpanded, onToggle, children, ...props }, ref) => {
  const hasSequentialCards = nextCard && 
    nextCard.description === description && 
    nextCard.number === number + 1;

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        "hover:shadow-md transition-shadow duration-200",
        className
      )}
      {...props}
    >
      {description ? (
        <div className="flex items-center justify-between p-6">
          <div>
            <span className="text-lg font-semibold">{description}</span>
            <span className="ml-2 text-sm text-muted-foreground">#{number}</span>
          </div>
          {hasSequentialCards && (
            <button
              onClick={onToggle}
              className="p-2 hover:bg-muted rounded-full transition-all duration-200"
            >
              <ChevronDown 
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isExpanded && "transform rotate-180"
                )}
              />
            </button>
          )}
        </div>
      ) : (
        children
      )}
    </div>
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }