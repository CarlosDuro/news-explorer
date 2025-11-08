import express from 'express';

const router = express.Router();

router.get('/search', (req, res) => {
  const q = (req.query.q || '').toString();
  res.json({
    query: q,
    total: 3,
    items: [
      {
        title: `Resultado 1 sobre ${q}`,
        text: 'Texto de ejemplo 1',
        date: '2025-10-29',
        source: 'Mock',
        link: 'https://example.com/1',
        image: 'https://picsum.photos/400?1'
      },
      {
        title: `Resultado 2 sobre ${q}`,
        text: 'Texto de ejemplo 2',
        date: '2025-10-29',
        source: 'Mock',
        link: 'https://example.com/2',
        image: 'https://picsum.photos/400?2'
      },
      {
        title: `Resultado 3 sobre ${q}`,
        text: 'Texto de ejemplo 3',
        date: '2025-10-29',
        source: 'Mock',
        link: 'https://example.com/3',
        image: 'https://picsum.photos/400?3'
      }
    ]
  });
});

export default router;
