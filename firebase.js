import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { isSupported } from "firebase/analytics";

const firebaseConfig = {
// add here
  };


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
