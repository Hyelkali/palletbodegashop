// This is a utility script to create an admin user
// You can run this in a Node.js environment or adapt it for your needs

import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "../firebase/config"

// Admin user credentials
const adminEmail = "admin@palletbodega.com"
const adminPassword = "admin123"

async function createAdminUser() {
  try {
    // Create user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword)

    // Set user role as admin in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: adminEmail,
      role: "admin",
      createdAt: new Date().toISOString(),
    })

    console.log("Admin user created successfully!")
    return userCredential.user
  } catch (error) {
    console.error("Error creating admin user:", error)
    throw error
  }
}

// Uncomment to run the function
// createAdminUser();

