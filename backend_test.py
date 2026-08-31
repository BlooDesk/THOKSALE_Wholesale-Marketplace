#!/usr/bin/env python3
"""
Backend tests for ThokSale authentication and onboarding.
Tests Supabase Auth integration, middleware, and profile creation.
"""

import os
import sys
import uuid
import time
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/.env')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000')

print(f"🔧 Configuration:")
print(f"   Base URL: {BASE_URL}")
print(f"   Supabase URL: {SUPABASE_URL}")
print(f"   Anon Key: {SUPABASE_ANON_KEY[:20]}...")
print(f"   Service Key: {SUPABASE_SERVICE_KEY[:20]}...")
print()

# Test counters
tests_passed = 0
tests_failed = 0
test_results = []


def log_test(name, passed, details=""):
    global tests_passed, tests_failed
    if passed:
        tests_passed += 1
        status = "✅ PASS"
    else:
        tests_failed += 1
        status = "❌ FAIL"
    
    result = f"{status}: {name}"
    if details:
        result += f"\n   {details}"
    print(result)
    test_results.append((name, passed, details))


def test_middleware_protected_routes():
    """Test middleware redirects for protected routes"""
    print("\n" + "="*80)
    print("TEST 1: Middleware / Protected Routes")
    print("="*80)
    
    # Test 1a: Unauthenticated access to /account should redirect to /login
    try:
        response = requests.get(f"{BASE_URL}/account", allow_redirects=False, timeout=15)
        if response.status_code in [307, 302, 303]:
            location = response.headers.get('Location', '')
            if '/login' in location and 'next=' in location:
                log_test("Unauthenticated /account redirects to /login", True, 
                        f"Status: {response.status_code}, Location: {location}")
            else:
                log_test("Unauthenticated /account redirects to /login", False,
                        f"Unexpected redirect location: {location}")
        else:
            log_test("Unauthenticated /account redirects to /login", False,
                    f"Expected redirect (307/302/303), got {response.status_code}")
    except Exception as e:
        log_test("Unauthenticated /account redirects to /login", False, f"Error: {str(e)}")
    
    # Test 1b: Public routes should return 200
    public_routes = ['/', '/login', '/register', '/forgot-password', '/verify-email']
    for route in public_routes:
        try:
            time.sleep(0.5)  # Small delay between requests
            response = requests.get(f"{BASE_URL}{route}", timeout=15)
            if response.status_code == 200:
                log_test(f"Public route {route} returns 200", True, f"Status: {response.status_code}")
            elif response.status_code == 502:
                log_test(f"Public route {route} returns 200", False, 
                        f"Server error (502) - route may be crashing or server restarting")
            else:
                log_test(f"Public route {route} returns 200", False, 
                        f"Expected 200, got {response.status_code}")
        except Exception as e:
            log_test(f"Public route {route} returns 200", False, f"Error: {str(e)}")


def test_auth_confirm_route():
    """Test /auth/confirm route with invalid params"""
    print("\n" + "="*80)
    print("TEST 2: /auth/confirm Route")
    print("="*80)
    
    time.sleep(1)  # Wait for server to be ready
    
    # Test 2a: Missing token_hash should redirect to /login?error=invalid-link
    try:
        response = requests.get(f"{BASE_URL}/auth/confirm", allow_redirects=False, timeout=15)
        if response.status_code in [307, 302, 303]:
            location = response.headers.get('Location', '')
            if '/login' in location and 'error=invalid-link' in location:
                log_test("/auth/confirm without params redirects to /login?error=invalid-link", True,
                        f"Status: {response.status_code}, Location: {location}")
            else:
                log_test("/auth/confirm without params redirects to /login?error=invalid-link", False,
                        f"Unexpected redirect: {location}")
        elif response.status_code == 502:
            log_test("/auth/confirm without params redirects to /login?error=invalid-link", False,
                    "Server error (502) - route may be crashing")
        else:
            log_test("/auth/confirm without params redirects to /login?error=invalid-link", False,
                    f"Expected redirect, got {response.status_code}")
    except Exception as e:
        log_test("/auth/confirm without params redirects to /login?error=invalid-link", False, 
                f"Error: {str(e)}")
    
    time.sleep(0.5)
    
    # Test 2b: Invalid token_hash should redirect to /login?error
    try:
        response = requests.get(
            f"{BASE_URL}/auth/confirm?token_hash=invalid123&type=email",
            allow_redirects=False,
            timeout=15
        )
        if response.status_code in [307, 302, 303]:
            location = response.headers.get('Location', '')
            if '/login' in location and 'error=' in location:
                log_test("/auth/confirm with invalid token redirects to /login?error", True,
                        f"Status: {response.status_code}, Location: {location}")
            else:
                log_test("/auth/confirm with invalid token redirects to /login?error", False,
                        f"Unexpected redirect: {location}")
        elif response.status_code == 502:
            log_test("/auth/confirm with invalid token redirects to /login?error", False,
                    "Server error (502) - route may be crashing")
        else:
            log_test("/auth/confirm with invalid token redirects to /login?error", False,
                    f"Expected redirect, got {response.status_code}")
    except Exception as e:
        log_test("/auth/confirm with invalid token redirects to /login?error", False,
                f"Error: {str(e)}")


