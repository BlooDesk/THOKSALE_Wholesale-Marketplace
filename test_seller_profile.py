#!/usr/bin/env python3
"""
End-to-end test for ThokSale Seller Company Profile flow.
Creates a pre-confirmed seller user and tests the complete flow.
"""

import os
import sys
import json
import random
import string
import requests
from datetime import datetime

# Load environment variables from .env file
def load_env():
    env_vars = {}
    env_path = '/app/.env'
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key] = value
    return env_vars

env = load_env()
SUPABASE_URL = env.get('NEXT_PUBLIC_SUPABASE_URL', 'https://gwosqfpxqukmqjaobhms.supabase.co')
ANON_KEY = env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
SERVICE_ROLE_KEY = env.get('SUPABASE_SERVICE_ROLE_KEY')
BASE_URL = env.get('NEXT_PUBLIC_BASE_URL', 'https://wholesale-mvp-build.preview.emergentagent.com')

def random_suffix():
    """Generate random suffix for test data"""
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))

def create_test_seller():
    """Create a pre-confirmed seller user via Supabase Admin API"""
    print("\n=== STEP 0: Creating pre-confirmed test seller ===")
    
    suffix = random_suffix()
    email = f"qa-seller-{suffix}@thoksale.test"
    password = "TestPassword#123"
    
    # Create user via Admin API
    url = f"{SUPABASE_URL}/auth/v1/admin/users"
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "email": email,
        "password": password,
        "email_confirm": True,
        "user_metadata": {
            "full_name": "QA Seller",
            "phone": "+91 9812345678",
            "role": "seller",
            "company_name": "Acme QA Wholesale Pvt Ltd",
            "gst_number": "22AAAAA0000A1Z5"
        }
    }
    
    print(f"Creating user: {email}")
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code not in [200, 201]:
        print(f"❌ Failed to create user: {response.status_code}")
        print(f"Response: {response.text}")
        return None
    
    user_data = response.json()
    user_id = user_data.get('id')
    print(f"✅ User created: {user_id}")
    
    # Create profiles row
    print("Creating profiles row...")
    profiles_url = f"{SUPABASE_URL}/rest/v1/profiles"
    profiles_headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    profiles_payload = {
        "id": user_id,
        "email": email,
        "full_name": "QA Seller",
        "phone": "+91 9812345678",
        "role": "seller"
    }
    
    profiles_response = requests.post(profiles_url, headers=profiles_headers, json=profiles_payload)
    if profiles_response.status_code not in [200, 201]:
        print(f"❌ Failed to create profiles row: {profiles_response.status_code}")
        print(f"Response: {profiles_response.text}")
    else:
        print(f"✅ Profiles row created")
    
    # Create company_profiles row
    print("Creating company_profiles row...")
    company_url = f"{SUPABASE_URL}/rest/v1/company_profiles"
    company_headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    company_payload = {
        "profile_id": user_id,
        "legal_name": "Acme QA Wholesale Pvt Ltd",
        "display_name": "Acme QA Wholesale",
        "tax_id": "22AAAAA0000A1Z5",
        "kyc_status": "pending"
    }
    
    company_response = requests.post(company_url, headers=company_headers, json=company_payload)
    if company_response.status_code not in [200, 201]:
        print(f"❌ Failed to create company_profiles row: {company_response.status_code}")
        print(f"Response: {company_response.text}")
    else:
        print(f"✅ Company_profiles row created")
    
    return {
        "email": email,
        "password": password,
        "user_id": user_id
    }

