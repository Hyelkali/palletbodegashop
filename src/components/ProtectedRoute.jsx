"use client"

import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import LoadingScreen from "./LoadingScreen"

const ProtectedRoute = ({ requireAdmin = false }) => {
  const { isLoggedIn, isAdmin, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute

