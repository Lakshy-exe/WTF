document.addEventListener("DOMContentLoaded", () => {
    const cityInput = document.getElementById("city-input");
    const searchBtn = document.getElementById("search-btn");
    const weatherInfo = document.getElementById("weather-info");
    const loadingSpinner = document.getElementById("loading-spinner");
    const errorMessage = document.getElementById("error-message");
    const autoRefreshNotice = document.getElementById("auto-refresh-notice");

    // Fetch API Implementation with a Callback
    const fetchWeather = async (city, callback) => {
        // UI reset for loading state
        loadingSpinner.classList.remove("hidden");
        weatherInfo.classList.add("hidden");
        errorMessage.classList.add("hidden");

        try {
            // Using wttr.in as a keyless public REST API (format=j1 returns JSON)
            const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
            
            if (!response.ok) {
                throw new Error("Unable to retrieve weather data.");
            }
            
            const data = await response.json();
            
            // setTimeout: Delay execution slightly to demonstrate timer usage
            setTimeout(() => {
                callback(null, data, city);
            }, 500);

        } catch (error) {
            callback(error, null, null);
        }
    };

    // Callback function to process the fetched JSON data and update the DOM
    const updateUI = (error, data, city) => {
        loadingSpinner.classList.add("hidden");

        if (error) {
            errorMessage.textContent = "City not found or network error occurred.";
            errorMessage.classList.remove("hidden");
            return;
        }

        // Parse JSON structure from the API
        const currentCondition = data.current_condition[0];
        const locationName = data.nearest_area[0].areaName[0].value;
        
        document.getElementById("city-name").textContent = locationName;
        document.getElementById("temperature").textContent = `Temperature: ${currentCondition.temp_C}°C`;
        document.getElementById("conditions").textContent = `Condition: ${currentCondition.weatherDesc[0].value}`;
        document.getElementById("humidity").textContent = `Humidity: ${currentCondition.humidity}%`;
        
        weatherInfo.classList.remove("hidden");

        // Local Storage: Save the successfully searched city as the preference
        localStorage.setItem("preferredCity", city);
    };

    // Event Listener for user interaction
    searchBtn.addEventListener("click", () => {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeather(city, updateUI);
        }
    });

    // On Page Load: Retrieve data from Local Storage
    const savedCity = localStorage.getItem("preferredCity");
    if (savedCity) {
        cityInput.value = savedCity;
        fetchWeather(savedCity, updateUI); // Automatically fetch for the saved city
    }

    // setInterval: Background auto-refresh timer (Updates every 10 minutes)
    setInterval(() => {
        const currentCity = localStorage.getItem("preferredCity");
        if (currentCity) {
            fetchWeather(currentCity, updateUI);
            
            const time = new Date().toLocaleTimeString();
            autoRefreshNotice.textContent = `Data last auto-refreshed at: ${time}`;
        }
    }, 600000); // 600,000 ms = 10 minutes
});