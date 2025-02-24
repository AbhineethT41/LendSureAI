import React from 'react';

const FormSection = ({ title, children }) => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
};

export default FormSection;
