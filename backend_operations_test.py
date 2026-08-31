#!/usr/bin/env python3
"""
Backend tests for ThokSale Operations & Administration module.
Tests freight quotes, RFQs, notifications, and admin functionality.
"""

import os
import sys
import uuid
import time
import requests
import json
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

# Test data
TEST_SELLER_ID = "deb6ad2c-e141-4102-930f-c9ac45ff0d5e"
test_buyer_id = None
test_buyer_email = None
test_buyer_password = "TestBuyer123!@#"
test_order_id = None
test_freight_quote_id = None
test_rfq_id = None
test_rfq_response_id = None
test_category_id = None


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


def supabase_rest(method, path, data=None, use_service_key=False, user_jwt=None, prefer=None):
    """Helper to make Supabase REST API calls"""
    url = f"{SUPABASE_URL}{path}"
    headers = {
        'apikey': SUPABASE_SERVICE_KEY if use_service_key else SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
    }
    if use_service_key:
        headers['Authorization'] = f'Bearer {SUPABASE_SERVICE_KEY}'
    elif user_jwt:
        headers['Authorization'] = f'Bearer {user_jwt}'
    
    if prefer:
        headers['Prefer'] = prefer
    
    if method == 'GET':
        return requests.get(url, headers=headers, timeout=15)
    elif method == 'POST':
        return requests.post(url, headers=headers, json=data, timeout=15)
    elif method == 'PATCH':
        return requests.patch(url, headers=headers, json=data, timeout=15)
    elif method == 'DELETE':
        return requests.delete(url, headers=headers, timeout=15)


def test_stage_a_route_access_control():
    """STAGE A — Route access control (unauthenticated)"""
    print("\n" + "="*80)
    print("STAGE A — Route Access Control (Unauthenticated)")
    print("="*80)
    
    protected_routes = [
        '/rfq',
        '/rfq/new',
        '/rfq/anything',
        '/seller/rfq',
        '/notifications',
        '/admin',
        '/admin/users',
        '/admin/categories',
        '/admin/products',
        '/admin/orders',
        '/admin/rfqs',
    ]
    
    for route in protected_routes:
        try:
            time.sleep(0.3)
            response = requests.get(f"{BASE_URL}{route}", allow_redirects=False, timeout=15)
            if response.status_code == 307:
                location = response.headers.get('Location', '')
                log_test(f"GET {route} -> 307 redirect", True, 
                        f"Status: {response.status_code}, Location: {location}")
            else:
                log_test(f"GET {route} -> 307 redirect", False,
                        f"Expected 307, got {response.status_code}")
        except Exception as e:
            log_test(f"GET {route} -> 307 redirect", False, f"Error: {str(e)}")


