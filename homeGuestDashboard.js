// Populate dropdown with months and years
const populateMonthYearDropdown = () => {
    const dropdown = document.getElementById("monthYearDropdown");
    const years = [2024, 2025]; // Possible years
    const months = [
        "January", "February", "March", "April", "May",
        "June", "July", "August", "September", "October",
        "November", "December"
    ];

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Populate the dropdown with month-year options
    years.forEach((year) => {
        months.forEach((month, index) => {
            const option = document.createElement("option");
            const monthValue = index + 1; // Adjust to get 1-12 range for months
            option.value = `${year}-${monthValue < 10 ? '0' + monthValue : monthValue}`; // Format value as "YYYY-MM"
            option.textContent = `${month} ${year}`;
            if (year === currentYear && monthValue === currentMonth) {
                option.selected = true;
            }
            dropdown.appendChild(option);
        });
    });
};

// Sample code to add an income entry with a unique id
const addIncomeEntry = (amount, category, remarks) => {
    const newEntry = {
        id: Date.now(), // Use timestamp for a unique id
        amount,
        category,
        remarks,
        timestamp: new Date().getTime()
    };

    const incomeData = JSON.parse(localStorage.getItem("incomeData")) || [];
    incomeData.push(newEntry);
    localStorage.setItem("incomeData", JSON.stringify(incomeData));

    // Refresh totals and history
    const dropdown = document.getElementById("monthYearDropdown");
    const [year, month] = dropdown.value.split("-");
    fetchMonthlyTotals(parseInt(year, 10), parseInt(month, 10));
    fetchIncomeExpenseHistory(parseInt(year, 10), parseInt(month, 10));
};

// Similarly, for adding expense entries
const addExpenseEntry = (amount, category, remarks) => {
    const newEntry = {
        id: Date.now(), // Use timestamp for a unique id
        amount,
        category,
        remarks,
        timestamp: new Date().getTime()
    };

    const expenseData = JSON.parse(localStorage.getItem("expenseData")) || [];
    expenseData.push(newEntry);
    localStorage.setItem("expenseData", JSON.stringify(expenseData));

    // Refresh totals and history
    const dropdown = document.getElementById("monthYearDropdown");
    const [year, month] = dropdown.value.split("-");
    fetchMonthlyTotals(parseInt(year, 10), parseInt(month, 10));
    fetchIncomeExpenseHistory(parseInt(year, 10), parseInt(month, 10));
};

window.addEventListener("storage", () => {
    const dropdown = document.getElementById("monthYearDropdown");
    const [year, month] = dropdown.value.split("-");
    fetchMonthlyTotals(parseInt(year, 10), parseInt(month, 10));
    fetchIncomeExpenseHistory(parseInt(year, 10), parseInt(month, 10));
});

// Fetch and update monthly totals in real-time (using localStorage)
const fetchMonthlyTotals = (year, month) => {
    const totalIncomeElement = document.getElementById("totalIncome");
    const totalExpenseElement = document.getElementById("totalExpense");

    let totalIncome = 0;
    let totalExpense = 0;

    const startOfMonth = new Date(year, month - 1, 1).getTime();
    const endOfMonth = new Date(year, month, 0).getTime();

    // Fetch income data from localStorage
    const incomeData = JSON.parse(localStorage.getItem("incomeData")) || [];
    incomeData.forEach(item => {
        if (item.timestamp >= startOfMonth && item.timestamp <= endOfMonth) {
            totalIncome += parseFloat(item.amount) || 0;
        }
    });

    // Fetch expense data from localStorage
    const expenseData = JSON.parse(localStorage.getItem("expenseData")) || [];
    expenseData.forEach(item => {
        if (item.timestamp >= startOfMonth && item.timestamp <= endOfMonth) {
            totalExpense += parseFloat(item.amount) || 0;
        }
    });

    totalIncomeElement.textContent = `$${totalIncome.toFixed(2)}`;
    totalExpenseElement.textContent = `$${totalExpense.toFixed(2)}`;
};

// Function to handle delete icon click and deletion from localStorage
const handleDelete = (id, type) => {
    if (confirm("Are you sure you want to delete this entry?")) {
        const dataKey = type === "Income" ? "incomeData" : "expenseData";
        const data = JSON.parse(localStorage.getItem(dataKey)) || [];

        // Filter out the entry with the matching id
        const updatedData = data.filter(item => item.id !== parseInt(id));

        // Save the updated data back to localStorage
        localStorage.setItem(dataKey, JSON.stringify(updatedData));

        const [year, month] = document.getElementById("monthYearDropdown").value.split("-");
        fetchMonthlyTotals(parseInt(year, 10), parseInt(month, 10)); // Update totals
        fetchIncomeExpenseHistory(parseInt(year, 10), parseInt(month, 10)); // Update history
    }
};

