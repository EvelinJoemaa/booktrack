describe('View login/signup page', () => {
    it('Test viewing the login page', () => {
        cy.visit('http://localhost:4000/')
        cy.get('h1').should('contain', 'Booktrack')
        cy.get('h2').should('contain', 'Make keeping track of the books you have read easy with Booktrack. Just enter the title of the book along with the page count and rating!')

    })
})


