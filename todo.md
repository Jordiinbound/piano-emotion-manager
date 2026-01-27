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
- [x] Crear router tRPC de servicios en el backend con endpoints:
  - [x] getServices (con paginación y filtros por tipo y búsqueda)
  - [x] getServiceById
  - [x] getStats (estadísticas por tipo: afinaciones, mantenimiento, reparaciones, regulaciones)
  - [x] createService con generación automática de odId
  - [x] updateService
  - [x] deleteService
- [x] Registrar servicesRouter en routers.ts
- [x] Crear tests para el router de servicios (8/8 pasando)
- [x] Crear componente ServiceCard para mostrar información del servicio
- [x] Implementar página Servicios.tsx con:
  - [x] Grid de estadísticas por tipo (4 tarjetas: Afinaciones, Mantenimiento, Reparaciones, Regulaciones)
  - [x] Barra de búsqueda con placeholder
  - [x] Filtros horizontales (Todos, Afinación, Mantenimiento, Reparación, Regulación)
  - [x] Lista de servicios con ServiceCard
  - [x] Indicador visual de servicios pasados vs futuros (badge "Completado")
  - [x] FAB (botón flotante) naranja para agregar servicio
- [x] Corregir error de enlaces anidados en Layout
- [x] Probar la página de Servicios en el navegador
- [x] Verificar que todos los filtros se muestran correctamente
- [x] Verificar que las estadísticas se cargan correctamente (12 servicios, 3 de cada tipo)
- [ ] Implementar formulario de creación/edición de servicio
- [ ] Implementar página de detalle de servicio

## Fase 8: Migración detallada de la página de Pianos
- [x] Crear router tRPC de pianos en el backend con endpoints:
  - [x] getPianos (con paginación y filtros por categoría y búsqueda)
  - [x] getPianoById
  - [x] getStats (estadísticas por categoría: verticales, de cola)
  - [x] createPiano con generación automática de odId y pianoType
  - [x] updatePiano
  - [x] deletePiano
- [x] Registrar pianosRouter en routers.ts
- [x] Crear tests para el router de pianos (8/8 pasando)
- [x] Crear componente PianoCard para mostrar información del piano
- [x] Implementar página Pianos.tsx con:
  - [x] Grid de estadísticas (2 tarjetas: Verticales, De Cola)
  - [x] Barra de búsqueda con placeholder
  - [x] Filtros horizontales (Todos, Verticales, De Cola)
  - [x] Lista de pianos con PianoCard
  - [x] FAB (botón flotante) naranja para agregar piano
- [x] Probar la página de Pianos en el navegador
- [x] Verificar que todos los filtros funcionan correctamente
- [x] Verificar que las estadísticas se cargan correctamente (3 verticales, 0 de cola)
- [ ] Implementar formulario de creación/edición de piano
- [ ] Implementar página de detalle de piano

## Fase 9: Migración detallada de la página de Agenda
- [x] Crear router tRPC de appointments en el backend con endpoints:
  - [x] getAppointments (con paginación y filtros por fecha y estado)
  - [x] getAppointmentById
  - [x] getStats (estadísticas: total, confirmadas, programadas, completadas)
  - [x] createAppointment con generación automática de odId
  - [x] updateAppointment
  - [x] deleteAppointment
  - [x] getUpcomingAppointments (próximas citas agrupadas por fecha)
- [x] Registrar appointmentsRouter en routers.ts
- [x] Crear tests para el router de appointments (8/8 pasando)
- [x] Crear componente AppointmentCard para mostrar información de la cita
- [x] Implementar página Agenda.tsx con:
  - [x] Grid de estadísticas (4 tarjetas: Total, Programadas, Confirmadas, Completadas)
  - [x] Filtros horizontales (Todas, Programadas, Confirmadas, Completadas, Canceladas)
  - [x] Lista de citas agrupadas por fecha (Hoy, Mañana, Futuras)
  - [x] Tarjetas de cita con hora, cliente, piano, estado y duración
  - [x] Badges de estado con colores (programada, confirmada, completada, cancelada)
  - [x] FAB (botón flotante) naranja para agregar cita
- [x] Probar la página de Agenda en el navegador
- [x] Verificar que todos los filtros funcionan correctamente
- [x] Verificar que las estadísticas se cargan correctamente (0 citas porque DB está vacía)
- [ ] Implementar formulario de creación/edición de cita
- [ ] Implementar página de detalle de cita

