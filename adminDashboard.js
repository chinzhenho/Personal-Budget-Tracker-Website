// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, collectionGroup, getDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDlrbumKo34d3Hel__bA1Xj6TG_ClFOF0g",
    authDomain: "login-form-4c66d.firebaseapp.com",
    projectId: "login-form-4c66d",
    storageBucket: "login-form-4c66d.firebasestorage.app",
    messagingSenderId: "9677626952",
    appId: "1:9677626952:web:4f55f083e1cdf36f77c27d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// HTML Elements for Expense Categories
const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
const categoriesSection = document.getElementById('categoriesSection');
const expenseCategoryInput = document.getElementById('expenseCategoryInput');
const addExpenseCategoryBtn = document.getElementById('addExpenseCategoryBtn');
const expenseCategoryList = document.getElementById('expenseCategoryList');

// HTML Elements for Income Categories
const incomeCategoryInput = document.getElementById('incomeCategoryInput');
const addIncomeCategoryBtn = document.getElementById('addIncomeCategoryBtn');
const incomeCategoryList = document.getElementById('incomeCategoryList');

// Elements
const viewCategoryStatsBtn = document.getElementById('viewCategoryStatsBtn');
const categoryStatsSection = document.getElementById('categoryStatsSection');
const expenseChartCanvas = document.getElementById('expenseChart').getContext('2d');
const incomeChartCanvas = document.getElementById('incomeChart').getContext('2d');


// Chart Instances (to avoid recreating)
let expenseChart;
let incomeChart;


// Sign Out Button
const logoutBtn = document.getElementById('logout');

logoutBtn.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent the default action of the link
    window.location.href = 'welcompage.html'; // Redirect to the welcome page
});

// Toggle Categories Section Visibility
manageCategoriesBtn.addEventListener('click', () => {
    if (categoriesSection.classList.contains('hide')) {
        categoriesSection.classList.remove('hide'); // Show the section
    } else {
        categoriesSection.classList.add('hide'); // Hide the section
    }
});





// Fetch and Display Categories
async function displayExpenseCategories() {
    expenseCategoryList.innerHTML = ''; // Clear the list
    const querySnapshot = await getDocs(collection(db, 'expenseCategories'));
    querySnapshot.forEach((docSnapshot) => {
        const category = docSnapshot.data();
        const li = document.createElement('li');
        li.textContent = category.name;

        // Create Edit Button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => editExpenseCategory(docSnapshot.id, category.name);

        // Create Delete Button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteExpenseCategory(docSnapshot.id);

        li.appendChild(editButton);
        li.appendChild(deleteButton);
        expenseCategoryList.appendChild(li);
    });
}

async function displayIncomeCategories() {
    incomeCategoryList.innerHTML = ''; // Clear the list
    const querySnapshot = await getDocs(collection(db, 'incomeCategories'));
    querySnapshot.forEach((docSnapshot) => {
        const category = docSnapshot.data();
        const li = document.createElement('li');
        li.textContent = category.name;

        // Create Edit Button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => editIncomeCategory(docSnapshot.id, category.name);

        // Create Delete Button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteIncomeCategory(docSnapshot.id);

        li.appendChild(editButton);
        li.appendChild(deleteButton);
        incomeCategoryList.appendChild(li);
    });
}

// Add New Expense Category
addExpenseCategoryBtn.addEventListener('click', async () => {
    const categoryName = expenseCategoryInput.value.trim();
    if (categoryName) {
        try {
            await addDoc(collection(db, 'expenseCategories'), { name: categoryName });
            expenseCategoryInput.value = '';
            displayExpenseCategories(); // Refresh the list
            alert('Expense category added successfully!');
        } catch (error) {
            console.error('Error adding expense category:', error);
            alert('Failed to add expense category. Error: ' + error.message);
        }
    } else {
        alert('Please enter a category name.');
    }
});

// Add New Income Category
addIncomeCategoryBtn.addEventListener('click', async () => {
    const categoryName = incomeCategoryInput.value.trim();
    if (categoryName) {
        try {
            await addDoc(collection(db, 'incomeCategories'), { name: categoryName });
            incomeCategoryInput.value = '';
            displayIncomeCategories(); // Refresh the list
            alert('Income category added successfully!');
        } catch (error) {
            console.error('Error adding income category:', error);
            alert('Failed to add income category. Error: ' + error.message);
        }
    } else {
        alert('Please enter a category name.');
    }
});

logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const auth = getAuth();
    try {
        await signOut(auth); // Sign out the user
        window.location.href = 'welcompage.html'; // Redirect to the welcome page
    } catch (error) {
        console.error("Error signing out:", error);
        alert("Failed to sign out. Try again.");
    }
});

