require('dotenv/config')
const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const { verify } = require('jsonwebtoken')
const { hash, compare } = require('bcryptjs')

// 1. Register a user
// 2. Log in a user
// 3. Log out a user
// 4. Set up a protected route
// 5. Get a new access token with a refresh token

const server = express()

// Use express middleware for easier cookie handling
server.use(cookieParser())

server.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))

//ability to read body data
server.use(express.json()) //to support JSON-encoded bodies
server.use(express.urlencoded({
    extended: true
})) //to support URL-encoded bodies

server.listen(process.env.PORT, () => console.log('server is running on ' + process.env.PORT))

// 1. Register a user
server.post('/register', async (req, res) => {
    const { email, password } = req.body

    try{
        //check if user exists

        const hashedPassword = await hash(password, 10)
        console.log(hashedPassword)
    }catch(err){

    }
})