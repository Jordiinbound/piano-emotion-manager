# Piano Emotion Manager - Migración a Next.js

## Fase 1: Configurar proyecto Next.js base con Tailwind CSS
- [x] Verificar que el proyecto Next.js se ha inicializado correctamente
- [x] Verificar que Tailwind CSS está configurado
- [x] Compilar el proyecto sin errores
- [x] Verificar que el servidor de desarrollo funciona correctamente
- [x] Probar la página de inicio en el navegador

## Fase 2: Configurar tRPC client
- [x] Migrar schema de base de datos del proyecto antiguo
- [x] Verificar que el schema compila sin errores
- [x] Conectar a la base de datos existente
- [x] Crear router de dashboard con métricas básicas
- [x] Configurar tRPC client en el frontend
- [x] Crear página de inicio con llamada a tRPC
- [ ] Configurar autenticación para probar endpoint
- [ ] Verificar comunicación end-to-end completa
- [ ] Migrar routers adicionales según necesidad (incremental)

## Fase 3: Integrar Clerk para autenticación
- [x] Instalar @clerk/clerk-react
- [x] Configurar credenciales de Clerk desde Vercel
- [x] Crear ClerkProvider personalizado
- [x] Crear hook useAuth con timeout para evitar spinner infinito
- [x] Crear páginas de SignIn y SignUp
- [x] Agregar rutas de autenticación
- [x] Verificar que la aplicación carga correctamente
- [x] Dashboard muestra métricas (0 porque DB está vacía)
- [ ] Probar flujo completo de login con Clerk
- [ ] Conectar a base de datos de producción TiDB

## Fase 4: Diseñar layout responsive base
- [x] Crear componente Layout principal con sidebar
- [x] Implementar navegación con enlaces a todas las secciones
- [x] Agregar menú hamburguesa para móvil
- [x] Implementar header con información de usuario
- [x] Agregar estilos responsive (mobile-first)
- [x] Probar navegación en desktop
- [x] Sidebar persistente para desktop funcionando
- [x] Resaltado de sección activa funcionando
- [ ] Probar menú hamburguesa en móvil
- [ ] Verificar responsive en diferentes tamaños

## Fase 5: Migrar dashboard principal con métricas
- [x] Mejorar métricas del dashboard con 4 tarjetas principales
- [x] Agregar métrica de servicios del mes actual
- [x] Agregar lista de servicios recientes (5 últimos)
- [x] Agregar lista de próximos servicios programados (5 próximos)
- [x] Crear router de dashboard con 4 endpoints
- [x] Implementar getServicesStats para estadísticas mensuales
- [x] Crear tests para todos los endpoints del dashboard
- [x] Verificar que todos los tests pasen correctamente
- [x] Diseño responsive con grid adaptativo
- [ ] Agregar gráficos visuales de servicios por mes (opcional)
- [ ] Conectar a base de datos de producción para ver datos reales

## Fase 6: Migrar gestión de clientes
- [ ] Crear página de lista de clientes
- [ ] Implementar búsqueda de clientes
- [ ] Implementar filtros
- [ ] Crear formulario de nuevo cliente
- [ ] Crear formulario de edición de cliente
- [ ] Implementar eliminación de cliente
- [ ] Validar cada funcionalidad exhaustivamente

## Fase 7: Migrar gestión de servicios
- [ ] Crear página de lista de servicios
- [ ] Implementar vista de calendario
- [ ] Implementar filtros de servicios
- [ ] Crear formulario de nuevo servicio
- [ ] Crear formulario de edición de servicio
- [ ] Implementar eliminación de servicio
- [ ] Probar cada componente exhaustivamente

## Fase 8: Migrar gestión de pianos
- [ ] Crear página de lista de pianos
- [ ] Implementar vinculación con clientes
- [ ] Crear formulario de nuevo piano
- [ ] Crear formulario de edición de piano
- [ ] Verificar relaciones con clientes
- [ ] Validar formularios funcionan correctamente

## Fase 9: Migrar página de predicciones matemáticas
- [ ] Crear página de predicciones
- [ ] Implementar sección de ingresos
- [ ] Implementar sección de churn
- [ ] Implementar sección de mantenimiento
- [ ] Implementar sección de carga de trabajo
- [ ] Implementar sección de inventario
- [ ] Verificar conexión con backend
- [ ] Validar datos correctos en todas las secciones

## Fase 10: Migrar página de reportes/analytics
- [ ] Crear página de reportes
- [ ] Implementar gráficos de ingresos
- [ ] Implementar gráficos de servicios
- [ ] Implementar gráficos de clientes
- [ ] Verificar visualizaciones en desktop
- [ ] Verificar visualizaciones en móvil
- [ ] Validar datos correctos

## Fase 11: Configurar deployment en Vercel
- [ ] Configurar variables de entorno
- [ ] Hacer primer deployment
- [ ] Verificar aplicación en producción
- [ ] Probar todas las funcionalidades en producción

## Fase 12: Entrega final
- [ ] Verificación final de todas las funcionalidades
- [ ] Documentar cambios y mejoras
- [ ] Reportar resultado al usuario

