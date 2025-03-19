import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCBvUbXZdJ7aQd7UbdPfGjytnxV41Qa9U4",
    authDomain: "pallet-bodega-shop.firebaseapp.com",
    projectId: "pallet-bodega-shop",
    storageBucket: "pallet-bodega-shop.firebasestorage.app",
    messagingSenderId: "799472142873",
    appId: "1:799472142873:web:d3811abd5485e81d4af888",
    measurementId: "G-T16HMRRJ54"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { auth, db, storage }

