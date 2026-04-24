import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC1yfxgyjHblW0kZtl8-b8QPLMgh-IIIdk",
  authDomain: "tiktok-shop-3fc86.firebaseapp.com",
  projectId: "tiktok-shop-3fc86",
  storageBucket: "tiktok-shop-3fc86.firebasestorage.app",
  messagingSenderId: "1000220621760",
  appId: "1:1000220621760:web:a0bc080764d8206a53a625",
  measurementId: "G-TH9SC0TRX7"
};

// Prevent initializing multiple apps during Next.js hot reloads
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Export these to use in your Login component
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
