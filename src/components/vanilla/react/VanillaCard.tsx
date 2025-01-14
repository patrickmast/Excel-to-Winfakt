import { forwardRef } from 'react';
import {
  Card as VanillaCardBase,
  CardHeader as VanillaCardHeaderBase,
  CardTitle as VanillaCardTitleBase,
  CardContent as VanillaCardContentBase,
  CardFooter as VanillaCardFooterBase,
  CardDescription as VanillaCardDescriptionBase
} from '../Card.jsx';
import '../Card.css';

export const VanillaCard = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <VanillaCardBase
    ref={ref}
    className={className}
    {...props}
  />
));
VanillaCard.displayName = "VanillaCard";

export const VanillaCardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <VanillaCardHeaderBase
    ref={ref}
    className={className}
    {...props}
  />
));
VanillaCardHeader.displayName = "VanillaCardHeader";

export const VanillaCardTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <VanillaCardTitleBase
    ref={ref}
    className={className}
    {...props}
  />
));
VanillaCardTitle.displayName = "VanillaCardTitle";

export const VanillaCardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <VanillaCardContentBase
    ref={ref}
    className={className}
    {...props}
  />
));
VanillaCardContent.displayName = "VanillaCardContent";

export const VanillaCardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <VanillaCardFooterBase
    ref={ref}
    className={className}
    {...props}
  />
));
VanillaCardFooter.displayName = "VanillaCardFooter";

export const VanillaCardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <VanillaCardDescriptionBase
    ref={ref}
    className={className}
    {...props}
  />
));
VanillaCardDescription.displayName = "VanillaCardDescription";