function calculateResult() {
    const mathMarks = parseFloat(document.getElementById('math').value);
    const scienceMarks = parseFloat(document.getElementById('science').value);
    const englishMarks = parseFloat(document.getElementById('english').value);

    // Validate if inputs are numbers and within range
    if (isNaN(mathMarks) || isNaN(scienceMarks) || isNaN(englishMarks)) {
        alert("Enter valid marks for all subjects.");
        return;
    }

    if (mathMarks < 0 || mathMarks > 100 || scienceMarks < 0 || scienceMarks > 100 || englishMarks < 0 || englishMarks > 100) {
        alert("Marks must be between 0 and 100.");
        return;
    }

    const totalMarks = mathMarks + scienceMarks + englishMarks;
    const percentage = (totalMarks / 300) * 100;

    let grade = '';
    let classification = '';

    // Calculate grades based on percentage[cite: 6]
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

    // Inject results back into the DOM
    document.getElementById('total-marks').innerText = totalMarks;
    document.getElementById('percentage').innerText = percentage.toFixed(2);
    document.getElementById('grade').innerText = grade;
    document.getElementById('classification').innerText = classification;

    document.getElementById('result-display').classList.remove('hidden');
}