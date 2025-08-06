import pandas as pd
from prophet import Prophet
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from datetime import date

logging.basicConfig(level=logging.INFO)
app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if not data or 'history' not in data:
        return jsonify({"error": "Invalid input: 'history' key not found."}), 400

    history_df = pd.DataFrame(data['history'])
    if history_df.empty:
        return jsonify({"error": "No historical data provided."}), 400

    history_df['transaction_date'] = pd.to_datetime(history_df['transaction_date'])
    history_df['amount'] = pd.to_numeric(history_df['amount']).abs()
    
    if 'category' not in history_df.columns:
        history_df['category'] = 'One-time'
    else:
        history_df['category'] = history_df['category'].fillna('One-time')

    subscriptions = history_df[history_df['category'].str.lower() == 'subscription']
    holidays = []
    if not subscriptions.empty:
        subscription_days = subscriptions['transaction_date'].dt.day.unique()
        
        for day in subscription_days:
            holiday_name = f"Subscription_Day_{day}"
            valid_dates = []
            for year in [2024, 2025, 2026]:
                for month in range(1, 13):
                    try:
                        d = date(year, month, day)
                        valid_dates.append(pd.to_datetime(d))
                    except ValueError:
                        continue
            
            if valid_dates:
                holidays.append(pd.DataFrame({
                    'holiday': holiday_name,
                    'ds': valid_dates,
                    'lower_window': 0,
                    'upper_window': 0,
                }))

    holidays_df = pd.concat(holidays, ignore_index=True) if holidays else None
    if holidays_df is not None:
        logging.info(f"Created custom holidays for subscription days: {holidays_df['holiday'].unique().tolist()}")

    daily_spending = history_df.resample('D', on='transaction_date')['amount'].sum().fillna(0)
    
    prophet_df = daily_spending.reset_index()
    prophet_df.rename(columns={'transaction_date': 'ds', 'amount': 'y'}, inplace=True)
    
    prophet_df['ds'] = prophet_df['ds'].dt.tz_localize(None)
    prophet_df['cap'] = 1500

    if len(prophet_df) < 2:
        return jsonify({"error": "Not enough historical data to make a prediction."}), 400

    # CORRECTED MODEL INITIALIZATION
    model = Prophet(
        growth='logistic',
        yearly_seasonality=False,
        changepoint_prior_scale=0.01,
        holidays=holidays_df
    )
    # Add monthly seasonality in a separate step for compatibility
    model.add_seasonality(name='monthly', period=30.5, fourier_order=5)
    
    model.fit(prophet_df)

    future = model.make_future_dataframe(periods=30)
    future['cap'] = 1500

    forecast = model.predict(future)
    forecast['yhat'] = forecast['yhat'].clip(lower=0)
    
    # PREPARE RESPONSE
    forecast_data = forecast[['ds', 'yhat']].tail(30)
    response_data = []
    for index, row in prophet_df.iterrows():
        response_data.append({
            "date": row['ds'].strftime('%Y-%m-%d'),
            "actual": row['y'],
            "predicted": None
        })
    for index, row in forecast_data.iterrows():
        response_data.append({
            "date": row['ds'].strftime('%Y-%m-%d'),
            "actual": None,
            "predicted": row['yhat']
        })
        
    return jsonify(response_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)