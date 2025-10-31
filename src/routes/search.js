import express from 'express';
import { NEWS_API_KEY, NEWS_API_LANG } from '../config/index.js';

const router = express.Router();

router.get('/search', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ query: '', total: 0, items: [] });

    // Si hay API key → llama NewsAPI; si no → demo/mocks
    if (NEWS_API_KEY) {
      const url = new URL('https://newsapi.org/v2/everything');
      url.searchParams.set('q', q);
      url.searchParams.set('language', (NEWS_API_LANG || 'en').slice(0,2));
      url.searchParams.set('pageSize', '10');
      const r = await fetch(url, { headers: { 'X-Api-Key': NEWS_API_KEY }});
      const j = await r.json().catch(() => ({}));
      const items = Array.isArray(j.articles) ? j.articles.map(a => ({
        title: a.title || '',
        text: a.description || '',
        date: (a.publishedAt || '').slice(0,10),
        source: a.source?.name || '',
        link: a.url || '#',
        image: a.urlToImage || 'https://picsum.photos/400'
      })) : [];
      return res.json({ query: q, total: items.length, items });
    }

    // Mock si no hay NEWS_API_KEY
    return res.json({
      query: q,
      total: 3,
      items: [
        { title: `Resultado 1: ${q}`, text: 'Demo item', date: new Date().toISOString().slice(0,10), source: 'Demo', link: 'https://example.com', image: 'https://picsum.photos/400' },
        { title: `Resultado 2: ${q}`, text: 'Demo item', date: new Date().toISOString().slice(0,10), source: 'Demo', link: 'https://example.com', image: 'https://picsum.photos/400' },
        { title: `Resultado 3: ${q}`, text: 'Demo item', date: new Date().toISOString().slice(0,10), source: 'Demo', link: 'https://example.com', image: 'https://picsum.photos/400' }
      ]
    });
  } catch (e) { next(e); }
});

export default router;
