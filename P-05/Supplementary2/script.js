document.getElementById('employeeForm').addEventListener('submit', function(e) {
    // Prevent actual form submission[cite: 10]
    e.preventDefault();

    // Secure input validation by trimming spaces[cite: 9]
    const empId = document.getElementById('empId').value.trim();
    const email = document.getElementById('email').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const salary = document.getElementById('salary').value.trim();
    const password = document.getElementById('password').value.trim();
    
    const errorBox = document.getElementById('errorMessages');
    const successBox = document.getElementById('successMessage');
    
    // Clear previous states
    errorBox.innerHTML = '';
    errorBox.classList.add('hidden');
    successBox.classList.add('hidden');

    let errors = [];

    // Custom RegEx Patterns for strict validation[cite: 9, 10]
    const empIdRegex = /^EMP-\d{4}$/; // Must be exactly 'EMP-' followed by 4 digits
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    const mobileRegex = /^[6-9]\d{9}$/; 
    const salaryRegex = /^[1-9]\d*(\.\d{1,2})?$/; // Positive number, optional 2 decimal places
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/; // Min 8 chars, 1 uppercase letter, 1 number

    // Validating against the RegEx[cite: 10]
    if (!empIdRegex.test(empId)) {
        errors.push("Employee ID must be in the format EMP-XXXX (e.g., EMP-1234).");
    }

    if (!emailRegex.test(email)) {
        errors.push("Enter a valid work email address.");
    }

    if (!mobileRegex.test(mobile)) {
        errors.push("Enter a valid 10-digit mobile number starting with 6-9.");
    }
    
    if (!salaryRegex.test(salary)) {
        errors.push("Salary must be a valid positive number.");
    }

    if (!passwordRegex.test(password)) {
        errors.push("Password must be at least 8 characters with 1 uppercase letter and 1 number.");
    }

    // Checking if we should display errors or succeed[cite: 9]
    if (errors.length > 0) {
        errorBox.innerHTML = errors.join('<br>');
        errorBox.classList.remove('hidden');
    } else {
        successBox.classList.remove('hidden');
        // Clear the form to simulate successful submission
        document.getElementById('employeeForm').reset();
    }
});