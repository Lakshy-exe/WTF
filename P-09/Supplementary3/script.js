async function fetchMovies(q = 'Avengers') {
    const status = document.getElementById('status');
    const grid = document.getElementById('movieGrid');
    status.textContent = 'Loading titles...';
    try {
        const res = await fetch(`/api/movies?q=${encodeURIComponent(q)}`);
        const movies = await res.json();
        status.textContent = `Found ${movies.length} result(s) for "${q}"`;
        grid.innerHTML = movies.map(m => `
            <div class="card">
                ${m.poster ? `<img src="${m.poster}" alt="${m.title}">` : '<div style="height:290px;background:#334155;display:flex;align-items:center;justify-content:center;">No Poster</div>'}
                <div class="card-body">
                    <h3>${m.title}</h3>
                    <span class="rating">★ ${m.rating}</span>
                    <p style="font-size:0.85rem;color:#94a3b8;margin:6px 0;">${m.genres}</p>
                    <p class="desc">${m.summary}</p>
                </div>
            </div>
        `).join('');
    } catch (e) {
        status.textContent = 'Error loading movies.';
    }
}

document.getElementById('movieForm').addEventListener('submit', (e) => {
    e.preventDefault();
    fetchMovies(document.getElementById('searchInput').value.trim());
});

fetchMovies();
