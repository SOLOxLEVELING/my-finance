# 1. Import all the necessary libraries
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from flask import Flask, request, jsonify
from flask_cors import CORS

# 2. Create the Flask web server
app = Flask(__name__)
# Allow requests from other origins (like your Node.js server)
CORS(app)

# 3. Define the prediction endpoint
@app.route('/predict', methods=['POST'])
def predict():
    # --- DATA PREPARATION ---
    
    # Get the JSON data sent from your Node.js server
    data = request.get_json()
    if not data or 'history' not in data:
        return jsonify({"error": "Invalid input: 'history' key not found."}), 400

    # Convert the list of transactions into a pandas DataFrame
    # This makes it easy to work with the data
    history_df = pd.DataFrame(data['history'])
    if history_df.empty:
        return jsonify({"error": "No historical data provided."}), 400

    # Convert date strings to actual datetime objects
    history_df['transaction_date'] = pd.to_datetime(history_df['transaction_date'])
    # Convert amounts to numbers and take the absolute value (spending is positive)
    history_df['amount'] = pd.to_numeric(history_df['amount']).abs()

    # Sum up all transactions for each day to get total daily spending
    # 'D' stands for Daily. We fill any days with no spending with 0.
    daily_spending = history_df.resample('D', on='transaction_date')['amount'].sum().fillna(0)
    
    # If we have less than 2 data points, we can't train a model
    if len(daily_spending) < 2:
        return jsonify({"error": "Not enough historical data to make a prediction."}), 400

    # --- MODEL TRAINING ---

    # We need a numerical feature for time. We'll use "days from the start".
    # This creates an array like [0, 1, 2, 3, ...]
    X = np.arange(len(daily_spending)).reshape(-1, 1)
    y = daily_spending.values

    # Create and train the Linear Regression model
    model = LinearRegression()
    model.fit(X, y)

    # --- FORECASTING ---

    # Predict the spending for the next 30 days
    last_day_index = len(daily_spending) - 1
    future_days = np.arange(last_day_index + 1, last_day_index + 31).reshape(-1, 1)
    predicted_spending = model.predict(future_days)

    # Don't predict negative spending
    predicted_spending = predicted_spending.clip(min=0)

    # --- PREPARE RESPONSE ---

    # Get the dates for the forecast period
    last_date = daily_spending.index.max()
    future_dates = pd.to_datetime([last_date + pd.DateOffset(days=i) for i in range(1, 31)])

    # Combine historical and predicted data for the chart
    response_data = []
    # Add historical data
    for date, amount in daily_spending.items():
        response_data.append({
            "date": date.strftime('%Y-%m-%d'),
            "actual": amount,
            "predicted": None # No prediction for past dates
        })
    # Add forecasted data
    for i in range(len(future_dates)):
        response_data.append({
            "date": future_dates[i].strftime('%Y-%m-%d'),
            "actual": None, # No actual spending for future dates
            "predicted": predicted_spending[i]
        })
        
    return jsonify(response_data)

# 4. Start the server
if __name__ == '__main__':
    # Runs on port 5000 by default.
    # The debug=True flag allows you to see errors and automatically reloads the server when you save changes.
    app.run(host='0.0.0.0', debug=True, port=5001) # <-- CHANGE THIS LINE