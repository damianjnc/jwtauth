require('dotenv/config')
const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const { verify } = require('jsonwebtoken')
const { hash, compare } = require('bcryptjs')
const { fakeDB } = require('./fakeDB')
const {
    createAccessToken,
    createRefreshToken,
    sendAccessToken,
    sendRefreshToken
} = require('./tokens')
const { isAuth } = require('./isAuth')

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


// 1. Register a user
server.post('/register', async (req, res) => {
    const { email, password } = req.body

    try{
        // 1. Check if user exists
        const user = fakeDB.find(user => user.email === email)
        if(user) throw new Error('User already registered')
        // 2. If no user exists, hash the password
        const hashedPassword = await hash(password, 10)

        // 3. Save the user to the database
        fakeDB.push({
            id: fakeDB.length,
            email,
            password: hashedPassword
        })
        res.send('User created')
        console.log(fakeDB)
    }catch(err){
        res.send({
            error: `${err.message}`
        })
    }
})

// 2. Log in the user
server.post('/login', async(req, res) => {
    try{
        // 1. Find user in database, if it doesn't exist, send an error
        const user = fakeDB.find(user => user.email === req.body.email)
        if(!user) throw new Error('User not found')

        // 2. Compare crypted password and send an error if it doesn't match
        const valid = await compare(req.body.password, user.password)
        if(!valid) throw new Error('Password invalid')

        // 3. Create Refresh and access token
        const accessToken = createAccessToken(user.id)
        const refreshToken = createRefreshToken(user.id)

        // 4. Put the refresh token in the db
        user.refreshToken = refreshToken
        console.log(fakeDB)

        // 5. Send token, refreshtoken as a cookie, accesstoken as a res
        sendRefreshToken(res, refreshToken)
        sendAccessToken(req, res, accessToken)
    } catch(err){
        res.send({
            error: `${err.message}`
        })
    }
})

// 3. Log out the user
    server.post('/logout', (_req, res) => {
        res.clearCookie('refreshtoken')
        return res.send({
            message: 'Logged out'
        })
    })

// 4. Protected route
    server.post('/protected', (req, res) => {
        try{
            const userId = isAuth(req)
            if(userId !== null){
                res.send({
                    data: 'This is protected data'
                })
            }

        } catch (e) {
            res.send({
                error: `${e.message}`
            })

        }
    })

server.listen(process.env.PORT, () => console.log('server is running on ' + process.env.PORT))
