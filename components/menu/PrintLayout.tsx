import React from 'react';

interface PrintLayoutProps {
  children: React.ReactNode;
}

/**
 * A layout component that wraps content intended only for printing.
 * It uses Tailwind CSS utility classes to be hidden on screen and visible on print.
 */
const PrintLayout: React.FC<PrintLayoutProps> = ({ children }) => {
  if (!children) return null;

  return (
    <div className="hidden print:block">
      {children}
    </div>
  );
};

export default PrintLayout;
