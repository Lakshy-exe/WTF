document.getElementById('weatherForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = document.getElementById('cityInput').value.trim();
    const status = document.getElementById('status');
    const card = document.getElementById('weatherCard');

    status.style.color = '#0284c7';
    status.textContent = 'Fetching weather data...';
    card.classList.add('hidden');

    try {
        const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error fetching weather');

        status.textContent = '';
        card.innerHTML = `
            <h2>${data.city}, ${data.country}</h2>
            <div class="temp">${data.temperature}°C</div>
            <p><strong>Wind Speed:</strong> ${data.windspeed} km/h</p>
            <p><strong>Observed At:</strong> ${data.time}</p>
        `;
        card.classList.remove('hidden');
    } catch (err) {
        status.style.color = '#dc2626';
        status.textContent = err.message;
    }
});
