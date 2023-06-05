describe('Creating a user to be able to add books', () => {

    it('should sign up user with valid credentials', () => {
        cy.visit('http://localhost:4000/');
        cy.get('button').contains('Sign Up').click();
        cy.wait(2000);
        cy.get('#signUpEmail').type('evelinjoemaa@gmail.com')
        cy.get('#signUpPassword').type('KollneKollne');
        cy.get('#signUpModal > .modal-dialog > .modal-content > .modal-footer > .btn-primary').click();
        cy.wait(10000);
    });
    it('should log in a user successfully with correct credentials', () => {
        cy.get('button').contains('Sign In').click();
        cy.wait(2000);
        cy.get('#signInEmail').type('evelinjoemaa@gmail.com')
        cy.wait(2000);
        cy.get('#signInPassword').type('KollneKollne');
        cy.wait(2000);
        cy.get('#signInModal > .modal-dialog > .modal-content > .modal-footer > .btn-primary').click();

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

