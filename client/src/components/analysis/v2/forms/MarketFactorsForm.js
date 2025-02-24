import React from 'react';
import FormSection from './FormSection';
import InputField from './InputField';

const MarketFactorsForm = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <FormSection title="Market Factors">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Economic Conditions Risk"
          type="select"
          value={data.economic_conditions_risk}
          onChange={(value) => handleChange('economic_conditions_risk', value)}
          options={[
            { value: 'low', label: 'Low Risk' },
            { value: 'moderate', label: 'Moderate Risk' },
            { value: 'high', label: 'High Risk' },
          ]}
          required
        />
        
        <InputField
          label="Job Stability Score"
          type="number"
          value={data.job_stability_score}
          onChange={(value) => handleChange('job_stability_score', parseInt(value))}
          required
          min={0}
          max={100}
        />
        
        <InputField
          label="Housing Market Volatility"
          type="select"
          value={data.housing_market_volatility}
          onChange={(value) => handleChange('housing_market_volatility', value)}
          options={[
            { value: 'low', label: 'Low' },
            { value: 'moderate', label: 'Moderate' },
            { value: 'high', label: 'High' },
          ]}
          required
        />
        
        <InputField
          label="Inflation Rate (%)"
          type="number"
          value={data.inflation_rate}
          onChange={(value) => handleChange('inflation_rate', parseFloat(value))}
          required
          min={-5}
          max={20}
          step={0.1}
          suffix="%"
        />
        
        <InputField
          label="Interest Rate Trend"
          type="select"
          value={data.interest_rate_trend}
          onChange={(value) => handleChange('interest_rate_trend', value)}
          options={[
            { value: 'decreasing', label: 'Decreasing' },
            { value: 'stable', label: 'Stable' },
            { value: 'increasing', label: 'Increasing' },
          ]}
          required
        />
      </div>
    </FormSection>
  );
};

export default MarketFactorsForm;