def test_stage_b_admin_gating():
    """STAGE B — Admin gating"""
    print("\n" + "="*80)
    print("STAGE B — Admin Gating")
    print("="*80)
    
    global test_buyer_id, test_buyer_email
    
    # Create a test buyer
    test_buyer_email = f"buyer_ops_test_{int(time.time())}@example.com"
    
    try:
        # Sign up buyer via Supabase Auth
        signup_response = supabase_rest('POST', '/auth/v1/signup', {
            'email': test_buyer_email,
            'password': test_buyer_password,
            'data': {'role': 'buyer'}
        })
        
        if signup_response.status_code in [200, 201]:
            signup_data = signup_response.json()
            test_buyer_id = signup_data.get('user', {}).get('id')
            log_test("Create test buyer via Supabase Auth", True, 
                    f"Buyer ID: {test_buyer_id}")
            
            # Create profile for buyer using SERVICE_ROLE_KEY
            profile_response = supabase_rest('POST', '/rest/v1/profiles', {
                'id': test_buyer_id,
                'email': test_buyer_email,
                'full_name': 'Test Buyer',
                'role': 'buyer',
                'is_active': True
            }, use_service_key=True)
            
            if profile_response.status_code in [200, 201]:
                log_test("Create buyer profile", True, f"Status: {profile_response.status_code}")
            else:
                log_test("Create buyer profile", False, 
                        f"Status: {profile_response.status_code}, Body: {profile_response.text}")
        else:
            log_test("Create test buyer via Supabase Auth", False,
                    f"Status: {signup_response.status_code}, Body: {signup_response.text}")
            return
    except Exception as e:
        log_test("Create test buyer", False, f"Error: {str(e)}")
        return
    
    # Sign in as buyer and try to access /admin
    try:
        time.sleep(1)
        signin_response = supabase_rest('POST', '/auth/v1/token?grant_type=password', {
            'email': test_buyer_email,
            'password': test_buyer_password
        })
        
        if signin_response.status_code == 200:
            signin_data = signin_response.json()
            buyer_jwt = signin_data.get('access_token')
            
            # Try to access /admin as non-admin
            time.sleep(0.5)
            admin_response = requests.get(f"{BASE_URL}/admin", 
                                         cookies={'sb-access-token': buyer_jwt},
                                         timeout=15)
            
            if admin_response.status_code == 200 and 'Admins only' in admin_response.text:
                log_test("Non-admin access to /admin shows 403 page", True,
                        f"Status: 200, Body contains 'Admins only'")
            else:
                log_test("Non-admin access to /admin shows 403 page", False,
                        f"Status: {admin_response.status_code}, Expected 'Admins only' in body")
        else:
            log_test("Sign in as buyer", False,
                    f"Status: {signin_response.status_code}, Body: {signin_response.text}")
    except Exception as e:
        log_test("Non-admin access to /admin", False, f"Error: {str(e)}")
    
    # Grant admin role to test seller
    try:
        time.sleep(0.5)
        grant_response = supabase_rest('PATCH', 
                                      f'/rest/v1/profiles?id=eq.{TEST_SELLER_ID}',
                                      {'role': 'admin'},
                                      use_service_key=True)
        
        if grant_response.status_code in [200, 204]:
            log_test("Grant admin role to test seller", True,
                    f"Status: {grant_response.status_code}")
            
            # Sign in as seller (now admin) and access /admin
            time.sleep(0.5)
            seller_signin = supabase_rest('POST', '/auth/v1/token?grant_type=password', {
                'email': 'seller_qa_1783411980@thoksale.test',  # Known seller email
                'password': 'SellerQA123!@#'
            })
            
            if seller_signin.status_code == 200:
                seller_jwt = seller_signin.json().get('access_token')
                time.sleep(0.5)
                admin_page = requests.get(f"{BASE_URL}/admin",
                                         cookies={'sb-access-token': seller_jwt},
                                         timeout=15)
                
                if admin_page.status_code == 200 and 'Admin Dashboard' in admin_page.text:
                    log_test("Admin user access to /admin shows dashboard", True,
                            f"Status: 200, Body contains 'Admin Dashboard'")
                else:
                    log_test("Admin user access to /admin shows dashboard", False,
                            f"Status: {admin_page.status_code}")
            else:
                log_test("Sign in as seller (admin)", False,
                        f"Status: {seller_signin.status_code}")
            
            # Revert role back to seller
            time.sleep(0.5)
            revert_response = supabase_rest('PATCH',
                                           f'/rest/v1/profiles?id=eq.{TEST_SELLER_ID}',
                                           {'role': 'seller'},
                                           use_service_key=True)
            log_test("Revert seller role", revert_response.status_code in [200, 204],
                    f"Status: {revert_response.status_code}")
        else:
            log_test("Grant admin role to test seller", False,
                    f"Status: {grant_response.status_code}, Body: {grant_response.text}")
    except Exception as e:
        log_test("Admin role grant/test", False, f"Error: {str(e)}")


