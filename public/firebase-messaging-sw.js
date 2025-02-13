importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

const firebaseConfig = {
    apiKey: "AIzaSyDbi165VobM5x_pUQwCBEOoSkgklKIjylQ",
    authDomain: "thirdparty-ea518.firebaseapp.com",
    projectId: "thirdparty-ea518",
    storageBucket: "thirdparty-ea518.firebasestorage.app",
    messagingSenderId: "382840587410",
    appId: "1:382840587410:web:564b95213e77285a6c524b",
    measurementId: "G-HFT4QSNY2K"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log("Received background message:", payload);
    const { title, body } = payload.notification || {};

    self.registration.showNotification(title, {
        body,
        icon: "./file.svg",
        vibrate: [200, 100, 200], // Vibrate pattern for mobile devices
    });
});
