export const HoverCard = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`vanilla-hover-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const HoverCardTrigger = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`vanilla-hover-card-trigger ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const HoverCardContent = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`vanilla-hover-card-content ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};