## Fase 10: Migración detallada de la página de Facturación
- [x] Crear router tRPC de invoices en el backend con endpoints:
  - [x] getInvoices (con paginación y filtros por estado, fecha y búsqueda)
  - [x] getInvoiceById
  - [x] getStats (estadísticas: total, pendiente, cobrado, borradores)
  - [x] createInvoice con generación automática de odId e invoiceNumber
  - [x] updateInvoice
  - [x] deleteInvoice
- [x] Registrar invoicesRouter en routers.ts
- [x] Crear tests para el router de invoices (9/9 pasando)
- [x] Crear componente InvoiceCard para mostrar información de la factura
- [x] Implementar página Facturacion.tsx con:
  - [x] Grid de estadísticas (4 tarjetas: Total, Pendiente, Cobrado, Borradores)
  - [x] Barra de búsqueda por número de factura o cliente
  - [x] Filtros por estado (Todas, Borrador, Enviada, Pagada, Anulada)
  - [x] Filtros por período (Todo, Este mes, Mes anterior, Este año)
  - [x] Grid de facturas con número, cliente, fecha, estado y total
  - [x] Badges de estado con colores (borrador, enviada, pagada, anulada)
  - [x] FAB (botón flotante) naranja para agregar factura
- [x] Probar la página de Facturación en el navegador
- [x] Verificar que todos los filtros funcionan correctamente
- [x] Verificar que las estadísticas se cargan correctamente (€0.00 porque DB está vacía)

## Fase 11: Migración detallada de la página de Inventario
- [x] Crear router tRPC de inventory en el backend con endpoints:
  - [x] getInventory (con paginación y filtros por categoría, stock bajo y búsqueda)
  - [x] getInventoryById
  - [x] getStats (estadísticas: total items, stock bajo, categorías)
  - [x] getLowStockItems (items con quantity <= minStock)
  - [x] createInventoryItem con generación automática de odId
  - [x] updateInventoryItem
  - [x] deleteInventoryItem
- [x] Registrar inventoryRouter en routers.ts
- [x] Crear tests para el router de inventory (mínimo 8 tests)
- [x] Crear componente InventoryCard para mostrar información del item
- [x] Implementar página Inventario.tsx con:
  - [x] Grid de estadísticas (Total Items, Stock Bajo, Categorías)
  - [x] Barra de búsqueda por nombre, descripción o proveedor
  - [x] Filtros por categoría (Todos, Stock Bajo, Cuerdas, Martillos, Fieltros, Herramientas, etc.)
  - [x] Lista de items con nombre, categoría, stock, stock mínimo, precio y proveedor
  - [x] Badges de alerta para stock bajo (quantity <= minStock)
  - [x] FAB (botón flotante) naranja para agregar item
- [x] Probar la página de Inventario en el navegador
- [x] Verificar que todos los filtros funcionan correctamente
- [x] Verificar que las estadísticas se cargan correctamente

## Corrección de error: Anchor anidado
- [ ] Identificar dónde está el error de `<a>` anidado en el código
- [ ] Corregir el error eliminando el anchor anidado
- [ ] Verificar que el error se ha resuelto en el navegador
## Corrección de error: Anchor anidado
- [x] Identificar dónde está el error de `<a>` anidado en el código
- [x] Corregir el error eliminando el anchor anidado
- [x] Verificar que el error se ha resuelto en el navegador

## Fase 12: Página de Store (versión simplificada)
- [x] Crear página Store.tsx con diseño elegante de "Próximamente"
- [x] Incluir categorías de productos (Macillos, Cuerdas, Fieltros, Herramientas, etc.)
- [x] Mensaje explicativo sobre el catálogo premium en preparación
- [x] Diseño minimalista y profesional acorde al resto de la aplicación

## Fase 13: Página de Reportes con estadísticas
- [x] Crear página Reportes.tsx con diseño de analytics
- [x] Grid de métricas principales (Servicios, Ingresos, Clientes, Pianos)
- [x] Indicadores circulares de predicciones IA (placeholder)
- [x] Sección de tendencias mensuales
- [x] Diseño profesional y minimalista acorde al resto de la aplicación

## Fase 14: Páginas finales (Accesos Rápidos, Herramientas Avanzadas, Configuración)
- [x] Revisar página quick-access.tsx del proyecto original
- [x] Crear página AccesosRapidos.tsx con diseño minimalista
- [x] Revisar página advanced-tools.tsx del proyecto original
- [x] Crear página HerramientasAvanzadas.tsx con diseño minimalista
- [x] Revisar página settings.tsx del proyecto original
- [x] Crear página Configuracion.tsx con diseño minimalista
- [x] Verificar funcionamiento de las 3 páginas en el navegador
- [x] Guardar checkpoint final con todas las páginas completadas


