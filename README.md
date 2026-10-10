# Harkai panel

Panel Next.js para usuarios, municipalidades y administradores en `panel.harkai.lat`. La landing vive en otro repositorio y servicio. La API de Go es la fuente común de datos y permisos para web y móvil.

## Código

- `src/app`: rutas y adaptador HTTP del servidor web.
- `src/components`: shell lateral, controles accesibles y acceso por rol.
- `src/features`: reportes, mapas, estadísticas, cuenta y administración.
- `src/lib`: contratos, sesión, cliente API y adaptadores.

Las consultas pasan por `/api/backend` y las sesiones por `/api/session`. Los tokens se guardan en cookies HttpOnly; no se exponen a almacenamiento JavaScript. Las mutaciones verifican un origen exacto y limitan el cuerpo antes de cargarlo en memoria.

## Desarrollo

Node 24. Ejecuta `npm ci`, `npm run dev`. Configura `API_BASE_URL=http://localhost:8080` y `APP_ORIGIN=http://localhost:3000` para una API local aislada. Verifica con `npm run typecheck`, `npm run lint`, `npm test` y `npm run build`.

## Dokploy

Docker standalone, puerto 3000, usuario sin privilegios. Entorno de servidor: `API_BASE_URL=https://api.harkai.lat`, `APP_ORIGIN=https://panel.harkai.lat`. Los tres argumentos `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` y `NEXT_PUBLIC_FIREBASE_APP_ID` contienen configuración pública del cliente Google del proyecto harkai-acceso; no claves privadas del backend. Nunca introduzcas una cuenta de servicio en argumentos públicos.

El panel usa Leaflet y OpenStreetMap. Las gráficas y CSV describen la muestra cargada y avisan si quedan páginas. Comunidad reúne actividad y conversaciones sobre reportes comunitarios. /dashboard/news redirige a esa sección; no hay una fuente editorial inventada. /dashboard/analytics redirige al historial visual de la ciudad. Pagos están desactivados. Google y FCM solo se presentan como operativos después de completar configuración y pruebas de esos circuitos.

La navegación principal del usuario tiene Mapa, Ayuda y orientación, Comunidad, Historial de la ciudad y Red de apoyo. Esta última reúne mascotas y lugares de ayuda; los reportes propios y privacidad se gestionan desde la cuenta. El historial usa archive/incidents con distrito, fechas y zona, incluye alertas vencidas y reportes resueltos y excluye los ocultos. Los distritos son etiquetas aportadas por usuarios, no geometrías oficiales.

La conversación de cada reporte usa GET/POST/DELETE incidents/{id}/comments, con paginación y permisos de Go. Solo el autor o el admin puede retirar un comentario. Se muestra un marcador sin texto ni nombre. No se renderiza HTML aportado por usuarios.

## Notificaciones por dispositivo

Mi cuenta reúne registro, inicio/cierre de sesión, perfil, preferencias y actividad. Los reportes nuevos se publican exclusivamente desde la app móvil; la web conserva comentarios, confirmación y gestión de reportes propios. El proxy web rechaza POST incidents, media y analysis/audio, y las rutas antiguas de publicación/acceso dirigen a Mi cuenta.

Mi cuenta permite activar FCM con consentimiento y registrar una zona elegida en el mapa o con ubicación en primer plano. Go aplica radio y preferencias, incluyendo reportes no verificados; el navegador no recibe texto, contacto ni coordenadas en el aviso. El botón permanece deshabilitado mientras `/v1/meta` no habilite push o falte `NEXT_PUBLIC_FIREBASE_VAPID_KEY`.

El service worker se empaqueta localmente con el SDK modular en `npm run build` y `npm run dev`, sin scripts remotos. La clave VAPID es pública y va como argumento de build; la credencial privada FCM solo pertenece al entorno del backend. Al cerrar sesión se revoca la elegibilidad en Go y se retira el token local. La prueba de recepción real requiere activar permisos en un navegador compatible con HTTPS.

## Ubicación en desktop

El mapa principal admite zoom con la rueda. LocationControl comparte selección manual y geolocalización entre mapa, historial, filtros y notificaciones. La búsqueda usa precisión normal y una posición reciente de hasta dos minutos, con un límite de veinte segundos; distingue permisos bloqueados, equipo sin ubicación y timeout. La consulta no depende de GPS: se puede elegir un punto en un diálogo Leaflet, con controles de teclado y coordenadas. No se calcula una ubicación personal a partir de la IP. La orientación por categoría es pública; la consulta por texto sigue autenticada.

## Directorio y controles

Ayuda y Red de apoyo consultan `support/directory` por ciudad y distrito. Los recursos permanentes de `support/places` aparecen como marcadores azules, separados de las alertas y sus estadísticas. Cada ficha conserva fuentes y fecha de consulta; si falta contraste institucional del número municipal se indica y se ofrecen las líneas nacionales. La carga inicial es una selección de centros, no una cobertura completa de establecimientos.

`components/select.tsx` comparte desplegables propios con opciones redondeadas, navegación por flechas, búsqueda al escribir, Escape y cierre exterior. El control nativo oculto conserva FormData y reinicio del formulario. El menú se monta fuera de paneles con overflow y ajusta su posición a la pantalla. Los estados de foco no usan outline, ring ni glow: solo cambios discretos de fondo o subrayado.
