import React from 'react';
import FormSection from './FormSection';
import InputField from './InputField';

const CustomerInfoForm = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <FormSection title="Customer Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Full Name"
          type="text"
          value={data.customer_name}
          onChange={(value) => handleChange('customer_name', value)}
          required
        />
        
        <InputField
          label="Age"
          type="number"
          value={data.customer_age}
          onChange={(value) => handleChange('customer_age', parseInt(value))}
          required
          min={18}
          max={120}
        />
        
        <InputField
          label="Job Title"
          type="text"
          value={data.job_title}
          onChange={(value) => handleChange('job_title', value)}
          required
        />
        
        <InputField
          label="Company"
          type="text"
          value={data.company}
          onChange={(value) => handleChange('company', value)}
          required
        />
        
        <InputField
          label="Industry"
          type="text"
          value={data.industry}
          onChange={(value) => handleChange('industry', value)}
          required
        />
        
        <InputField
          label="Years at Current Job"
          type="number"
          value={data.years_at_job}
          onChange={(value) => handleChange('years_at_job', parseInt(value))}
          required
          min={0}
        />
        
        <InputField
          label="Employment Type"
          type="select"
          value={data.employment_type}
          onChange={(value) => handleChange('employment_type', value)}
          options={[
            { value: 'full_time', label: 'Full Time' },
            { value: 'part_time', label: 'Part Time' },
            { value: 'self_employed', label: 'Self Employed' },
            { value: 'contract', label: 'Contract' },
          ]}
          required
        />
        
        <InputField
          label="Annual Income"
          type="number"
          value={data.annual_income}
          onChange={(value) => handleChange('annual_income', parseFloat(value))}
          required
          min={0}
          step={0.01}
          prefix="$"
        />
        
        <InputField
          label="Credit Score"
          type="number"
          value={data.credit_score}
          onChange={(value) => handleChange('credit_score', parseInt(value))}
          required
          min={300}
          max={850}
        />
        
        <InputField
          label="Total Assets"
          type="number"
          value={data.total_assets}
          onChange={(value) => handleChange('total_assets', parseFloat(value))}
          required
          min={0}
          step={0.01}
          prefix="$"
        />
        
        <InputField
          label="Total Liabilities"
          type="number"
          value={data.total_liabilities}
          onChange={(value) => handleChange('total_liabilities', parseFloat(value))}
          required
          min={0}
          step={0.01}
          prefix="$"
        />
        
        <InputField
          label="Net Worth"
          type="number"
          value={data.net_worth}
          onChange={(value) => handleChange('net_worth', parseFloat(value))}
          required
          min={0}
          step={0.01}
          prefix="$"
        />
        
        <InputField
          label="Savings Rate (%)"
          type="number"
          value={data.savings_rate}
          onChange={(value) => handleChange('savings_rate', parseInt(value))}
          required
          min={0}
          max={100}
          suffix="%"
        />
        
        <InputField
          label="Monthly Savings"
          type="number"
          value={data.monthly_savings}
          onChange={(value) => handleChange('monthly_savings', parseFloat(value))}
          required
          min={0}
          step={0.01}
          prefix="$"
        />
        
        <InputField
          label="Credit Utilization (%)"
          type="number"
          value={data.credit_utilization}
          onChange={(value) => handleChange('credit_utilization', parseInt(value))}
          required
          min={0}
          max={100}
          suffix="%"
        />
      </div>
    </FormSection>
  );
};

export default CustomerInfoForm;
