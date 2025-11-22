export async function searchNews(req, res, next) {
  try {
    const q = (req.query.q || '').trim() || 'news';

    // datos dummy para frontend
    const items = [
      {
        title: 'El nuevo AI Mode de Google estrena una función que hará temblar a ChatGPT',
        text: 'Google lanzó una actualización de búsqueda con IA…',
        date: '2025-10-01',
        source: 'Hipertextual',
        link: 'https://hipertextual.com/inteligencia-artificial/ai-mode-busqueda-visual-imagenes/',
        image: 'https://picsum.photos/seed/ai1/400/200'
      },
      {
        title: 'Google te regala 12 meses de su IA más TOP',
        text: 'Promo para estudiantes, incluye 2TB…',
        date: '2025-10-13',
        source: 'Hipertextual',
        link: 'https://hipertextual.com/tecnologia/nueva-ayuda-para-estudiantes-google-te-regala-12-meses-de-su-ia-mas-top-y-2-tb-de-memoria-en-la-nube/',
        image: 'https://picsum.photos/seed/ai2/400/200'
      }
    ];

    res.json({ query: q, total: items.length, items });
  } catch (err) {
    next(err);
  }
}
