"use client"

import { createContext, useContext, useState, useEffect } from "react"

// Create the context
const AuthContext = createContext()

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  // State to track user, login status, admin status, and loading state
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  // Predefined users for demo purposes
  const predefinedUsers = [
    {
      uid: "admin123",
      email: "admin@palletbodega.com",
      password: "admin123",
      role: "admin",
      createdAt: new Date().toISOString(),
    },
    {
      uid: "user123",
      email: "user@example.com",
      password: "password123",
      role: "customer",
      createdAt: new Date().toISOString(),
    },
  ]

  // Check if user is logged in on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")

    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        setIsLoggedIn(true)
        setIsAdmin(userData.role === "admin")
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("currentUser")
      }
    }

    setLoading(false)
  }, [])

  // Function to log in a user
  const login = async (email, password) => {
    // First check predefined users
    let foundUser = predefinedUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    )

    // If not found in predefined users, check registered users in localStorage
    if (!foundUser) {
      const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
      foundUser = registeredUsers.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
    }

    if (!foundUser) {
      throw new Error("Invalid email or password")
    }

    // Remove password before storing in state and localStorage
    const { password: _, ...userWithoutPassword } = foundUser

    setUser(userWithoutPassword)
    setIsLoggedIn(true)
    setIsAdmin(userWithoutPassword.role === "admin")

    localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))

    return userWithoutPassword
  }

  // Function to register a new user
  const register = async (email, password) => {
    // Check if email already exists in predefined users
    if (predefinedUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Email already in use")
    }

    // Check if email already exists in registered users
    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
    if (registeredUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Email already in use")
    }

    // Create new user
    const newUser = {
      uid: `user_${Date.now()}`,
      email,
      password,
      role: "customer",
      createdAt: new Date().toISOString(),
    }

    // Add to registered users
    registeredUsers.push(newUser)
    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers))

    // Log in the new user
    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    setIsLoggedIn(true)
    setIsAdmin(false)

    localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))

    return userWithoutPassword
  }

  // Function to log out a user
  const logout = async () => {
    setUser(null)
    setIsLoggedIn(false)
    setIsAdmin(false)
    localStorage.removeItem("currentUser")
  }

  // Function to send password reset email (mock function)
  const resetPassword = async (email) => {
    // Check if email exists in predefined users or registered users
    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
    const userExists =
      predefinedUsers.some((u) => u.email.toLowerCase() === email.toLowerCase()) ||
      registeredUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())

    if (!userExists) {
      throw new Error("No user found with this email address")
    }

    // In a real app, this would send an email
    console.log(`Password reset email sent to ${email}`)
    return true
  }

  // Provide the auth context value to children
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isAdmin,
        loading,
        login,
        register,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

