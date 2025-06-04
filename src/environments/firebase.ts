import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: "AIzaSyDHggClyHqb3iRfJFQxG91-jen8d5eKbog",
  authDomain: "myfridgemonitordb.firebaseapp.com",
  projectId: "myfridgemonitordb",
  storageBucket: "myfridgemonitordb.firebasestorage.app",
  messagingSenderId: "181302298067",
  appId: "1:181302298067:web:562465e8adcb6eb2291b26",
  measurementId: "G-54LMYYQMPS"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