def create_test_buyer():
    """Create a pre-confirmed buyer user for access control testing"""
    print("\n=== Creating test buyer for access control ===")
    
    suffix = random_suffix()
    email = f"qa-buyer-{suffix}@thoksale.test"
    password = "TestPassword#123"
    
    url = f"{SUPABASE_URL}/auth/v1/admin/users"
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "email": email,
        "password": password,
        "email_confirm": True,
        "user_metadata": {
            "full_name": "QA Buyer",
            "phone": "+91 9876543210",
            "role": "buyer"
        }
    }
    
    print(f"Creating buyer: {email}")
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code not in [200, 201]:
        print(f"❌ Failed to create buyer: {response.status_code}")
        print(f"Response: {response.text}")
        return None
    
    user_data = response.json()
    user_id = user_data.get('id')
    print(f"✅ Buyer created: {user_id}")
    
    # Create profiles row for buyer
    profiles_url = f"{SUPABASE_URL}/rest/v1/profiles"
    profiles_headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    profiles_payload = {
        "id": user_id,
        "email": email,
        "full_name": "QA Buyer",
        "phone": "+91 9876543210",
        "role": "buyer"
    }
    
    profiles_response = requests.post(profiles_url, headers=profiles_headers, json=profiles_payload)
    if profiles_response.status_code not in [200, 201]:
        print(f"❌ Failed to create buyer profiles row: {profiles_response.status_code}")
    else:
        print(f"✅ Buyer profiles row created")
    
    return {
        "email": email,
        "password": password,
        "user_id": user_id
    }

def verify_db_state(user_id):
    """Verify the database state after profile edits"""
    print("\n=== STEP 4: Verifying database state ===")
    
    url = f"{SUPABASE_URL}/rest/v1/company_profiles?profile_id=eq.{user_id}"
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Failed to fetch company profile: {response.status_code}")
        print(f"Response: {response.text}")
        return False
    
    data = response.json()
    if not data or len(data) == 0:
        print(f"❌ No company profile found for user {user_id}")
        return False
    
    company = data[0]
    print(f"✅ Company profile found:")
    print(f"   Display name: {company.get('display_name')}")
    print(f"   Business type: {company.get('business_type')}")
    print(f"   Website: {company.get('website')}")
    print(f"   City: {company.get('city')}")
    print(f"   State: {company.get('state')}")
    print(f"   Postal code: {company.get('postal_code')}")
    print(f"   Contact phone: {company.get('contact_phone')}")
    print(f"   Logo URL: {company.get('logo_url')}")
    
    # Verify expected values
    expected = {
        'display_name': 'Acme Wholesale',
        'business_type': 'Private Limited',
        'website': 'https://acme-wholesale.example.com',
        'city': 'Mumbai',
        'state': 'Maharashtra',
        'postal_code': '400001',
        'contact_phone': '+91 9812345678'
    }
    
    all_match = True
    for key, expected_value in expected.items():
        actual_value = company.get(key)
        if actual_value != expected_value:
            print(f"❌ Mismatch for {key}: expected '{expected_value}', got '{actual_value}'")
            all_match = False
    
    if all_match:
        print("✅ All fields match expected values")
    
    return all_match

if __name__ == "__main__":
    print("=" * 60)
    print("ThokSale Seller Company Profile E2E Test")
    print("=" * 60)
    
    # Create test seller
    seller = create_test_seller()
    if not seller:
        print("\n❌ Failed to create test seller. Exiting.")
        sys.exit(1)
    
    # Create test buyer
    buyer = create_test_buyer()
    if not buyer:
        print("\n⚠️  Failed to create test buyer. Access control tests will be skipped.")
    
    # Save credentials to file for Playwright
    credentials = {
        "seller": seller,
        "buyer": buyer,
        "base_url": BASE_URL,
        "supabase_url": SUPABASE_URL
    }
    
    with open('/tmp/test_credentials.json', 'w') as f:
        json.dump(credentials, f, indent=2)
    
    print("\n✅ Test setup complete!")
    print(f"\nSeller credentials:")
    print(f"  Email: {seller['email']}")
    print(f"  Password: {seller['password']}")
    print(f"  User ID: {seller['user_id']}")
    
    if buyer:
        print(f"\nBuyer credentials:")
        print(f"  Email: {buyer['email']}")
        print(f"  Password: {buyer['password']}")
    
    print(f"\nCredentials saved to: /tmp/test_credentials.json")
    print("\nNow run the Playwright tests...")
