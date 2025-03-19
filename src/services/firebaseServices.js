// Mock data storage
let orders = []

// Orders
export const getOrders = async () => {
  // Get orders from localStorage
  const storedOrders = localStorage.getItem("orders")
  if (storedOrders) {
    orders = JSON.parse(storedOrders)
  }
  return orders
}

export const getOrderById = async (orderId) => {
  // Get orders from localStorage
  const storedOrders = localStorage.getItem("orders")
  if (storedOrders) {
    orders = JSON.parse(storedOrders)
  }

  const order = orders.find((o) => o.id === orderId)
  if (!order) {
    throw new Error("Order not found")
  }

  return order
}

export const createOrder = async (orderData) => {
  // Get orders from localStorage
  const storedOrders = localStorage.getItem("orders")
  if (storedOrders) {
    orders = JSON.parse(storedOrders)
  }

  const orderId = `order_${Date.now()}`
  const newOrder = {
    id: orderId,
    ...orderData,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  orders.push(newOrder)
  localStorage.setItem("orders", JSON.stringify(orders))

  return newOrder
}

export const updateOrderStatus = async (orderId, status, userId) => {
  // Get orders from localStorage
  const storedOrders = localStorage.getItem("orders")
  if (storedOrders) {
    orders = JSON.parse(storedOrders)
  }

  const orderIndex = orders.findIndex((o) => o.id === orderId)
  if (orderIndex === -1) {
    throw new Error("Order not found")
  }

  const updatedOrder = {
    ...orders[orderIndex],
    status,
    updatedAt: new Date().toISOString(),
  }

  if (status === "approved") {
    updatedOrder.approvedBy = userId
    updatedOrder.approvedAt = new Date().toISOString()
  } else if (status === "rejected") {
    updatedOrder.rejectedBy = userId
    updatedOrder.rejectedAt = new Date().toISOString()
  }

  orders[orderIndex] = updatedOrder
  localStorage.setItem("orders", JSON.stringify(orders))

  return updatedOrder
}

// Users
export const getUserById = async (userId) => {
  // Check predefined users
  const predefinedUsers = [
    {
      uid: "admin123",
      email: "admin@palletbodega.com",
      role: "admin",
      createdAt: new Date().toISOString(),
    },
    {
      uid: "user123",
      email: "user@example.com",
      role: "customer",
      createdAt: new Date().toISOString(),
    },
  ]

  const predefinedUser = predefinedUsers.find((u) => u.uid === userId)
  if (predefinedUser) {
    return predefinedUser
  }

  // Check registered users
  const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
  const user = registeredUsers.find((u) => u.uid === userId)

  if (!user) {
    throw new Error("User not found")
  }

  // Remove password before returning
  const { password, ...userWithoutPassword } = user
  return userWithoutPassword
}

export const updateUserRole = async (userId, role) => {
  // Check registered users
  const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
  const userIndex = registeredUsers.findIndex((u) => u.uid === userId)

  if (userIndex >= 0) {
    registeredUsers[userIndex].role = role
    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers))
  }

  // If it's the current user, update the current user in localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null")
  if (currentUser && currentUser.uid === userId) {
    currentUser.role = role
    localStorage.setItem("currentUser", JSON.stringify(currentUser))
  }

  return true
}

