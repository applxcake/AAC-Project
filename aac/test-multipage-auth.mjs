// Test suite verifying multi-page application routing, authentication & demo users
import { appState } from './src/js/state.js';

console.log('--- Testing Multi-Page Application & Authentication Flow ---');

// 1. Initial State Check
console.log('[Test 1] Initial page should be "home" (when unauthenticated)');
if (appState.currentPage !== 'home' && !appState.currentUser) {
  throw new Error(`Expected initial page to be "home", got "${appState.currentPage}"`);
}
console.log(`  ✓ Current page: ${appState.currentPage}`);

// 2. Navigation between Public Pages
console.log('[Test 2] Navigating to About page');
appState.setCurrentPage('about');
if (appState.currentPage !== 'about') throw new Error('Failed to set page to about');
console.log('  ✓ Page successfully set to: about');

console.log('[Test 3] Navigating to Register page');
appState.setCurrentPage('register');
if (appState.currentPage !== 'register') throw new Error('Failed to set page to register');
console.log('  ✓ Page successfully set to: register');

console.log('[Test 4] Navigating to Login page');
appState.setCurrentPage('login');
if (appState.currentPage !== 'login') throw new Error('Failed to set page to login');
console.log('  ✓ Page successfully set to: login');

// 3. Protected Route Guard
console.log('[Test 5] Attempting unauthenticated access to Dashboard');
const canAccess = appState.setCurrentPage('dashboard');
if (canAccess !== false || appState.currentPage !== 'login') {
  throw new Error(`Protected route guard failed! Expected redirect to 'login', got '${appState.currentPage}'`);
}
console.log('  ✓ Route guard successfully intercepted unauthenticated user & redirected to login');

// 4. Authentication: Invalid Credentials
console.log('[Test 6] Testing invalid login');
const invalidRes = appState.login('invalid@xyz.edu', 'wrongpassword');
if (invalidRes.success !== false) {
  throw new Error('Invalid login should fail');
}
console.log('  ✓ Invalid login rejected with message:', invalidRes.message);

// 5. Authentication: Quick 1-Click Demo Login (HOD)
console.log('[Test 7] Testing quick demo login as Dr. Aris Thorne (HOD)');
const hodLogin = appState.login('admin@xyz.edu', 'admin');
if (!hodLogin.success || !appState.currentUser) {
  throw new Error('Demo login failed');
}
if (appState.currentPage !== 'dashboard') {
  throw new Error(`Expected dashboard after login, got: ${appState.currentPage}`);
}
console.log(`  ✓ Logged in as: ${appState.currentUser.name} (${appState.currentUser.role})`);
console.log(`  ✓ Current page now: ${appState.currentPage}`);

// 6. Accessing Protected Dashboard as Authenticated User
console.log('[Test 8] Accessing Dashboard while authenticated');
const authAccess = appState.setCurrentPage('dashboard');
if (authAccess !== true || appState.currentPage !== 'dashboard') {
  throw new Error('Authenticated user should be granted access to dashboard');
}
console.log('  ✓ Access granted to protected academic workspace');

// 7. Testing User Registration
console.log('[Test 9] Testing new faculty registration');
const newReg = appState.register({
  name: 'Dr. Sarah Connor',
  email: 'sconnor@xyz.edu',
  role: 'Assistant Professor',
  department: 'Information Technology',
  password: 'securepass123'
});
if (!newReg.success || appState.currentUser.email !== 'sconnor@xyz.edu') {
  throw new Error('Registration failed');
}
console.log(`  ✓ Successfully registered: ${appState.currentUser.name}`);
console.log(`  ✓ Automatic login to dashboard: ${appState.currentPage}`);

// 8. Testing Logout
console.log('[Test 10] Testing logout');
appState.logout();
if (appState.currentUser !== null || appState.currentPage !== 'home') {
  throw new Error('Logout failed to reset user and return to home page');
}
console.log('  ✓ Logged out successfully. User state reset, returned to home page.');

console.log('\n✅ ALL MULTI-PAGE & AUTHENTICATION TESTS PASSED PERFECTLY!');
