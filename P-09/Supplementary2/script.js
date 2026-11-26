document.getElementById('searchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = document.getElementById('query').value.trim();
    const msg = document.getElementById('msg');
    const results = document.getElementById('results');

    msg.textContent = 'Searching books...';
    results.innerHTML = '';

    try {
        const res = await fetch(`/api/books?q=${encodeURIComponent(q)}`);
        const books = await res.json();
        if (!res.ok) throw new Error(books.error);
        if (books.length === 0) {
            msg.textContent = 'No matching books found.';
            return;
        }
        msg.textContent = `Showing ${books.length} results for "${q}"`;
        results.innerHTML = books.map(b => `
            <div class="book-card">
                ${b.cover ? `<img src="${b.cover}" alt="${b.title}">` : '<div style="height:220px;display:flex;align-items:center;justify-content:center;background:#e2e8f0;color:#64748b;">No Cover</div>'}
                <h3>${b.title}</h3>
                <p><strong>Author:</strong> ${b.author}</p>
                <p><strong>First Published:</strong> ${b.year}</p>
            </div>
        `).join('');
    } catch (err) {
        msg.textContent = err.message;
    }
});
