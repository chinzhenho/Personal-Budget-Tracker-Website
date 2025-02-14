// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDlrbumKo34d3Hel__bA1Xj6TG_ClFOF0g",
    authDomain: "login-form-4c66d.firebaseapp.com",
    projectId: "login-form-4c66d",
    storageBucket: "login-form-4c66d.appspot.com",
    messagingSenderId: "9677626952",
    appId: "1:9677626952:web:4f55f083e1cdf36f77c27d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// DOM Elements
const statusMessage = document.getElementById("statusMessage");
const messagesContainer = document.getElementById("messagesContainer");

// Function to load messages for the logged-in user
async function loadMessages(userId) {
    try {
        const messagesCollection = collection(db, `users/${userId}/messages`);
        const querySnapshot = await getDocs(messagesCollection);

        messagesContainer.innerHTML = ""; // Clear previous messages

        if (querySnapshot.empty) {
            messagesContainer.innerHTML = '<p>No messages found.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const messageData = doc.data();
            const messageItem = document.createElement("div");
            messageItem.classList.add("message-item");
            messageItem.innerHTML = `
                <p>${messageData.message}</p>
                <p class="timestamp">${new Date(messageData.timestamp.seconds * 1000).toLocaleString()}</p>
            `;
            messagesContainer.appendChild(messageItem);
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
        statusMessage.textContent = "Failed to load messages.";
        statusMessage.style.color = "red";
    }
}

// Check user authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadMessages(user.uid);
    } else {
        statusMessage.textContent = "You need to be logged in to view messages.";
        statusMessage.style.color = "red";
    }
});