// Edit Expense Category
async function editExpenseCategory(categoryId, currentName) {
    const newName = prompt('Edit expense category name:', currentName);
    if (newName && newName.trim() !== '') {
        try {
            const docRef = doc(db, 'expenseCategories', categoryId);
            await updateDoc(docRef, { name: newName });
            displayExpenseCategories(); // Refresh the list
            alert('Expense category updated successfully!');
        } catch (error) {
            console.error('Error updating expense category:', error);
            alert('Failed to update expense category. Error: ' + error.message);
        }
    }
}

// Edit Income Category
async function editIncomeCategory(categoryId, currentName) {
    const newName = prompt('Edit income category name:', currentName);
    if (newName && newName.trim() !== '') {
        try {
            const docRef = doc(db, 'incomeCategories', categoryId);
            await updateDoc(docRef, { name: newName });
            displayIncomeCategories(); // Refresh the list
            alert('Income category updated successfully!');
        } catch (error) {
            console.error('Error updating income category:', error);
            alert('Failed to update income category. Error: ' + error.message);
        }
    }
}

// Delete Expense Category
async function deleteExpenseCategory(categoryId) {
    const confirmDelete = confirm('Are you sure you want to delete this expense category?');
    if (confirmDelete) {
        try {
            const docRef = doc(db, 'expenseCategories', categoryId);
            await deleteDoc(docRef);
            displayExpenseCategories(); // Refresh the list
            alert('Expense category deleted successfully!');
        } catch (error) {
            console.error('Error deleting expense category:', error);
            alert('Failed to delete expense category. Error: ' + error.message);
        }
    }
}

// Delete Income Category
async function deleteIncomeCategory(categoryId) {
    const confirmDelete = confirm('Are you sure you want to delete this income category?');
    if (confirmDelete) {
        try {
            const docRef = doc(db, 'incomeCategories', categoryId);
            await deleteDoc(docRef);
            displayIncomeCategories(); // Refresh the list
            alert('Income category deleted successfully!');
        } catch (error) {
            console.error('Error deleting income category:', error);
            alert('Failed to delete income category. Error: ' + error.message);
        }
    }
}

// Show Category Statistics Section
viewCategoryStatsBtn.addEventListener('click', async () => {
    if (categoryStatsSection.classList.contains('hide')) {
        categoryStatsSection.classList.remove('hide');
        await loadCategoryStatistics(); // Load data when the section is displayed
    } else {
        categoryStatsSection.classList.add('hide');
    }
});

// Fetch and Load Statistics
async function loadCategoryStatistics() {
    const expenseData = {};
    const incomeData = {};

    // Fetch Expense Records from All Users
    const expenseQuerySnapshot = await getDocs(collection(db, "users"));
    expenseQuerySnapshot.forEach((userDoc) => {
        const expensesCollection = collection(db, "users", userDoc.id, "expenses");
        getDocs(expensesCollection).then((expensesSnapshot) => {
            expensesSnapshot.forEach((expense) => {
                const category = expense.data().category;
                if (category) {
                    expenseData[category] = (expenseData[category] || 0) + 1;
                }
            });

            // Update the chart with new data
            renderExpenseChart(expenseData);
        });
    });

    // Fetch Income Records from All Users
    const incomeQuerySnapshot = await getDocs(collection(db, "users"));
    incomeQuerySnapshot.forEach((userDoc) => {
        const incomesCollection = collection(db, "users", userDoc.id, "incomes");
        getDocs(incomesCollection).then((incomesSnapshot) => {
            incomesSnapshot.forEach((income) => {
                const category = income.data().category;
                if (category) {
                    incomeData[category] = (incomeData[category] || 0) + 1;
                }
            });

            // Update the chart with new data
            renderIncomeChart(incomeData);
        });
    });
}

// Render Expense Chart
function renderExpenseChart(data) {
    const labels = Object.keys(data);
    const values = Object.values(data);

    if (expenseChart) {
        expenseChart.destroy(); // Destroy existing chart to prevent duplication
    }

    expenseChart = new Chart(expenseChartCanvas, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Expense Categories',
                data: values,
                backgroundColor: generateColors(labels.length)
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: { enabled: true }
            }
        }
    });
}


// Render Income Chart
function renderIncomeChart(data) {
    const labels = Object.keys(data);
    const values = Object.values(data);

    if (incomeChart) {
        incomeChart.destroy(); // Destroy existing chart to prevent duplication
    }

    incomeChart = new Chart(incomeChartCanvas, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Income Categories',
                data: values,
                backgroundColor: generateColors(labels.length)
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: { enabled: true }
            }
        }
    });
}


