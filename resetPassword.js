import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

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
const auth = getAuth(app);

document.getElementById("resetForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("resetEmail").value;
    const resetMessage = document.getElementById("resetMessage");

    sendPasswordResetEmail(auth, email)
        .then(() => {
            resetMessage.style.display = "block";
            resetMessage.className = "alert alert-success";
            resetMessage.textContent = "Password reset email sent! Check your inbox.";
        })
        .catch((error) => {
            resetMessage.style.display = "block";
            resetMessage.className = "alert alert-danger";
            resetMessage.textContent = "Error: " + error.message;
        });
});
