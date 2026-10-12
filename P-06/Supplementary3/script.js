document.addEventListener("DOMContentLoaded", () => {
    const genreSelect = document.getElementById("genre-select");
    const exploreBtn = document.getElementById("explore-btn");
    const movieResults = document.getElementById("movie-results");
    const loadingMessage = document.getElementById("loading-message");
    const errorMessage = document.getElementById("error-message");

    // 1. Retrieve saved preference from Browser Storage (Local Storage)
    const savedGenre = localStorage.getItem("preferredMovieGenre");
    if (savedGenre) {
        genreSelect.value = savedGenre;
    }

    // 2. Asynchronous data fetching using Fetch API and Callbacks
    const fetchMovies = async (selectedGenre, callback) => {
        // UI State: Loading
        movieResults.innerHTML = "";
        errorMessage.classList.add("hidden");
        loadingMessage.classList.remove("hidden");

        try {
            const response = await fetch("movies.json");
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const movies = await response.json();
            
            // 3. JavaScript Timer: Simulate network delay for realistic loading effect
            setTimeout(() => {
                // Filter logic based on genre selection
                const filteredMovies = selectedGenre === "All" 
                    ? movies 
                    : movies.filter(movie => movie.genre === selectedGenre);
                
                // Execute callback with the filtered data
                callback(null, filteredMovies);
            }, 800); // 800ms delay

        } catch (error) {
            console.error("Error fetching movies:", error);
            callback(error, null);
        }
    };

    // Callback function to dynamically update the DOM with movie data
    const renderMovies = (error, movies) => {
        loadingMessage.classList.add("hidden");

        if (error) {
            errorMessage.textContent = "Failed to load movie database. Please try again later.";
            errorMessage.classList.remove("hidden");
            return;
        }

        if (movies.length === 0) {
            movieResults.innerHTML = `<p style="text-align:center; width:100%; color:#aaa;">No movies found for this genre.</p>`;
            return;
        }

        // Dynamically generate HTML elements for each movie
        movies.forEach(movie => {
            const card = document.createElement("div");
            card.className = "movie-card";
            
            card.innerHTML = `
                <h2>${movie.title}</h2>
                <div class="genre-tag">${movie.genre}</div>
                <div class="rating">⭐ ${movie.rating}/10</div>
                <div class="description">${movie.description}</div>
            `;
            
            movieResults.appendChild(card);
        });
    };

    // Event Listener for the Explore button
    exploreBtn.addEventListener("click", () => {
        const currentGenre = genreSelect.value;
        
        // Save the newly selected preference to Local Storage
        localStorage.setItem("preferredMovieGenre", currentGenre);
        
        // Trigger the fetch and render process
        fetchMovies(currentGenre, renderMovies);
    });

    // Auto-load movies based on the saved preference on initial page load
    fetchMovies(genreSelect.value, renderMovies);
});