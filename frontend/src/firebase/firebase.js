// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAmW3tPkY-vI0aP8iCPeE7oPeyY8cPRgq4",
  authDomain: "habitquest-b9b76.firebaseapp.com",
  projectId: "habitquest-b9b76",
  storageBucket: "habitquest-b9b76.firebasestorage.app",
  messagingSenderId: "486592816995",
  appId: "1:486592816995:web:bede03d1ac4be470181556",
  measurementId: "G-D0GW45ZQGX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export default app;