def test_signout_route():
    """Test /auth/signout POST route"""
    print("\n" + "="*80)
    print("TEST 3: /auth/signout Route")
    print("="*80)
    
    try:
        response = requests.post(f"{BASE_URL}/auth/signout", allow_redirects=False, timeout=10)
        if response.status_code == 303:
            location = response.headers.get('Location', '')
            if '/login' in location:
                log_test("POST /auth/signout returns 303 redirect to /login", True,
                        f"Status: {response.status_code}, Location: {location}")
            else:
                log_test("POST /auth/signout returns 303 redirect to /login", False,
                        f"Unexpected redirect: {location}")
        else:
            log_test("POST /auth/signout returns 303 redirect to /login", False,
                    f"Expected 303, got {response.status_code}")
    except Exception as e:
        log_test("POST /auth/signout returns 303 redirect to /login", False, f"Error: {str(e)}")


def test_signup_buyer():
    """Test buyer signup via Supabase REST API and verify profile creation"""
    print("\n" + "="*80)
    print("TEST 4: Buyer Signup & Profile Creation")
    print("="*80)
    
    # Generate unique email
    test_id = str(uuid.uuid4())[:8]
    email = f"qa+buyer-{test_id}@example.com"
    password = "TestPass123!"
    full_name = "Test Buyer"
    phone = "+919876543210"
    
    print(f"   Creating buyer account: {email}")
    
    # Step 1: Sign up via Supabase Auth API
    try:
        signup_response = requests.post(
            f"{SUPABASE_URL}/auth/v1/signup",
            headers={
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'email': email,
                'password': password,
                'data': {
                    'full_name': full_name,
                    'phone': phone,
                    'role': 'buyer'
                }
            },
            timeout=10
        )
        
        if signup_response.status_code in [200, 201]:
            signup_data = signup_response.json()
            user_id = signup_data.get('user', {}).get('id')
            
            if user_id:
                log_test("Buyer signup via Supabase Auth API", True,
                        f"User ID: {user_id}")
                
                # Step 2: Verify profile was created (using service role key)
                # Note: The Next.js server action should have created this via admin client
                # We'll check if it exists by querying with service role
                try:
                    profile_response = requests.get(
                        f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}",
                        headers={
                            'apikey': SUPABASE_SERVICE_KEY,
                            'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
                            'Content-Type': 'application/json'
                        },
                        timeout=10
                    )
                    
                    if profile_response.status_code == 200:
                        profiles = profile_response.json()
                        if len(profiles) > 0:
                            profile = profiles[0]
                            if (profile.get('role') == 'buyer' and 
                                profile.get('email') == email and
                                profile.get('full_name') == full_name):
                                log_test("Buyer profile created in database", True,
                                        f"Profile: role={profile.get('role')}, email={profile.get('email')}")
                            else:
                                log_test("Buyer profile created in database", False,
                                        f"Profile data mismatch: {profile}")
                        else:
                            log_test("Buyer profile created in database", False,
                                    "Profile not found in database (server action may not have run)")
                    else:
                        log_test("Buyer profile created in database", False,
                                f"Failed to query profiles: {profile_response.status_code}")
                except Exception as e:
                    log_test("Buyer profile created in database", False, f"Error querying profile: {str(e)}")
            else:
                log_test("Buyer signup via Supabase Auth API", False,
                        "No user ID in response")
        else:
            log_test("Buyer signup via Supabase Auth API", False,
                    f"Status: {signup_response.status_code}, Body: {signup_response.text[:200]}")
    except Exception as e:
        log_test("Buyer signup via Supabase Auth API", False, f"Error: {str(e)}")


