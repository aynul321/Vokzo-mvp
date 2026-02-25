import requests
import sys
import json
from datetime import datetime

class VokzoAPITester:
    def __init__(self, base_url="https://vokzo-india.preview.emergentagent.com"):
        self.base_url = base_url
        self.admin_token = None
        self.customer_token = None
        self.provider_token = None
        self.provider_id = None
        self.customer_id = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   {method} {endpoint}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=default_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=default_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"   ✅ Status: {response.status_code}")
            else:
                print(f"   ❌ Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text[:200]}")

            try:
                response_data = response.json()
                return success, response_data
            except:
                return success, {}

        except Exception as e:
            print(f"   ❌ Exception: {str(e)}")
            return False, {}

    def test_seed_data(self):
        """Seed initial data"""
        print("\n🌱 Seeding initial data...")
        success, response = self.run_test(
            "Seed Data", "POST", "seed", 200
        )
        return success

    def test_get_cities(self):
        """Test cities endpoint"""
        success, response = self.run_test(
            "Get Cities", "GET", "cities", 200
        )
        if success:
            cities = response.get('cities', [])
            villages = response.get('villages', [])
            print(f"   Cities found: {len(cities)}")
            print(f"   Villages found: {len(villages)}")
        return success

    def test_get_categories(self):
        """Test service categories"""
        success, response = self.run_test(
            "Get Service Categories", "GET", "services/categories", 200
        )
        if success:
            categories = response if isinstance(response, list) else []
            print(f"   Categories found: {len(categories)}")
            for cat in categories[:3]:  # Show first 3
                print(f"   - {cat.get('name', 'Unknown')}")
        return success

    def test_admin_login(self):
        """Test admin login"""
        login_data = {
            "email": "memonaynul2403@gmail.com",
            "password": "aynul2226@"
        }
        success, response = self.run_test(
            "Admin Login", "POST", "auth/login", 200, data=login_data
        )
        
        if success and 'token' in response:
            self.admin_token = response['token']
            user = response.get('user', {})
            print(f"   Logged in as: {user.get('full_name', 'Unknown')} ({user.get('role', 'Unknown')})")
            return True
        return False

    def test_customer_signup(self):
        """Test customer signup"""
        timestamp = datetime.now().strftime("%H%M%S")
        signup_data = {
            "full_name": f"Test Customer {timestamp}",
            "email": f"customer_{timestamp}@test.com",
            "password": "testpass123",
            "confirm_password": "testpass123",
            "role": "customer"
        }
        success, response = self.run_test(
            "Customer Signup", "POST", "auth/signup", 200, data=signup_data
        )
        
        if success and 'token' in response:
            self.customer_token = response['token']
            self.customer_id = response.get('user', {}).get('id')
            print(f"   Customer created: {signup_data['email']}")
            return True
        return False

    def test_provider_signup(self):
        """Test provider signup"""
        timestamp = datetime.now().strftime("%H%M%S")
        
        # First get categories to use
        _, categories = self.run_test("Get Categories for Provider", "GET", "services/categories", 200)
        if not categories:
            print("   ❌ No categories available for provider signup")
            return False
        
        category = categories[0] if isinstance(categories, list) else None
        if not category:
            return False
            
        # Get sub-services for this category
        _, sub_services = self.run_test(
            f"Get Sub-services for {category['id']}", 
            "GET", 
            f"services/categories/{category['id']}/sub-services", 
            200
        )
        
        if not sub_services:
            print("   ❌ No sub-services available")
            return False
            
        sub_service = sub_services[0]
        
        signup_data = {
            "full_name": f"Test Provider {timestamp}",
            "email": f"provider_{timestamp}@test.com",
            "password": "testpass123",
            "confirm_password": "testpass123",
            "category_id": category['id'],
            "sub_service_id": sub_service['id'],
            "experience": 5,
            "base_price": 500.0,
            "city": "Mumbai"
        }
        
        success, response = self.run_test(
            "Provider Signup", "POST", "auth/provider-signup", 200, data=signup_data
        )
        
        if success and 'token' in response:
            self.provider_token = response['token']
            self.provider_id = response.get('provider_id')
            print(f"   Provider created: {signup_data['email']}")
            return True
        return False

    def test_admin_get_providers(self):
        """Test admin getting providers list"""
        if not self.admin_token:
            print("   ❌ Admin token not available")
            return False
            
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        success, response = self.run_test(
            "Admin Get Providers", "GET", "admin/providers", 200, headers=headers
        )
        
        if success:
            providers = response if isinstance(response, list) else []
            print(f"   Found {len(providers)} providers")
            pending_providers = [p for p in providers if not p.get('is_approved', False)]
            print(f"   Pending approval: {len(pending_providers)}")
        return success

    def test_admin_approve_provider(self):
        """Test admin approving provider"""
        if not self.admin_token or not self.provider_id:
            print("   ❌ Admin token or provider ID not available")
            return False
            
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        success, response = self.run_test(
            "Admin Approve Provider", "PUT", f"admin/providers/{self.provider_id}/approve", 200, headers=headers
        )
        return success

    def test_get_providers(self):
        """Test getting approved providers"""
        success, response = self.run_test(
            "Get Approved Providers", "GET", "providers", 200
        )
        
        if success:
            providers = response if isinstance(response, list) else []
            print(f"   Found {len(providers)} approved providers")
        return success

    def test_create_booking(self):
        """Test creating a booking"""
        if not self.customer_token or not self.provider_id:
            print("   ❌ Customer token or provider ID not available")
            return False
        
        # Get sub-services first
        _, sub_services = self.run_test("Get Sub-services", "GET", "services/sub-services", 200)
        if not sub_services:
            return False
            
        sub_service = sub_services[0]
        
        booking_data = {
            "provider_id": self.provider_id,
            "sub_service_id": sub_service['id'],
            "booking_date": "2024-12-25",
            "booking_time": "10:00 AM",
            "address": "123 Test Street, Test Area",
            "city": "Mumbai",
            "notes": "Test booking for API testing"
        }
        
        headers = {'Authorization': f'Bearer {self.customer_token}'}
        success, response = self.run_test(
            "Create Booking", "POST", "bookings", 200, data=booking_data, headers=headers
        )
        
        if success:
            print(f"   Booking created: {response.get('id')}")
        return success

    def test_admin_analytics(self):
        """Test admin analytics"""
        if not self.admin_token:
            print("   ❌ Admin token not available")
            return False
            
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        success, response = self.run_test(
            "Admin Analytics", "GET", "admin/analytics", 200, headers=headers
        )
        
        if success:
            print(f"   Total users: {response.get('total_users', 0)}")
            print(f"   Total providers: {response.get('total_providers', 0)}")
            print(f"   Total bookings: {response.get('total_bookings', 0)}")
            print(f"   Total revenue: ₹{response.get('total_revenue', 0)}")
        return success

def main():
    """Main test execution"""
    print("🚀 Starting VOKZO API Tests")
    print("=" * 50)
    
    tester = VokzoAPITester()
    
    # Test sequence
    tests = [
        ("Seed Data", tester.test_seed_data),
        ("Get Cities", tester.test_get_cities),
        ("Get Categories", tester.test_get_categories),
        ("Admin Login", tester.test_admin_login),
        ("Customer Signup", tester.test_customer_signup),
        ("Provider Signup", tester.test_provider_signup),
        ("Admin Get Providers", tester.test_admin_get_providers),
        ("Admin Approve Provider", tester.test_admin_approve_provider),
        ("Get Approved Providers", tester.test_get_providers),
        ("Create Booking", tester.test_create_booking),
        ("Admin Analytics", tester.test_admin_analytics),
    ]
    
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"   ❌ Test '{test_name}' failed with exception: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())