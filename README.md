Misinformation Detection on Social Media

Session 25 (Tutor: Zehang Deng) – Group 6
Members: Soad Yusuf (105406263), Nishama Warnakulasooriya Mahalekamge (105025150)

1) Overview

This project trains machine-learning classifiers to detect misinformation (FAKE) vs. credible (REAL) content using three public datasets (News Detection, Misinformation, FakeNewsNet).
We unify the datasets, clean text, build TF–IDF features (5,000 terms), and train three models:

Logistic Regression (baseline)

Linear Support Vector Classifier (LinearSVC, best)

Random Forest

Key results (test set ~17,734 samples):

Logistic Regression: ~94% accuracy

Random Forest: ~95% accuracy

LinearSVC: ~96% accuracy (best)

(Google Colab)

1- Open Colab and upload notebooks/Misinformation.ipynb.

2- Mount Drive if your data is in Drive:

from google.colab import drive
drive.mount('/content/drive')

3-Unzip the datasets if you stored them as .zip in Drive:

import zipfile, os
zip_path = "/content/drive/My Drive/Innovation Project/FakeNewsNet.zip"
extract_path = "/content/Innovation_Project/FakeNewsNet"
os.makedirs(extract_path, exist_ok=True)
with zipfile.ZipFile(zip_path, "r") as zf:
    zf.extractall(extract_path)

4-Set paths used in the notebook

NEWS_PATH = "/content/Innovation_Project/News_Detection/fake_and_real_news.csv"
MISINFO_FAKE = "/content/Innovation_Project/Misinformation/DataSet_Misinfo_FAKE.csv"
MISINFO_TRUE = "/content/Innovation_Project/Misinformation/DataSet_Misinfo_TRUE.csv"
FNN_FAKE = "/content/Innovation_Project/FakeNewsNet/BuzzFeed_fake_news_content.csv"
FNN_REAL = "/content/Innovation_Project/FakeNewsNet/BuzzFeed_real_news_content.csv"

5-Run all cells