const handleEdit = (id, type) => {
    const dataKey = type === "Income" ? "incomeData" : "expenseData";
    const data = JSON.parse(localStorage.getItem(dataKey)) || [];
    const entry = data.find(item => item.id === parseInt(id));

    if (entry) {
        // Define categories
        const categories = type === "Income"
            ? ["Salary", "Part-time", "Others"]
            : ["Food", "Transport", "Others"];

        // Generate category dropdown options
        const categoryOptions = categories.map(category =>
            `<option value="${category}" ${entry.category === category ? "selected" : ""}>${category}</option>`
        ).join("");

        // Create the edit form HTML
        const editFormHTML = `
            <div class="edit-form-container">
                <h4 class="edit-form-title">Edit ${type} Entry</h4>
                <div class="edit-form-field">
                    <label for="editAmount">Amount:</label>
                    <input type="number" id="editAmount" value="${entry.amount}" />
                </div>
                <div class="edit-form-field">
                    <label for="editCategory">Category:</label>
                    <select id="editCategory">${categoryOptions}</select>
                </div>
                <div class="edit-form-field">
                    <label for="editRemarks">Remarks:</label>
                    <input type="text" id="editRemarks" value="${entry.remarks}" />
                </div>
                <div class="edit-form-buttons">
                    <button id="saveEditBtn" data-id="${entry.id}" data-type="${type}" class="save-btn">Save Changes</button>
                    <button id="cancelEditBtn" class="cancel-btn">Cancel</button>
                </div>
            </div>
        `;

        // Insert the form into the expandable content area
        const expandableContent = document.getElementById("expandableContent");
        expandableContent.innerHTML = editFormHTML;
        expandableContent.classList.add("active");

        // Attach event listeners
        document.getElementById("saveEditBtn").addEventListener("click", () => saveEdit(entry.id, type));
        document.getElementById("cancelEditBtn").addEventListener("click", () => {
            expandableContent.classList.remove("active");
            expandableContent.innerHTML = "";
        });
    }
};


const saveEdit = (id, type) => {
    const dataKey = type === "Income" ? "incomeData" : "expenseData";
    const data = JSON.parse(localStorage.getItem(dataKey)) || [];

    // Find the item and update its values
    const entryIndex = data.findIndex(item => item.id === parseInt(id));
    if (entryIndex !== -1) {
        data[entryIndex].amount = parseFloat(document.getElementById("editAmount").value) || 0;
        data[entryIndex].category = document.getElementById("editCategory").value || "N/A";
        data[entryIndex].remarks = document.getElementById("editRemarks").value || "N/A";

        // Update localStorage
        localStorage.setItem(dataKey, JSON.stringify(data));

        // Refresh UI
        const [year, month] = document.getElementById("monthYearDropdown").value.split("-");
        fetchMonthlyTotals(parseInt(year, 10), parseInt(month, 10));
        fetchIncomeExpenseHistory(parseInt(year, 10), parseInt(month, 10));

        // Close the form
        const expandableContent = document.getElementById("expandableContent");
        expandableContent.classList.remove("active");
        expandableContent.innerHTML = "";
    }
};


// Function to fetch and display history (income & expense) from localStorage
const fetchIncomeExpenseHistory = (year, month) => {
    const expandableContent = document.getElementById("expandableContent");

    const startOfMonth = new Date(year, month - 1, 1).getTime();
    const endOfMonth = new Date(year, month, 0).getTime();

    let historyItems = [];

    // Fetch income data
    const incomeData = JSON.parse(localStorage.getItem("incomeData")) || [];
    incomeData.forEach(item => {
        if (item.timestamp >= startOfMonth && item.timestamp <= endOfMonth) {
            historyItems.push({
                type: "Income",
                id: item.id, // Include the id
                date: new Date(item.timestamp),
                amount: parseFloat(item.amount),
                category: item.category || "N/A",
                remarks: item.remarks || "N/A"
            });
        }
    });

    // Fetch expense data
    const expenseData = JSON.parse(localStorage.getItem("expenseData")) || [];
    expenseData.forEach(item => {
        if (item.timestamp >= startOfMonth && item.timestamp <= endOfMonth) {
            historyItems.push({
                type: "Expense",
                id: item.id, // Include the id
                date: new Date(item.timestamp),
                amount: parseFloat(item.amount),
                category: item.category || "N/A",
                remarks: item.remarks || "N/A"
            });
        }
    });

    // Sort by date
    historyItems.sort((a, b) => a.date - b.date);

    let historyHTML = `<h4>Income & Expense History for ${year}-${month.toString().padStart(2, '0')}</h4>`;
    if (historyItems.length > 0) {
        historyHTML +=
            `<div class="history-item header">
                <div class="history-field" style="font-weight: bold;">Type</div>
                <div class="history-field" style="font-weight: bold;">Date</div>
                <div class="history-field" style="font-weight: bold;">Amount</div>
                <div class="history-field" style="font-weight: bold;">Category</div>
                <div class="history-field" style="font-weight: bold;">Remarks</div>
                <div class="history-field" style="font-weight: bold;">Actions</div>
            </div>`;

        historyItems.forEach(item => {
            historyHTML +=
                `<div class="history-item">
            <div class="history-field">${item.type}</div>
            <div class="history-field">${item.date.toLocaleDateString()}</div>
            <div class="history-field">$${item.amount.toFixed(2)}</div>
            <div class="history-field">${item.category}</div>
            <div class="history-field">${item.remarks}</div>
            <div class="history-field">
                <button class="edit-btn" data-id="${item.id}" data-type="${item.type}">
                    <i class="fas fa-edit"></i> <!-- Edit icon -->
                </button>
                <button class="delete-btn" data-id="${item.id}" data-type="${item.type}">
                    <i class="fas fa-trash-alt"></i> <!-- Delete icon -->
                </button>
            </div>
        </div>`;
        });

    } else {
        historyHTML += `<p>No records found for this month.</p>`;
    }

    expandableContent.innerHTML = `<div class="history-container">${historyHTML}</div>`;

    // Attach delete event listeners after the content has been updated
    attachDeleteEventListeners();
};

