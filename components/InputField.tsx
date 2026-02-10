import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  gridSpan?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, id, gridSpan = 'md:col-span-1', ...props }) => {
  const isTextArea = props.type === 'textarea';
  
  const commonProps = {
    id: id,
    className: "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100 transition-colors duration-300",
    ...props
  };

  return (
    <div className={`w-full ${gridSpan}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
        {label}
      </label>
      {isTextArea ? (
        <textarea {...commonProps} rows={4}></textarea>
      ) : (
        <input {...commonProps} />
      )}
    </div>
  );
};

export default InputField;
