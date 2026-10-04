document.getElementById('admissionForm').addEventListener('submit', function(e) {
    // Prevent the form from submitting to the server before validation finishes[cite: 9]
    e.preventDefault();

    // Secure input validation by trimming unnecessary spaces[cite: 9]
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    
    const errorBox = document.getElementById('errorMessages');
    const successBox = document.getElementById('successMessage');
    
    // Reset message boxes
    errorBox.innerHTML = '';
    errorBox.classList.add('hidden');
    successBox.classList.add('hidden');

    let errors = [];

    // Regular Expressions (RegEx) for strict validation[cite: 9]
    const nameRegex = /^[a-zA-Z\s]{3,50}$/; // Only letters and spaces, min 3 chars
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Standard email format
    const mobileRegex = /^[6-9]\d{9}$/; // Indian mobile format: starts with 6-9, strictly 10 digits
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; // Minimum 8 chars, at least 1 letter and 1 number

    // Applying RegEx checks[cite: 9]
    if (!nameRegex.test(fullName)) {
        errors.push("Name must contain only letters and spaces (min 3 characters).");
    }

    if (!emailRegex.test(email)) {
        errors.push("Please enter a valid email address.");
    }

    if (!mobileRegex.test(mobile)) {
        errors.push("Enter a valid 10-digit mobile number.");
    }

    if (!passwordRegex.test(password)) {
        errors.push("Password must be at least 8 characters long and contain at least one letter and one number.");
    }

    // Checking if passwords match[cite: 9]
    if (password !== confirmPassword) {
        errors.push("Passwords do not match.");
    }

    // Displaying meaningful validation messages[cite: 9]
    if (errors.length > 0) {
        // Prevent form submission and show errors[cite: 9]
        errorBox.innerHTML = errors.join('<br>');
        errorBox.classList.remove('hidden');
    } else {
        // Success condition
        successBox.classList.remove('hidden');
        // If this were connected to a backend, you would use this.submit() here.
    }
});