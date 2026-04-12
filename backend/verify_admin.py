import requests
import json

BASE_URL = "http://localhost:8000"

def test_admin_stats():
    print("\n--- Testing Admin Stats ---")
    try:
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error connecting: {e}")

def test_create_and_audit():
    print("\n--- Testing Admin Patient Creation & Audit ---")
    patient_data = {
        "first_name": "Test",
        "last_name": "Patient",
        "email": "test@audit.com",
        "phone": "09123456789",
        "date_of_birth": "1990-01-01",
        "sex": "Male",
        "address": "Zone 1",
        "barangay": "Unknown"
    }
    
    try:
        # Create patient
        print("Creating patient...")
        res = requests.post(f"{BASE_URL}/api/patients/", json=patient_data)
        print(f"Create Status: {res.status_code}")
        
        # Check audit logs
        if res.status_code == 200:
            print("Checking audit logs...")
            res_logs = requests.get(f"{BASE_URL}/api/admin/audit-logs")
            logs = res_logs.json()
            # print(json.dumps(logs[0], indent=2))
            found = any(log['details'] == f"Added patient {patient_data['first_name']} {patient_data['last_name']}" for log in logs)
            print(f"Audit log found: {found}")
            
            # Clean up
            pat_id = res.json()['id']
            print(f"Cleaning up (deleting patient {pat_id})...")
            requests.delete(f"{BASE_URL}/api/patients/{pat_id}")
        else:
            print(f"Create Error: {res.text}")
    except Exception as e:
        print(f"Error connecting: {e}")

if __name__ == "__main__":
    test_admin_stats()
    test_create_and_audit()
