# SEO público de Harkai

La landing (harkai.lat), los directorios y las publicaciones públicas (panel.harkai.lat) se enlazan con enlaces HTML rastreables. La navegación superior y las migas de pan de cada publicación vuelven a la landing. Las páginas públicas siguen disponibles en navegadores móviles sin cuenta; comentar requiere sesión.

## Generación automática

- `src/lib/public-seo.ts` centraliza canonical, descripción, Open Graph, Twitter, permisos de snippets, organización, sitio y breadcrumbs.
- Los chats se publican al tener mensajes reales. El UBIGEO forma parte de la URL para distinguir distritos con nombres iguales; las variantes del slug redirigen permanentemente.
- Cada alerta conserva su URL aunque expire su punto en el mapa. Su ubicación, categoría, fecha y estado de confirmación aparecen como contenido visible. Las publicaciones ocultas no se indexan.
- `DiscussionForumPosting` describe conversaciones y `SocialMediaPosting` describe reportes ciudadanos. No se presentan como noticias oficiales ni se inventan autores, opiniones, fechas de modificación o valoraciones.
- Las páginas paginadas tienen canonical propio y enlaces a contenido anterior. JSON-LD se serializa escapando texto aportado por usuarios.
- `/sitemap.xml` es un índice dinámico: directorios/chats más un archivo por cada página de 100 alertas. Las fechas de creación no se hacen pasar por fechas de última modificación. El índice recorre la API paginada; si el volumen crece mucho conviene materializar sus límites en backend para evitar recorrer todas las páginas al regenerarlo.

## Validación y seguimiento

Ejecutar `npm run test`, `npm run lint`, `npm run build` y, con un servidor disponible, `node scripts/check-public-seo.mjs https://panel.harkai.lat`.

Después de desplegar, enviar los sitemaps `https://harkai.lat/sitemap.xml` y `https://panel.harkai.lat/sitemap.xml` en la propiedad correspondiente de Google Search Console. Inspeccionar una alerta y un chat reales, y revisar los informes de indexación y resultados enriquecidos. La implementación no envía automáticamente solicitudes a Search Console.

Medir impresiones, clics, consultas locales y URLs indexadas antes de decidir nuevos contenidos. No crear páginas vacías por combinación de distrito/palabra clave. La indexación y las posiciones dependen de los buscadores y de la calidad real de las contribuciones.

Referencias: https://developers.google.com/search/docs/appearance/structured-data/discussion-forum y https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap.
