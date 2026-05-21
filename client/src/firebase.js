// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-8a877.firebaseapp.com",
  projectId: "mern-estate-8a877",
  storageBucket: "mern-estate-8a877.firebasestorage.app",
  messagingSenderId: "354875076445",
  appId: "1:354875076445:web:f427b8795d97aafaaf42b4"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);