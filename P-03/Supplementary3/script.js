function generateBill() {
    const amount = parseFloat(document.getElementById('purchase-amount').value);

    // Basic sanity check to ensure you aren't trying to generate a bill for negative rupees
    if (isNaN(amount) || amount <= 0) {
        alert("Enter a valid purchase amount greater than zero.");
        return;
    }

    let discountPercentage = 0;
    let discountAmount = 0;

    // Using conditional statements to determine the discount tier[cite: 6]
    if (amount >= 10000) {
        discountPercentage = 20; // 20% off for big spenders
    } else if (amount >= 5000) {
        discountPercentage = 10; // 10% off for medium carts
    } else if (amount >= 2000) {
        discountPercentage = 5;  // 5% off for small carts
    }

    // Applying arithmetic operators to calculate the final values[cite: 5, 6]
    discountAmount = amount * (discountPercentage / 100);
    const discountedSubtotal = amount - discountAmount;
    
    // Flat 18% GST applied AFTER the discount
    const gstAmount = discountedSubtotal * 0.18;
    const finalPayable = discountedSubtotal + gstAmount;

    // Outputting to the DOM dynamically[cite: 6]
    document.getElementById('subtotal').innerText = amount.toFixed(2);
    document.getElementById('discount').innerText = discountAmount.toFixed(2);
    document.getElementById('gst').innerText = gstAmount.toFixed(2);
    document.getElementById('final-payable').innerText = finalPayable.toFixed(2);

    // Show the discount badge only if a discount was actually applied
    const badge = document.getElementById('discount-rate');
    if (discountPercentage > 0) {
        badge.innerText = `(${discountPercentage}% OFF)`;
        badge.style.display = 'inline';
    } else {
        badge.style.display = 'none';
    }

    // Reveal the receipt
    document.getElementById('bill-receipt').classList.remove('hidden');
}