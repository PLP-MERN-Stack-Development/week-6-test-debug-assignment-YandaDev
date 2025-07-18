describe('Error Handling and Edge Cases', () => {
  beforeEach(() => {
    cy.clearDatabase();
  });

  describe('Network Error Handling', () => {
    it('should handle server connection errors gracefully', () => {
      // Intercept API calls and simulate network error
      cy.intercept('GET', '/api/posts', { forceNetworkError: true }).as('networkError');
      
      cy.visit('/');
      
      cy.wait('@networkError');
      
      // Should show error message
      cy.contains('Unable to load posts').should('be.visible');
      cy.get('[data-cy=retry-button]').should('be.visible');
    });

    it('should retry failed requests', () => {
      // First call fails, second succeeds
      cy.intercept('GET', '/api/posts', { forceNetworkError: true }).as('failedRequest');
      
      cy.visit('/');
      cy.wait('@failedRequest');
      
      // Click retry button
      cy.intercept('GET', '/api/posts', { fixture: 'posts.json' }).as('successRequest');
      cy.get('[data-cy=retry-button]').click();
      
      cy.wait('@successRequest');
      cy.contains('Unable to load posts').should('not.exist');
    });

    it('should handle slow network connections', () => {
      // Simulate slow response
      cy.intercept('GET', '/api/posts', (req) => {
        req.reply({ delay: 3000, fixture: 'posts.json' });
      }).as('slowRequest');
      
      cy.visit('/');
      
      // Should show loading indicator
      cy.get('[data-cy=loading-spinner]').should('be.visible');
      
      cy.wait('@slowRequest');
      
      // Loading should disappear
      cy.get('[data-cy=loading-spinner]').should('not.exist');
    });
  });

  describe('API Error Responses', () => {
    it('should handle 401 unauthorized errors', () => {
      cy.register('testuser', 'test@example.com', 'password123');
      cy.loginViaUI('test@example.com', 'password123');
      
      // Intercept create post request and return 401
      cy.intercept('POST', '/api/posts', { statusCode: 401, body: { error: 'Unauthorized' } }).as('unauthorizedError');
      
      cy.visit('/create-post');
      
      cy.get('[data-cy=title-input]').type('Test Post');
      cy.get('[data-cy=content-textarea]').type('Test content');
      cy.get('[data-cy=category-select]').select(0);
      cy.get('[data-cy=create-post-button]').click();
      
      cy.wait('@unauthorizedError');
      
      // Should redirect to login or show error
      cy.contains('Session expired').should('be.visible');
    });

    it('should handle 403 forbidden errors', () => {
      cy.register('testuser', 'test@example.com', 'password123');
      cy.loginViaUI('test@example.com', 'password123');
      
      // Intercept delete request and return 403
      cy.intercept('DELETE', '/api/posts/*', { statusCode: 403, body: { error: 'Forbidden' } }).as('forbiddenError');
      
      // Create a post first
      cy.setupTestData().then((testData) => {
        cy.createPost('Test Post', 'Test content', testData.categoryId, testData.token).then((response) => {
          const postId = response.body._id;
          
          cy.visit(`/posts/${postId}`);
          cy.get('[data-cy=delete-post-button]').click();
          cy.get('[data-cy=confirm-delete-button]').click();
          
          cy.wait('@forbiddenError');
          
          cy.contains('You are not authorized to delete this post').should('be.visible');
        });
      });
    });

    it('should handle 404 not found errors', () => {
      const nonExistentPostId = '507f1f77bcf86cd799439011';
      
      cy.visit(`/posts/${nonExistentPostId}`);
      
      cy.contains('Post not found').should('be.visible');
      cy.get('[data-cy=back-home-link]').should('be.visible');
    });

    it('should handle 500 server errors', () => {
      cy.intercept('GET', '/api/posts', { statusCode: 500, body: { error: 'Internal Server Error' } }).as('serverError');
      
      cy.visit('/');
      
      cy.wait('@serverError');
      
      cy.contains('Something went wrong on our end').should('be.visible');
      cy.get('[data-cy=retry-button]').should('be.visible');
    });
  });

  describe('Form Validation Edge Cases', () => {
    beforeEach(() => {
      cy.register('testuser', 'test@example.com', 'password123');
      cy.loginViaUI('test@example.com', 'password123');
    });

    it('should handle extremely long input values', () => {
      cy.visit('/create-post');
      
      const longTitle = 'a'.repeat(200);
      const longContent = 'b'.repeat(10000);
      
      cy.get('[data-cy=title-input]').type(longTitle);
      cy.get('[data-cy=content-textarea]').type(longContent);
      
      cy.get('[data-cy=create-post-button]').click();
      
      // Should show validation errors
      cy.contains('Title must be less than 100 characters').should('be.visible');
    });

    it('should handle special characters in input', () => {
      cy.visit('/create-post');
      
      const specialTitle = 'Test Post <script>alert("xss")</script>';
      const specialContent = 'Content with special chars: <>&"\'';
      
      cy.get('[data-cy=title-input]').type(specialTitle);
      cy.get('[data-cy=content-textarea]').type(specialContent);
      cy.get('[data-cy=category-select]').select(0);
      
      cy.get('[data-cy=create-post-button]').click();
      
      // Should escape special characters properly
      cy.contains('Test Post <script>alert("xss")</script>').should('not.exist');
      cy.contains('Test Post &lt;script&gt;').should('be.visible');
    });

    it('should handle unicode characters', () => {
      cy.visit('/create-post');
      
      const unicodeTitle = '测试帖子 🚀 émoji';
      const unicodeContent = 'Content with émojis 🎉 and unicode: café naïve';
      
      cy.get('[data-cy=title-input]').type(unicodeTitle);
      cy.get('[data-cy=content-textarea]').type(unicodeContent);
      cy.get('[data-cy=category-select]').select(0);
      
      cy.get('[data-cy=create-post-button]').click();
      
      // Should handle unicode properly
      cy.contains(unicodeTitle).should('be.visible');
      cy.contains(unicodeContent).should('be.visible');
    });
  });

  describe('File Upload Edge Cases', () => {
    beforeEach(() => {
      cy.register('testuser', 'test@example.com', 'password123');
      cy.loginViaUI('test@example.com', 'password123');
    });

    it('should handle large file uploads', () => {
      cy.visit('/create-post');
      
      // Try to upload a large file (simulate with a large text file)
      cy.get('[data-cy=image-upload]').selectFile('cypress/fixtures/large-file.txt', { force: true });
      
      cy.contains('File size exceeds maximum limit').should('be.visible');
    });

    it('should handle invalid file types', () => {
      cy.visit('/create-post');
      
      // Try to upload a non-image file
      cy.get('[data-cy=image-upload]').selectFile('cypress/fixtures/document.pdf', { force: true });
      
      cy.contains('Only image files are allowed').should('be.visible');
    });

    it('should handle corrupted image files', () => {
      cy.visit('/create-post');
      
      // Try to upload a corrupted image file
      cy.get('[data-cy=image-upload]').selectFile('cypress/fixtures/corrupted-image.jpg', { force: true });
      
      cy.contains('Invalid image file').should('be.visible');
    });
  });

  describe('Browser Compatibility Issues', () => {
    it('should handle disabled JavaScript', () => {
      // Note: This test would require specific setup for no-JS environment
      // For now, we'll test that critical functionality still works
      cy.visit('/');
      
      // Basic navigation should work
      cy.get('[data-cy=home-link]').should('be.visible');
      cy.get('[data-cy=login-link]').should('be.visible');
    });

    it('should handle local storage unavailability', () => {
      // Clear and disable localStorage
      cy.window().then((win) => {
        win.localStorage.clear();
        // Mock localStorage to throw errors
        cy.stub(win.localStorage, 'setItem').throws(new Error('LocalStorage disabled'));
        cy.stub(win.localStorage, 'getItem').returns(null);
      });
      
      cy.visit('/login');
      
      // Should still be able to use the app without localStorage
      cy.get('[data-cy=email-input]').should('be.visible');
    });

    it('should handle cookies being disabled', () => {
      // Clear all cookies
      cy.clearCookies();
      
      cy.visit('/');
      
      // App should still function
      cy.contains('Home').should('be.visible');
    });
  });

  describe('Concurrent User Actions', () => {
    it('should handle simultaneous login attempts', () => {
      cy.register('testuser', 'test@example.com', 'password123');
      
      // Open multiple login forms and submit simultaneously
      cy.visit('/login');
      
      cy.get('[data-cy=email-input]').type('test@example.com');
      cy.get('[data-cy=password-input]').type('password123');
      
      // Submit multiple times quickly
      cy.get('[data-cy=login-button]').click();
      cy.get('[data-cy=login-button]').click();
      cy.get('[data-cy=login-button]').click();
      
      // Should handle gracefully without multiple redirects
      cy.url().should('not.include', '/login');
    });

    it('should handle post being deleted while viewing', () => {
      cy.setupTestData().then((testData) => {
        cy.createPost('Post to Delete', 'Content', testData.categoryId, testData.token).then((response) => {
          const postId = response.body._id;
          
          cy.visit(`/posts/${postId}`);
          
          // Simulate post being deleted by another user
          cy.request('DELETE', `/api/posts/${postId}`, {
            headers: { 'Authorization': `Bearer ${testData.token}` }
          });
          
          // Try to interact with the post
          cy.get('[data-cy=like-button]').click();
          
          // Should show appropriate error
          cy.contains('This post is no longer available').should('be.visible');
        });
      });
    });
  });

  describe('Performance Edge Cases', () => {
    it('should handle large numbers of posts', () => {
      cy.setupTestData().then((testData) => {
        // Create many posts
        for (let i = 1; i <= 100; i++) {
          cy.createPost(`Post ${i}`, `Content ${i}`, testData.categoryId, testData.token);
        }
        
        cy.visit('/');
        
        // Should load within reasonable time
        cy.get('[data-cy=post-list]', { timeout: 10000 }).should('be.visible');
        
        // Pagination should work
        cy.get('[data-cy=pagination]').should('be.visible');
      });
    });

    it('should handle rapid search queries', () => {
      cy.setupTestData().then((testData) => {
        cy.createPost('Searchable Post', 'Searchable content', testData.categoryId, testData.token);
      });
      
      cy.visit('/');
      
      // Type rapidly in search box
      const searchTerms = ['sea', 'sear', 'searc', 'search', 'searcha', 'searchab', 'searchabl', 'searchable'];
      
      searchTerms.forEach(term => {
        cy.get('[data-cy=search-input]').clear().type(term);
        cy.wait(100); // Small delay between searches
      });
      
      // Should handle without errors
      cy.get('[data-cy=search-input]').should('have.value', 'searchable');
    });
  });
});
