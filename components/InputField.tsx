import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  gridSpan?: string;
  suggestions?: string[];
}

const InputField: React.FC<InputFieldProps> = ({ label, id, gridSpan = 'md:col-span-1', suggestions, ...props }) => {
  const isTextArea = props.type === 'textarea';
  const isDate = props.type === 'date';
  const isRodneCislo = props.name === 'rodneCislo';
  const listId = `${id}-list`;
  
  // State for suggestions dropdown
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
              setShowSuggestions(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
          document.removeEventListener("mousedown", handleClickOutside);
      };
  }, []);

  const handleSuggestionClick = (value: string) => {
      if (props.onChange) {
          const syntheticEvent = {
              target: {
                  name: props.name,
                  value: value,
                  type: props.type
              }
          } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
          props.onChange(syntheticEvent);
      }
      setShowSuggestions(false);
  };
  
  // State for date input display value (DD.MM.YYYY)
  const [displayValue, setDisplayValue] = React.useState('');
  
  // Sync display value with prop value (YYYY-MM-DD -> DD.MM.YYYY)
  React.useEffect(() => {
    if (isDate && props.value) {
      const [y, m, d] = String(props.value).split('-');
      if (y && m && d) {
        setDisplayValue(`${d}.${m}.${y}`);
      } else {
        setDisplayValue('');
      }
    }
  }, [props.value, isDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    // Check if user is deleting (backspace)
    // If the new value is shorter than the old value, and we are at a dot position, allow deletion
    const isDeleting = val.length < displayValue.length;

    // Allow only numbers and dots
    val = val.replace(/[^0-9.]/g, '');
    
    if (!isDeleting) {
        // Auto-add dots only when typing forward
        if (val.length === 2 && !val.includes('.')) val += '.';
        if (val.length === 5 && val.split('.').length === 2) val += '.';
    }
    
    // Limit length to DD.MM.YYYY (10 chars)
    if (val.length > 10) val = val.substring(0, 10);
    
    setDisplayValue(val);
    
    // If valid date format DD.MM.YYYY, convert to YYYY-MM-DD and call parent onChange
    if (val.length === 10) {
      const [d, m, y] = val.split('.');
      if (d && m && y && !isNaN(Number(d)) && !isNaN(Number(m)) && !isNaN(Number(y))) {
         // Basic validation
         const day = parseInt(d, 10);
         const month = parseInt(m, 10);
         const year = parseInt(y, 10);
         
         if (day > 0 && day <= 31 && month > 0 && month <= 12 && year > 1900) {
             const isoDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
             
             // Create a synthetic event to pass to parent
             const syntheticEvent = {
               ...e,
               target: {
                 ...e.target,
                 name: props.name,
                 value: isoDate,
                 type: 'date'
               }
             } as React.ChangeEvent<HTMLInputElement>;
             
             if (props.onChange) props.onChange(syntheticEvent);
         }
      }
    } else if (val === '') {
        // Handle empty value
         const syntheticEvent = {
           ...e,
           target: {
             ...e.target,
             name: props.name,
             value: '',
             type: 'date'
           }
         } as React.ChangeEvent<HTMLInputElement>;
         if (props.onChange) props.onChange(syntheticEvent);
    }
  };

  const handleRodneCisloChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;
      
      // Check if deleting
      const isDeleting = props.value && val.length < String(props.value).length;

      // Allow only numbers and slash
      val = val.replace(/[^0-9/]/g, '');

      if (!isDeleting) {
          // Auto-add slash after 6th digit
          if (val.length === 6 && !val.includes('/')) val += '/';
      }
      
      // Limit length (11 chars: 6 digits + / + 4 digits)
      if (val.length > 11) val = val.substring(0, 11);

      // Call parent onChange directly with the formatted value
      const syntheticEvent = {
          ...e,
          target: {
              ...e.target,
              name: props.name,
              value: val,
              type: 'text'
          }
      } as React.ChangeEvent<HTMLInputElement>;

      if (props.onChange) props.onChange(syntheticEvent);
  };

  const commonProps: React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> = {
    id: id,
    list: suggestions ? listId : undefined,
    className: "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100 transition-colors duration-300",
    ...props
  };

  if (isRodneCislo) {
      // Override onChange for rodneCislo
      commonProps.onChange = handleRodneCisloChange;
      commonProps.maxLength = 11;
      commonProps.inputMode = 'numeric';
      commonProps.placeholder = 'RRMMDD/CCCC';
  }

  return (
    <div className={`w-full ${gridSpan}`} ref={wrapperRef}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
        {label}
      </label>
      {isTextArea ? (
        <div className="relative">
            <textarea {...commonProps} rows={4}></textarea>
            {suggestions && suggestions.length > 0 && (
                <>
                    <button 
                        type="button"
                        className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 bg-gray-100 dark:bg-slate-600 rounded-md shadow-sm border border-gray-200 dark:border-gray-500 transition-colors"
                        onClick={() => setShowSuggestions(!showSuggestions)}
                        title="Vybrať zo zoznamu činností"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {showSuggestions && (
                        <ul className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                            {suggestions.map((s, idx) => (
                                <li 
                                    key={idx} 
                                    className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-slate-600 cursor-pointer text-sm text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-600 last:border-0"
                                    onClick={() => handleSuggestionClick(s)}
                                >
                                    {s}
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </div>
      ) : isDate ? (
        <div className="relative flex mt-1">
            <input 
                {...commonProps} 
                type="text" 
                inputMode="numeric" 
                placeholder="DD.MM.RRRR" 
                value={displayValue} 
                onChange={handleDateChange}
                maxLength={10}
                className={`${commonProps.className} mt-0 rounded-r-none border-r-0`}
            />
            <div className="relative">
                <input 
                    type="date" 
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    value={props.value as string || ''}
                    onChange={(e) => {
                        if (props.onChange) props.onChange(e);
                    }}
                    tabIndex={-1}
                />
                <div className="flex items-center justify-center h-full px-3 bg-gray-100 dark:bg-slate-600 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            </div>
        </div>
      ) : (
        <input {...commonProps} />
      )}
      {suggestions && (
        <datalist id={listId}>
          {suggestions.map(s => <option key={s} value={s} />)}
        </datalist>
      )}
    </div>
  );
};

export default InputField;
