from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import pickle
import io
import logging
from werkzeug.utils import secure_filename
import os

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global variable to store the loaded model
model = None

# Attack type mappings
ATTACK_TYPES = {
    0: "BENIGN",
    1: "Bot", 
    2: "DDoS",
    3: "DoS GoldenEye",
    4: "DoS Hulk",
    5: "DoS Slowhttptest", 
    6: "DoS Slowloris",
    7: "FTP-Patator",
    8: "Heartbleed",
    9: "Infiltration",
    10: "PortScan",
    11: "SSH-Patator",
    12: "Web Attack  Brute Force",
    13: "Web Attack  SQL Injection", 
    14: "Web Attack  XSS"
}

def load_model():
    """Load the XGBoost model from pickle file"""
    global model
    try:
        model_path = os.path.join(os.path.dirname(__file__), '..', 'xgboost_model.pkl')
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        logger.info("Model loaded successfully")
        return True
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        return False

def prepare_features(data):
    """Prepare features for prediction by ensuring correct order and format"""
    try:
        # Load the exact feature columns from the CSV file
        csv_path = os.path.join(os.path.dirname(__file__), '..', 'test_data.csv')
        sample_df = pd.read_csv(csv_path, nrows=1)
        feature_columns = [col for col in sample_df.columns if col not in ['Unnamed: 0', 'Label', 'Label_Encoded']]
        
        if isinstance(data, dict):
            # Single prediction - convert dict to DataFrame
            df = pd.DataFrame([data])
        else:
            # Batch prediction - data is already a DataFrame
            df = data.copy()
        
        # Select only the feature columns
        if 'Unnamed: 0' in df.columns:
            df = df.drop('Unnamed: 0', axis=1)
        if 'Label' in df.columns:
            df = df.drop('Label', axis=1)
        if 'Label_Encoded' in df.columns:
            df = df.drop('Label_Encoded', axis=1)
        
        # Ensure all required features are present
        missing_features = set(feature_columns) - set(df.columns)
        if missing_features:
            logger.warning(f"Missing features: {missing_features}")
            # Fill missing features with 0
            for feature in missing_features:
                df[feature] = 0
        
        # Select features in the correct order
        df = df[feature_columns]
        
        # The model expects 79 features but CSV has 78, add a dummy feature
        if df.shape[1] == 78:
            df['Dummy_Feature'] = 0
        
        # Convert to numpy array
        return df.values
        
    except Exception as e:
        logger.error(f"Error preparing features: {str(e)}")
        raise

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

@app.route('/predict', methods=['POST'])
def predict_single():
    """Predict attack type for a single set of features"""
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Prepare features
        features = prepare_features(data)
        
        # Make prediction
        prediction = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        
        # Get confidence (probability of predicted class)
        confidence = float(probabilities[prediction]) * 100
        
        result = {
            'label': int(prediction),
            'attack_type': ATTACK_TYPES.get(prediction, 'Unknown'),
            'confidence': round(confidence, 2),
            'timestamp': pd.Timestamp.now().isoformat()
        }
        
        logger.info(f"Single prediction result: {result}")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in single prediction: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/predict_csv', methods=['POST'])
def predict_csv():
    """Predict attack types for CSV file upload"""
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.lower().endswith('.csv'):
            return jsonify({'error': 'File must be a CSV'}), 400
        
        # Read CSV file
        try:
            csv_content = file.read().decode('utf-8')
            df = pd.read_csv(io.StringIO(csv_content))
        except Exception as e:
            return jsonify({'error': f'Error reading CSV: {str(e)}'}), 400
        
        if df.empty:
            return jsonify({'error': 'CSV file is empty'}), 400
        
        # Prepare features
        features = prepare_features(df)
        
        # Make predictions
        predictions = model.predict(features)
        probabilities = model.predict_proba(features)
        
        # Prepare results
        results = []
        for i, (pred, probs) in enumerate(zip(predictions, probabilities)):
            confidence = float(probs[pred]) * 100
            results.append({
                'row': i + 1,
                'label': int(pred),
                'attack_type': ATTACK_TYPES.get(pred, 'Unknown'),
                'confidence': round(confidence, 2)
            })
        
        response = {
            'total_predictions': len(results),
            'results': results,
            'timestamp': pd.Timestamp.now().isoformat()
        }
        
        logger.info(f"CSV prediction completed: {len(results)} predictions")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in CSV prediction: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/attack_types', methods=['GET'])
def get_attack_types():
    """Get all available attack types"""
    return jsonify(ATTACK_TYPES)

@app.route('/model_info', methods=['GET'])
def get_model_info():
    """Get information about the loaded model"""
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        info = {
            'model_type': str(type(model).__name__),
            'feature_count': model.n_features_in_ if hasattr(model, 'n_features_in_') else 'Unknown',
            'classes': len(ATTACK_TYPES),
            'attack_types': ATTACK_TYPES
        }
        
        return jsonify(info)
        
    except Exception as e:
        logger.error(f"Error getting model info: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Load model on startup
    if load_model():
        logger.info("Starting Flask server...")
        app.run(debug=True, host='0.0.0.0', port=5000)
    else:
        logger.error("Failed to load model. Exiting...")
        exit(1)