def test_stage_c_freight_quote_flow():
    """STAGE C — Freight quote flow via REST simulation"""
    print("\n" + "="*80)
    print("STAGE C — Freight Quote Flow via REST")
    print("="*80)
    
    global test_order_id, test_freight_quote_id, test_buyer_id
    
    # First, check if we have a buyer ID
    if not test_buyer_id:
        # Use seller as both buyer and seller for testing
        test_buyer_id = TEST_SELLER_ID
        log_test("Using seller as buyer for freight test", True, 
                f"Buyer ID: {test_buyer_id}")
    
    # Create a test order with 'accepted' status directly
    try:
        order_number = f"ORD-{int(time.time())}"
        order_data = {
            'order_number': order_number,
            'buyer_id': test_buyer_id,
            'seller_id': TEST_SELLER_ID,
            'status': 'accepted',
            'currency': 'INR',
            'subtotal': 10000,
            'tax_total': 1800,
            'discount_total': 0,
            'freight_total': 0,
            'grand_total': 11800
        }
        
        order_response = supabase_rest('POST', '/rest/v1/orders?select=id',
                                      order_data, use_service_key=True)
        
        if order_response.status_code in [200, 201]:
            test_order_id = order_response.json()[0]['id']
            log_test("Create test order with status='accepted'", True, f"Order ID: {test_order_id}")
        else:
            # Check if it's an enum error
            if 'invalid input value for enum order_status' in order_response.text:
                if 'accepted' in order_response.text:
                    log_test("Create test order", False,
                            f"⚠️  BLOCKER: Enum value 'accepted' not found. Database schema not applied correctly.")
                else:
                    log_test("Create test order", False,
                            f"⚠️  BLOCKER: order_status enum issue. Error: {order_response.text}")
            else:
                log_test("Create test order", False,
                        f"Status: {order_response.status_code}, Body: {order_response.text}")
            return
    except Exception as e:
        log_test("Create test order", False, f"Error: {str(e)}")
        return
    
    # Insert freight quote
    try:
        time.sleep(0.5)
        freight_data = {
            'order_id': test_order_id,
            'buyer_id': test_buyer_id or TEST_SELLER_ID,
            'seller_id': TEST_SELLER_ID,
            'status': 'quoted',
            'quoted_amount': 500,
            'transit_days': 5,
            'currency': 'INR',
            'origin_address': {},
            'destination_address': {}
        }
        
        freight_response = supabase_rest('POST',
                                        '/rest/v1/freight_quotes?select=id&Prefer=return=representation',
                                        freight_data, use_service_key=True)
        
        if freight_response.status_code in [200, 201]:
            test_freight_quote_id = freight_response.json()[0]['id']
            log_test("Insert freight quote", True,
                    f"Freight Quote ID: {test_freight_quote_id}")
        else:
            log_test("Insert freight quote", False,
                    f"Status: {freight_response.status_code}, Body: {freight_response.text}")
            return
    except Exception as e:
        log_test("Insert freight quote", False, f"Error: {str(e)}")
        return
    
    # Update order to 'freight_quote_sent' - THIS IS THE CRITICAL TEST
    try:
        time.sleep(0.5)
        freight_sent_data = {
            'status': 'freight_quote_sent',
            'freight_quote_id': test_freight_quote_id,
            'freight_total': 500,
            'grand_total': 12300  # 11800 + 500
        }
        
        freight_sent_response = supabase_rest('PATCH',
                                             f'/rest/v1/orders?id=eq.{test_order_id}',
                                             freight_sent_data,
                                             use_service_key=True)
        
        if freight_sent_response.status_code in [200, 204]:
            log_test("Update order to 'freight_quote_sent'", True,
                    f"Status: {freight_sent_response.status_code}")
        elif 'invalid input value for enum order_status' in freight_sent_response.text:
            log_test("Update order to 'freight_quote_sent'", False,
                    f"⚠️  BLOCKER: Enum value 'freight_quote_sent' not found. User must apply orders_status_extension_v2.sql")
            print(f"   Error: {freight_sent_response.text}")
            return
        else:
            log_test("Update order to 'freight_quote_sent'", False,
                    f"Status: {freight_sent_response.status_code}, Body: {freight_sent_response.text}")
            return
    except Exception as e:
        log_test("Update order to freight_quote_sent", False, f"Error: {str(e)}")
        return
    
    # Continue with freight flow
    statuses = ['freight_approved', 'ready_for_payment', 'processing', 'shipped', 'delivered']
    for status in statuses:
        try:
            time.sleep(0.5)
            status_response = supabase_rest('PATCH',
                                           f'/rest/v1/orders?id=eq.{test_order_id}',
                                           {'status': status},
                                           use_service_key=True)
            
            if status_response.status_code in [200, 204]:
                log_test(f"Update order to '{status}'", True,
                        f"Status: {status_response.status_code}")
            else:
                log_test(f"Update order to '{status}'", False,
                        f"Status: {status_response.status_code}, Body: {status_response.text}")
        except Exception as e:
            log_test(f"Update order to {status}", False, f"Error: {str(e)}")


