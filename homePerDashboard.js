import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, updateDoc, deleteDoc, doc, onSnapshot,setDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

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
const auth = getAuth();
const db = getFirestore(app);

// Populate dropdown with months and years
const populateMonthYearDropdown = () => {
    const dropdown = document.getElementById("monthYearDropdown");
    const years = [2024, 2025];
    const months = [
        "January", "February", "March", "April", "May",
        "June", "July", "August", "September", "October",
        "November", "December"
    ];

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    years.forEach((year) => {
        months.forEach((month, index) => {
            const option = document.createElement("option");
            const monthValue = index + 1;
            option.value = `${year}-${monthValue}`;
            option.textContent = `${month} ${year}`;
            if (year === currentYear && monthValue === currentMonth) {
                option.selected = true;
            }
            dropdown.appendChild(option);
        });
    });
};

const fetchMonthlyTotals = async (userId, year, month) => {
    const totalIncomeElement = document.getElementById("totalIncome");
    const totalExpenseElement = document.getElementById("totalExpense");
    const totalBudgetElement = document.getElementById("totalBudget");

    let totalIncome = 0;
    let totalExpense = 0;
    let totalBudget = 0;

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    try {
        // Income query with real-time updates
        const incomeQuery = query(
            collection(db, "users", userId, "incomes"),
            where("timestamp", ">=", startOfMonth),
            where("timestamp", "<=", endOfMonth)
        );

        onSnapshot(incomeQuery, (snapshot) => {
            totalIncome = 0;
            snapshot.forEach((doc) => {
                const data = doc.data();
                totalIncome += data.amount || 0;
            });
            totalIncomeElement.textContent = `$${totalIncome.toFixed(2)}`;
            updateBudgetPieChart(totalBudget, totalIncome, totalExpense);
        });

        // Expense query with real-time updates
        const expenseQuery = query(
            collection(db, "users", userId, "expenses"),
            where("timestamp", ">=", startOfMonth),
            where("timestamp", "<=", endOfMonth)
        );

        onSnapshot(expenseQuery, (snapshot) => {
            totalExpense = 0;
            snapshot.forEach((doc) => {
                const data = doc.data();
                totalExpense += data.amount || 0;
            });
            totalExpenseElement.textContent = `$${totalExpense.toFixed(2)}`;
            updateBudgetPieChart(totalBudget, totalIncome, totalExpense);
        });

        // Fetch budget in real-time
        const budgetDocRef = doc(db, "users", userId, "budgets", `${year}-${month}`);
        onSnapshot(budgetDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                totalBudget = docSnapshot.data().budget || 0;
            } else {
                totalBudget = 0;
            }
            totalBudgetElement.textContent = `$${totalBudget.toFixed(2)}`;
            updateBudgetPieChart(totalBudget, totalIncome, totalExpense);
        });
    } catch (error) {
        console.error("Error fetching totals:", error);
    }
};


// Function to handle delete icon click and deletion from Firestore
const handleDelete = (id, type, userId) => {
    // Show confirmation dialog
    if (confirm("Are you sure you want to delete this entry?")) {
        // Proceed with deleting the document from Firestore
        const collectionPath = type === "Income" ? "incomes" : "expenses";
        const docRef = doc(db, "users", userId, collectionPath, id);

        // Delete the document from Firestore
        deleteDoc(docRef)
            .then(() => {
                console.log(`${type} deleted successfully.`);
                // Recalculate the total income/expense and update the history
                const [year, month] = document.getElementById("monthYearDropdown").value.split("-");
                fetchMonthlyTotals(userId, parseInt(year, 10), parseInt(month, 10)); // Update totals
                fetchIncomeExpenseHistory(parseInt(year, 10), parseInt(month, 10), userId); // Update history
            })
            .catch((error) => {
                console.error("Error deleting document: ", error);
            });
    }
};

let unsubscribeIncome = null;
let unsubscribeExpense = null;

