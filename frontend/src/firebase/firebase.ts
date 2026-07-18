import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Validate all required environment variables
const requiredEnvVars = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
  "VITE_FIREBASE_MEASUREMENT_ID",
];

const missingEnvVars: string[] = [];
requiredEnvVars.forEach((varName) => {
  if (!import.meta.env[varName]) {
    missingEnvVars.push(varName);
  }
});

if (missingEnvVars.length > 0) {
  const errorMsg = `Configuration Error: Missing required environment variables: ${missingEnvVars.join(", ")}`;
  console.error(errorMsg);
  throw new Error(errorMsg);
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app: any;
let auth: any;
let db: any;

try {
  // Prevent duplicate Firebase initialization (e.g. during Vite HMR)
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  console.log("Firebase initialized successfully.");

  auth = getAuth(app);
  console.log("Firebase Auth initialized.");

  db = getFirestore(app);
  console.log("Firestore initialized.");

  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001';
  if (apiUrl) {
    console.log("Backend API URL detected.");
  }

  console.log("Authentication ready.");
} catch (error: any) {
  console.error("Firebase initialization failed:", error.message || error);
  throw error;
}

export { app, auth, db };
export default app;