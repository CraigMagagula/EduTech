
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className, isLoading = false, ...props }) => {
  const baseStyles = "font-medium py-2.5 px-5 rounded-lg focus:outline-none focus:ring-4 transition-colors duration-150 ease-in-out inline-flex items-center justify-center text-sm shadow-md hover:shadow-lg";
  
  const variantStyles = {
    primary: "bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-300 disabled:bg-sky-400 disabled:cursor-not-allowed disabled:shadow-none",
    secondary: "bg-slate-200 hover:bg-slate-300 text-slate-800 focus:ring-slate-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${isLoading ? 'cursor-wait' : ''} ${className || ''}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;