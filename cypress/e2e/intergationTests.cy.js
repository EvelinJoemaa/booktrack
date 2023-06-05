describe('Adding books as existing user', () => {

    it('should log in a user successfully with correct credentials', () => {
        cy.visit('http://localhost:4000/');
        cy.get('button').contains('Sign In').click();
        cy.wait(2000);
        cy.get('#signInEmail').type('admin')
        cy.get('#signInPassword').type('KollneKollne');
        cy.get('#signInModal > .modal-dialog > .modal-content > .modal-footer > .btn-primary').click();
        cy.wait(2000);
    });

    it('should create a new book successfully', () => {
        cy.get('button').contains('Add Book').click();
        cy.get('#addBookContent').type('Book content');
        cy.wait(2000);
        cy.get('#addBookTitle').type('New Book');
        cy.get('#addBookModal > .modal-dialog > .modal-content > .modal-footer > .btn-primary').click();
        cy.get('#book-list > :nth-child(3)').should('contain', 'New Book');
    });

});
