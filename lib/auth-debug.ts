// Debug utility for authentication testing
import { authService } from './auth';

export const authDebug = {
  // Test login with default admin credentials
  async testLogin() {
    try {
      console.log('🔐 Testing login with admin credentials...');
      const result = await authService.login({
        email: 'admin@inventory.com',
        password: 'admin123'
      });
      console.log('✅ Login successful:', result);
      return result;
    } catch (error: any) {
      console.error('❌ Login failed:', error.message);
      throw error;
    }
  },

  // Test getting current user profile
  async testProfile() {
    try {
      console.log('👤 Testing profile fetch...');
      const user = await authService.getCurrentUser();
      console.log('✅ Profile fetch successful:', user);
      return user;
    } catch (error: any) {
      console.error('❌ Profile fetch failed:', error.message);
      throw error;
    }
  },

  // Test authentication status
  testAuthStatus() {
    const isAuth = authService.isAuthenticated();
    const token = authService.getToken();
    console.log('🔍 Auth Status:', { isAuthenticated: isAuth, hasToken: !!token });
    return { isAuthenticated: isAuth, hasToken: !!token };
  },

  // Test logout
  testLogout() {
    console.log('🚪 Testing logout...');
    authService.logout();
    console.log('✅ Logout completed');
  },

  // Full authentication flow test
  async testFullFlow() {
    console.log('🧪 Starting full authentication flow test...');
    
    // 1. Check initial state
    console.log('1. Initial auth status:');
    this.testAuthStatus();
    
    // 2. Test login
    console.log('2. Testing login:');
    await this.testLogin();
    
    // 3. Check auth status after login
    console.log('3. Auth status after login:');
    this.testAuthStatus();
    
    // 4. Test profile fetch
    console.log('4. Testing profile fetch:');
    await this.testProfile();
    
    // 5. Test logout
    console.log('5. Testing logout:');
    this.testLogout();
    
    console.log('🎉 Full flow test completed!');
  }
};

// Make it available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).authDebug = authDebug;
}