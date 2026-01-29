# Guía de Despliegue a Producción - Piano Emotion Manager

## Requisitos Previos

### 1. Cuentas y Servicios Configurados

- **Vercel**: Cuenta activa con proyecto conectado
- **GitHub**: Repositorio en https://github.com/hidajonedIE/piano-emotion-manager.git
- **TiDB**: Base de datos configurada y accesible
- **Upstash Redis**: Instancia en región eu-west-1 (Dublin)
- **Clerk**: Configuración de autenticación
- **Stripe**: Configuración de pagos (modo test/producción)

### 2. Variables de Entorno Requeridas

Las siguientes variables deben estar configuradas en Vercel:

#### Base de Datos
```
DATABASE_URL=mysql://[usuario]:[password]@[host]:4000/[database]?ssl={"rejectUnauthorized":true}
```

#### Autenticación (Clerk)
```
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
```

#### Caché Distribuido (Upstash Redis)
```
UPSTASH_REDIS_REST_URL=https://[endpoint].upstash.io
UPSTASH_REDIS_REST_TOKEN=[token]
```

#### Pagos (Stripe)
```
STRIPE_SECRET_KEY=sk_live_... (o sk_test_... para testing)
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (o pk_test_...)
```

#### Sistema
```
JWT_SECRET=[secret-aleatorio-seguro]
OWNER_OPEN_ID=[clerk-user-id-del-owner]
OWNER_NAME=[nombre-del-owner]
NODE_ENV=production
```

## Proceso de Despliegue

### Paso 1: Verificación Pre-Despliegue

1. **Ejecutar tests localmente**:
   ```bash
   pnpm test
   ```
   - Verificar que todos los tests de caché pasen (10/10)
   - Revisar que no haya errores críticos

2. **Verificar compilación**:
   ```bash
   pnpm build
   ```
   - Asegurar que no hay errores de TypeScript
   - Confirmar que el bundle se genera correctamente

3. **Revisar migraciones de base de datos**:
   ```bash
   pnpm db:push
   ```
   - Confirmar que el schema está sincronizado

### Paso 2: Configuración en Vercel

1. **Conectar repositorio de GitHub**:
   - Ir a Vercel Dashboard
   - Importar proyecto desde GitHub
   - Seleccionar repositorio: `hidajonedIE/piano-emotion-manager`

2. **Configurar variables de entorno**:
   - Ir a Settings → Environment Variables
   - Agregar todas las variables listadas arriba
   - Asegurar que están en el entorno "Production"

3. **Configurar regiones de despliegue**:
   - Recomendado: `dub1` (Dublin), `cdg1` (Paris), `fra1` (Frankfurt)
   - Estas regiones están cerca de Upstash Redis (eu-west-1)
   - Latencia esperada: 5-35ms

### Paso 3: Despliegue

1. **Push a rama principal**:
   ```bash
   git push origin main
   ```

2. **Vercel desplegará automáticamente**:
   - Monitorear el proceso en Vercel Dashboard
   - Revisar logs de build
   - Confirmar que el despliegue fue exitoso

### Paso 4: Validación Post-Despliegue

#### Checklist de Validación

- [ ] **Página de inicio carga correctamente**
  - Verificar: https://www.pianoemotion.com

- [ ] **Autenticación funciona**
  - Probar login con Google
  - Verificar que el usuario se crea en la base de datos
  - Confirmar que el dashboard carga después del login

- [ ] **Sistema de caché operativo**
  - Acceder a `/monitor-cache` (solo owner)
  - Verificar conexión a Upstash Redis
  - Confirmar modo: "Redis (Production)"
  - Validar latencia: debe estar entre 5-35ms

- [ ] **Base de datos TiDB conectada**
  - Verificar que se pueden listar clientes
  - Confirmar que se pueden crear servicios
  - Validar que las relaciones funcionan

- [ ] **Sistema de alertas activo**
  - Verificar en `/monitor-cache` que el sistema de alertas está habilitado
  - Confirmar que el cron job se ejecuta cada 5 minutos
  - Revisar logs para verificar ejecución

