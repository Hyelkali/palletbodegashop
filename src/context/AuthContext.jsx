"use client"

import { createContext, useContext, useState, useEffect } from "react"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "../firebase/config"

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

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))

          if (userDoc.exists()) {
            // Combine Firebase auth data with Firestore data
            const userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...userDoc.data(),
            }

            console.log("User data from Firestore:", userData)

            setUser(userData)
            setIsLoggedIn(true)
            setIsAdmin(userData.role === "admin")
            console.log("Admin status set to:", userData.role === "admin")
          } else {
            // If user document doesn't exist in Firestore, create it
            const newUserData = {
              email: firebaseUser.email,
              role: "customer",
              createdAt: new Date().toISOString(),
            }

            await setDoc(doc(db, "users", firebaseUser.uid), newUserData)
            console.log("Created new user document:", newUserData)

            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...newUserData,
            })
            setIsLoggedIn(true)
            setIsAdmin(false)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          // Basic user data if Firestore fetch fails
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
          })
          setIsLoggedIn(true)
          setIsAdmin(false)
        }
      } else {
        // User is signed out
        console.log("User is signed out")
        setUser(null)
        setIsLoggedIn(false)
        setIsAdmin(false)
      }

      setLoading(false)
    })

    // Cleanup subscription
    return () => unsubscribe()
  }, [])

  // Function to log in a user
  const login = async (email, password) => {
    try {
      // Add timeout handling
      const loginPromise = signInWithEmailAndPassword(auth, email, password)

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Login timed out. Please check your internet connection.")), 15000),
      )

      // Race the promises
      const userCredential = await Promise.race([loginPromise, timeoutPromise])

      // We don't need to store anything in localStorage as Firebase handles the auth state
      return userCredential.user
    } catch (error) {
      console.error("Login error:", error)

      // Provide more specific error messages
      if (error.code === "auth/network-request-failed") {
        throw new Error("Network connection error. Please check your internet connection and try again.")
      } else if (error.message && error.message.includes("timed out")) {
        throw new Error(error.message)
      } else {
        throw new Error(getAuthErrorMessage(error.code))
      }
    }
  }

  // Function to register a new user
  const register = async (email, password) => {
    try {
      // Add timeout handling
      const registerPromise = createUserWithEmailAndPassword(auth, email, password)

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Registration timed out. Please check your internet connection.")), 15000),
      )

      // Race the promises
      const userCredential = await Promise.race([registerPromise, timeoutPromise])

      // Create user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        role: "customer",
        createdAt: new Date().toISOString(),
      })

      return userCredential.user
    } catch (error) {
      console.error("Registration error:", error)

      // Provide more specific error messages
      if (error.code === "auth/network-request-failed") {
        throw new Error("Network connection error. Please check your internet connection and try again.")
      } else if (error.message && error.message.includes("timed out")) {
        throw new Error(error.message)
      } else {
        throw new Error(getAuthErrorMessage(error.code))
      }
    }
  }

  // Function to log out a user
  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  }

  // Function to send password reset email
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email)
      return true
    } catch (error) {
      console.error("Password reset error:", error)
      throw new Error(getAuthErrorMessage(error.code))
    }
  }

  // Helper function to get user-friendly error messages
  const getAuthErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/user-not-found":
        return "No user found with this email address"
      case "auth/wrong-password":
        return "Incorrect password"
      case "auth/email-already-in-use":
        return "Email already in use"
      case "auth/weak-password":
        return "Password is too weak"
      case "auth/invalid-email":
        return "Invalid email address"
      case "auth/too-many-requests":
        return "Too many failed login attempts. Please try again later"
      case "auth/network-request-failed":
        return "Network connection error. Please check your internet connection and try again."
      case "auth/operation-not-allowed":
        return "Email/password registration is not enabled. Please contact support."
      default:
        return "An error occurred. Please try again"
    }
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

