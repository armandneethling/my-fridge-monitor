// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyDHggClyHqb3iRfJFQxG91-jen8d5eKbog",
  authDomain: "myfridgemonitordb.firebaseapp.com",
  projectId: "myfridgemonitordb",
  storageBucket: "myfridgemonitordb.firebasestorage.app",
  messagingSenderId: "181302298067",
  appId: "1:181302298067:web:562465e8adcb6eb2291b26",
  measurementId: "G-54LMYYQMPS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);