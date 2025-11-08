import express from 'express';

const router = express.Router();

// mock de noticias para el frontend
router.get('/search', (req, res) => {
  const q = (req.query.q || '').toString();
  res.json({
    query: q,
    total: 3,
    items: [
      {
        title: 'Ejemplo 1 de noticia sobre ' + q,
        text: 'Texto de ejemplo 1',
        date: '2025-10-29',
        source: 'MockSource',
        link: 'https://example.com/1',
        image: 'https://picsum.photos/400?1'
      },
      {
        title: 'Ejemplo 2 de noticia sobre ' + q,
        text: 'Texto de ejemplo 2',
        date: '2025-10-29',
        source: 'MockSource',
        link: 'https://example.com/2',
        image: 'https://picsum.photos/400?2'
      },
      {
        title: 'Ejemplo 3 de noticia sobre ' + q,
        text: 'Texto de ejemplo 3',
        date: '2025-10-29',
        source: 'MockSource',
        link: 'https://example.com/3',
        image: 'https://picsum.photos/400?3'
      }
    ],
  });
});

export default router;