// Attach delete button event listeners
function attachDeleteEventListeners() {
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function () {
            const id = button.getAttribute('data-id');
            const type = button.getAttribute('data-type');
            handleDelete(id, type);
        });
    });

    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function () {
            const id = button.getAttribute('data-id');
            const type = button.getAttribute('data-type');
            handleEdit(id, type);
        });
    });
}



let incomeExpenseChart = null; // Chart reference

function toggleExpandableContent(content) {
    const expandableContent = document.getElementById("expandableContent");

    if (content === "Chart Content") {
        expandableContent.innerHTML = `
            <h4>View Total of Income and Expense</h4>
            <div class="chart-container" style="position: relative; width: 100%; height: 400px;">
                <canvas id="incomeExpenseChart"></canvas>
            </div>
        `;
        drawChart();  // Call the function to render the chart
    } else {
        expandableContent.innerHTML = `<h4>${content}</h4><p>Details and settings related to ${content} can go here.</p>`;
    }

    expandableContent.classList.toggle("active");
}


const drawChart = () => {
    const ctx = document.getElementById("incomeExpenseChart").getContext("2d");

    const [year, month] = document.getElementById("monthYearDropdown").value.split("-");
    const incomeData = JSON.parse(localStorage.getItem("incomeData")) || [];
    const expenseData = JSON.parse(localStorage.getItem("expenseData")) || [];

    let totalIncome = 0;
    let totalExpense = 0;

    const startOfMonth = new Date(year, month - 1, 1).getTime();
    const endOfMonth = new Date(year, month, 0).getTime();

    // Calculate total income for the month
    incomeData.forEach(item => {
        if (item.timestamp >= startOfMonth && item.timestamp <= endOfMonth) {
            totalIncome += parseFloat(item.amount) || 0;
        }
    });

    // Calculate total expenses for the month
    expenseData.forEach(item => {
        if (item.timestamp >= startOfMonth && item.timestamp <= endOfMonth) {
            totalExpense += parseFloat(item.amount) || 0;
        }
    });

    // Create the chart
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expense'],
            datasets: [{
                data: [totalIncome, totalExpense],
                backgroundColor: ['#4CAF50', '#F44336'], // Green for income, red for expense
                borderColor: ['#388E3C', '#D32F2F'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true, // Ensure the chart is responsive
            maintainAspectRatio: false, // Allow resizing
            plugins: {
                legend: {
                    display: false // Hide the legend (remove the "Total" label)
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return '$' + value.toFixed(2); // Format Y-axis with currency
                        }
                    }
                }
            }
        }
    });
};


// Initialize the app with listeners
const initializeAppListeners = () => {
    const dropdown = document.getElementById("monthYearDropdown");
    const refreshTotals = () => {
        const [year, month] = dropdown.value.split("-");
        fetchMonthlyTotals(parseInt(year, 10), parseInt(month, 10));
        fetchIncomeExpenseHistory(parseInt(year, 10), parseInt(month, 10));
    };

    dropdown.addEventListener("change", refreshTotals);

    document.getElementById("incomePopupBtn").addEventListener("click", () => {
        window.open("incomeGuest.html", "Income Entry", "width=400,height=400");
    });

    document.getElementById("expensePopupBtn").addEventListener("click", () => {
        window.open("expenseGuest.html", "Expense Entry", "width=400,height=400");
    });

    document.getElementById("historyBtn").addEventListener("click", () => {
        const dropdown = document.getElementById("monthYearDropdown");
        const [year, month] = dropdown.value.split("-");

        // Fetch and display history content
        fetchIncomeExpenseHistory(parseInt(year, 10), parseInt(month, 10));

        // Ensure the expandable content is active and visible
        const expandableContent = document.getElementById("expandableContent");
        expandableContent.classList.add("active");
    });


    document.getElementById("chartBtn").addEventListener("click", () => {
        toggleExpandableContent("Chart Content");
    });

    document.getElementById("logout").addEventListener("click", () => {
        localStorage.removeItem("incomeData");
        localStorage.removeItem("expenseData");
        window.location.href = "welcompage.html";
    });

    refreshTotals();
};

// Initialize app
populateMonthYearDropdown();
initializeAppListeners();

