// Get elements from the HTML

const adminEmail = "admin@gmail.com";
const adminPassword = "admin123";

// Event listener for login button
submitAdminLogin.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent form submission

    const enteredEmail = document.getElementById("adminEmail").value.trim();
    const enteredPassword = document.getElementById("adminPassword").value.trim();

    if (enteredEmail === "" || enteredPassword === "") {
        showErrorMessage("⚠️ Please enter both email and password.");
        return;
    }

    // Check credentials (simulated authentication)
    if (enteredEmail === adminEmail && enteredPassword === adminPassword) {
        window.location.href = "adminPage.html"; // Redirect on success
    } else {
        showErrorMessage("Invalid email or password. Please try again.");
    }
});

// Function to display the error message
function showErrorMessage(message) {
    adminLoginMessage.innerHTML = message;
    adminLoginMessage.style.display = "block"; // Make it visible
    adminLoginMessage.style.opacity = "1"; // Ensure full visibility
    adminLoginMessage.style.transition = "opacity 0.5s ease-in-out"; // Smooth fade-in effect

    // Remove message after 3 seconds
    setTimeout(() => {
        adminLoginMessage.style.opacity = "0"; // Fade out
        setTimeout(() => {
            adminLoginMessage.style.display = "none"; // Hide completely
        }, 500);
    }, 3000);
}
