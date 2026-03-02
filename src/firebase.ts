import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: replace the following config object with your own Firebase project settings
// You can obtain these from the Firebase console under Project Settings -> General.
// When deploying to Vercel you should store these values in environment variables
// and reference them via import.meta.env.

// Firebase web config inserted per user request
const firebaseConfig = {
  apiKey: "AIzaSyBs-1yEZmvbS3F6BYOD-z87BSnrRa41ia8",
  authDomain: "bharatqr-30624.firebaseapp.com",
  projectId: "bharatqr-30624",
  storageBucket: "bharatqr-30624.firebasestorage.app",
  messagingSenderId: "807138932035",
  appId: "1:807138932035:web:d8bfefec67f0567c272bf6",
  measurementId: "G-VN4G78VQJP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
