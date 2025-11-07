import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyDJymhg9cCWZDz44FnPdJ4d4FO-sWIwJJQ",
  authDomain: "fir-business-managementsystem.firebaseapp.com",
  databaseURL: "https://fir-business-managementsystem-default-rtdb.firebaseio.com",
  projectId: "fir-business-managementsystem",
  storageBucket: "fir-business-managementsystem.firebasestorage.app",
  messagingSenderId: "520408301859",
  appId: "1:520408301859:web:8dbc441895da61d342cc96",
  measurementId: "G-5VWX831XGG",
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
export const auth = getAuth(app)
export const storage = getStorage(app)
