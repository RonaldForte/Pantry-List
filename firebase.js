import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
//Put Firebase API conifg here

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let analytics;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      const { getAnalytics } = require("firebase/analytics");
      analytics = getAnalytics(app);
    }
  });
}

const firestore = getFirestore(app);

export { firestore };
