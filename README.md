# Harkai panel web

Aplicación web para usuarios, gobiernos locales y administradores. El repositorio de la landing pública es `harkai-landing`.

- Panel y enlaces de reportes: `https://panel.harkai.lat` y `/incidents/{id}`.
- Landing: `https://harkai.lat`.
- API común: `https://api.harkai.lat`.
- Alojamiento: Dokploy, servicio dentro del proyecto `harkai`.
- Desarrollo: `npm ci`, `npm run dev`; compilación: `npm run build`.

La migración a Go está en la rama `codex/harkai-rebuild`. El cliente original todavía conserva adaptadores que se reemplazarán: no se debe considerar listo para producción hasta completar la migración y las pruebas. Firebase se utilizará exclusivamente para Google login y FCM; roles y datos pertenecen al backend.

Navegación principal mediante sidebar, componentes reutilizables y acceso institucional protegido por roles en la API. Sin pagos activos durante esta etapa.