def test_stage_d_rfq_flow():
    """STAGE D — RFQ flow via REST simulation"""
    print("\n" + "="*80)
    print("STAGE D — RFQ Flow via REST")
    print("="*80)
    
    global test_rfq_id, test_rfq_response_id, test_buyer_id
    
    # Use seller as buyer if no buyer created
    if not test_buyer_id:
        test_buyer_id = TEST_SELLER_ID
        log_test("Using seller as buyer for RFQ test", True, 
                f"Buyer ID: {test_buyer_id}")
    
    # Insert RFQ as buyer
    try:
        rfq_number = f"RFQ-{int(time.time())}"
        rfq_data = {
            'buyer_id': test_buyer_id or TEST_SELLER_ID,
            'rfq_number': rfq_number,
            'title': 'QA RFQ Bulk T-shirts',
            'description': 'Need 500 pieces of cotton t-shirts',
            'quantity': 500,
            'unit': 'piece',
            'currency': 'INR',
            'status': 'open',
            'is_public': True,
            'delivery_location': {'city': 'Mumbai', 'state': 'Maharashtra'}
        }
        
        rfq_response = supabase_rest('POST', '/rest/v1/rfqs?select=id',
                                    rfq_data, use_service_key=True, prefer='return=representation')
        
        if rfq_response.status_code in [200, 201]:
            try:
                test_rfq_id = rfq_response.json()[0]['id']
                log_test("Insert RFQ as buyer", True, f"RFQ ID: {test_rfq_id}")
            except (KeyError, IndexError, ValueError) as e:
                log_test("Insert RFQ as buyer", False,
                        f"Status: {rfq_response.status_code}, but failed to parse response: {rfq_response.text}")
                return
        else:
            log_test("Insert RFQ as buyer", False,
                    f"Status: {rfq_response.status_code}, Body: {rfq_response.text}")
            return
    except Exception as e:
        log_test("Insert RFQ", False, f"Error: {str(e)}")
        return
    
    # Insert RFQ response as seller
    try:
        time.sleep(0.5)
        response_data = {
            'rfq_id': test_rfq_id,
            'seller_id': TEST_SELLER_ID,
            'quoted_price': 95,
            'lead_time_days': 10,
            'notes': 'Ready to ship',
            'status': 'submitted'
        }
        
        response_response = supabase_rest('POST', '/rest/v1/rfq_responses?select=id',
                                         response_data, use_service_key=True, prefer='return=representation')
        
        if response_response.status_code in [200, 201]:
            try:
                test_rfq_response_id = response_response.json()[0]['id']
                log_test("Insert RFQ response as seller", True,
                        f"Response ID: {test_rfq_response_id}")
            except (KeyError, IndexError, ValueError) as e:
                log_test("Insert RFQ response as seller", False,
                        f"Status: {response_response.status_code}, but failed to parse response: {response_response.text}")
                return
        else:
            log_test("Insert RFQ response as seller", False,
                    f"Status: {response_response.status_code}, Body: {response_response.text}")
            return
    except Exception as e:
        log_test("Insert RFQ response", False, f"Error: {str(e)}")
        return
    
    # Update RFQ status to 'quoted'
    try:
        time.sleep(0.5)
        quoted_response = supabase_rest('PATCH',
                                       f'/rest/v1/rfqs?id=eq.{test_rfq_id}',
                                       {'status': 'quoted'},
                                       use_service_key=True)
        
        if quoted_response.status_code in [200, 204]:
            log_test("Update RFQ status to 'quoted'", True,
                    f"Status: {quoted_response.status_code}")
        else:
            log_test("Update RFQ status to 'quoted'", False,
                    f"Status: {quoted_response.status_code}, Body: {quoted_response.text}")
    except Exception as e:
        log_test("Update RFQ to quoted", False, f"Error: {str(e)}")
    
    # Accept the response
    try:
        time.sleep(0.5)
        accept_data = {
            'status': 'accepted',
            'accepted_at': time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())
        }
        
        accept_response = supabase_rest('PATCH',
                                       f'/rest/v1/rfq_responses?id=eq.{test_rfq_response_id}',
                                       accept_data,
                                       use_service_key=True)
        
        if accept_response.status_code in [200, 204]:
            log_test("Accept RFQ response", True,
                    f"Status: {accept_response.status_code}")
        else:
            log_test("Accept RFQ response", False,
                    f"Status: {accept_response.status_code}, Body: {accept_response.text}")
    except Exception as e:
        log_test("Accept RFQ response", False, f"Error: {str(e)}")
    
    # Update RFQ to 'accepted'
    try:
        time.sleep(0.5)
        rfq_accept = supabase_rest('PATCH',
                                  f'/rest/v1/rfqs?id=eq.{test_rfq_id}',
                                  {'status': 'accepted'},
                                  use_service_key=True)
        
        if rfq_accept.status_code in [200, 204]:
            log_test("Update RFQ status to 'accepted'", True,
                    f"Status: {rfq_accept.status_code}")
        else:
            log_test("Update RFQ status to 'accepted'", False,
                    f"Status: {rfq_accept.status_code}, Body: {rfq_accept.text}")
    except Exception as e:
        log_test("Update RFQ to accepted", False, f"Error: {str(e)}")
    
    # Verify GET with join
    try:
        time.sleep(0.5)
        verify_response = supabase_rest('GET',
                                       f'/rest/v1/rfqs?id=eq.{test_rfq_id}&select=*,rfq_responses(*)',
                                       use_service_key=True)
        
        if verify_response.status_code == 200:
            data = verify_response.json()
            if len(data) > 0 and 'rfq_responses' in data[0]:
                log_test("Verify RFQ with responses join", True,
                        f"RFQ returned with {len(data[0]['rfq_responses'])} response(s)")
            else:
                log_test("Verify RFQ with responses join", False,
                        f"RFQ data incomplete: {data}")
        else:
            log_test("Verify RFQ with responses join", False,
                    f"Status: {verify_response.status_code}, Body: {verify_response.text}")
    except Exception as e:
        log_test("Verify RFQ join", False, f"Error: {str(e)}")