## Fase 15: Formularios modales completos

### Componentes base de formularios
- [x] Instalar react-hook-form y zod para validación
- [ ] Crear componente Dialog reutilizable con shadcn/ui
- [ ] Crear componente FormField reutilizable con validación

### Formularios de Clientes
- [x] Crear ClientFormModal con campos (nombre, email, teléfono, dirección)
- [ ] Integrar con trpc.clients.createClient y updateClient
- [ ] Agregar validación Zod y manejo de errores
- [ ] Integrar modal en página Clientes con botón "Nuevo Cliente"

### Formularios de Servicios
- [x] Crear ServiceFormModal con campos (tipo, descripción, precio, duración)
- [ ] Integrar con trpc.services.createService y updateService
- [ ] Agregar validación Zod y manejo de errores
- [ ] Integrar modal en página Servicios con botón "Nuevo Servicio"

### Formularios de Pianos
- [x] Crear PianoFormModal con campos (marca, modelo, tipo, categoría, condición, ubicación)
- [ ] Integrar con trpc.pianos.createPiano y updatePiano
- [ ] Agregar validación Zod y manejo de errores
- [ ] Integrar modal en página Pianos con botón "Nuevo Piano"

### Formularios de Citas
- [ ] Crear AppointmentFormModal con campos (fecha, cliente, piano, servicio, duración, estado)
- [ ] Integrar con trpc.appointments.createAppointment y updateAppointment
- [ ] Agregar validación Zod y manejo de errores
- [ ] Integrar modal en página Agenda con botón "Nueva Cita"

### Formularios de Facturas
- [ ] Crear InvoiceFormModal con campos (cliente, items, fecha, vencimiento, notas)
- [ ] Integrar con trpc.invoices.createInvoice y updateInvoice
- [ ] Agregar validación Zod y manejo de errores
- [ ] Integrar modal en página Facturación con botón "Nueva Factura"

### Formularios de Inventario
- [ ] Crear InventoryFormModal con campos (nombre, categoría, cantidad, unidad, precio, proveedor)
- [ ] Integrar con trpc.inventory.createItem y updateItem
- [ ] Agregar validación Zod y manejo de errores
- [ ] Integrar modal en página Inventario con botón "Nuevo Item"

### Funcionalidad de eliminación
- [ ] Crear DeleteConfirmModal reutilizable
- [ ] Agregar botón de eliminar en ClientCard con confirmación
- [ ] Agregar botón de eliminar en ServiceCard con confirmación
- [ ] Agregar botón de eliminar en PianoCard con confirmación
- [ ] Agregar botón de eliminar en AppointmentCard con confirmación
- [ ] Agregar botón de eliminar en InvoiceCard con confirmación
- [ ] Agregar botón de eliminar en InventoryCard con confirmación

### Testing y verificación
- [ ] Verificar funcionamiento de todos los formularios en el navegador
- [ ] Verificar validación de campos obligatorios
- [ ] Verificar manejo de errores y feedback visual
- [ ] Guardar checkpoint con formularios completos

## Fase 16: Funcionalidad de edición y eliminación
- [ ] Modal de confirmación de eliminación reutilizable
- [ ] Botones editar/eliminar en ClientCard
- [ ] Botones editar/eliminar en ServiceCard
- [ ] Botones editar/eliminar en PianoCard
- [ ] Botones editar/eliminar en AppointmentCard
- [ ] Botones editar/eliminar en InvoiceCard
- [ ] Botones editar/eliminar en InventoryCard
- [ ] Integración de modales de edición en todas las páginas
- [ ] Pruebas de edición y eliminación en todas las entidades

## Fase 16: Funcionalidad de edición y eliminación - COMPLETADA ✅
- [x] Modal de confirmación de eliminación reutilizable (DeleteConfirmModal)
- [x] Botones de editar y eliminar en ClientCard con mutación tRPC
- [x] Botones de editar y eliminar en ServiceCard con mutación tRPC
- [x] Botones de editar y eliminar en PianoCard con mutación tRPC
- [x] Botones de editar y eliminar en AppointmentCard con mutación tRPC
- [x] Botones de editar y eliminar en InvoiceCard con mutación tRPC
- [x] Botones de editar y eliminar en InventoryCard con mutación tRPC
- [x] Integración completa en todas las páginas con modales de edición y eliminación
- [x] Actualización optimista de queries tras eliminación exitosa


