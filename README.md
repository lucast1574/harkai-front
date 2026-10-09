# Harkai panel

Panel Next.js para usuarios, municipalidades y administradores en `panel.harkai.lat`. La landing vive en otro repositorio y servicio. La API de Go es la fuente común de datos y permisos para web y móvil.

## Código

- `src/app`: rutas y adaptador HTTP del servidor web.
- `src/components`: shell lateral, controles accesibles y acceso por rol.
- `src/features`: reportes, mapas, estadísticas, cuenta y administración.
- `src/lib`: contratos, sesión, cliente API y adaptadores.

Las consultas pasan por `/api/backend` y las sesiones por `/api/session`. Los tokens se guardan en cookies HttpOnly; no se exponen a almacenamiento JavaScript. Las mutaciones verifican un origen exacto y limitan el cuerpo antes de cargarlo en memoria.

## Desarrollo

Node 24. Ejecuta `npm ci`, `npm run dev`. Configura `API_BASE_URL=http://localhost:8080` y `APP_ORIGIN=http://localhost:3000` para una API local aislada. Verifica con `npm run typecheck`, `npm run lint` y `npm run build`.

## Dokploy

Docker standalone, puerto 3000, usuario sin privilegios. Entorno de servidor: `API_BASE_URL=https://api.harkai.lat`, `APP_ORIGIN=https://panel.harkai.lat`. Los tres argumentos `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` y `NEXT_PUBLIC_FIREBASE_APP_ID` contienen configuración pública del cliente Google del proyecto harkai-acceso; no claves privadas del backend. Nunca introduzcas una cuenta de servicio en argumentos públicos.

El panel usa Leaflet y OpenStreetMap. Las gráficas y CSV describen la muestra cargada y avisan si quedan páginas. Comunidad reúne actividad y conversaciones sobre reportes comunitarios. /dashboard/news redirige a esa sección; no hay una fuente editorial inventada. /dashboard/analytics redirige al historial visual de la ciudad. Pagos están desactivados. Google y FCM solo se presentan como operativos después de completar configuración y pruebas de esos circuitos.

La navegación principal del usuario tiene Mapa, Comunidad e Historial de la ciudad. Mascotas y Lugares de ayuda se abren dentro de Comunidad; los reportes propios y privacidad se gestionan desde la cuenta. El historial usa archive/incidents con distrito, fechas y zona, incluye alertas vencidas y reportes resueltos y excluye los ocultos. Los distritos son etiquetas aportadas por usuarios, no geometrías oficiales.

La conversación de cada reporte usa GET/POST/DELETE incidents/{id}/comments, con paginación y permisos de Go. Solo el autor o el admin puede retirar un comentario. Se muestra un marcador sin texto ni nombre. No se renderiza HTML aportado por usuarios.
