import { forwardRef } from 'react';
import {
  HoverCard as VanillaHoverCardBase,
  HoverCardTrigger as VanillaHoverCardTriggerBase,
  HoverCardContent as VanillaHoverCardContentBase
} from '../HoverCard.jsx';
import '../HoverCard.css';

export const VanillaHoverCard = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <VanillaHoverCardBase
    ref={ref}
    className={className}
    {...props}
  />
));
VanillaHoverCard.displayName = "VanillaHoverCard";

export const VanillaHoverCardTrigger = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <VanillaHoverCardTriggerBase
    ref={ref}
    className={className}
    {...props}
  />
));
VanillaHoverCardTrigger.displayName = "VanillaHoverCardTrigger";

export const VanillaHoverCardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <VanillaHoverCardContentBase
    ref={ref}
    className={className}
    {...props}
  />
));
VanillaHoverCardContent.displayName = "VanillaHoverCardContent";