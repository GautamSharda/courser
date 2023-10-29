'use client'
import constants from '@/helpers/constants'
import React, { useEffect, useState } from 'react'

function Admin() {
  const [userCount, setUserCount] = useState(0)

  const getTotalUsers = async () => {
    try {
      const response = await fetch(`${constants.url}/getCourserData`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.status !== 200) {
        throw new Error('Request failed')
      }

      const data = await response.json()
      setUserCount(data.userCount)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getTotalUsers()
  }, [])

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <h1>Hello World</h1>
      <p>
        There are currently {userCount} active users signed up for your app.
      </p>
    </div>
  )
}

export default Admin