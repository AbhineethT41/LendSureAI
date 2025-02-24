import React from 'react';
import FormSection from './FormSection';
import InputField from './InputField';

const PropertyDetailsForm = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <FormSection title="Property Details">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Property Type"
          type="select"
          value={data.property_type}
          onChange={(value) => handleChange('property_type', value)}
          options={[
            { value: 'single_family', label: 'Single Family Home' },
            { value: 'condo', label: 'Condominium' },
            { value: 'townhouse', label: 'Townhouse' },
            { value: 'multi_family', label: 'Multi-Family Home' },
          ]}
          required
        />
        
        <InputField
          label="Property Location"
          type="text"
          value={data.property_location}
          onChange={(value) => handleChange('property_location', value)}
          required
        />
        
        <InputField
          label="Property Value Growth (%)"
          type="number"
          value={data.property_value_growth}
          onChange={(value) => handleChange('property_value_growth', parseFloat(value))}
          required
          min={-20}
          max={20}
          step={0.1}
          suffix="%"
        />
        
        <InputField
          label="Property Tax Rate (%)"
          type="number"
          value={data.property_tax_rate}
          onChange={(value) => handleChange('property_tax_rate', parseFloat(value))}
          required
          min={0}
          max={10}
          step={0.001}
          suffix="%"
        />
      </div>
    </FormSection>
  );
};

export default PropertyDetailsForm;
