
import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: SelectOption[];
}

const SelectInput: React.FC<SelectInputProps> = ({ label, id, options, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <select
        id={id}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white border-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md shadow-sm"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectInput;