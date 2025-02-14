    // Import Firebase modules
    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
    import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

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

    // DOM Elements
    const userSelect = document.getElementById('userSelect');
    const messageInput = document.getElementById('messageInput');
    const sendMessageButton = document.getElementById('sendMessage');
    const statusMessage = document.getElementById('statusMessage');

    // Populate user dropdown from Firestore
    async function loadUsers() {
        try {
            const querySnapshot = await getDocs(collection(db, 'users')); // 'users' collection
            userSelect.innerHTML = '<option value="" disabled selected>Select a user</option>'; // Reset options

            if (querySnapshot.empty) {
                userSelect.innerHTML = '<option value="" disabled>No users found</option>';
                userSelect.disabled = true;
                return;
            }

            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                const option = document.createElement('option');
                option.value = doc.id; // Use document ID as the value
                option.textContent = userData.email || doc.id; // Display email if available
                userSelect.appendChild(option);
            });

            userSelect.disabled = false; // Enable dropdown after loading users
        } catch (error) {
            console.error('Error loading users:', error);
            statusMessage.textContent = 'Failed to load users.';
            statusMessage.style.color = 'red';
        }
    }

    // Enable message input and button when a user is selected
    userSelect.addEventListener('change', () => {
        messageInput.disabled = false;
        sendMessageButton.disabled = false;
    });

    // Send message to Firestore
    sendMessageButton.addEventListener('click', async () => {
        const userId = userSelect.value;
        const message = messageInput.value.trim();

        if (userId && message) {
            try {
                // Add message to Firestore under the selected user's subcollection
                await addDoc(collection(db, `users/${userId}/messages`), {
                    message: message,
                    timestamp: new Date()
                });

                // Update status and clear input
                statusMessage.textContent = `Message sent to ${userSelect.options[userSelect.selectedIndex].textContent}.`;
                statusMessage.style.color = 'green';
                messageInput.value = '';
            } catch (error) {
                console.error('Error sending message:', error);
                statusMessage.textContent = 'Failed to send message. Try again.';
                statusMessage.style.color = 'red';
            }
        } else {
            statusMessage.textContent = 'Please select a user and type a message.';
            statusMessage.style.color = 'red';
        }
    });

    // Load users on page load
    loadUsers();
