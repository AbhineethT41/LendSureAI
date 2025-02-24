import React from 'react';
import FormSection from './FormSection';
import InputField from './InputField';

const DebtInfoForm = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <FormSection title="Existing Debt Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Car Loan Payment"
          type="number"
          value={data.car_loan_payment}
          onChange={(value) => handleChange('car_loan_payment', parseFloat(value))}
          min={0}
          step={0.01}
          prefix="$"
        />
        
        <InputField
          label="Car Loan Remaining Months"
          type="number"
          value={data.car_loan_remaining_months}
          onChange={(value) => handleChange('car_loan_remaining_months', parseInt(value))}
          min={0}
        />
        
        <InputField
          label="Credit Card Debt"
          type="number"
          value={data.credit_card_debt}
          onChange={(value) => handleChange('credit_card_debt', parseFloat(value))}
          min={0}
          step={0.01}
          prefix="$"
        />
        
        <InputField
          label="Student Loans"
          type="number"
          value={data.student_loans}
          onChange={(value) => handleChange('student_loans', parseFloat(value))}
          min={0}
          step={0.01}
          prefix="$"
        />
        
        <InputField
          label="Emergency Fund"
          type="number"
          value={data.emergency_fund}
          onChange={(value) => handleChange('emergency_fund', parseFloat(value))}
          min={0}
          step={0.01}
          prefix="$"
        />
        
        <InputField
          label="Retirement Accounts"
          type="number"
          value={data.retirement_accounts}
          onChange={(value) => handleChange('retirement_accounts', parseFloat(value))}
          min={0}
          step={0.01}
          prefix="$"
        />
      </div>
    </FormSection>
  );
};

export default DebtInfoForm;
