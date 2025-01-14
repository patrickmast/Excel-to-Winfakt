export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`vanilla-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`vanilla-card-header ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3
      className={`vanilla-card-title ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`vanilla-card-content ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`vanilla-card-footer ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardDescription = ({ children, className = '', ...props }) => {
  return (
    <p
      className={`vanilla-card-description ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};