document.getElementById('eventForm').addEventListener('submit', function(e) {
    // Prevent form submission to the server[cite: 10]
    e.preventDefault();

    // Secure input validation by trimming spaces[cite: 9]
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const cardNumber = document.getElementById('cardNumber').value.trim();
    const expiry = document.getElementById('expiry').value.trim();
    const cvv = document.getElementById('cvv').value.trim();
    
    const errorBox = document.getElementById('errorMessages');
    const successBox = document.getElementById('successMessage');
    
    // Clear previous states
    errorBox.innerHTML = '';
    errorBox.classList.add('hidden');
    successBox.classList.add('hidden');

    let errors = [];

    // Custom RegEx Patterns[cite: 9]
    const nameRegex = /^[a-zA-Z\s]{3,50}$/; 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    const mobileRegex = /^[6-9]\d{9}$/; 
    const cardRegex = /^\d{16}$/; // Exactly 16 digits
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/; // MM/YY format
    const cvvRegex = /^\d{3,4}$/; // 3 or 4 digits

    // Validating against the RegEx[cite: 10]
    if (!nameRegex.test(fullName)) {
        errors.push("Name must contain only letters and spaces (min 3 characters).");
    }

    if (!emailRegex.test(email)) {
        errors.push("Enter a valid email address.");
    }

    if (!mobileRegex.test(mobile)) {
        errors.push("Enter a valid 10-digit mobile number starting with 6-9.");
    }
    
    if (!cardRegex.test(cardNumber)) {
        errors.push("Card number must be exactly 16 digits.");
    }

    if (!expiryRegex.test(expiry)) {
        errors.push("Expiry date must be in MM/YY format (e.g., 12/28).");
    }

    if (!cvvRegex.test(cvv)) {
        errors.push("CVV must be 3 or 4 digits.");
    }

    // Checking if we should display errors or succeed[cite: 9]
    if (errors.length > 0) {
        errorBox.innerHTML = errors.join('<br>');
        errorBox.classList.remove('hidden');
    } else {
        successBox.classList.remove('hidden');
        document.getElementById('eventForm').reset();
    }
});