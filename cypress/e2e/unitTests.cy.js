describe('View login/signup page', () => {
    it('Test viewing the login page', () => {
        cy.visit('http://localhost:4000/')
        cy.get('h1').should('contain', 'Booktrack')
        cy.get('h2').should('contain', 'Make keeping track of the books you have read easy with Booktrack. Just enter the title of the book along with the page count and rating!')
    })
})

describe('User Login function with invalid and then valid credentials', () => {
    beforeEach(() => {
        cy.visit('http://localhost:4000/');
    });
    it('should not login if email is incorrect', () => {
        cy.get('button').contains('Sign In').click();
        cy.wait(2000);
        cy.get('#signInEmail').type('adminjoemaa@kanakana.kana')
        cy.get('#signInPassword').type('KollneKollne');
        cy.get('#signInModal > .modal-dialog > .modal-content > .modal-footer > .btn-primary').click();
    });

    it('should not login if password is incorrect', () => {
        cy.get('button').contains('Sign In').click();
        cy.wait(2000);
        cy.get('#signInEmail').type('admin')
        cy.get('#signInPassword').type('Kollne');
        cy.get('#signInModal > .modal-dialog > .modal-content > .modal-footer > .btn-primary').click();
    });

    it('should log in a user successfully with correct credentials', () => {
        cy.get('button').contains('Sign In').click();
        cy.wait(2000);
        cy.get('#signInEmail').type('admin')
        cy.get('#signInPassword').type('KollneKollne');
        cy.get('#signInModal > .modal-dialog > .modal-content > .modal-footer > .btn-primary').click();
    });

});