const fetchIncomeExpenseHistory = async (year, month, userId) => {
    const expandableContent = document.getElementById("expandableContent");

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    let historyItems = [];

    try {
        // Clean up old listeners if they exist
        if (unsubscribeIncome) unsubscribeIncome();
        if (unsubscribeExpense) unsubscribeExpense();

        // Income history query
        const incomeQuery = query(
            collection(db, "users", userId, "incomes"),
            where("timestamp", ">=", startOfMonth),
            where("timestamp", "<=", endOfMonth)
        );

        // Real-time updates for income history using onSnapshot
        unsubscribeIncome = onSnapshot(incomeQuery, (incomeSnapshot) => {
            historyItems = []; // Reset the history items before adding new ones
            incomeSnapshot.forEach((doc) => {
                const data = doc.data();
                const incomeDate = new Date(data.timestamp.seconds * 1000);
                const incomeAmount = data.amount || 0;
                const incomeCategory = data.category || "N/A";
                const incomeRemark = data.remarks || "N/A";
                historyItems.push({
                    type: "Income",
                    id: doc.id,
                    date: incomeDate,
                    amount: incomeAmount,
                    category: incomeCategory,
                    remarks: incomeRemark
                });
            });

            // Expense history query
            const expenseQuery = query(
                collection(db, "users", userId, "expenses"),
                where("timestamp", ">=", startOfMonth),
                where("timestamp", "<=", endOfMonth)
            );

            // Real-time updates for expense history using onSnapshot
            unsubscribeExpense = onSnapshot(expenseQuery, (expenseSnapshot) => {
                expenseSnapshot.forEach((doc) => {
                    const data = doc.data();
                    const expenseDate = new Date(data.timestamp.seconds * 1000);
                    const expenseAmount = data.amount || 0;
                    const expenseCategory = data.category || "N/A";
                    const expenseRemark = data.remarks || "N/A";
                    historyItems.push({
                        type: "Expense",
                        id: doc.id,
                        date: expenseDate,
                        amount: expenseAmount,
                        category: expenseCategory,
                        remarks: expenseRemark
                    });
                });

                // Sort the items by date
                historyItems.sort((a, b) => a.date - b.date);  // Ascending order of date

                // Build the history display
                let historyHTML = `<h4>Income & Expense History for ${month} ${year}</h4>`;
                historyHTML += `
                    <div class="history-item header">
                        <div class="history-field" style="font-weight: bold;">Type</div>
                        <div class="history-field" style="font-weight: bold;">Date</div>
                        <div class="history-field" style="font-weight: bold;">Amount</div>
                        <div class="history-field" style="font-weight: bold;">Category</div>
                        <div class="history-field" style="font-weight: bold;">Remark</div>
                        <div class="history-field" style="font-weight: bold;">Actions</div>
                    </div>`;

                // Update the history item with the delete button event listener
                historyItems.forEach(item => {
                    historyHTML += `
                        <div class="history-item">
                            <div class="history-field">${item.type}</div>
                            <div class="history-field">${item.date.toLocaleDateString()}</div>
                            <div class="history-field">$${item.amount.toFixed(2)}</div>
                            <div class="history-field">${item.category}</div>
                            <div class="history-field">${item.remarks}</div>
                            <div class="history-field">
                                <button class="edit-btn" data-id="${item.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="delete-btn" data-id="${item.id}" data-type="${item.type}">
                                    <i class="fas fa-trash-alt"></i> <!-- Delete icon -->
                                </button>
                            </div>
                        </div>`;
                });

                expandableContent.innerHTML = `
                    <div class="history-container">
                        ${historyHTML}
                    </div>
                `;
                
                // Add event listeners for edit buttons
                const editButtons = document.querySelectorAll('.edit-btn');
                editButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const id = button.getAttribute('data-id');
                        window.location.href = `editHistory.html?id=${id}`; // Navigate to edit page
                    });
                });

                // Add event listeners for the delete buttons
                const deleteButtons = document.querySelectorAll('.delete-btn');
                deleteButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const id = button.getAttribute('data-id');
                        const type = button.getAttribute('data-type');
                        handleDelete(id, type, userId);
                    });
                });
            });
        });
    } catch (error) {
        console.error("Error fetching history:", error);
        expandableContent.innerHTML = "<p>Failed to load income and expense history.</p>";
    }
};


// Event listener for dropdown change
const initializeAppListeners = (userId) => {
    const dropdown = document.getElementById("monthYearDropdown");
    const refreshTotals = () => {
        const [year, month] = dropdown.value.split("-");
        fetchMonthlyTotals(userId, parseInt(year, 10), parseInt(month, 10));
        fetchIncomeExpenseHistory(parseInt(year, 10), parseInt(month, 10), userId);
    };

    dropdown.addEventListener("change", refreshTotals);

    const handleAddOrDelete = () => {
        const [year, month] = document.getElementById("monthYearDropdown").value.split("-");
        fetchIncomeExpenseHistory(parseInt(year, 10), parseInt(month, 10), auth.currentUser.uid);  // Refresh history after action
    };

    document.getElementById("incomePopupBtn").addEventListener("click", () => {
        window.open("incomeForm.html", "Income Entry", "width=400,height=400");
        handleAddOrDelete();
    });

    document.getElementById("expensePopupBtn").addEventListener("click", () => {
        window.open("expenseForm.html", "Expense Entry", "width=400,height=400");
        handleAddOrDelete();
    });

    // Add event listeners for expanding buttons
    document.getElementById("historyBtn").addEventListener("click", () => {
        toggleExpand('historyExpand');
    });

    document.getElementById("chartBtn").addEventListener("click", () => {
        toggleExpand('chartExpand');
    });

    document.getElementById("budgetBtn").addEventListener("click", () => {
        toggleExpand('budgetExpand');
    });

    refreshTotals(); // Initial load for current month/year
};



