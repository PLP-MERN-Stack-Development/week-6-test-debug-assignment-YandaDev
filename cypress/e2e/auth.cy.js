describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear the database before each test
    cy.clearDatabase();
    cy.visit('/');
  });

  describe('User Registration', () => {
    it('should register a new user successfully', () => {
      // Navigate to registration page
      cy.visit('/register');
      
      // Verify we're on the registration page
      cy.url().should('include', '/register');
      cy.contains('Register').should('be.visible');
      
      // Fill out registration form
      cy.get('[data-cy=username-input]').type('testuser');
      cy.get('[data-cy=email-input]').type('test@example.com');
      cy.get('[data-cy=password-input]').type('password123');
      cy.get('[data-cy=confirm-password-input]').type('password123');
      
      // Submit registration form
      cy.get('[data-cy=register-button]').click();
      
      // Should redirect to login page or show success message
      cy.url().should('include', '/login');
      cy.contains('Registration successful').should('be.visible');
    });

    it('should show validation errors for invalid registration data', () => {
      cy.visit('/register');
      
      // Try to submit with empty fields
      cy.get('[data-cy=register-button]').click();
      
      // Should show validation errors
      cy.contains('Username is required').should('be.visible');
      cy.contains('Email is required').should('be.visible');
      cy.contains('Password is required').should('be.visible');
    });

    it('should show error for mismatched passwords', () => {
      cy.visit('/register');
      
      cy.get('[data-cy=username-input]').type('testuser');
      cy.get('[data-cy=email-input]').type('test@example.com');
      cy.get('[data-cy=password-input]').type('password123');
      cy.get('[data-cy=confirm-password-input]').type('differentpassword');
      
      cy.get('[data-cy=register-button]').click();
      
      cy.contains('Passwords do not match').should('be.visible');
    });

    it('should show error for duplicate email', () => {
      // Create a user first
      cy.register('existinguser', 'existing@example.com', 'password123');
      
      cy.visit('/register');
      
      cy.get('[data-cy=username-input]').type('newuser');
      cy.get('[data-cy=email-input]').type('existing@example.com');
      cy.get('[data-cy=password-input]').type('password123');
      cy.get('[data-cy=confirm-password-input]').type('password123');
      
      cy.get('[data-cy=register-button]').click();
      
      cy.contains('User already exists').should('be.visible');
    });
  });

  describe('User Login', () => {
    beforeEach(() => {
      // Create a test user for login tests
      cy.register('testuser', 'test@example.com', 'password123');
    });

    it('should login with valid credentials', () => {
      cy.visit('/login');
      
      // Verify we're on the login page
      cy.url().should('include', '/login');
      cy.contains('Login').should('be.visible');
      
      // Fill out login form
      cy.get('[data-cy=email-input]').type('test@example.com');
      cy.get('[data-cy=password-input]').type('password123');
      
      // Submit login form
      cy.get('[data-cy=login-button]').click();
      
      // Should redirect to home page
      cy.url().should('not.include', '/login');
      cy.url().should('include', '/');
      
      // Should show user is logged in
      cy.contains('Welcome').should('be.visible');
      cy.get('[data-cy=user-menu]').should('be.visible');
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/login');
      
      cy.get('[data-cy=email-input]').type('test@example.com');
      cy.get('[data-cy=password-input]').type('wrongpassword');
      
      cy.get('[data-cy=login-button]').click();
      
      cy.contains('Invalid credentials').should('be.visible');
      cy.url().should('include', '/login');
    });

    it('should show validation errors for empty fields', () => {
      cy.visit('/login');
      
      cy.get('[data-cy=login-button]').click();
      
      cy.contains('Email is required').should('be.visible');
      cy.contains('Password is required').should('be.visible');
    });

    it('should redirect to intended page after login', () => {
      // Try to access a protected page
      cy.visit('/create-post');
      
      // Should redirect to login
      cy.url().should('include', '/login');
      
      // Login
      cy.get('[data-cy=email-input]').type('test@example.com');
      cy.get('[data-cy=password-input]').type('password123');
      cy.get('[data-cy=login-button]').click();
      
      // Should redirect to the originally intended page
      cy.url().should('include', '/create-post');
    });
  });

  describe('User Logout', () => {
    beforeEach(() => {
      // Create and login a test user
      cy.register('testuser', 'test@example.com', 'password123');
      cy.loginViaUI('test@example.com', 'password123');
    });

    it('should logout successfully', () => {
      // Should be logged in
      cy.get('[data-cy=user-menu]').should('be.visible');
      
      // Click logout
      cy.get('[data-cy=user-menu]').click();
      cy.get('[data-cy=logout-button]').click();
      
      // Should redirect to home page and show login link
      cy.url().should('not.include', '/dashboard');
      cy.get('[data-cy=login-link]').should('be.visible');
      cy.get('[data-cy=user-menu]').should('not.exist');
    });
  });
});
