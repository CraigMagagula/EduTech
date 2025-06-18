
import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-300" role="alert">
      <span className="font-medium">Error:</span> {message}
    </div>
  );
};

export default ErrorMessage;
