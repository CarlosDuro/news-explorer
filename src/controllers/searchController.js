export async function searchNews(req, res, next) {
  try {
    const q = (req.query.q || '').trim() || 'news';

    const items = [
      {
        title: 'El nuevo AI Mode de Google estrena una función que hará temblar a ChatGPT',
        text: 'Google ha lanzado una actualización para su buscador...',
        date: '2025-09-30',
        source: 'Hipertextual',
        link: 'https://hipertextual.com/inteligencia-artificial/ai-mode-busqueda-visual-imagenes/',
        image: 'https://i0.wp.com/imgs.hipertextual.com/wp-content/uploads/2025/09/google-ai-mode-imagenes.jpg?fit=1600%2C901&quality=70&strip=all&ssl=1'
      },
      {
        title: 'Nueva ayuda para estudiantes: Google te regala 12 meses de su IA más TOP',
        text: 'Google tiene activa una promo para estudiantes...',
        date: '2025-10-13',
        source: 'Hipertextual',
        link: 'https://hipertextual.com/tecnologia/nueva-ayuda-para-estudiantes-google-te-regala-12-meses-de-su-ia-mas-top-y-2-tb-de-memoria-en-la-nube/',
        image: 'https://imgs.hipertextual.com/wp-content/uploads/2025/10/google-ai-pro-.jpg'
      }
    ];

    res.json({
      query: q,
      total: items.length,
      items
    });
  } catch (err) {
    next(err);
  }
}
