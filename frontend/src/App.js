import React, { useState, useEffect, createContext } from 'react'
import { Router, navigate } from '@reach/router'

import Navigation from './components/Navigation'
import Login from './components/Login'
import Register from './components/Register'
import Protected from './components/Protected'
import Content from './components/Content'

export const UserContext = createContext([])

function App() {
  const [user, setUser] = useState({})
  const [loading, setLoading] = useState(true)

  const logOutCallback = async () => {
    await fetch('http://localhost:4001/logout', {
      method: 'POST',
      credentials: 'include'
    })
    // clear from user context
    setUser({})
    // navigate back to start page
    navigate('/')
  }

  // Get a new access token if refresh token exists
  useEffect(() => {
    async function checkRefreshToken() {
      const result = await (
        await fetch(`http://localhost:4001/refresh_token`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      ).json()
      setUser({ accesstoken: result.accesstoken })
      setLoading(false)
    }
    checkRefreshToken()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }
  return (
    <UserContext.Provider value={[user, setUser]}>
      <div className="app">
        <Navigation logOutCallback={logOutCallback} />
        <Router id="router">
          <Login path="login" />
          <Register path="register" />
          <Protected path="protected" />
          <Content path="/" />
        </Router>
      </div>
    </UserContext.Provider>
  )
}

export default App