def test_stage_e_notifications():
    """STAGE E — Notifications"""
    print("\n" + "="*80)
    print("STAGE E — Notifications")
    print("="*80)
    
    global test_buyer_id, test_order_id, test_rfq_id, test_buyer_email, test_buyer_password
    
    # Use seller as buyer if no buyer created
    if not test_buyer_id:
        test_buyer_id = TEST_SELLER_ID
        test_buyer_email = 'seller_qa_1783411980@thoksale.test'
        test_buyer_password = 'SellerQA123!@#'
        log_test("Using seller for notifications test", True, 
                f"User ID: {test_buyer_id}")
    
    # Insert 3 notifications
    notifications = [
        {
            'user_id': test_buyer_id,
            'type': 'order_created',
            'title': 'Order created',
            'body': 'Your order has been created',
            'data': {'order_id': test_order_id or 'test-order-id'},
            'is_read': False
        },
        {
            'user_id': test_buyer_id,
            'type': 'freight_quote',
            'title': 'Freight quote received',
            'body': 'Seller has sent a freight quote',
            'data': {'order_id': test_order_id or 'test-order-id'},
            'is_read': False
        },
        {
            'user_id': test_buyer_id,
            'type': 'rfq_response',
            'title': 'RFQ response received',
            'body': 'Seller has responded to your RFQ',
            'data': {'rfq_id': test_rfq_id or 'test-rfq-id'},
            'is_read': False
        }
    ]
    
    notification_ids = []
    for i, notif in enumerate(notifications):
        try:
            time.sleep(0.3)
            notif_response = supabase_rest('POST', '/rest/v1/notifications?select=id',
                                          notif, use_service_key=True, prefer='return=representation')
            
            if notif_response.status_code in [200, 201]:
                try:
                    notif_id = notif_response.json()[0]['id']
                    notification_ids.append(notif_id)
                    log_test(f"Insert notification {i+1} ({notif['type']})", True,
                            f"Notification ID: {notif_id}")
                except (KeyError, IndexError, ValueError) as e:
                    log_test(f"Insert notification {i+1}", False,
                            f"Status: {notif_response.status_code}, but failed to parse response: {notif_response.text}")
            else:
                log_test(f"Insert notification {i+1}", False,
                        f"Status: {notif_response.status_code}, Body: {notif_response.text}")
        except Exception as e:
            log_test(f"Insert notification {i+1}", False, f"Error: {str(e)}")
    
    # Sign in as buyer to get JWT
    try:
        time.sleep(0.5)
        signin_response = supabase_rest('POST', '/auth/v1/token?grant_type=password', {
            'email': test_buyer_email,
            'password': test_buyer_password
        })
        
        if signin_response.status_code == 200:
            buyer_jwt = signin_response.json().get('access_token')
            
            # GET notifications as buyer
            time.sleep(0.5)
            get_notifs = supabase_rest('GET',
                                      f'/rest/v1/notifications?user_id=eq.{test_buyer_id}',
                                      user_jwt=buyer_jwt)
            
            if get_notifs.status_code == 200:
                notifs_data = get_notifs.json()
                if len(notifs_data) >= 3:
                    log_test("GET notifications as buyer", True,
                            f"Retrieved {len(notifs_data)} notification(s)")
                else:
                    log_test("GET notifications as buyer", False,
                            f"Expected at least 3, got {len(notifs_data)}")
            else:
                log_test("GET notifications as buyer", False,
                        f"Status: {get_notifs.status_code}, Body: {get_notifs.text}")
            
            # Mark one as read
            if notification_ids:
                time.sleep(0.5)
                mark_read = supabase_rest('PATCH',
                                         f'/rest/v1/notifications?id=eq.{notification_ids[0]}',
                                         {'is_read': True},
                                         user_jwt=buyer_jwt)
                
                if mark_read.status_code in [200, 204]:
                    log_test("Mark notification as read", True,
                            f"Status: {mark_read.status_code}")
                else:
                    log_test("Mark notification as read", False,
                            f"Status: {mark_read.status_code}, Body: {mark_read.text}")
                
                # Verify unread count
                time.sleep(0.5)
                unread = supabase_rest('GET',
                                      f'/rest/v1/notifications?user_id=eq.{test_buyer_id}&is_read=eq.false&select=id',
                                      user_jwt=buyer_jwt)
                
                if unread.status_code == 200:
                    unread_count = len(unread.json())
                    if unread_count == 2:
                        log_test("Verify unread count = 2", True,
                                f"Unread count: {unread_count}")
                    else:
                        log_test("Verify unread count = 2", False,
                                f"Expected 2, got {unread_count}")
                else:
                    log_test("Verify unread count", False,
                            f"Status: {unread.status_code}")
        else:
            log_test("Sign in as buyer for notifications", False,
                    f"Status: {signin_response.status_code}")
    except Exception as e:
        log_test("Notifications GET/PATCH", False, f"Error: {str(e)}")


