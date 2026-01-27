# Análisis de Migración: Piano Emotion Manager

## Proyecto Original (GitHub)

**Repositorio**: https://github.com/hidajonedIE/piano-emotion-manager.git  
**Tecnologías**: React Native + Expo + Express + tRPC + Drizzle ORM + MySQL/TiDB  
**Despliegue**: Vercel (https://www.pianoemotion.com)

### Estructura del Proyecto Original

El proyecto original es una **aplicación móvil multiplataforma** (React Native + Expo) con backend Express + tRPC:

```
piano-emotion-original/
├── server/               # Backend Express + tRPC
├── app/                  # Frontend React Native (Expo Router)
├── components/           # Componentes React Native
├── hooks/                # Custom hooks
├── contexts/             # React contexts
├── services/             # Servicios de negocio
├── drizzle/              # Schema y migraciones de BD
├── locales/              # Traducciones i18n (10 idiomas)
├── public/               # Assets estáticos
└── portal/               # Portal del cliente (web)
```

### Base de Datos Original (52 tablas)

El proyecto original tiene un schema muy completo con **52 tablas** que cubren:

#### 1. **Gestión de Usuarios y Autenticación**
- `users` - Usuarios del sistema
- `clientPortalUsers` - Usuarios del portal del cliente
- `clientPortalSessions` - Sesiones del portal
- `clientPortalPasswordResets` - Restablecimiento de contraseñas
- `clientPortalInvitations` - Invitaciones al portal

#### 2. **Organizaciones y Partners**
- `organizations` - Organizaciones/empresas
- `organizationMembers` - Miembros de organizaciones
- `organizationInvitations` - Invitaciones a organizaciones
- `organizationActivityLog` - Log de actividad
- `organizationModules` - Módulos activos por organización
- `organizationSharingSettings` - Configuración de compartición
- `partners` - Partners/distribuidores
- `partnerUsers` - Usuarios de partners
- `partnerSettings` - Configuración de partners
- `partnerPricing` - Precios personalizados
- `platformAdmins` - Administradores de plataforma

#### 3. **Clientes y Pianos**
- `clients` - Clientes finales
- `pianos` - Pianos registrados
- `clientMessages` - Mensajes a clientes

#### 4. **Citas y Servicios**
- `appointments` - Citas programadas
- `services` - Servicios realizados
- `serviceTasks` - Tareas de servicio
- `serviceTypes` - Tipos de servicio
- `serviceRates` - Tarifas de servicio
- `serviceZones` - Zonas de servicio
- `technicianZones` - Zonas asignadas a técnicos
- `technicianMetrics` - Métricas de técnicos
- `workAssignments` - Asignaciones de trabajo
- `memberAbsences` - Ausencias de miembros

#### 5. **Facturación y Finanzas**
- `invoices` - Facturas
- `quotes` - Presupuestos
- `quoteTemplates` - Plantillas de presupuestos

#### 6. **Inventario**
- `inventory` - Inventario de productos/repuestos

#### 7. **Información de Negocio**
- `businessInfo` - Información fiscal y bancaria

#### 8. **Licencias y Suscripciones**
- `licenses` - Licencias de usuarios
- `licenseBatches` - Lotes de licencias
- `licenseTemplates` - Plantillas de licencias
- `licenseHistory` - Historial de cambios
- `subscriptionPlans` - Planes de suscripción
- `modules` - Módulos disponibles
- `distributorModuleConfig` - Configuración de módulos

#### 9. **Alertas y Recordatorios**
- `alertSettings` - Configuración de alertas
- `alertNotifications` - Notificaciones de alertas
- `alertHistory` - Historial de alertas
- `reminders` - Recordatorios

#### 10. **Integración de Calendarios**
- `calendarConnections` - Conexiones con Google/Microsoft Calendar
- `calendarSyncEvents` - Eventos sincronizados
- `calendarSyncLog` - Log de sincronización

#### 11. **Ayuda y Soporte**
- `helpSections` - Secciones de ayuda
- `helpItems` - Items de ayuda

#### 12. **Invitaciones**
- `invitations` - Invitaciones generales

#### 13. **Uso de IA**
- `aiUsageTracking` - Tracking de uso de IA

---

## Proyecto Nuevo (Manus)

**Tecnologías**: React 19 + Vite + Express + tRPC + Drizzle ORM + MySQL/TiDB  
**Despliegue**: Manus Platform

### Estructura del Proyecto Nuevo

```
piano-emotion-nextjs/
├── server/               # Backend Express + tRPC
│   ├── routers/          # Routers tRPC por funcionalidad
│   ├── services/         # Servicios de negocio
│   └── utils/            # Utilidades (PDF, email, etc.)
├── client/               # Frontend React 19 + Vite
│   ├── src/
│   │   ├── pages/        # Páginas de la aplicación
│   │   ├── components/   # Componentes reutilizables
│   │   └── lib/          # Librerías (tRPC client)
│   └── public/           # Assets estáticos
├── drizzle/              # Schema y migraciones de BD
└── shared/               # Código compartido
```

### Base de Datos Actual (Simplificada)

El proyecto nuevo tiene un schema simplificado enfocado en facturación:

- `users` - Usuarios con roles (admin/user)
- `clients` - Clientes
- `pianos` - Pianos (básico)
- `invoices` - Facturas con items
- `appointments` - Citas (básico)
- `services` - Servicios (básico)

### Funcionalidades Implementadas

1. ✅ **Sistema de autenticación** (Manus OAuth + Clerk)
2. ✅ **Gestión de clientes** (CRUD completo)
3. ✅ **Gestión de pianos** (CRUD completo)
4. ✅ **Sistema de facturación avanzado**:
   - Creación y edición de facturas
   - Estados: borrador, enviada, pagada, anulada
   - Items con precio, cantidad, descuento
   - Generación de PDF profesional
   - Envío por email (SMTP + OAuth2)
   - Pago online con Stripe
   - Portal del cliente sin login
   - Generación de recibos PDF
5. ✅ **Gestión de citas** (básico)
6. ✅ **Gestión de servicios** (básico)
7. ✅ **Dashboard con estadísticas**
8. ✅ **Sistema de alertas** (facturas vencidas, stock bajo)
9. ✅ **Exportación a Excel/CSV**
10. ✅ **OAuth2 para Gmail y Outlook**

---

## Plan de Migración

### Fase 1: Análisis y Priorización ✅

1. ✅ Clonar repositorio original
2. ✅ Analizar estructura del proyecto
3. ✅ Identificar tablas de la base de datos
4. ⏳ Priorizar funcionalidades a migrar

### Fase 2: Migración de Schema de Base de Datos

**Tablas prioritarias a migrar**:

1. **Alta prioridad** (core del negocio):
   - `serviceTypes` - Tipos de servicio predefinidos
   - `serviceRates` - Tarifas por tipo de servicio
   - `serviceTasks` - Tareas dentro de cada servicio
   - `inventory` - Gestión de inventario/repuestos
   - `quotes` - Presupuestos
   - `quoteTemplates` - Plantillas de presupuestos

2. **Media prioridad** (mejoras operativas):
   - `technicianZones` - Zonas de trabajo de técnicos
   - `technicianMetrics` - Métricas de rendimiento
   - `workAssignments` - Asignación de trabajos
   - `memberAbsences` - Gestión de ausencias
   - `reminders` - Sistema de recordatorios
   - `alertSettings` - Configuración de alertas personalizada

3. **Baja prioridad** (features avanzadas):
   - `organizations` + relacionadas - Multi-tenant
   - `partners` + relacionadas - Sistema de distribuidores
   - `licenses` + relacionadas - Gestión de licencias
   - `modules` + relacionadas - Sistema modular
   - `calendarConnections` + relacionadas - Integración calendarios
   - `helpSections` + `helpItems` - Sistema de ayuda
   - `aiUsageTracking` - Tracking de IA

### Fase 3: Migración de Lógica de Negocio

1. Migrar routers tRPC del proyecto original
2. Migrar servicios de negocio
3. Adaptar a la nueva estructura (React web vs React Native)
4. Implementar tests unitarios

### Fase 4: Migración de UI

1. Convertir componentes React Native a React web
2. Adaptar navegación (Expo Router → React Router)
3. Migrar estilos (React Native StyleSheet → Tailwind CSS)
4. Implementar responsive design

### Fase 5: Features Especiales

1. Portal del cliente (ya existe básico)
2. Integración con calendarios externos
3. Sistema de notificaciones push
4. Generación de reportes avanzados
5. Sistema de ayuda integrado

---

## Decisiones de Arquitectura

### ¿Qué mantener del proyecto original?

1. ✅ **Schema de base de datos** - Migrar tablas necesarias
2. ✅ **Lógica de negocio** - Routers y servicios tRPC
3. ✅ **Sistema de autenticación** - Adaptar Clerk a Manus OAuth
4. ❌ **React Native** - Reemplazar por React web
5. ❌ **Expo Router** - Reemplazar por React Router
6. ❌ **Traducciones i18n** - Mantener solo español (por ahora)

### ¿Qué es nuevo en el proyecto Manus?

1. ✅ **OAuth2 para email** (Gmail + Outlook)
2. ✅ **Generación de recibos PDF**
3. ✅ **Dashboard de estadísticas avanzado**
4. ✅ **Exportación a Excel/CSV**
5. ✅ **Sistema de alertas en tiempo real**
6. ✅ **Portal del cliente sin login**

---

## Próximos Pasos

### Inmediatos

1. **Priorizar funcionalidades** con el usuario
2. **Migrar schema de BD** (tablas prioritarias)
3. **Migrar routers tRPC** correspondientes
4. **Adaptar UI** a React web

### A medio plazo

1. Implementar gestión de inventario
2. Implementar sistema de presupuestos
3. Implementar zonas y asignación de técnicos
4. Implementar métricas de rendimiento

### A largo plazo

1. Sistema multi-tenant (organizaciones)
2. Sistema de partners/distribuidores
3. Integración con calendarios externos
4. Sistema de licencias y módulos
5. Traducciones a múltiples idiomas

---

## Notas Técnicas

### Compatibilidad de Código

- **tRPC**: ✅ Compatible (misma versión 11.7.2)
- **Drizzle ORM**: ✅ Compatible (versiones similares)
- **Express**: ✅ Compatible (mismo servidor)
- **React**: ⚠️ Requiere adaptación (Native → Web)
- **Autenticación**: ⚠️ Requiere adaptación (Clerk → Manus OAuth)

### Riesgos y Consideraciones

1. **Complejidad del schema original** - 52 tablas vs 6 actuales
2. **Dependencias de React Native** - Muchos componentes nativos
3. **Sistema multi-tenant** - Arquitectura compleja
4. **Traducciones** - 10 idiomas en el original
5. **Integraciones externas** - Calendarios, IA, etc.

---

## Conclusión

El proyecto original es **mucho más complejo y completo** que el actual. La migración debe ser **incremental y priorizada**, comenzando por las funcionalidades core del negocio y expandiendo gradualmente.

**Recomendación**: Comenzar con la migración de las tablas y funcionalidades de **alta prioridad** (servicios, inventario, presupuestos) antes de abordar features avanzadas como multi-tenant o integraciones externas.
