document.addEventListener("DOMContentLoaded", () => {
    const newsList = document.getElementById("news-list");
    const lastUpdated = document.getElementById("last-updated");

    // Function to fetch and render news
    const fetchNews = async () => {
        try {
            // Using the Fetch API to retrieve data from the local JSON source
            const response = await fetch("news.json");
            
            if (!response.ok) {
                throw new Error("Failed to load news source.");
            }
            
            const articles = await response.json();
            
            // Clear existing content before updating
            newsList.innerHTML = "";

            // Dynamically create HTML elements for each news article
            articles.forEach(article => {
                const articleElement = document.createElement("article");
                articleElement.className = "news-item";
                
                articleElement.innerHTML = `
                    <span class="category">${article.category}</span>
                    <h2>${article.title}</h2>
                    <p>${article.summary}</p>
                `;
                
                newsList.appendChild(articleElement);
            });

            // Update the timestamp to indicate a successful refresh
            const now = new Date();
            lastUpdated.textContent = `Last updated: ${now.toLocaleTimeString()}`;

        } catch (error) {
            console.error("Error fetching news:", error);
            newsList.innerHTML = `<p class="error">Unable to load headlines at this time.</p>`;
        }
    };

    // 1. Initial fetch to load the data immediately when the page loads
    fetchNews();

    // 2. JavaScript Timer: Automatically refresh the content every 10 seconds (10,000 ms)
    setInterval(fetchNews, 10000);
});