def test_stage_f_admin_actions():
    """STAGE F — Admin actions verifiable via REST"""
    print("\n" + "="*80)
    print("STAGE F — Admin Actions via REST")
    print("="*80)
    
    global test_buyer_id, test_category_id
    
    # Use seller as test user if no buyer created
    if not test_buyer_id:
        test_buyer_id = TEST_SELLER_ID
        log_test("Using seller for admin actions test", True, 
                f"User ID: {test_buyer_id}")
    
    # Toggle user is_active
    try:
        # Set to false
        time.sleep(0.5)
        deactivate = supabase_rest('PATCH',
                                  f'/rest/v1/profiles?id=eq.{test_buyer_id}',
                                  {'is_active': False},
                                  use_service_key=True)
        
        if deactivate.status_code in [200, 204]:
            log_test("Deactivate user (is_active=false)", True,
                    f"Status: {deactivate.status_code}")
            
            # Verify
            time.sleep(0.5)
            verify = supabase_rest('GET',
                                  f'/rest/v1/profiles?id=eq.{test_buyer_id}&select=is_active',
                                  use_service_key=True)
            
            if verify.status_code == 200:
                is_active = verify.json()[0]['is_active']
                log_test("Verify user is_active=false", is_active == False,
                        f"is_active: {is_active}")
            
            # Restore to true
            time.sleep(0.5)
            activate = supabase_rest('PATCH',
                                    f'/rest/v1/profiles?id=eq.{test_buyer_id}',
                                    {'is_active': True},
                                    use_service_key=True)
            log_test("Restore user (is_active=true)", activate.status_code in [200, 204],
                    f"Status: {activate.status_code}")
        else:
            log_test("Toggle user is_active", False,
                    f"Status: {deactivate.status_code}, Body: {deactivate.text}")
    except Exception as e:
        log_test("Toggle user is_active", False, f"Error: {str(e)}")
    
    # Verify seller (update company_profiles)
    try:
        time.sleep(0.5)
        verify_seller = supabase_rest('PATCH',
                                     f'/rest/v1/company_profiles?profile_id=eq.{TEST_SELLER_ID}',
                                     {
                                         'kyc_status': 'verified',
                                         'verified_at': time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())
                                     },
                                     use_service_key=True)
        
        if verify_seller.status_code in [200, 204]:
            log_test("Verify seller (kyc_status=verified)", True,
                    f"Status: {verify_seller.status_code}")
            
            # Verify
            time.sleep(0.5)
            check = supabase_rest('GET',
                                 f'/rest/v1/company_profiles?profile_id=eq.{TEST_SELLER_ID}&select=kyc_status,verified_at',
                                 use_service_key=True)
            
            if check.status_code == 200:
                data = check.json()
                if len(data) > 0:
                    kyc_status = data[0]['kyc_status']
                    verified_at = data[0]['verified_at']
                    log_test("Verify kyc_status and verified_at", 
                            kyc_status == 'verified' and verified_at is not None,
                            f"kyc_status: {kyc_status}, verified_at: {verified_at}")
        else:
            log_test("Verify seller", False,
                    f"Status: {verify_seller.status_code}, Body: {verify_seller.text}")
    except Exception as e:
        log_test("Verify seller", False, f"Error: {str(e)}")
    
    # Category upsert
    try:
        time.sleep(0.5)
        cat_data = {
            'parent_id': None,
            'name': 'QA Test Category',
            'slug': 'qa-test-cat',
            'is_active': True,
            'sort_order': 999
        }
        
        cat_response = supabase_rest('POST', '/rest/v1/categories?select=id',
                                    cat_data, use_service_key=True, prefer='return=representation')
        
        if cat_response.status_code in [200, 201]:
            try:
                test_category_id = cat_response.json()[0]['id']
                log_test("Insert test category", True,
                        f"Category ID: {test_category_id}")
            except (KeyError, IndexError, ValueError) as e:
                log_test("Insert test category", False,
                        f"Status: {cat_response.status_code}, but failed to parse response: {cat_response.text}")
                return
            
            # Verify present
            time.sleep(0.5)
            verify_cat = supabase_rest('GET',
                                      f'/rest/v1/categories?id=eq.{test_category_id}',
                                      use_service_key=True)
            
            if verify_cat.status_code == 200:
                cat_data = verify_cat.json()
                log_test("Verify category exists", len(cat_data) > 0,
                        f"Found {len(cat_data)} category")
            
            # Toggle is_active to false
            time.sleep(0.5)
            toggle_cat = supabase_rest('PATCH',
                                      f'/rest/v1/categories?id=eq.{test_category_id}',
                                      {'is_active': False},
                                      use_service_key=True)
            
            if toggle_cat.status_code in [200, 204]:
                log_test("Toggle category is_active=false", True,
                        f"Status: {toggle_cat.status_code}")
                
                # Verify
                time.sleep(0.5)
                check_cat = supabase_rest('GET',
                                         f'/rest/v1/categories?id=eq.{test_category_id}&select=is_active',
                                         use_service_key=True)
                
                if check_cat.status_code == 200:
                    is_active = check_cat.json()[0]['is_active']
                    log_test("Verify category is_active=false", is_active == False,
                            f"is_active: {is_active}")
            else:
                log_test("Toggle category is_active", False,
                        f"Status: {toggle_cat.status_code}")
        else:
            log_test("Insert test category", False,
                    f"Status: {cat_response.status_code}, Body: {cat_response.text}")
    except Exception as e:
        log_test("Category operations", False, f"Error: {str(e)}")
    
    # Product moderation
    try:
        # Get a product to moderate
        time.sleep(0.5)
        products = supabase_rest('GET',
                                '/rest/v1/products?select=id&limit=1',
                                use_service_key=True)
        
        if products.status_code == 200 and len(products.json()) > 0:
            product_id = products.json()[0]['id']
            
            # Set is_featured=true
            time.sleep(0.5)
            feature = supabase_rest('PATCH',
                                   f'/rest/v1/products?id=eq.{product_id}',
                                   {'is_featured': True},
                                   use_service_key=True)
            
            if feature.status_code in [200, 204]:
                log_test("Set product is_featured=true", True,
                        f"Status: {feature.status_code}")
                
                # Verify
                time.sleep(0.5)
                check_prod = supabase_rest('GET',
                                          f'/rest/v1/products?id=eq.{product_id}&select=is_featured',
                                          use_service_key=True)
                
                if check_prod.status_code == 200:
                    is_featured = check_prod.json()[0]['is_featured']
                    log_test("Verify product is_featured=true", is_featured == True,
                            f"is_featured: {is_featured}")
                
                # Set back to false
                time.sleep(0.5)
                unfeature = supabase_rest('PATCH',
                                         f'/rest/v1/products?id=eq.{product_id}',
                                         {'is_featured': False},
                                         use_service_key=True)
                log_test("Set product is_featured=false", unfeature.status_code in [200, 204],
                        f"Status: {unfeature.status_code}")
            else:
                log_test("Product moderation", False,
                        f"Status: {feature.status_code}")
        else:
            log_test("Product moderation", False, "No products found to moderate")
    except Exception as e:
        log_test("Product moderation", False, f"Error: {str(e)}")


