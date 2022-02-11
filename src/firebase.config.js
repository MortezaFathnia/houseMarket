import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCaytrgiM7bmgUN5Hxn74kGYk9kSF7riBo",
  authDomain: "house-marketplace-app-40549.firebaseapp.com",
  projectId: "house-marketplace-app-40549",
  storageBucket: "house-marketplace-app-40549.appspot.com",
  messagingSenderId: "445898838141",
  appId: "1:445898838141:web:98dc691876140adbe56114"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db=getFirestore();