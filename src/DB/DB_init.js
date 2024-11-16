// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAdHLH0_nqGRggAZaio1qUCHkmjqrGq-1o",
  authDomain: "portfolio-f18a3.firebaseapp.com",
  projectId: "portfolio-f18a3",
  storageBucket: "portfolio-f18a3.appspot.com",
  messagingSenderId: "545894820111",
  appId: "1:545894820111:web:de82f75d60e83886f7b67a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };
