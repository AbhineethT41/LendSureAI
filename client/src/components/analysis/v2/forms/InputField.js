import React from 'react';

const InputField = ({
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  min,
  max,
  step,
  prefix,
  suffix,
  options = [],
}) => {
  const id = label.toLowerCase().replace(/\s+/g, '_');

  const renderInput = () => {
    const commonProps = {
      id,
      required,
      className: `block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
        prefix || suffix ? 'pl-7' : ''
      }`,
      value: value || '',
      onChange: (e) => onChange(e.target.value),
    };

    if (type === 'select') {
      return (
        <select {...commonProps}>
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'number') {
      return (
        <div className="relative rounded-md shadow-sm">
          {prefix && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">{prefix}</span>
            </div>
          )}
          <input
            {...commonProps}
            type="number"
            min={min}
            max={max}
            step={step}
          />
          {suffix && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">{suffix}</span>
            </div>
          )}
        </div>
      );
    }

    return <input {...commonProps} type={type} />;
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="mt-1">{renderInput()}</div>
    </div>
  );
};

export default InputField;
