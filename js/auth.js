// ===================================
// Authentication System
// ===================================

class AuthSystem {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  init() {
    // Load current session
    const session = localStorage.getItem('sra_session');
    if (session) {
      this.currentUser = JSON.parse(session);
    }

    // Initialize users if not exists
    if (!localStorage.getItem('sra_users')) {
      const defaultUsers = [
        {
          id: 1,
          name: 'Admin',
          email: 'admin@sra.com',
          password: 'admin123', // In production, this should be hashed
          role: 'admin',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('sra_users', JSON.stringify(defaultUsers));
    }
  }

  // Register new user
  register(name, email, password, phone) {
    const users = JSON.parse(localStorage.getItem('sra_users') || '[]');

    // Check if email already exists
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Email already registered' };
    }

    // Validate inputs
    if (!name || !email || !password) {
      return { success: false, message: 'All fields are required' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }

    // Create new user
    const newUser = {
      id: users.length + 1,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      password: password, // In production, hash this
      role: 'user',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('sra_users', JSON.stringify(users));

    // Auto login
    this.currentUser = { ...newUser };
    delete this.currentUser.password; // Don't store password in session
    localStorage.setItem('sra_session', JSON.stringify(this.currentUser));

    return { success: true, message: 'Registration successful', user: this.currentUser };
  }

  // Login user
  login(email, password) {
    const users = JSON.parse(localStorage.getItem('sra_users') || '[]');

    const user = users.find(u =>
      u.email === email.trim().toLowerCase() && u.password === password
    );

    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }

    // Create session
    this.currentUser = { ...user };
    delete this.currentUser.password; // Don't store password in session
    localStorage.setItem('sra_session', JSON.stringify(this.currentUser));

    return { success: true, message: 'Login successful', user: this.currentUser };
  }

  // Logout user
  logout() {
    this.currentUser = null;
    localStorage.removeItem('sra_session');
    return { success: true, message: 'Logged out successfully' };
  }

  // Check if user is logged in
  isLoggedIn() {
    return this.currentUser !== null;
  }

  // Check if user is admin
  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Require authentication (redirect if not logged in)
  requireAuth(redirectUrl = 'login.html') {
    if (!this.isLoggedIn()) {
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  }

  // Require admin (redirect if not admin)
  requireAdmin(redirectUrl = 'index.html') {
    if (!this.isAdmin()) {
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  }

  // Update user profile
  updateProfile(updates) {
    if (!this.isLoggedIn()) {
      return { success: false, message: 'Not logged in' };
    }

    const users = JSON.parse(localStorage.getItem('sra_users') || '[]');
    const userIndex = users.findIndex(u => u.id === this.currentUser.id);

    if (userIndex === -1) {
      return { success: false, message: 'User not found' };
    }

    // Update user data
    users[userIndex] = { ...users[userIndex], ...updates };
    localStorage.setItem('sra_users', JSON.stringify(users));

    // Update session
    this.currentUser = { ...users[userIndex] };
    delete this.currentUser.password;
    localStorage.setItem('sra_session', JSON.stringify(this.currentUser));

    return { success: true, message: 'Profile updated', user: this.currentUser };
  }
}

// Create global auth instance
const auth = new AuthSystem();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthSystem;
}
