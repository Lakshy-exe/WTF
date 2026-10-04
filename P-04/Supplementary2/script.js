// Selecting the essential elements from the DOM[cite: 8]
const container = document.querySelector('.container');
const seats = document.querySelectorAll('.row .seat:not(.occupied)');
const count = document.getElementById('count');
const total = document.getElementById('total');
const movieSelect = document.getElementById('movie');

// Using the + operator to implicitly convert the string value to a number
let ticketPrice = +movieSelect.value;

// Function to update the DOM with the dynamic summary[cite: 8]
function updateSelectedCount() {
    const selectedSeats = document.querySelectorAll('.row .seat.selected');
    const selectedSeatsCount = selectedSeats.length;

    count.innerText = selectedSeatsCount;
    total.innerText = selectedSeatsCount * ticketPrice;
}

// Event Listener: Change movie and update ticket price dynamically[cite: 8]
movieSelect.addEventListener('change', (e) => {
    ticketPrice = +e.target.value;
    updateSelectedCount();
});

// Event Listener: Seat click event handling using event delegation on the container[cite: 8]
container.addEventListener('click', (e) => {
    // Check if the clicked element is a seat and is NOT occupied
    if (e.target.classList.contains('seat') && !e.target.classList.contains('occupied')) {
        // Toggle the 'selected' class on the clicked node
        e.target.classList.toggle('selected');
        
        // Recalculate totals
        updateSelectedCount();
    }
});