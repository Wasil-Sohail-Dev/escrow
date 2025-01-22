/* This code snippet is a JavaScript service worker file named `firebase-messaging-sw.js` that is used
for Firebase Cloud Messaging (FCM) in a web application. Here's a breakdown of what it does: */
// public/firebase-messaging-sw.js
try {
    importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js");
    importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging.js");
} catch (e) {
    console.error("Failed to import Firebase scripts:", e);
}

if (typeof firebase !== 'undefined') {
    // Initialize Firebase in the service worker
    const firebaseConfig = {
        apiKey: "AIzaSyDbi165VobM5x_pUQwCBEOoSkgklKIjylQ",
        authDomain: "thirdparty-ea518.firebaseapp.com",
        projectId: "thirdparty-ea518",
        storageBucket: "thirdparty-ea518.firebasestorage.app",
        messagingSenderId: "382840587410",
        appId: "1:382840587410:web:564b95213e77285a6c524b",
        measurementId: "G-HFT4QSNY2K"
    };

    firebase.initializeApp(firebaseConfig);

    // Retrieve an instance of Firebase Messaging
    const messaging = firebase.messaging();

    // Handle background messages
    messaging.onBackgroundMessage((payload) => {
        console.log("Background message received: ", payload);

        const notificationTitle = payload.notification?.title || "Default Title";
        const notificationOptions = {
            body: payload.notification?.body || "Default Body",
            icon: payload.notification?.icon || "/default-icon.png",
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });
} else {
    console.error("Firebase is not defined.");
}


