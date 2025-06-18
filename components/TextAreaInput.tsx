
import React from 'react';

interface TextAreaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({ label, id, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <textarea
        id={id}
        rows={4}
        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm placeholder-slate-400"
        {...props}
      />
    </div>
  );
};

export default TextAreaInput;