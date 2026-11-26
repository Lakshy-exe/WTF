const express = require('express');
const app = express();
const PORT = 3011;

app.use(express.static(__dirname));

// Proxy/Mock REST API endpoint using Open-Meteo (free, no API key needed)
app.get('/api/weather', async (req, res) => {
    const city = (req.query.city || '').trim();
    if (!city) return res.status(400).json({ error: 'City name is required.' });

    try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
        const geoData = await geoRes.json();
        if (!geoData.results || geoData.results.length === 0) {
            return res.status(404).json({ error: 'City not found.' });
        }
        const loc = geoData.results[0];
        const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current_weather=true`);
        const wData = await wRes.json();

        res.json({
            city: loc.name,
            country: loc.country,
            temperature: wData.current_weather.temperature,
            windspeed: wData.current_weather.windspeed,
            weathercode: wData.current_weather.weathercode,
            time: wData.current_weather.time
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch weather data.' });
    }
});

app.listen(PORT, () => console.log(`Weather Portal running at http://localhost:${PORT}`));
