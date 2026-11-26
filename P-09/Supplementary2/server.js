const express = require('express');
const app = express();
const PORT = 3012;

app.use(express.static(__dirname));

app.get('/api/books', async (req, res) => {
    const q = (req.query.q || '').trim();
    if (!q) return res.status(400).json({ error: 'Search query required.' });

    try {
        const apiRes = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=8`);
        const data = await apiRes.json();
        const books = (data.docs || []).map(b => ({
            title: b.title,
            author: b.author_name ? b.author_name.join(', ') : 'Unknown Author',
            year: b.first_publish_year || 'N/A',
            cover: b.cover_i ? `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg` : ''
        }));
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: 'Unable to reach book catalog API.' });
    }
});

app.listen(PORT, () => console.log(`Book Search App running at http://localhost:${PORT}`));