// Toggle expansion of the square boxes
const toggleExpand = (id) => {
    const element = document.getElementById(id);
    const allExpands = document.querySelectorAll('.expandable');
    allExpands.forEach((expand) => {
        if (expand !== element) {
            expand.classList.remove('expanded');
        }
    });
    element.classList.toggle('expanded');
};

// Monitor authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        populateMonthYearDropdown();
        initializeAppListeners(user.uid);
    } else {
        window.location.href = "homePerDashboard.html";
    }
});

// Logout functionality
document.getElementById("logout").addEventListener("click", () => {
    signOut(auth)
        .then(() => {
            window.location.href = "welcompage.html";
        })
        .catch(console.error);
});

// Expandable content for the square buttons
document.getElementById("historyBtn").addEventListener("click", () => {
    const [year, month] = document.getElementById("monthYearDropdown").value.split("-");
    fetchIncomeExpenseHistory(year, month, auth.currentUser.uid);
    toggleExpandableContent("History Content");
});

document.getElementById("chartBtn").addEventListener("click", () => {
    toggleExpandableContent("Chart Content");
});

document.getElementById("budgetBtn").addEventListener("click", () => {
    toggleExpandableContent("Budget Content");
});

function toggleExpandableContent(content) {
    const expandableContent = document.getElementById("expandableContent");

    expandableContent.classList.toggle("active");

    if (!expandableContent.classList.contains("active")) {
        expandableContent.innerHTML = "";
        return;
    }

    if (content === "Chart Content") {
        expandableContent.innerHTML = `
            <h4>${content}</h4>
            <div class="chart-buttons-container">
                <button id="addButton" class="green-btn">+</button>
                <button id="subtractButton" class="red-btn">-</button>
            </div>
            <div class="scrollable-container" id="chartContainer">
                <canvas id="chartCanvas" width="800" height="400"></canvas>
            </div>
        `;

        // Add event listeners after buttons are added to the DOM
        document.getElementById("addButton").addEventListener("click", () => {
            refreshChart("Income");
        });

        document.getElementById("subtractButton").addEventListener("click", () => {
            refreshChart("Expense");
        });

        // Show the initial chart
        refreshChart("Income");
    } else {
        expandableContent.innerHTML = `
            <h4>${content}</h4>
            <p>Details and settings related to ${content} can go here.</p>
        `;
    }
}


function refreshChart(type) {
    const chartContainer = document.getElementById("chartContainer");

    // Clear the previous chart
    chartContainer.innerHTML = `
        <canvas id="chartCanvas"></canvas>
    `;

    // Set the canvas dimensions to match the container
    const canvas = document.getElementById("chartCanvas");
    canvas.width = chartContainer.offsetWidth; // Match the container width
    canvas.height = 300; // Fixed height for scrolling

    // Fetch data and render the chart
    showBarChart(type, auth.currentUser.uid);
}



