"use client"

import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import LoadingScreen from "./LoadingScreen"

const ProtectedRoute = ({ requireAdmin = false }) => {
  const { isLoggedIn, isAdmin, loading, user } = useAuth()

  console.log("Protected Route Check:", { isLoggedIn, isAdmin, requireAdmin, user })

  if (loading) {
    return <LoadingScreen message="Verifying authentication..." />
  }

  if (!isLoggedIn) {
    console.log("Not logged in, redirecting to login")
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && !isAdmin) {
    console.log("Not admin, redirecting to home")
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute

