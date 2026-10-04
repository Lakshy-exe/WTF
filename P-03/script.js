// alert("HI");
function checkLoanEligibility() {
    const age = Number(document.getElementById("age").value);
    const salary = Number(document.getElementById("salary").value);
    const creditScore = Number(document.getElementById("creditScore").value);

    const result = document.getElementById("loanResult");

    // Validate input
    if (!age || !salary || !creditScore) {
        result.innerHTML = "Please enter all the required details.";
        return;
    }

    // Loan eligibility criteria
    if (age >= 21 && age <= 60 &&
        salary >= 25000 &&
        creditScore >= 700) {

        result.innerHTML = "✓ You are eligible for the loan.";
    } else {
        result.innerHTML = "✗ You are not eligible for the loan.";
    }
}

function calculateEMI() {
    const loanAmount = Number(document.getElementById("loanAmount").value);
    const annualRate = Number(document.getElementById("interestRate").value);
    const years = Number(document.getElementById("loanYears").value);

    const result = document.getElementById("emiResult");

    if (loanAmount <= 0 || annualRate < 0 || years <= 0) {
        result.innerHTML = "Please enter valid values.";
        return;
    }

    // Convert annual interest rate to monthly rate
    const monthlyRate = annualRate / 12 / 100;

    // Convert years to months
    const months = years * 12;

    let emi;

    // If interest rate is 0
    if (monthlyRate === 0) {
        emi = loanAmount / months;
    } else {
        emi = loanAmount * monthlyRate *
              Math.pow(1 + monthlyRate, months) /
              (Math.pow(1 + monthlyRate, months) - 1);
    }

    result.innerHTML = "Monthly EMI: ₹" + emi.toFixed(2);
}