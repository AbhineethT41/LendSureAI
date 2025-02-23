import requests
import json
import os

# 🟢 Set your Groq API Key (Replace with your actual key)
GROQ_API_KEY = "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"

# 🟢 Define the API URL
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

# 🟢 Headers for authentication
headers = {
    "Authorization": f"Bearer {GROQ_API_KEY}",
    "Content-Type": "application/json"
}

# 🟢 Detailed Customer Profile for Credit Risk Analysis
customer_details = {
    "full_name": "John Doe",
    "age": 45,
    "credit_score": 620,
    "annual_income": 50000,
    "employment_status": "Full-time",
    "total_debt": 25000,
    "missed_payments_last_12_months": 3,
    "loan_types": ["Mortgage", "Credit Card", "Personal Loan"],
    "debt_to_income_ratio": "48%",
    "existing_loans": [
        {"type": "Mortgage", "balance": 150000, "monthly_payment": 1200},
        {"type": "Credit Card", "balance": 5000, "monthly_payment": 200},
        {"type": "Personal Loan", "balance": 10000, "monthly_payment": 300}
    ],
    "recent_credit_inquiries": 2,
    "bankruptcies": 0,
    "foreclosures": 0,
    "on_time_payment_percentage": "85%",
    "savings_account_balance": 10000
}

# 🟢 Construct Prompt for Detailed Credit Risk Analysis
prompt = f"""
Analyze the credit risk of the following customer based on financial and credit details.
Assess risk level (Low, Medium, High) and provide a comprehensive explanation.

**Customer Profile:**
- Full Name: {customer_details["full_name"]}
- Age: {customer_details["age"]}
- Credit Score: {customer_details["credit_score"]}
- Annual Income: ${customer_details["annual_income"]}
- Employment Status: {customer_details["employment_status"]}
- Total Debt: ${customer_details["total_debt"]}
- Missed Payments in Last 12 Months: {customer_details["missed_payments_last_12_months"]}
- Debt-to-Income Ratio: {customer_details["debt_to_income_ratio"]}
- Existing Loans:
  - Mortgage: ${customer_details["existing_loans"][0]["balance"]} (Monthly Payment: ${customer_details["existing_loans"][0]["monthly_payment"]})
  - Credit Card: ${customer_details["existing_loans"][1]["balance"]} (Monthly Payment: ${customer_details["existing_loans"][1]["monthly_payment"]})
  - Personal Loan: ${customer_details["existing_loans"][2]["balance"]} (Monthly Payment: ${customer_details["existing_loans"][2]["monthly_payment"]})
- Recent Credit Inquiries: {customer_details["recent_credit_inquiries"]}
- Bankruptcies: {customer_details["bankruptcies"]}
- Foreclosures: {customer_details["foreclosures"]}
- On-Time Payment Percentage: {customer_details["on_time_payment_percentage"]}
- Savings Account Balance: ${customer_details["savings_account_balance"]}

**Analysis Requirements:**
1️⃣ **Risk Level (Low, Medium, High)**
2️⃣ **Factors contributing to the risk score**
3️⃣ **Debt-to-Income Ratio assessment**
4️⃣ **Impact of existing loans & credit inquiries**
5️⃣ **Payment history analysis**
6️⃣ **Likelihood of future financial distress**
7️⃣ **If risk is HIGH, provide specific recommendations to improve creditworthiness**

**Output format:**
{{
  "risk_level": "Low/Medium/High",
  "assessment": "Detailed explanation of risk factors...",
  "recommendations": "Suggestions if applicable, otherwise null"
}}
"""

# 🟢 Send request to Groq API
data = {
    "model": "llama-3.3-70b-versatile",
    "messages": [{"role": "user", "content": prompt}]
}

response = requests.post(GROQ_API_URL, headers=headers, json=data)

# 🟢 Handle Response Properly
try:
    response_data = response.json()  # Parse JSON response

    if "choices" in response_data:
        # Extract message content
        result = response_data["choices"][0]["message"]["content"]

        try:
            # Convert result to JSON (if valid)
            formatted_result = json.loads(result)
            print("🔹 Credit Risk Analysis Response 🔹")
            print(json.dumps(formatted_result, indent=4))  # Pretty-print JSON response
        except json.JSONDecodeError:
            print("⚠️ The response was not a valid JSON, displaying raw output:\n")
            print(result)
    else:
        print("⚠️ No valid response from API:", response_data)

except requests.exceptions.JSONDecodeError:
    print("❌ Error: API response is not valid JSON:", response.text)
except Exception as e:
    print("❌ Unexpected Error:", str(e))