// Generate Unique Colors for Categories
function generateColors(count) {
    const colors = [];
    const hueStep = Math.floor(360 / count); // Divide the hue range by the number of categories
    for (let i = 0; i < count; i++) {
        const hue = i * hueStep; // Assign a distinct hue for each category
        const saturation = 70; // Keep saturation fixed for consistency
        const lightness = 60; // Keep lightness fixed for consistency
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`); // Generate color
    }
    return colors;
}



//改了这里
document.addEventListener('DOMContentLoaded', () => {
    // HTML elements for 'Others' analysis
    const othersAnalysisBtn = document.getElementById('othersAnalysisBtn');
    const othersAnalysisSection = document.getElementById('othersAnalysisSection');
    const othersAnalysisTable = document.getElementById('othersAnalysisTable');

    // Event listener for the "Others Analysis" button
    // Event listener for the "Others Analysis" button
    othersAnalysisBtn.addEventListener('click', async () => {
        // Toggle visibility of the analysis section
        othersAnalysisSection.classList.toggle('hide');

        if (!othersAnalysisSection.classList.contains('hide')) {
            othersAnalysisTable.innerHTML = '<tr><td colspan="3">Loading...</td></tr>'; // Show loading state

            try {
                const othersData = {}; // To store aggregated descriptions and their counts

                // Fetch "Others" from Expenses
                const expenseQuerySnapshot = await getDocs(collectionGroup(db, 'expenses'));
                expenseQuerySnapshot.forEach((docSnapshot) => {
                    const expense = docSnapshot.data();
                    if (expense.category === 'Others' || expense.category === 'Orthers') {
                        const description = expense.remarks || 'No description provided';
                        othersData[description] = othersData[description] || { expenses: 0, incomes: 0 };
                        othersData[description].expenses += 1; // Increment count for expenses
                    }
                });

                // Fetch "Others" from Incomes
                const incomeQuerySnapshot = await getDocs(collectionGroup(db, 'incomes'));
                incomeQuerySnapshot.forEach((docSnapshot) => {
                    const income = docSnapshot.data();
                    if (income.category === 'Others' || income.category === 'Orthers') {
                        const description = income.remarks || 'No description provided';
                        othersData[description] = othersData[description] || { expenses: 0, incomes: 0 };
                        othersData[description].incomes += 1; // Increment count for incomes
                    }
                });

                console.log('Fetched "Others" Data:', othersData); // Debug the fetched data

                // Build table rows with aggregated data
                const tableRows = Object.entries(othersData)
                    .map(
                        ([description, counts]) =>
                            `<tr>
                            <td>${description}</td>
                            <td>${counts.expenses}</td>
                            <td>${counts.incomes}</td>
                        </tr>`
                    )
                    .join('');

                // Populate table with results or show "No data available"
                othersAnalysisTable.innerHTML =
                    tableRows || '<tr><td colspan="3">No data available.</td></tr>';
            } catch (error) {
                console.error('Error fetching "Others" data:', error);
                othersAnalysisTable.innerHTML = '<tr><td colspan="3">Failed to load data. Please try again.</td></tr>';
            }
        }
    });


});




document.getElementById("viewUserDetailsBtn").addEventListener("click", async () => {
    const userDetailsSection = document.getElementById("userDetailsSection");
    const userDetailsTableBody = document.querySelector("#userDetailsTable tbody");

    // Check if the user details section is already visible
    if (userDetailsSection.style.display === "block") {
        // Hide the section
        userDetailsSection.style.display = "none";
        return; // Exit the function
    }

    try {
        // Show the user details section (unhide it)
        userDetailsSection.style.display = "block";

        // Clear previous user details
        userDetailsTableBody.innerHTML = "<tr><td colspan='7'>Loading...</td></tr>";

        // Fetch user documents from the "users" collection
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);

        if (!usersSnapshot.empty) {
            // Fetch details for all users asynchronously
            const userDetailsPromises = usersSnapshot.docs.map(async (userDoc) => {
                const userId = userDoc.id;
                const userData = userDoc.data(); // Get data directly from the root document

                // Fetch additional details (personal-info) if available
                const userDetailsRef = doc(db, "users", userId, "details", "personal-info");
                const userDetailsSnap = await getDoc(userDetailsRef);

                const userDetails = userDetailsSnap.exists() ? userDetailsSnap.data() : {};

                return `
                    <tr>
                        <td>${userData.email || "N/A"}</td> <!-- Email fetched from root document -->
                        <td>${userDetails.name || "N/A"}</td>
                        <td>${userDetails.age || "N/A"}</td>
                        <td>${userDetails.dob || "N/A"}</td>
                        <td>${userDetails.gender || "N/A"}</td>
                        <td>${userDetails.occupation || "N/A"}</td>
                        <td>${userDetails.address || "N/A"}</td>
                    </tr>
                `;
            });

            // Wait for all user details to be fetched
            const userDetailsRows = await Promise.all(userDetailsPromises);

            // Populate the table
            userDetailsTableBody.innerHTML = userDetailsRows.join("") || "<tr><td colspan='7'>No users found.</td></tr>";
        } else {
            userDetailsTableBody.innerHTML = "<tr><td colspan='7'>No users found.</td></tr>";
        }
    } catch (error) {
        console.error("Error fetching user details:", error);
        userDetailsTableBody.innerHTML = `<tr><td colspan='7'>Error fetching user details: ${error.message}</td></tr>`;
    }
});


// Display categories on page load
displayExpenseCategories();
displayIncomeCategories();
