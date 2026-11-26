const express = require('express');
const app = express();
const PORT = 3013;

app.use(express.static(__dirname));

app.get('/api/movies', async (req, res) => {
    const q = (req.query.q || 'Batman').trim();
    try {
        const apiRes = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`);
        const data = await apiRes.json();
        const items = data.map(entry => ({
            title: entry.show.name,
            genres: entry.show.genres.join(', ') || 'General',
            rating: entry.show.rating?.average || 'N/A',
            poster: entry.show.image?.medium || '',
            summary: entry.show.summary ? entry.show.summary.replace(/<[^>]*>/g, '') : 'No description available.'
        }));
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve movie/show catalog.' });
    }
});

app.listen(PORT, () => console.log(`Movie Info System running at http://localhost:${PORT}`));