def test_signup_seller():
    """Test seller signup via Supabase REST API and verify profile + company_profile creation"""
    print("\n" + "="*80)
    print("TEST 5: Seller Signup & Profile Creation")
    print("="*80)
    
    # Generate unique email
    test_id = str(uuid.uuid4())[:8]
    email = f"qa+seller-{test_id}@example.com"
    password = "TestPass123!"
    full_name = "Test Seller"
    phone = "+919876543211"
    company_name = "Test Company Pvt Ltd"
    gst_number = "29ABCDE1234F1Z5"
    
    print(f"   Creating seller account: {email}")
    
    # Step 1: Sign up via Supabase Auth API
    try:
        signup_response = requests.post(
            f"{SUPABASE_URL}/auth/v1/signup",
            headers={
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'email': email,
                'password': password,
                'data': {
                    'full_name': full_name,
                    'phone': phone,
                    'role': 'seller',
                    'company_name': company_name,
                    'gst_number': gst_number
                }
            },
            timeout=10
        )
        
        if signup_response.status_code in [200, 201]:
            signup_data = signup_response.json()
            user_id = signup_data.get('user', {}).get('id')
            
            if user_id:
                log_test("Seller signup via Supabase Auth API", True,
                        f"User ID: {user_id}")
                
                # Step 2: Verify profile was created
                try:
                    profile_response = requests.get(
                        f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}",
                        headers={
                            'apikey': SUPABASE_SERVICE_KEY,
                            'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
                            'Content-Type': 'application/json'
                        },
                        timeout=10
                    )
                    
                    if profile_response.status_code == 200:
                        profiles = profile_response.json()
                        if len(profiles) > 0:
                            profile = profiles[0]
                            if (profile.get('role') == 'seller' and 
                                profile.get('email') == email):
                                log_test("Seller profile created in database", True,
                                        f"Profile: role={profile.get('role')}, email={profile.get('email')}")
                            else:
                                log_test("Seller profile created in database", False,
                                        f"Profile data mismatch: {profile}")
                        else:
                            log_test("Seller profile created in database", False,
                                    "Profile not found in database")
                    else:
                        log_test("Seller profile created in database", False,
                                f"Failed to query profiles: {profile_response.status_code}")
                except Exception as e:
                    log_test("Seller profile created in database", False, f"Error: {str(e)}")
                
                # Step 3: Verify company_profile was created
                try:
                    company_response = requests.get(
                        f"{SUPABASE_URL}/rest/v1/company_profiles?profile_id=eq.{user_id}",
                        headers={
                            'apikey': SUPABASE_SERVICE_KEY,
                            'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
                            'Content-Type': 'application/json'
                        },
                        timeout=10
                    )
                    
                    if company_response.status_code == 200:
                        companies = company_response.json()
                        if len(companies) > 0:
                            company = companies[0]
                            if (company.get('legal_name') == company_name and
                                company.get('tax_id') == gst_number):
                                log_test("Seller company_profile created in database", True,
                                        f"Company: {company.get('legal_name')}, GST: {company.get('tax_id')}")
                            else:
                                log_test("Seller company_profile created in database", False,
                                        f"Company data mismatch: {company}")
                        else:
                            log_test("Seller company_profile created in database", False,
                                    "Company profile not found in database")
                    else:
                        log_test("Seller company_profile created in database", False,
                                f"Failed to query company_profiles: {company_response.status_code}")
                except Exception as e:
                    log_test("Seller company_profile created in database", False, f"Error: {str(e)}")
            else:
                log_test("Seller signup via Supabase Auth API", False,
                        "No user ID in response")
        else:
            log_test("Seller signup via Supabase Auth API", False,
                    f"Status: {signup_response.status_code}, Body: {signup_response.text[:200]}")
    except Exception as e:
        log_test("Seller signup via Supabase Auth API", False, f"Error: {str(e)}")


def test_password_reset():
    """Test password reset request via Supabase REST API"""
    print("\n" + "="*80)
    print("TEST 6: Password Reset Request")
    print("="*80)
    
    # Use a test email (doesn't need to exist for this test)
    email = "test@example.com"
    
    try:
        response = requests.post(
            f"{SUPABASE_URL}/auth/v1/recover",
            headers={
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
                'Content-Type': 'application/json'
            },
            json={'email': email},
            timeout=10
        )
        
        # Supabase returns 200 even if email doesn't exist (security best practice)
        if response.status_code == 200:
            log_test("Password reset request via Supabase API", True,
                    f"Status: {response.status_code}")
        else:
            log_test("Password reset request via Supabase API", False,
                    f"Expected 200, got {response.status_code}, Body: {response.text[:200]}")
    except Exception as e:
        log_test("Password reset request via Supabase API", False, f"Error: {str(e)}")


def print_summary():
    """Print test summary"""
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    print(f"Total tests: {tests_passed + tests_failed}")
    print(f"✅ Passed: {tests_passed}")
    print(f"❌ Failed: {tests_failed}")
    print()
    
    if tests_failed > 0:
        print("Failed tests:")
        for name, passed, details in test_results:
            if not passed:
                print(f"  - {name}")
                if details:
                    print(f"    {details}")
    
    return tests_failed == 0


if __name__ == '__main__':
    print("🚀 Starting ThokSale Backend Authentication Tests")
    print("="*80)
    
    # Run all tests
    test_middleware_protected_routes()
    test_auth_confirm_route()
    test_signout_route()
    test_signup_buyer()
    test_signup_seller()
    test_password_reset()
    
    # Print summary
    success = print_summary()
    
    sys.exit(0 if success else 1)