async function showBarChart(type, userId) {
    const [year, month] = document.getElementById("monthYearDropdown").value.split("-");
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const collectionPath = type === "Income" ? "incomes" : "expenses";

    try {
        const querySnapshot = await getDocs(
            query(
                collection(db, "users", userId, collectionPath),
                where("timestamp", ">=", startOfMonth),
                where("timestamp", "<=", endOfMonth)
            )
        );

        const categoryTotals = {};
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const category = data.category || "Other";
            const amount = data.amount || 0;
            categoryTotals[category] = (categoryTotals[category] || 0) + amount;
        });

        const categories = Object.keys(categoryTotals);
        const amounts = Object.values(categoryTotals);

        const ctx = document.getElementById("chartCanvas").getContext("2d");
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: categories,
                datasets: [{
                    label: `${type} by Category`,
                    data: amounts,
                    backgroundColor: type === "Income" ? "rgba(75, 192, 192, 0.6)" : "rgba(255, 99, 132, 0.6)",
                    borderColor: type === "Income" ? "rgba(75, 192, 192, 1)" : "rgba(255, 99, 132, 1)",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Allow the chart to resize freely
                plugins: {
                    legend: {
                        position: "top"
                    },
                    title: {
                        display: true,
                        text: `${type} Distribution for ${month}/${year}`
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } catch (error) {
        console.error(`Error fetching ${type} data for chart:`, error);
    }
}
const updateBudgetPieChart = (budget, income, expense) => {
    const remainingBudget = budget - expense;
    const pieChartCanvas = document.getElementById("budgetPieChart");

    if (!pieChartCanvas) {
        console.error("Pie chart canvas not found!");
        return;
    }

    const ctx = pieChartCanvas.getContext("2d");

    // Alert if remaining budget is below 10%
    if (budget > 0 && remainingBudget / budget <= 0.1) {
        alert("Warning: Remaining budget is below 10%!");
    }

    // Destroy the existing chart if it exists
    if (window.budgetChart) {
        window.budgetChart.destroy();
    }

    // Create a new chart instance
    window.budgetChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Income", "Expense", "Remaining Budget"],
            datasets: [
                {
                    label: "Budget Distribution",
                    data: [
                        income,
                        expense,
                        remainingBudget > 0 ? remainingBudget : 0,
                    ],
                    backgroundColor: ["#4CAF50", "#F44336", "#FFEB3B"],
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allow custom width/height
            plugins: {
                legend: {
                    position: "top",
                },
            },
        },
    });
};

const loadBudgetContent = async () => {
    const expandableContent = document.getElementById("expandableContent");

    // Clear the existing content in the expandable area
    expandableContent.innerHTML = "";

    // Create the budget container dynamically
    const budgetContainer = document.createElement("div");
    budgetContainer.id = "budgetExpand";
    budgetContainer.classList.add("expandable");

    // Create the "Set Monthly Budget" button dynamically
    const setBudgetBtn = document.createElement("button");
    setBudgetBtn.id = "setBudgetBtn";
    setBudgetBtn.classList.add("btn", "btn-warning");
    setBudgetBtn.textContent = "Set Monthly Budget";

    // Append the button to the budget container
    budgetContainer.appendChild(setBudgetBtn);

    // Check if the pie chart canvas already exists
    let pieChartCanvas = document.getElementById("budgetPieChart");
    if (pieChartCanvas) {
        // If a canvas exists, clear its content to avoid conflicts
        pieChartCanvas.remove();
    }

    // Create a new pie chart canvas
    pieChartCanvas = document.createElement("canvas");
    pieChartCanvas.id = "budgetPieChart";
    pieChartCanvas.style.width = "380px";
    pieChartCanvas.style.height = "380px";
    pieChartCanvas.style.margin = "20px auto";
    budgetContainer.appendChild(pieChartCanvas);

    // Append the budget container to the expandable content area
    expandableContent.appendChild(budgetContainer);

    // Add event listener to the "Set Monthly Budget" button
    setBudgetBtn.addEventListener("click", async () => {
        const dropdown = document.getElementById("monthYearDropdown");
        const [year, month] = dropdown.value.split("-");
        const budgetAmount = parseFloat(
            prompt(`Enter the budget for ${month}-${year}:`)
        );

        if (!isNaN(budgetAmount) && budgetAmount > 0) {
            const userId = auth.currentUser.uid; // Get the current user's ID
            await setMonthlyBudget(userId, parseInt(year, 10), parseInt(month, 10), budgetAmount);
            fetchMonthlyTotals(userId, parseInt(year, 10), parseInt(month, 10)); // Refresh data
        } else {
            alert("Please enter a valid budget amount.");
        }
    });

    // Fetch and update the chart with current budget data
    const dropdown = document.getElementById("monthYearDropdown");
    const [year, month] = dropdown.value.split("-");
    const userId = auth.currentUser.uid;

    await fetchMonthlyTotals(userId, parseInt(year, 10), parseInt(month, 10));
};



// Event listener for the "Budget" button
document.getElementById("budgetBtn").addEventListener("click", loadBudgetContent);

const setMonthlyBudget = async (userId, year, month, budgetAmount) => {
    const budgetDocRef = doc(db, "users", userId, "budgets", `${year}-${month}`);
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Use setDoc to create or overwrite the budget document
            await setDoc(budgetDocRef, { budget: budgetAmount });
            alert(`Budget for ${month}-${year} successfully set to $${budgetAmount}`);
            return;
        } catch (error) {
            console.error(`Attempt ${attempt} failed: ${error.message}`);
            if (attempt === maxRetries) {
                alert(`Failed to set the budget after ${maxRetries} attempts: ${error.message}`);
            }
        }
    }
};

