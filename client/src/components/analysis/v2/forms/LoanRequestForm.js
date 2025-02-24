import React from 'react';
import FormSection from './FormSection';
import InputField from './InputField';

const LoanRequestForm = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <FormSection title="Loan Request Details">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Loan Amount"
          type="number"
          value={data.loan_amount}
          onChange={(value) => handleChange('loan_amount', parseFloat(value))}
          required
          min={0}
          step={0.01}
          prefix="$"
        />
        
        <InputField
          label="Loan Purpose"
          type="select"
          value={data.loan_purpose}
          onChange={(value) => handleChange('loan_purpose', value)}
          options={[
            { value: 'purchase', label: 'Home Purchase' },
            { value: 'refinance', label: 'Refinance' },
            { value: 'renovation', label: 'Home Renovation' },
            { value: 'construction', label: 'New Construction' },
          ]}
          required
        />
        
        <InputField
          label="Loan Term (Years)"
          type="number"
          value={data.loan_term_years}
          onChange={(value) => handleChange('loan_term_years', parseInt(value))}
          required
          min={1}
          max={30}
        />
        
        <InputField
          label="Down Payment"
          type="number"
          value={data.down_payment}
          onChange={(value) => handleChange('down_payment', parseFloat(value))}
          required
          min={0}
          step={0.01}
          prefix="$"
        />
        
        <InputField
          label="Loan to Value Ratio (%)"
          type="number"
          value={data.loan_to_value_ratio}
          onChange={(value) => handleChange('loan_to_value_ratio', parseFloat(value))}
          required
          min={0}
          max={100}
          step={0.01}
          suffix="%"
        />
        
        <InputField
          label="Interest Rate Offered (%)"
          type="number"
          value={data.interest_rate_offered}
          onChange={(value) => handleChange('interest_rate_offered', parseFloat(value))}
          required
          min={0}
          max={20}
          step={0.001}
          suffix="%"
        />
      </div>
    </FormSection>
  );
};

export default LoanRequestForm;
