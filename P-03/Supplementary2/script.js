function calculateBill() {
    const units = parseFloat(document.getElementById('units').value);

    // Input validation
    if (isNaN(units) || units < 0) {
        alert("Enter a valid positive number for units. Electricity meters don't run in reverse unless you have solar.");
        return;
    }

    let billAmount = 0;

    // Implementing conditional statements for slab-wise tariff calculations[cite: 6]
    // Slab 1: First 50 units @ ₹3.50/unit
    if (units <= 50) {
        billAmount = units * 3.50; 
    } 
    // Slab 2: Next 100 units @ ₹4.00/unit
    else if (units <= 150) {
        billAmount = (50 * 3.50) + ((units - 50) * 4.00);
    } 
    // Slab 3: Next 100 units @ ₹5.20/unit
    else if (units <= 250) {
        billAmount = (50 * 3.50) + (100 * 4.00) + ((units - 150) * 5.20);
    } 
    // Slab 4: Anything above 250 units @ ₹6.50/unit
    else {
        billAmount = (50 * 3.50) + (100 * 4.00) + (100 * 5.20) + ((units - 250) * 6.50);
    }

    // Adding a standard fixed charge to make the logic robust
    const fixedCharge = 50;
    const totalPayable = billAmount + fixedCharge;

    // Displaying the computed result dynamically[cite: 6]
    document.getElementById('bill-amount').innerText = totalPayable.toFixed(2);
    document.getElementById('result-display').classList.remove('hidden');
}