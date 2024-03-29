const express = require('express')
const verifier = require('@gradeup/email-verify')
const bcrypt = require('bcrypt')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 3000
let expressWs = require('express-ws')(app);
const {v4: uuidv4} = require('uuid');

// Add Swagger UI
const swaggerUi = require('swagger-ui-express');
const yamlJs = require('yamljs');
const swaggerDocument = yamlJs.load('./swagger.yml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.static('public'))
app.use(express.json())
app.ws('/', function (ws, req) {
    ws.on('message', function (msg) {
        expressWs.getWss().clients.forEach(client => client.send(msg));
    });
    console.log('socket', req.testing);
});
const users = [
    {id: 1, email: 'admin', password: '$2b$10$0EfA6fMFRDVQWzU0WR1dmelPA7.qSp7ZYJAgneGsy2ikQltX2Duey'} // KollneKollne
]

const books = [
    {
        id: 1,
        title: 'Book 1',
        content: 'Information about Book 1',
        userId: 1
    },
    {
        id: 2,
        title: 'Book 2',
        content: 'Information about Book 2',
        userId: 2
    },
    {
        id: 3,
        title: 'Book 3',
        content: 'Information about Book 3',
        userId: 1
    }
]


let sessions = [
    {id: '123', userId: 1}
]

function tryToParseJson(jsonString) {
    try {
        let o = JSON.parse(jsonString);
        if (o && typeof o === "object") {
            return o;
        }
    } catch (e) {
    }
    return false;
}

//const delay = ms => new Promise(res => setTimeout(res, ms));

app.post('/users', async (req, res) => {

    // Validate email and password
    if (!req.body.email || !req.body.password) return res.status(400).send('Email and password are required')
    if (req.body.password.length < 8) return res.status(400).send('Password must be at least 8 characters long')
    if (!req.body.email.match(/^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)) return res.status(400).send('Email must be in a valid format')

    // Check if email already exists
    if (users.find(user => user.email === req.body.email)) return res.status(409).send('Email already exists')

    // Try to contact the mail server and send a test email without actually sending it
    try {
        const result = await verifyEmail(req.body.email);
        if (!result.success) {
            return res.status(400).send('Invalid email: ' + result.info)
        }
        console.log('Email verified')
    } catch (error) {
        const errorObject = tryToParseJson(error)
        if (errorObject && errorObject.info) {
            return res.status(400).send('Invalid email: ' + errorObject.info)
        }
        return res.status(400).send('Invalid email: ' + error)
    }

    // Hash password
    let hashedPassword
    try {
        hashedPassword = await bcrypt.hash(req.body.password, 10);
    } catch (error) {
        console.error(error);
    }

    // Find max id
    const maxId = users.reduce((max, user) => user.id > max ? user.id : max, users[0].id)

    // Save user to database
    users.push({id: maxId + 1, email: req.body.email, password: hashedPassword})

    res.status(201).end()
})

// POST /sessions
app.post('/sessions', async (req, res) => {

    // Validate email and password
    if (!req.body.email || !req.body.password) return res.status(400).send('Email and password are required')

    // Find user in database
    const user = users.find(user => user.email === req.body.email)
    if (!user) return res.status(404).send('User not found')

    // Compare password
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {

            // Create session
            const session = {id: uuidv4(), userId: user.id}

            // Add session to sessions array
            sessions.push(session)

            // Send session to client
            res.status(201).send(session)

        } else {
            res.status(401).send('Invalid password')
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error')
    }
})

function authorizeRequest(req, res, next) {
    // Check that there is an authorization header
    if (!req.headers.authorization) return res.status(401).send('Missing authorization header')

    // Check that the authorization header is in the correct format
    const authorizationHeader = req.headers.authorization.split(' ')
    if (authorizationHeader.length !== 2 || authorizationHeader[0] !== 'Bearer') return res.status(400).send('Invalid authorization header')

    // Get sessionId from authorization header
    const sessionId = authorizationHeader[1]

    // Find session in sessions array
    const session = sessions.find(session => session.id === sessionId)
    if (!session) return res.status(401).send('Invalid session')

    // Check that the user exists
    const user = users.find(user => user.id === session.userId)
    if (!user) return res.status(401).send('Invalid session')

    // Add user to request object
    req.user = user

    // Add session to request object
    req.session = session

    // Call next middleware
    next()

}

app.get('/books', authorizeRequest, async (req, res) => {
    // await delay(10000); // Simulate slow connection
    // Get books for user
    const booksForUser = books.filter(book => book.userId === req.user.id)

    // Send book data to client
    res.send(booksForUser)
})

app.post('/books', authorizeRequest, (req, res) => {

    // Validate title and content
    if (!req.body.title || !req.body.content) return res.status(400).send('Title and content are required')

    // Find max id
    const maxId = books.reduce((max, book) => book.id > max ? book.id : max, 0)

    // Save the book to database
    const book = {id: maxId + 1, title: req.body.title, content: req.body.content, userId: req.user.id}

    //Add book to books array
    books.push(book)


    // Send the book to client
    expressWs.getWss().clients.forEach(client => client.send(JSON.stringify({event: 'create', book})));
    res.status(201).send(books[books.length - 1])
})

app.delete('/books/:id', authorizeRequest, (req, res) => {

    // Find the book in database
    const book = books.find(book => book.id === parseInt(req.params.id))
    if (!book) return res.status(404).send('Book not found')

    // Check that the book belongs to the correct user
    if (book.userId !== req.user.id) return res.status(401).send('Unauthorized')

    // Remove the book from read books
    books.splice(books.indexOf(book), 1)

    // Send delete event to clients
    expressWs.getWss().clients.forEach(client => client.send(JSON.stringify({event: 'delete', id: book.id})));

    res.status(204).end()
})

app.put('/books/:id', authorizeRequest, (req, res) => {

    // Validate title and content
    if (!req.body.title || !req.body.content) return res.status(400).send('Title and content are required')

    // Find the book in database
    const book = books.find(book => book.id === parseInt(req.params.id))
    if (!book) return res.status(404).send('Book not found')

    // Check that the book belongs to the user
    if (book.userId !== req.user.id) return res.status(401).send('Unauthorized')

    // Update the book
    book.title = req.body.title
    book.content = req.body.content

    // Send update event to clients
    expressWs.getWss().clients.forEach(client => client.send(JSON.stringify({event: 'update', book})));

    // Send requested book to client
    res.send(book)
})

app.delete('/sessions', authorizeRequest, (req, res) => {

    // Remove session from sessions array
    sessions = sessions.filter(session => session.id !== req.session.id)

    res.status(204).end()
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

function verifyEmail(email) {
    return new Promise((resolve, reject) => {
        verifier.verify(email, (err, info) => {
            console.log(err, info);
            if (err) {
                reject(JSON.stringify(info));
            } else {
                resolve(info);
            }
        });
    });
}