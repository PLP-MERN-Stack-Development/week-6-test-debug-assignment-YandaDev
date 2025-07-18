describe('Navigation and Routing', () => {
  beforeEach(() => {
    cy.clearDatabase();
  });

  describe('Public Navigation', () => {
    it('should navigate to all public pages', () => {
      cy.visit('/');
      
      // Test home page
      cy.contains('Home').should('be.visible');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      
      // Test login page navigation
      cy.get('[data-cy=login-link]').click();
      cy.url().should('include', '/login');
      cy.contains('Login').should('be.visible');
      
      // Test register page navigation
      cy.get('[data-cy=register-link]').click();
      cy.url().should('include', '/register');
      cy.contains('Register').should('be.visible');
      
      // Test navigation back to home
      cy.get('[data-cy=home-link]').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should show correct navigation items for unauthenticated users', () => {
      cy.visit('/');
      
      // Should show public navigation items
      cy.get('[data-cy=home-link]').should('be.visible');
      cy.get('[data-cy=login-link]').should('be.visible');
      cy.get('[data-cy=register-link]').should('be.visible');
      
      // Should not show authenticated navigation items
      cy.get('[data-cy=create-post-link]').should('not.exist');
      cy.get('[data-cy=user-menu]').should('not.exist');
      cy.get('[data-cy=logout-button]').should('not.exist');
    });

    it('should handle invalid routes with 404 page', () => {
      cy.visit('/invalid-route');
      
      cy.contains('404').should('be.visible');
      cy.contains('Page not found').should('be.visible');
      cy.get('[data-cy=back-home-link]').should('be.visible');
      
      // Test back to home link
      cy.get('[data-cy=back-home-link]').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('Authenticated Navigation', () => {
    beforeEach(() => {
      // Create and login a test user
      cy.register('testuser', 'test@example.com', 'password123');
      cy.loginViaUI('test@example.com', 'password123');
    });

    it('should show authenticated navigation items', () => {
      cy.visit('/');
      
      // Should show authenticated navigation items
      cy.get('[data-cy=home-link]').should('be.visible');
      cy.get('[data-cy=create-post-link]').should('be.visible');
      cy.get('[data-cy=user-menu]').should('be.visible');
      
      // Should not show unauthenticated navigation items
      cy.get('[data-cy=login-link]').should('not.exist');
      cy.get('[data-cy=register-link]').should('not.exist');
    });

    it('should navigate to protected pages', () => {
      cy.visit('/');
      
      // Test create post page navigation
      cy.get('[data-cy=create-post-link]').click();
      cy.url().should('include', '/create-post');
      cy.contains('Create New Post').should('be.visible');
    });

    it('should show user menu options', () => {
      cy.visit('/');
      
      // Click user menu
      cy.get('[data-cy=user-menu]').click();
      
      // Should show menu options
      cy.get('[data-cy=profile-link]').should('be.visible');
      cy.get('[data-cy=my-posts-link]').should('be.visible');
      cy.get('[data-cy=logout-button]').should('be.visible');
    });
  });

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users to login', () => {
      // Try to access protected routes
      const protectedRoutes = ['/create-post', '/edit-post/123', '/profile'];
      
      protectedRoutes.forEach(route => {
        cy.visit(route);
        cy.url().should('include', '/login');
        cy.contains('Please log in to access this page').should('be.visible');
      });
    });

    it('should allow authenticated users to access protected routes', () => {
      // Create and login a test user
      cy.register('testuser', 'test@example.com', 'password123');
      cy.loginViaUI('test@example.com', 'password123');
      
      // Should be able to access create post page
      cy.visit('/create-post');
      cy.url().should('include', '/create-post');
      cy.contains('Create New Post').should('be.visible');
    });

    it('should remember intended destination after login', () => {
      // Try to access protected page
      cy.visit('/create-post');
      
      // Should redirect to login
      cy.url().should('include', '/login');
      
      // Login
      cy.register('testuser', 'test@example.com', 'password123');
      cy.get('[data-cy=email-input]').type('test@example.com');
      cy.get('[data-cy=password-input]').type('password123');
      cy.get('[data-cy=login-button]').click();
      
      // Should redirect to originally intended page
      cy.url().should('include', '/create-post');
    });
  });

  describe('Browser Navigation', () => {
    beforeEach(() => {
      // Create and login a test user
      cy.register('testuser', 'test@example.com', 'password123');
      cy.loginViaUI('test@example.com', 'password123');
    });

    it('should handle browser back and forward buttons', () => {
      cy.visit('/');
      
      // Navigate to create post
      cy.get('[data-cy=create-post-link]').click();
      cy.url().should('include', '/create-post');
      
      // Use browser back button
      cy.go('back');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      
      // Use browser forward button
      cy.go('forward');
      cy.url().should('include', '/create-post');
    });

    it('should maintain scroll position when navigating back', () => {
      // Create multiple posts to make the page scrollable
      cy.setupTestData().then((testData) => {
        for (let i = 1; i <= 10; i++) {
          cy.createPost(`Post ${i}`, `Content ${i}`, testData.categoryId, testData.token);
        }
      });
      
      cy.visit('/');
      
      // Scroll down the page
      cy.scrollTo(0, 500);
      
      // Click on a post
      cy.get('[data-cy=post-item]').first().click();
      
      // Go back
      cy.go('back');
      
      // Should maintain scroll position (approximately)
      cy.window().its('scrollY').should('be.greaterThan', 400);
    });

    it('should update page title for different routes', () => {
      cy.visit('/');
      cy.title().should('include', 'Home');
      
      cy.visit('/login');
      cy.title().should('include', 'Login');
      
      cy.visit('/register');
      cy.title().should('include', 'Register');
      
      cy.visit('/create-post');
      cy.title().should('include', 'Create Post');
    });
  });

  describe('Deep Linking', () => {
    it('should handle direct navigation to specific post', () => {
      cy.setupTestData().then((testData) => {
        cy.createPost('Direct Link Post', 'Post for direct linking test', testData.categoryId, testData.token)
          .then((response) => {
            const postId = response.body._id;
            
            // Direct navigation to post
            cy.visit(`/posts/${postId}`);
            
            cy.contains('Direct Link Post').should('be.visible');
            cy.contains('Post for direct linking test').should('be.visible');
          });
      });
    });

    it('should handle URL parameters for pagination', () => {
      cy.setupTestData().then((testData) => {
        // Create multiple posts
        for (let i = 1; i <= 15; i++) {
          cy.createPost(`Page Test Post ${i}`, `Content ${i}`, testData.categoryId, testData.token);
        }
        
        // Direct navigation to page 2
        cy.visit('/?page=2');
        
        cy.url().should('include', 'page=2');
        cy.get('[data-cy=current-page]').should('contain', '2');
      });
    });

    it('should handle URL parameters for search', () => {
      cy.setupTestData().then((testData) => {
        cy.createPost('Searchable Post', 'Content with keyword test', testData.categoryId, testData.token);
        
        // Direct navigation with search parameter
        cy.visit('/?search=Searchable');
        
        cy.url().should('include', 'search=Searchable');
        cy.get('[data-cy=search-input]').should('have.value', 'Searchable');
        cy.contains('Searchable Post').should('be.visible');
      });
    });
  });
});
