import os
from dotenv import load_dotenv
from azure.storage.blob import BlobServiceClient
from azure.core.credentials import AzureKeyCredential
from azure.ai.documentintelligence import DocumentIntelligenceClient

# This is the magic line that actually reads your .env file!
load_dotenv()

storage_conn_str = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
ocr_endpoint = os.getenv('AZURE_OCR_ENDPOINT')
ocr_key = os.getenv('AZURE_OCR_KEY')

print('Testing Azure Storage Connection...')
try:
    if not storage_conn_str:
        raise ValueError("Storage connection string not found in .env!")
    blob_service_client = BlobServiceClient.from_connection_string(storage_conn_str)
    print('[OK] Azure Storage connection verified!')
except Exception as e:
    print(f'[ERROR] Storage failed: {e}')

print('\nTesting Azure AI Document Intelligence Connection...')
try:
    if not ocr_endpoint or not ocr_key:
        raise ValueError("OCR keys not found in .env!")
    document_intelligence_client = DocumentIntelligenceClient(
        endpoint=ocr_endpoint, credential=AzureKeyCredential(ocr_key)
    )
    print('[OK] Azure AI Document Intelligence client initialized successfully!')
except Exception as e:
    print(f'[ERROR] OCR Client failed: {e}')

print('\nAzure setup verification complete.')