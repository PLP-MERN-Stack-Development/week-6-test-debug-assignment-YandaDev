// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command for user registration
Cypress.Commands.add('register', (username, email, password) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/register',
    body: {
      username,
      email,
      password
    }
  });
});

// Custom command for user login
Cypress.Commands.add('login', (email, password) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      email,
      password
    }
  }).then((response) => {
    // Store the token in localStorage
    window.localStorage.setItem('token', response.body.token);
    // Set auth headers for subsequent requests
    cy.window().then((win) => {
      win.localStorage.setItem('token', response.body.token);
    });
  });
});

// Custom command for login via UI
Cypress.Commands.add('loginViaUI', (email, password) => {
  cy.visit('/login');
  cy.get('[data-cy=email-input]').type(email);
  cy.get('[data-cy=password-input]').type(password);
  cy.get('[data-cy=login-button]').click();
  cy.url().should('not.include', '/login');
});

// Custom command to create a test post
Cypress.Commands.add('createPost', (title, content, categoryId, token) => {
  cy.request({
    method: 'POST',
    url: '/api/posts',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: {
      title,
      content,
      category: categoryId
    }
  });
});

// Custom command to create a test category
Cypress.Commands.add('createCategory', (name, description, token) => {
  cy.request({
    method: 'POST',
    url: '/api/categories',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: {
      name,
      description
    }
  });
});

// Custom command to clear database (for test cleanup)
Cypress.Commands.add('clearDatabase', () => {
  cy.request({
    method: 'POST',
    url: '/api/test/clear-database',
    failOnStatusCode: false
  });
});

// Custom command to setup test data
Cypress.Commands.add('setupTestData', () => {
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  };
  
  return cy.register(testUser.username, testUser.email, testUser.password)
    .then(() => cy.login(testUser.email, testUser.password))
    .then((response) => {
      const token = response.body.token;
      return cy.createCategory('Test Category', 'Test category description', token)
        .then((categoryResponse) => {
          return {
            user: testUser,
            token: token,
            categoryId: categoryResponse.body._id
          };
        });
    });
});
