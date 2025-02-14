const graphType = document.getElementById('graphType');
const fileInput = document.getElementById('fileInput');
const viewGraphButton = document.getElementById('viewGraph');
const chartCanvas = document.getElementById('myChart').getContext('2d');

let myChart = null;

viewGraphButton.addEventListener('click', () => {
    const graph = graphType.value;
    const file = fileInput.files[0];

    if (!file) {
        alert('Please upload a data file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        const fileData = reader.result.trim().split('\n');
        if (graph === 'expenses') {
            createExpensesGraph(fileData);
        } else if (graph === 'budget') {
            createBudgetGraph(fileData);
        } else if (graph === 'savings') {
            createSavingsGraph(fileData);
        }
    };
    reader.readAsText(file);
});

function createExpensesGraph(data) {
    const labels = data.map((line) => line.split(',')[0]); // First column as labels (e.g., months)
    const values = data.map((line) => parseFloat(line.split(',')[1])); // Second column as values

    renderChart({
        labels,
        datasets: [{
            label: 'Expenses Over Time',
            data: values,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }]
    }, 'line');
}

function createBudgetGraph(data) {
    const labels = data.map((line) => line.split(',')[0]); // Categories
    const values = data.map((line) => parseFloat(line.split(',')[1])); // Values

    renderChart({
        labels,
        datasets: [{
            label: 'Budget Utilization',
            data: values,
            backgroundColor: [
                'rgba(75, 192, 192, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    }, 'bar');
}

function createSavingsGraph(data) {
    const labels = data.map((line) => line.split(',')[0]); // Years
    const values = data.map((line) => parseFloat(line.split(',')[1])); // Savings

    renderChart({
        labels,
        datasets: [{
            label: 'Savings Growth',
            data: values,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    }, 'line');
}

function renderChart(data, type) {
    if (myChart) {
        myChart.destroy();
    }
    myChart = new Chart(chartCanvas, {
        type: type,
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}