## Fase 17: Sistema de autenticación real con Clerk
- [ ] Revisar configuración actual de Clerk y credenciales disponibles
- [ ] Instalar dependencias de Clerk (@clerk/clerk-react)
- [ ] Configurar ClerkProvider en el frontend
- [ ] Implementar componentes de autenticación (SignIn, SignUp, UserButton)
- [ ] Proteger rutas con middleware de autenticación
- [ ] Actualizar backend para validar tokens de Clerk
- [ ] Implementar gestión de roles (admin/user)
- [ ] Verificar funcionamiento completo del sistema de autenticación

## Fase 17: Sistema de autenticación con Clerk - ✅ COMPLETADO
- [x] Instalar @clerk/backend para validación de tokens en el servidor
- [x] Crear archivo clerkAuth.ts con funciones de autenticación de Clerk
- [x] Actualizar context.ts para usar autenticación de Clerk
- [x] Crear componente ProtectedRoute para proteger rutas en el frontend
- [x] Actualizar App.tsx para envolver todas las rutas protegidas con ProtectedRoute
- [x] Actualizar useAuth para incluir el rol del usuario desde el backend
- [x] Verificar funcionamiento completo del sistema de autenticación con Clerk


## Fase 16: Implementar formularios CRUD para todos los módulos

[x] Identificar páginas de formularios faltantes (12 páginas: 6 crear + 6 editar)
[x] Crear página /clientes/nuevo (formulario de creación)

### Clientes
- [ ] Crear página /clientes/nuevo (formulario de creación)
- [ ] Crear página /clientes/[id]/editar (formulario de edición)
- [ ] Agregar rutas en App.tsx para formularios de clientes

### Pianos
- [ ] Crear página /pianos/nuevo (formulario de creación)
- [ ] Crear página /pianos/[id]/editar (formulario de edición)
- [ ] Agregar rutas en App.tsx para formularios de pianos

### Servicios
- [ ] Crear página /servicios/nuevo (formulario de creación)
- [ ] Crear página /servicios/[id]/editar (formulario de edición)
- [ ] Agregar rutas en App.tsx para formularios de servicios

### Citas (Agenda)
- [ ] Crear página /agenda/nuevo (formulario de creación)
- [ ] Crear página /agenda/[id]/editar (formulario de edición)
- [ ] Agregar rutas en App.tsx para formularios de citas

### Facturas
- [ ] Crear página /facturacion/nuevo (formulario de creación)
- [ ] Crear página /facturacion/[id]/editar (formulario de edición)
- [ ] Agregar rutas en App.tsx para formularios de facturas

### Inventario
- [ ] Crear página /inventario/nuevo (formulario de creación)
- [ ] Crear página /inventario/[id]/editar (formulario de edición)
- [ ] Agregar rutas en App.tsx para formularios de inventario

## Fase 17: Pruebas CRUD completas

- [ ] Probar creación de cliente
- [ ] Probar edición de cliente
- [ ] Probar eliminación de cliente
- [ ] Probar creación de piano
- [ ] Probar edición de piano
- [ ] Probar eliminación de piano
- [ ] Probar creación de servicio
- [ ] Probar edición de servicio
- [ ] Probar eliminación de servicio
- [ ] Probar creación de cita
- [ ] Probar edición de cita
- [ ] Probar eliminación de cita
- [ ] Probar creación de factura
- [ ] Probar edición de factura
- [ ] Probar eliminación de factura
- [ ] Probar creación de item de inventario
- [ ] Probar edición de item de inventario
- [ ] Probar eliminación de item de inventario

## Stripe Integration Issues (URGENTE)
- [x] Corregir error de autenticación que redirige a /sign-in al hacer clic en botón Pagar
- [x] Verificar que el middleware de autenticación funciona correctamente con tRPC
- [x] Probar flujo completo de pago con Stripe Checkout
- [x] Verificar que el webhook actualiza el estado de la factura correctamente


## Stripe Payment Flow Issue (CRÍTICO)
- [x] Botón "Pagar" redirige al dashboard en lugar de abrir Stripe Checkout
- [x] Revisar logs del servidor para identificar errores
- [x] Verificar que el handler onPay se está ejecutando correctamente
- [x] Agregar logs de depuración en el flujo completo
- [x] Verificar que la mutación createCheckoutSession devuelve la URL correctamente
- [x] Corregir campo partnerId en TiDB con valor por defecto