def test_stage_g_html_rendering():
    """STAGE G — HTML rendering with data (unauthenticated public pages)"""
    print("\n" + "="*80)
    print("STAGE G — HTML Rendering (Public Pages)")
    print("="*80)
    
    # GET / (home)
    try:
        time.sleep(0.5)
        home = requests.get(f"{BASE_URL}/", timeout=15)
        
        if home.status_code == 200:
            if 'Latest products' in home.text or 'ThokSale' in home.text:
                log_test("GET / (home) returns 200 with content", True,
                        f"Status: 200, Contains expected content")
            else:
                log_test("GET / (home) returns 200 with content", False,
                        f"Status: 200, but missing expected content")
        else:
            log_test("GET / (home) returns 200", False,
                    f"Status: {home.status_code}")
    except Exception as e:
        log_test("GET / (home)", False, f"Error: {str(e)}")
    
    # GET /products
    try:
        time.sleep(0.5)
        products = requests.get(f"{BASE_URL}/products", timeout=15)
        
        if products.status_code == 200:
            log_test("GET /products returns 200", True,
                    f"Status: {products.status_code}")
        else:
            log_test("GET /products returns 200", False,
                    f"Status: {products.status_code}")
    except Exception as e:
        log_test("GET /products", False, f"Error: {str(e)}")
    
    # GET a valid product slug
    try:
        # First, get a product slug
        time.sleep(0.5)
        prod_query = supabase_rest('GET',
                                  '/rest/v1/products?select=slug&status=eq.active&limit=1',
                                  use_service_key=True)
        
        if prod_query.status_code == 200 and len(prod_query.json()) > 0:
            slug = prod_query.json()[0]['slug']
            
            time.sleep(0.5)
            product_page = requests.get(f"{BASE_URL}/products/{slug}", timeout=15)
            
            if product_page.status_code == 200:
                log_test(f"GET /products/{slug} returns 200", True,
                        f"Status: {product_page.status_code}")
            else:
                log_test(f"GET /products/{slug} returns 200", False,
                        f"Status: {product_page.status_code}")
        else:
            log_test("GET product detail page", False, "No active products found")
    except Exception as e:
        log_test("GET product detail page", False, f"Error: {str(e)}")


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
                print(f"  ❌ {name}")
                if details:
                    print(f"     {details}")
        print()
    
    return tests_failed == 0


if __name__ == '__main__':
    print("="*80)
    print("ThokSale Operations & Administration Module Backend Tests")
    print("="*80)
    print()
    
    try:
        test_stage_a_route_access_control()
        test_stage_b_admin_gating()
        test_stage_c_freight_quote_flow()
        test_stage_d_rfq_flow()
        test_stage_e_notifications()
        test_stage_f_admin_actions()
        test_stage_g_html_rendering()
        
        success = print_summary()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
