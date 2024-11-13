// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBsOvyTBpZ-I5Bd9RgzxJO2-Gbk4ddlYkY",
  authDomain: "graduation-showcase.firebaseapp.com",
  projectId: "graduation-showcase",
  storageBucket: "graduation-showcase.appspot.com",
  messagingSenderId: "1064747626143",
  appId: "1:1064747626143:web:6387d4b604db48fdd9bcaa",
  measurementId: "G-02EWHW6HGN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Google provider
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
