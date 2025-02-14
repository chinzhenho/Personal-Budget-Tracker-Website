const fileUpload = document.getElementById('fileUpload');
const generateReportButton = document.getElementById('generateReport');
let fileContent = '';

fileUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        if (file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = function (e) {
                fileContent = e.target.result.trim();
                if (fileContent) {
                    console.log('File content loaded successfully:', fileContent);
                    generateReportButton.disabled = false; // Enable the button
                } else {
                    alert('The uploaded file is empty. Please try again.');
                }
            };
            reader.readAsText(file);
        } else {
            alert('Please upload a valid .txt file.');
        }
    } else {
        alert('No file selected. Please choose a file.');
    }
});

generateReportButton.addEventListener('click', () => {
    if (fileContent) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add report title
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('User Finance Report', 105, 20, { align: 'center' });

        // Add the file content
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(12);
        const lines = doc.splitTextToSize(fileContent, 180);
        doc.text(lines, 15, 40);

        // Save the PDF
        doc.save('finance_report.pdf');
        alert('Report generated and downloaded!');
    } else {
        alert('No data available to generate a report.');
    }
});
