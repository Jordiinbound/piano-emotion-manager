# Configuración de Variables de Entorno en Vercel

El despliegue actual en Vercel necesita las siguientes variables de entorno configuradas para funcionar correctamente.

## Acceso a Configuración

1. Ve a: https://vercel.com/jordi-navarretes-projects/piano-emotion-nextjs/settings/environment-variables
2. O desde el dashboard: Project Settings → Environment Variables

## Variables Requeridas

### Base de Datos (TiDB)
```
DATABASE_URL=mysql://[usuario]:[password]@[host]:4000/[database]?ssl={"rejectUnauthorized":true}
```

### Autenticación (Clerk)
```
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
```

### Caché Distribuido (Upstash Redis) - CRÍTICO PARA VALIDACIÓN
```
UPSTASH_REDIS_REST_URL=https://[endpoint].upstash.io
UPSTASH_REDIS_REST_TOKEN=[token]
```

### Pagos (Stripe)
```
STRIPE_SECRET_KEY=sk_live_... (o sk_test_... para testing)
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (o pk_test_...)
```

### Sistema
```
JWT_SECRET=[secret-aleatorio-seguro]
OWNER_OPEN_ID=[clerk-user-id-del-owner]
OWNER_NAME=[nombre-del-owner]
NODE_ENV=production
```

### Manus (si aplica)
```
BUILT_IN_FORGE_API_URL=[url]
BUILT_IN_FORGE_API_KEY=[key]
VITE_FRONTEND_FORGE_API_KEY=[key]
VITE_FRONTEND_FORGE_API_URL=[url]
```

## Pasos para Configurar

1. **Ir a Environment Variables en Vercel**
   - URL directa: https://vercel.com/jordi-navarretes-projects/piano-emotion-nextjs/settings/environment-variables

2. **Agregar cada variable**
   - Click en "Add New"
   - Name: nombre de la variable (ej: `DATABASE_URL`)
   - Value: valor de la variable
   - Environment: seleccionar "Production", "Preview", y "Development" según necesidad

3. **Guardar cambios**
   - Click en "Save"

4. **Redesplegar**
   - Después de agregar todas las variables, ve a Deployments
   - Click en los 3 puntos del último despliegue
   - Selecciona "Redeploy"
   - O ejecuta desde CLI: `vercel --prod --token [tu-token]`

## Validación Post-Configuración

Una vez configuradas las variables y redesplegado, ejecuta:

```bash
node scripts/validate-redis-latency.mjs
```

Este script validará:
- ✅ Conectividad con el endpoint de producción
- ✅ Latencia de Redis (objetivo: <100ms promedio, <35ms P95)
- ✅ Tasa de éxito de peticiones (objetivo: >95%)

## Troubleshooting

### Error 404 en endpoints
- **Causa**: Variables de entorno no configuradas
- **Solución**: Configurar todas las variables requeridas y redesplegar

### Error de conexión a Redis
- **Causa**: `UPSTASH_REDIS_REST_URL` o `UPSTASH_REDIS_REST_TOKEN` incorrectos
- **Solución**: Verificar credenciales en Upstash Dashboard

### Error de autenticación
- **Causa**: `CLERK_SECRET_KEY` no configurado
- **Solución**: Obtener clave de Clerk Dashboard y configurar

## Información Adicional

- **Proyecto en Vercel**: https://vercel.com/jordi-navarretes-projects/piano-emotion-nextjs
- **URL de producción**: https://piano-emotion-nextjs.vercel.app
- **Región recomendada**: Dublin (dub1) para latencia óptima con Upstash Redis EU
