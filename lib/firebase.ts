import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyD8kkQF9OYvrtSTKxP7xBq0XYi18xJHFto",
  authDomain: "realstate-843fd.firebaseapp.com",
  databaseURL: "https://realstate-843fd-default-rtdb.firebaseio.com",
  projectId: "realstate-843fd",
  storageBucket: "realstate-843fd.firebasestorage.app",
  messagingSenderId: "778478056753",
  appId: "1:778478056753:web:ea0a88c8eb307dd6b6ac10",
  measurementId: "G-2MQTW5EYBT"
};

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
export const auth = getAuth(app)
export const storage = getStorage(app)
