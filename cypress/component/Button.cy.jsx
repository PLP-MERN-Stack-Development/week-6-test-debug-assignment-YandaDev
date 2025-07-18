import Button from '../../client/src/components/Button';

describe('Button Component', () => {
  it('renders with default props', () => {
    cy.mount(<Button>Click me</Button>);
    
    cy.get('button')
      .should('be.visible')
      .should('contain.text', 'Click me')
      .should('have.class', 'btn-primary')
      .should('have.class', 'btn-md');
  });

  it('renders with different variants', () => {
    cy.mount(<Button variant="secondary">Secondary</Button>);
    cy.get('button').should('have.class', 'btn-secondary');
    
    cy.mount(<Button variant="danger">Danger</Button>);
    cy.get('button').should('have.class', 'btn-danger');
  });

  it('renders with different sizes', () => {
    cy.mount(<Button size="sm">Small</Button>);
    cy.get('button').should('have.class', 'btn-sm');
    
    cy.mount(<Button size="lg">Large</Button>);
    cy.get('button').should('have.class', 'btn-lg');
  });

  it('handles click events', () => {
    const onClick = cy.stub().as('onClick');
    
    cy.mount(<Button onClick={onClick}>Click me</Button>);
    
    cy.get('button').click();
    cy.get('@onClick').should('have.been.called');
  });

  it('renders in disabled state', () => {
    cy.mount(<Button disabled>Disabled</Button>);
    
    cy.get('button')
      .should('be.disabled')
      .should('have.attr', 'disabled');
  });

  it('does not call onClick when disabled', () => {
    const onClick = cy.stub().as('onClick');
    
    cy.mount(<Button disabled onClick={onClick}>Disabled</Button>);
    
    cy.get('button').click({ force: true });
    cy.get('@onClick').should('not.have.been.called');
  });

  it('applies custom className', () => {
    cy.mount(<Button className="custom-class">Custom</Button>);
    
    cy.get('button').should('have.class', 'custom-class');
  });

  it('passes additional props to button element', () => {
    cy.mount(<Button data-testid="custom-button" aria-label="Custom button">Test</Button>);
    
    cy.get('button')
      .should('have.attr', 'data-testid', 'custom-button')
      .should('have.attr', 'aria-label', 'Custom button');
  });

  it('renders with loading state', () => {
    cy.mount(<Button loading>Loading</Button>);
    
    cy.get('button')
      .should('be.disabled')
      .should('contain.text', 'Loading...');
    
    // Check for loading spinner if implemented
    cy.get('.loading-spinner').should('exist');
  });

  it('handles keyboard interactions', () => {
    const onClick = cy.stub().as('onClick');
    
    cy.mount(<Button onClick={onClick}>Keyboard</Button>);
    
    cy.get('button').focus().type('{enter}');
    cy.get('@onClick').should('have.been.called');
    
    cy.get('button').focus().type(' ');
    cy.get('@onClick').should('have.been.calledTwice');
  });

  it('renders with icon support', () => {
    const Icon = () => <span className="icon">🚀</span>;
    
    cy.mount(
      <Button>
        <Icon />
        With Icon
      </Button>
    );
    
    cy.get('button')
      .should('contain.text', 'With Icon')
      .find('.icon')
      .should('contain.text', '🚀');
  });

  describe('Visual Tests', () => {
    it('should match visual snapshots', () => {
      cy.mount(
        <div style={{ padding: '20px', display: 'flex', gap: '10px', flexDirection: 'column' }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </div>
      );
      
      cy.get('[data-cy=root]').screenshot('button-variants-component');
    });

    it('should show hover states', () => {
      cy.mount(<Button>Hover me</Button>);
      
      cy.get('button').trigger('mouseover');
      cy.get('[data-cy=root]').screenshot('button-hover-state');
    });

    it('should show focus states', () => {
      cy.mount(<Button>Focus me</Button>);
      
      cy.get('button').focus();
      cy.get('[data-cy=root]').screenshot('button-focus-state');
    });
  });

  describe('Accessibility Tests', () => {
    it('should be accessible', () => {
      cy.mount(<Button>Accessible Button</Button>);
      
      // Check for proper button semantics
      cy.get('button')
        .should('have.attr', 'type', 'button')
        .should('be.visible');
      
      // Check focus management
      cy.get('button').focus().should('be.focused');
      
      // Check keyboard navigation
      cy.get('button').type('{enter}').should('be.focused');
    });

    it('should support aria attributes', () => {
      cy.mount(
        <Button 
          aria-label="Close dialog"
          aria-describedby="help-text"
          role="button"
        >
          ×
        </Button>
      );
      
      cy.get('button')
        .should('have.attr', 'aria-label', 'Close dialog')
        .should('have.attr', 'aria-describedby', 'help-text')
        .should('have.attr', 'role', 'button');
    });

    it('should announce state changes to screen readers', () => {
      cy.mount(<Button aria-live="polite">Dynamic</Button>);
      
      cy.get('button').should('have.attr', 'aria-live', 'polite');
    });
  });
});
