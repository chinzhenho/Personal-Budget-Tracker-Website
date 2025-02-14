import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

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

const form = document.getElementById("editHistoryForm");
const typeInput = document.getElementById("type");
const dateInput = document.getElementById("date");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const remarksInput = document.getElementById("remarks");

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

if (!id) {
    alert("No entry ID provided. Redirecting back.");
    window.location.href = "homePerDashboard.html";
}

// Fetch the history entry
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const userId = user.uid;
        const incomeDocRef = doc(db, "users", userId, "incomes", id);
        const expenseDocRef = doc(db, "users", userId, "expenses", id);

        try {
            const incomeDoc = await getDoc(incomeDocRef);
            const expenseDoc = await getDoc(expenseDocRef);

            let data = null;
            if (incomeDoc.exists()) {
                data = incomeDoc.data();
                typeInput.value = "Income";
            } else if (expenseDoc.exists()) {
                data = expenseDoc.data();
                typeInput.value = "Expense";
            } else {
                throw new Error("Document not found.");
            }

            // Populate the form with the data
            dateInput.value = new Date(data.timestamp.seconds * 1000).toISOString().split("T")[0];
            amountInput.value = data.amount;
            categoryInput.value = data.category;
            remarksInput.value = data.remarks;

        } catch (error) {
            console.error("Error fetching document:", error);
            alert("Failed to fetch entry. Redirecting back.");
            window.location.href = "homePerDashboard.html";
        }
    } else {
        alert("User not signed in. Redirecting to login.");
        window.location.href = "login.html";
    }
});

// Handle form submission
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const user = auth.currentUser;
    if (!user) {
        alert("User not signed in. Redirecting to login.");
        window.location.href = "login.html";
        return;
    }

    const userId = user.uid;
    const collectionName = typeInput.value === "Income" ? "incomes" : "expenses";
    const docRef = doc(db, "users", userId, collectionName, id);

    // Prepare the updated data
    const updatedData = {
        amount: parseFloat(amountInput.value),
        category: categoryInput.value.trim(),
        remarks: remarksInput.value.trim(),
        timestamp: new Date(dateInput.value), // Use a Date object for Firestore to handle properly
    };

    try {
        // Use updateDoc to only update the specific fields without overwriting the entire document
        await updateDoc(docRef, updatedData);
        alert("History updated successfully!");
        window.location.href = "homePerDashboard.html"; // Redirect back to the dashboard
    } catch (error) {
        console.error("Error updating document:", error);
        alert("Failed to update entry. Please try again.");
    }
});