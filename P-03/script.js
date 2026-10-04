function calculateResult() {
    // Grabbing values from the input fields and converting them to numbers
    const mathMarks = parseFloat(document.getElementById('math').value);
    const scienceMarks = parseFloat(document.getElementById('science').value);
    const englishMarks = parseFloat(document.getElementById('english').value);

    // Basic validation to prevent empty fields or invalid numbers
    if (isNaN(mathMarks) || isNaN(scienceMarks) || isNaN(englishMarks)) {
        alert("Please enter valid marks for all subjects before calculating.");
        return;
    }

    if (mathMarks < 0 || mathMarks > 100 || scienceMarks < 0 || scienceMarks > 100 || englishMarks < 0 || englishMarks > 100) {
        alert("Marks must be between 0 and 100. Stop trying to break the system.");
        return;
    }

    // Applying variables and arithmetic operators[cite: 5]
    const totalMarks = mathMarks + scienceMarks + englishMarks;
    const percentage = (totalMarks / 300) * 100;

    let grade = '';
    let classification = '';

    // Applying conditional statements to classify the student[cite: 5, 6]
    if (percentage >= 85) {
        grade = 'A+';
        classification = 'Distinction';
    } else if (percentage >= 70) {
        grade = 'A';
        classification = 'First Class';
    } else if (percentage >= 60) {
        grade = 'B';
        classification = 'Second Class';
    } else if (percentage >= 50) {
        grade = 'C';
        classification = 'Pass Class';
    } else {
        grade = 'F';
        classification = 'Fail';
    }

    // Displaying the computed results dynamically
    document.getElementById('total-marks').innerText = totalMarks;
    document.getElementById('percentage').innerText = percentage.toFixed(2);
    document.getElementById('grade').innerText = grade;
    document.getElementById('classification').innerText = classification;

    // Removing the 'hidden' class to show the result box
    document.getElementById('result-display').classList.remove('hidden');
}