## Correcciones del Dashboard y Sidebar
- [x] Revisar estructura del drawer original (CustomSidebar.tsx)
- [x] Agregar sección "MAIN" con 7 opciones (Inicio, Agenda, Clientes, Pianos, Servicios, Facturación, Inventario)
- [x] Agregar sección "COMERCIAL" con 2 opciones (Store, Reportes)
- [x] Agregar sección "HERRAMIENTAS" con 3 opciones (Accesos Rápidos, Herramientas Avanzadas, Configuración)
- [x] Crear páginas placeholder para todas las nuevas rutas
- [x] Actualizar App.tsx con todas las rutas nuevas
- [x] Verificar que la navegación coincida exactamente con el proyecto original

## Revisar contenido central del Dashboard
- [x] Revisar página index del drawer original
- [x] Identificar todas las secciones y componentes del dashboard
- [x] Replicar estructura exacta del dashboard original:
  - [x] Barra de alertas (verde/roja)
  - [x] Grid 2x2 de métricas "Este Mes" con navegación de meses
  - [x] Predicciones IA con 3 indicadores circulares
  - [x] Próximas Citas
  - [x] Acciones Rápidas (6 botones terracota)
- [x] Verificar que todos los elementos coincidan
- [x] Corregir error de TypeScript

## Revisar y replicar todas las páginas del Drawer
- [ ] Revisar y replicar página de Agenda
- [ ] Revisar y replicar página de Clientes
- [ ] Revisar y replicar página de Pianos
- [ ] Revisar y replicar página de Servicios
- [ ] Revisar y replicar página de Facturación
- [ ] Revisar y replicar página de Inventario
- [ ] Revisar y replicar página de Store
- [ ] Revisar y replicar página de Reportes
- [ ] Revisar y replicar página de Accesos Rápidos
- [ ] Revisar y replicar página de Herramientas Avanzadas
- [ ] Revisar y replicar página de Configuración

## Migración detallada de la página de Clientes
- [x] Crear router tRPC de clientes en el backend con endpoints:
  - [x] getClients (con paginación y filtros)
  - [x] getClientById
  - [x] getStats (Total, Activos, VIP, Con Pianos)
  - [x] createClient
  - [x] updateClient
  - [x] deleteClient
  - [x] getFilterOptions (regiones, ciudades, grupos de ruta)
- [x] Registrar clientsRouter en routers.ts
- [x] Crear tests para el router de clientes (6/6 pasando)
- [x] Crear componente ClientCard para mostrar información del cliente
- [x] Implementar página Clientes.tsx con:
  - [x] Header azul con título y contador de clientes
  - [x] Sección de estadísticas (4 tarjetas minimalistas)
  - [x] Barra de búsqueda con placeholder completo
  - [x] Filtros (3 dropdowns: Comunidad, Ciudad, Grupo de Ruta)
  - [x] Lista de clientes con ClientCard
  - [x] Paginación (50 items por página)
  - [x] Botones de Importar/Exportar en header
  - [x] FAB (botón flotante) naranja para agregar cliente
- [x] Probar la página de Clientes en el navegador
- [x] Verificar que muestra el cliente de prueba correctamente
- [x] Verificar que las estadísticas se cargan correctamente
- [ ] Implementar formulario de creación/edición de cliente
- [ ] Implementar página de detalle de cliente
- [ ] Implementar funcionalidad de eliminación con confirmación
## Fase 6: Configurar claves de desarrollo de Clerk
- [x] Acceder al dashboard de Clerk y cambiar al entorno Development
- [x] Obtener las claves de desarrollo:
  - VITE_CLERK_PUBLISHABLE_KEY: pk_test_c2luY2VyZS1jaGltcC02My5jbGVyay5hY2NvdW50cy5kZXYk
  - CLERK_SECRET_KEY: sk_test_VXnvxqFvJdhMbWHubNG6IqH8uqkirpZo1hgpNxMegR
- [x] Configurar las claves de desarrollo en las variables de entorno del proyecto
- [x] Crear tests para validar las credenciales (3/3 pasando)
- [x] Reiniciar servidor para cargar las nuevas credenciales
- [x] Verificar que Clerk funciona correctamente sin errores de dominio
- [x] Confirmar que las claves de desarrollo NO afectan a producción
- [x] Documentar que producción seguirá usando las claves de producción en Vercel

## Fase 7: Migración detallada de la página de Servicios
- [ ] Crear router tRPC de servicios en el backend con endpoints:
  - [ ] getServices (con paginación y filtros por tipo y búsqueda)
  - [ ] getServiceById
  - [ ] getStats (estadísticas por tipo: afinaciones, mantenimiento, reparaciones, regulaciones)
  - [ ] createService
  - [ ] updateService
  - [ ] deleteService
- [ ] Registrar servicesRouter en routers.ts
- [ ] Crear tests para el router de servicios (mínimo 6 tests)
- [ ] Crear componente ServiceCard para mostrar información del servicio
- [ ] Implementar página Servicios.tsx con:
  - [ ] Grid de estadísticas por tipo (4 tarjetas: Afinaciones, Mantenimiento, Reparaciones, Regulaciones)
  - [ ] Barra de búsqueda
  - [ ] Filtros horizontales (Todos, Afinación, Mantenimiento, Reparación, Regulación)
  - [ ] Lista de servicios con ServiceCard
  - [ ] Indicador visual de servicios pasados vs futuros
  - [ ] FAB (botón flotante) para agregar servicio
- [ ] Probar la página de Servicios en el navegador
- [ ] Verificar que todos los filtros funcionan correctamente
- [ ] Verificar que las estadísticas se cargan correctamente
- [ ] Implementar formulario de creación/edición de servicio
- [ ] Implementar página de detalle de servicio