- [ ] **Métricas de rendimiento**
  - Acceder a dashboard de monitoreo
  - Verificar que se están recopilando snapshots horarios
  - Confirmar que los gráficos muestran datos

- [ ] **Stripe configurado**
  - Probar flujo de pago (si aplica)
  - Verificar webhooks configurados

## Monitoreo Post-Despliegue

### Métricas Clave a Vigilar

1. **Rendimiento de Caché**:
   - Hit Rate: debe estar > 80%
   - Latencia promedio: debe estar < 100ms
   - Revisar en: `/monitor-cache`

2. **Alertas Automáticas**:
   - El sistema notificará al owner si:
     - Hit rate < 80%
     - Latencia > 100ms
   - Verificar notificaciones en el sistema

3. **Logs de Vercel**:
   - Monitorear errores en tiempo real
   - Revisar logs de funciones serverless
   - Verificar uso de recursos

### Herramientas de Monitoreo

- **Vercel Analytics**: Métricas de rendimiento y tráfico
- **Dashboard de Caché**: `/monitor-cache` (solo owner)
- **Upstash Console**: Monitoreo de Redis
- **TiDB Dashboard**: Monitoreo de base de datos

## Troubleshooting

### Problema: Latencia Alta en Redis

**Síntomas**: Latencia > 100ms en operaciones de caché

**Soluciones**:
1. Verificar que Vercel está desplegado en regiones europeas
2. Confirmar que Upstash Redis está en eu-west-1
3. Revisar logs de conexión en `/monitor-cache`
4. Considerar cambiar región de Upstash si es necesario

### Problema: Hit Rate Bajo (<80%)

**Síntomas**: Muchos cache misses, rendimiento degradado

**Soluciones**:
1. Revisar TTL de caché en `server/cache.ts`
2. Verificar que la invalidación no es demasiado agresiva
3. Analizar patrones de acceso en métricas históricas
4. Ajustar estrategias de prefetching

### Problema: Errores de Autenticación

**Síntomas**: Usuarios no pueden hacer login

**Soluciones**:
1. Verificar variables de Clerk en Vercel
2. Confirmar que el dominio está autorizado en Clerk Dashboard
3. Revisar logs de autenticación
4. Validar que JWT_SECRET está configurado

### Problema: Base de Datos No Conecta

**Síntomas**: Errores al cargar datos

**Soluciones**:
1. Verificar DATABASE_URL en variables de entorno
2. Confirmar que TiDB está accesible desde Vercel
3. Revisar configuración de SSL
4. Validar credenciales de conexión

## Rollback

Si algo sale mal, puedes hacer rollback rápidamente:

1. **En Vercel Dashboard**:
   - Ir a Deployments
   - Seleccionar el despliegue anterior estable
   - Click en "Promote to Production"

2. **Desde CLI**:
   ```bash
   vercel rollback
   ```

## Contacto y Soporte

- **Email**: jnavarrete@inboundemotion.com
- **GitHub**: https://github.com/hidajonedIE/piano-emotion-manager
- **Vercel Dashboard**: https://vercel.com/dashboard

## Notas Adicionales

### Optimizaciones de Rendimiento

- El sistema usa caché de 3 niveles:
  1. Upstash Redis (servidor)
  2. Service Workers (navegador)
  3. tRPC Prefetch (cliente)

- Capacidad: 2500+ usuarios concurrentes
- Latencia objetivo: 5-35ms en operaciones de caché
- Hit rate objetivo: > 80%

### Seguridad

- Todas las comunicaciones usan HTTPS
- Autenticación manejada por Clerk
- Tokens JWT para sesiones
- Variables sensibles en Vercel (nunca en código)
- Dashboard de monitoreo solo accesible para owner

### Backup y Recuperación

- TiDB tiene backups automáticos
- Vercel mantiene historial de despliegues
- Upstash Redis es persistente
- Considerar backups regulares de base de datos

---

**Última actualización**: Enero 2026
**Versión del sistema**: 1.0.0
**Estado**: Listo para producción ✅
