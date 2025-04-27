import pandas as pd
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pd.options.display.max_rows = 9999
df = pd.read_csv("games.csv")

df['gameday'] = pd.to_datetime(df['gameday'])
df.sort_values(['away_team', 'gameday'], inplace=True)

df['away_rest_days'] = df.groupby('away_team')['gameday'].diff().dt.days.fillna(7)

df.sort_values(['home_team', 'gameday'], inplace=True)
df['home_rest_days'] = df.groupby('home_team')['gameday'].diff().dt.days.fillna(7)

df['roof_encoded'] = df['roof'].map({'dome': 1, 'outdoors': 0})
df['surface_cleaned'] = df['surface'].fillna('nan').str.strip().str.lower()

surface_map = {
    'grass': 0,
    'fieldturf': 1,
    'astroturf': 2,
    'sportturf': 3,
    'dessograss': 4,
    'astroplay': 5,
    'a_turf': 6,
    'matrixturf': 7,
    'nan': -1
}

df['surface_encoded'] = df['surface_cleaned'].map(surface_map)

df['home_win'] = (df['home_score'] > df['away_score']).astype(int)

df['moneyline_diff'] = -(df['home_moneyline'] - df['away_moneyline'])

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, roc_auc_score
from sklearn.impute import SimpleImputer

features = ['away_rest_days', 'home_rest_days', 'moneyline_diff', 'spread_line', 
            'temp', 'wind', 'roof_encoded', 'surface_encoded']
target = 'home_win'

X = df[features]
y = df[target]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

pipeline_lr = Pipeline([
    ('imputer', SimpleImputer(strategy='mean')),
    ('scaler', StandardScaler()),
    ('clf', LogisticRegression(solver='saga', max_iter=20))
])

cv_scores_lr = cross_val_score(pipeline_lr, X_train, y_train, cv=5, scoring='roc_auc')
print(f'Logistic Regression CV ROC AUC: {cv_scores_lr.mean():.3f}')
pipeline_lr.fit(X_train, y_train)
y_pred_lr = pipeline_lr.predict(X_test)
print('Test Accuracy:', accuracy_score(y_test, y_pred_lr))
print('Test ROC AUC:', roc_auc_score(y_test, pipeline_lr.predict_proba(X_test)[:, 1]))

pipeline_rf = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler()),
    ('clf', RandomForestClassifier(n_estimators=100, random_state=42))
])

cv_scores_rf = cross_val_score(pipeline_rf, X_train, y_train, cv=4, scoring='roc_auc')
print(f'Random Forest CV ROC AUC: {cv_scores_rf.mean():.3f}')

pipeline_rf.fit(X_train, y_train)

y_pred_rf = pipeline_rf.predict(X_test)
y_proba_rf = pipeline_rf.predict_proba(X_test)[:, 1]

print('Random Forest Test Accuracy:', accuracy_score(y_test, y_pred_rf))
print('Random Forest Test ROC AUC:', roc_auc_score(y_test, y_proba_rf))

single_game_data = {
    'away_rest_days': [7],
    'home_rest_days': [10],
    'moneyline_diff': [100],     
    'spread_line': [7],          
    'temp': [70],            
    'wind': [5],              
    'roof_encoded': [0],          
    'surface_encoded': [1]    
}

test_df = pd.DataFrame(single_game_data, columns=features)
y_pred_single = pipeline_lr.predict(test_df)
print("Predicted label for single game:", y_pred_single[0])

y_proba_single = pipeline_lr.predict_proba(test_df)
print("Probability for each class [0, 1]:", y_proba_single[0])
