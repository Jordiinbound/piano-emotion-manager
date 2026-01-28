# Plan de Migración Completa: GitHub → Manus PWA

**Objetivo:** Migrar el 100% de las funcionalidades del proyecto GitHub (Expo/React Native) a una PWA web responsiva en Manus.

**Fecha inicio:** 28 de enero de 2026

---

## FASE 1: Assets Visuales y PWA (ACTUAL)

### 1.1 Copiar Fuentes
- [ ] Copiar Arkhip.otf a client/public/fonts/
- [ ] Copiar Montserrat-Bold.otf a client/public/fonts/
- [ ] Copiar Montserrat-Regular.otf a client/public/fonts/
- [ ] Copiar Montserrat-SemiBold.otf a client/public/fonts/
- [ ] Copiar Arkhip_font.ttf a client/public/fonts/
- [ ] Actualizar index.html para cargar fuentes
- [ ] Actualizar index.css con @font-face declarations

### 1.2 Copiar Iconos e Imágenes
- [ ] Copiar favicon.png a client/public/
- [ ] Copiar icon.png a client/public/
- [ ] Copiar icon-192.png a client/public/
- [ ] Copiar icon-512.png a client/public/
- [ ] Copiar splash-icon.png a client/public/
- [ ] Actualizar index.html con referencias a iconos

### 1.3 Configurar PWA
- [ ] Crear manifest.json en client/public/
- [ ] Configurar service worker para PWA
- [ ] Configurar meta tags PWA en index.html
- [ ] Probar instalación PWA en móvil y desktop

---

## FASE 2: Servicios Backend Críticos

### 2.1 Email Service (Nodemailer)
- [ ] Instalar nodemailer
- [ ] Crear server/services/email.ts
- [ ] Implementar sendEmail()
- [ ] Implementar sendTemplateEmail()
- [ ] Crear plantillas de email
- [ ] Integrar con SMTP config existente
- [ ] Probar envío de emails

### 2.2 PDF Service (PDFKit)
- [ ] Instalar pdfkit
- [ ] Crear server/services/pdf.ts
- [ ] Implementar generateInvoicePDF()
- [ ] Implementar generateQuotePDF()
- [ ] Implementar generateReportPDF()
- [ ] Probar generación de PDFs

### 2.3 Excel Service (ExcelJS)
- [ ] Instalar exceljs
- [ ] Crear server/services/excel.ts
- [ ] Implementar exportToExcel()
- [ ] Implementar importFromExcel()
- [ ] Probar exportación/importación

### 2.4 QR Code Service
- [ ] Instalar qrcode
- [ ] Crear server/services/qrcode.ts
- [ ] Implementar generateQRCode()
- [ ] Integrar con facturas/presupuestos

### 2.5 Image Processing (Sharp)
- [ ] Instalar sharp
- [ ] Crear server/services/image.ts
- [ ] Implementar resizeImage()
- [ ] Implementar optimizeImage()
- [ ] Implementar convertImage()

### 2.6 WhatsApp Service (WhatsApp Personal del Cliente)
- [ ] Crear server/services/whatsapp.ts
- [ ] Implementar generateWhatsAppLink() con wa.me
- [ ] Implementar sendWhatsAppMessage() con mensajes pre-rellenados
- [ ] Implementar integración con WhatsApp Web
- [ ] Crear router whatsapp.router.ts
- [ ] Implementar detección de dispositivo (móvil/desktop)

### 2.7 Backup Service
- [ ] Crear server/services/backup.ts
- [ ] Implementar createBackup()
- [ ] Implementar restoreBackup()
- [ ] Implementar scheduleBackup()
- [ ] Configurar almacenamiento de backups en S3

---

## FASE 3: Módulos de Negocio Core

### 3.1 CRM Completo
- [ ] Copiar drizzle/schema.ts tablas CRM de GitHub
- [ ] Crear server/routers/crm/client.router.ts
- [ ] Crear server/services/crm.ts
- [ ] Implementar gestión de leads
- [ ] Implementar pipeline de ventas
- [ ] Implementar oportunidades
- [ ] Implementar actividades y tareas
- [ ] Crear client/src/pages/CRM/ (múltiples páginas)
- [ ] Crear componentes CRM
- [ ] Probar flujo completo CRM

### 3.2 Calendar Avanzado
- [ ] Instalar googleapis
- [ ] Copiar tablas calendarConnections, calendarSyncEvents, calendarSyncLog
- [ ] Crear server/routers/calendar/calendar.router.ts
- [ ] Crear server/services/calendar.ts
- [ ] Implementar integración Google Calendar
- [ ] Implementar sincronización bidireccional
- [ ] Implementar recordatorios automáticos
- [ ] Implementar disponibilidad de técnicos
- [ ] Crear client/src/pages/Calendar.tsx
- [ ] Crear componentes de calendario
- [ ] Probar sincronización Google Calendar

### 3.3 Work Orders (Órdenes de Trabajo)
- [ ] Copiar tabla workAssignments de GitHub
- [ ] Crear server/routers/workOrders.router.ts
- [ ] Crear server/services/workOrders.ts
- [ ] Implementar creación de órdenes
- [ ] Implementar asignación a técnicos
- [ ] Implementar seguimiento de estado
- [ ] Implementar historial completo
- [ ] Crear client/src/pages/WorkOrders/
- [ ] Crear componentes work orders
- [ ] Probar flujo completo

### 3.4 Timeline
- [ ] Crear server/routers/timeline.router.ts
- [ ] Crear server/services/timeline.ts
- [ ] Implementar registro de actividades
- [ ] Implementar filtros y búsqueda
- [ ] Crear client/src/pages/Timeline.tsx
- [ ] Crear componentes timeline
- [ ] Probar visualización timeline

---

## FASE 4: Módulos Avanzados

### 4.1 Contabilidad
- [ ] Copiar tablas de contabilidad de GitHub
- [ ] Crear server/routers/accounting/accounting.router.ts
- [ ] Crear server/services/accounting.ts
- [ ] Implementar libro mayor
- [ ] Implementar balance
- [ ] Implementar cuenta de resultados
- [ ] Implementar conciliación bancaria
- [ ] Crear client/src/pages/Accounting/
- [ ] Crear componentes contabilidad
- [ ] Probar módulo completo

### 4.2 Inventario Avanzado
- [ ] Copiar tablas de inventario avanzado de GitHub
- [ ] Crear server/routers/inventory/product.router.ts
- [ ] Crear server/routers/inventory/stock.router.ts
- [ ] Crear server/routers/inventory/supplier.router.ts
- [ ] Crear server/routers/inventory/warehouse.router.ts
- [ ] Crear server/services/inventory.ts
- [ ] Implementar gestión de productos
- [ ] Implementar control de stock
- [ ] Implementar gestión de proveedores
- [ ] Implementar gestión de almacenes
- [ ] Implementar alertas de stock bajo
- [ ] Crear client/src/pages/Inventory/ (múltiples páginas)
- [ ] Crear componentes inventario avanzado
- [ ] Probar módulo completo

### 4.3 Tienda Online (Shop)
- [ ] Copiar tablas de shop de GitHub
- [ ] Crear server/routers/shop/shop.router.ts
- [ ] Crear server/services/shop.ts
- [ ] Implementar catálogo de productos
- [ ] Implementar carrito de compras
- [ ] Implementar procesamiento de pedidos
- [ ] Implementar gestión de envíos
- [ ] Crear client/src/pages/Shop/
- [ ] Crear componentes tienda
- [ ] Integrar con Stripe
- [ ] Probar flujo completo e-commerce

### 4.4 Equipos (Team Management)
- [ ] Copiar tablas de equipos de GitHub
- [ ] Crear server/routers/team.router.ts
- [ ] Crear server/routers/team-extended.router.ts
- [ ] Crear server/services/team.ts
- [ ] Implementar gestión de equipos
- [ ] Implementar asignación de roles
- [ ] Implementar permisos granulares (ya existe base)
- [ ] Implementar colaboración
- [ ] Implementar ausencias (memberAbsences ya existe)
- [ ] Crear client/src/pages/Team/
- [ ] Crear componentes equipos
- [ ] Probar módulo completo

---

## FASE 5: Integraciones IA y Terceros

### 5.1 Google APIs
- [ ] Instalar googleapis
- [ ] Crear server/services/google.ts
- [ ] Implementar autenticación OAuth2 Google
- [ ] Implementar Google Calendar API
- [ ] Implementar Google Drive API
- [ ] Implementar Google Contacts API
- [ ] Probar integraciones

### 5.2 Azure/Microsoft
- [ ] Instalar @azure/identity, @azure/msal-node
- [ ] Instalar @microsoft/microsoft-graph-client
- [ ] Crear server/services/microsoft.ts
- [ ] Implementar autenticación Azure
- [ ] Implementar Microsoft Graph API
- [ ] Implementar integración Outlook Calendar
- [ ] Probar integraciones

### 5.3 Redis/Upstash (Caché)
- [ ] Instalar redis, @upstash/redis
- [ ] Crear server/services/cache.ts
- [ ] Implementar caché de sesiones
- [ ] Implementar caché de queries
- [ ] Implementar rate limiting
- [ ] Configurar Redis en producción

### 5.4 Previsión Matemática (Sustituto de IA Predicciones)
- [ ] Crear server/services/forecasting.ts
- [ ] Crear server/routers/forecasting.router.ts
- [ ] Implementar algoritmos de regresión lineal
- [ ] Implementar análisis de tendencias
- [ ] Implementar proyecciones basadas en datos históricos
- [ ] Implementar previsión de demanda (algoritmos matemáticos)
- [ ] Implementar previsión de ingresos (modelos estadísticos)
- [ ] Implementar análisis de churn (modelos matemáticos)
- [ ] Implementar recomendaciones basadas en estadísticas
- [ ] Crear client/src/pages/Forecasting/
- [ ] Crear componentes de gráficos de previsión
- [ ] Probar previsiones matemáticas

---

## FASE 6: Módulos Complementarios

### 6.1 Marketing Automation
- [ ] Copiar tablas de marketing de GitHub
- [ ] Crear server/routers/marketing.router.ts
- [ ] Crear server/services/marketing.ts
- [ ] Implementar campañas de email
- [ ] Implementar segmentación de clientes
- [ ] Implementar automatizaciones
- [ ] Implementar analytics de marketing
- [ ] Crear client/src/pages/Marketing/
- [ ] Crear componentes marketing
- [ ] Probar módulo completo

### 6.2 Workflows
- [ ] Copiar tablas de workflows de GitHub
- [ ] Crear server/routers/workflows.router.ts
- [ ] Crear server/services/workflows.ts
- [ ] Implementar motor de workflows
- [ ] Implementar triggers
- [ ] Implementar acciones personalizadas
- [ ] Implementar condiciones
- [ ] Crear client/src/pages/Workflows/
- [ ] Crear editor visual de workflows
- [ ] Probar workflows

### 6.3 Dashboard Editor
- [ ] Copiar tablas de dashboards de GitHub
- [ ] Crear server/routers/dashboard-editor.router.ts
- [ ] Crear server/services/dashboard.ts
- [ ] Implementar widgets personalizables
- [ ] Implementar drag & drop (@dnd-kit ya instalado)
- [ ] Implementar guardado de layouts
- [ ] Crear client/src/pages/DashboardEditor.tsx
- [ ] Crear componentes editor
- [ ] Probar editor visual

### 6.4 Help System
- [ ] Tablas helpItems, helpSections ya existen
- [ ] Crear server/routers/help.router.ts
- [ ] Crear server/services/help.ts
- [ ] Implementar base de conocimientos
- [ ] Implementar artículos de ayuda
- [ ] Implementar búsqueda
- [ ] Implementar categorías
- [ ] Crear client/src/pages/Help/
- [ ] Crear componentes help
- [ ] Probar sistema help

### 6.5 Reminders System
- [ ] Tabla reminders ya existe
- [ ] Crear server/routers/reminders.router.ts (copiar de GitHub)
- [ ] Crear server/services/reminders.ts
- [ ] Implementar recordatorios automáticos
- [ ] Implementar notificaciones programadas
- [ ] Implementar seguimiento
- [ ] Integrar con email service
- [ ] Integrar con WhatsApp service
- [ ] Crear client/src/pages/Reminders.tsx
- [ ] Probar recordatorios

### 6.6 Rate/Review System
- [ ] Crear tablas de valoraciones
- [ ] Crear server/routers/reviews.router.ts
- [ ] Crear server/services/reviews.ts
- [ ] Implementar valoraciones de clientes
- [ ] Implementar reseñas
- [ ] Implementar feedback
- [ ] Implementar moderación
- [ ] Crear client/src/pages/Reviews/
- [ ] Crear componentes reviews
- [ ] Probar sistema reviews

### 6.7 Import/Export System
- [ ] Crear server/routers/export.router.ts (copiar de GitHub)
- [ ] Crear server/services/import.ts
- [ ] Crear server/services/export.ts
- [ ] Implementar importación de datos
- [ ] Implementar migración desde otros sistemas
- [ ] Implementar validación de datos
- [ ] Implementar exportación Excel (usar ExcelJS)
- [ ] Implementar exportación PDF (usar PDFKit)
- [ ] Implementar exportación CSV
- [ ] Crear client/src/pages/Import.tsx
- [ ] Crear client/src/pages/Export.tsx
- [ ] Probar import/export

### 6.8 Business Info
- [ ] Tabla businessInfo ya existe
- [ ] Crear server/routers/business-info.router.ts (copiar de GitHub)
- [ ] Implementar gestión de información de negocio
- [ ] Implementar configuración de empresa
- [ ] Implementar datos fiscales
- [ ] Crear client/src/pages/BusinessInfo.tsx
- [ ] Probar configuración

### 6.9 Quote Templates
- [ ] Tabla quoteTemplates ya existe
- [ ] Crear server/routers/quote-templates.router.ts (copiar de GitHub)
- [ ] Implementar plantillas personalizables
- [ ] Implementar variables dinámicas
- [ ] Implementar preview
- [ ] Crear client/src/pages/QuoteTemplates.tsx
- [ ] Probar plantillas

### 6.10 E-Invoicing (Facturación Electrónica)
- [ ] Instalar jstoxml, node-forge
- [ ] Crear server/services/einvoicing.ts
- [ ] Crear server/routers/einvoicing.router.ts
- [ ] Implementar generación XML
- [ ] Implementar firma digital
- [ ] Implementar envío a administración
- [ ] Implementar cumplimiento legal
- [ ] Crear client/src/pages/EInvoicing/
- [ ] Probar facturación electrónica

### 6.11 Supplier Management
- [ ] Crear tablas de proveedores
- [ ] Crear server/routers/suppliers.router.ts
- [ ] Crear server/services/suppliers.ts
- [ ] Implementar gestión de proveedores
- [ ] Implementar órdenes de compra
- [ ] Implementar inventario de proveedores
- [ ] Crear client/src/pages/Suppliers/
- [ ] Probar módulo proveedores

### 6.12 Distributor Management
- [ ] Tabla distributorModuleConfig ya existe
- [ ] Crear server/routers/distributor/distributor.router.ts (copiar de GitHub)
- [ ] Crear server/services/distributor.ts
- [ ] Implementar gestión de distribuidores
- [ ] Implementar configuración de módulos
- [ ] Implementar pricing por distribuidor
- [ ] Crear client/src/pages/Distributors/
- [ ] Probar módulo distribuidores

### 6.13 Advanced Analytics & Reports
- [ ] Crear server/routers/reports/analytics.router.ts (copiar de GitHub)
- [ ] Crear server/services/analytics.ts
- [ ] Implementar dashboards personalizables
- [ ] Implementar reportes avanzados
- [ ] Implementar métricas de negocio
- [ ] Implementar exportación de datos
- [ ] Crear client/src/pages/Reports/ (múltiples páginas)
- [ ] Crear componentes analytics
- [ ] Integrar con gráficos (recharts ya instalado)
- [ ] Probar analíticas

### 6.14 Modules System
- [ ] Tabla modules ya existe
- [ ] Crear server/routers/modules.router.ts (copiar de GitHub)
- [ ] Implementar módulos dinámicos
- [ ] Implementar activación/desactivación
- [ ] Implementar configuración por módulo
- [ ] Crear client/src/pages/Modules.tsx
- [ ] Probar sistema de módulos

### 6.15 Invitations System
- [ ] Tabla invitations ya existe
- [ ] Crear server/routers/invitations.router.ts (copiar de GitHub)
- [ ] Implementar envío de invitaciones
- [ ] Implementar aceptación/rechazo
- [ ] Implementar expiración
- [ ] Integrar con email service
- [ ] Probar invitaciones

### 6.16 Portal Admin
- [ ] Crear server/routers/portal-admin.router.ts (copiar de GitHub)
- [ ] Implementar gestión de portal
- [ ] Implementar configuración de portal
- [ ] Implementar personalización
- [ ] Crear client/src/pages/PortalAdmin/
- [ ] Probar portal admin

### 6.17 Service Rates
- [ ] Tabla serviceRates ya existe
- [ ] Crear server/routers/service-rates.router.ts (copiar de GitHub)
- [ ] Implementar gestión de tarifas
- [ ] Implementar tarifas por zona
- [ ] Implementar tarifas por tipo de servicio
- [ ] Crear client/src/pages/ServiceRates.tsx
- [ ] Probar tarifas

### 6.18 Advanced Features
- [ ] Crear server/routers/advanced.router.ts (copiar de GitHub)
- [ ] Implementar funcionalidades avanzadas
- [ ] Implementar configuraciones avanzadas
- [ ] Crear client/src/pages/Advanced.tsx
- [ ] Probar funcionalidades avanzadas

### 6.19 Usage Tracking
- [ ] Tabla aiUsageTracking ya existe
- [ ] Crear server/routers/usage.router.ts (copiar de GitHub)
- [ ] Implementar tracking de uso
- [ ] Implementar métricas de uso
- [ ] Implementar límites de uso
- [ ] Crear client/src/pages/Usage.tsx
- [ ] Probar tracking

### 6.20 Seed Data
- [ ] Crear server/routers/seed.router.ts (copiar de GitHub)
- [ ] Implementar seed de datos de prueba
- [ ] Implementar reset de datos
- [ ] Probar seed

---

## FASE 7: Tests Exhaustivos

### 7.1 Tests de Routers
- [ ] Crear __tests__/routers/ (copiar estructura de GitHub)
- [ ] Crear tests para cada router
- [ ] Implementar tests de autenticación
- [ ] Implementar tests de autorización
- [ ] Implementar tests de validación
- [ ] Ejecutar todos los tests

### 7.2 Tests de Servicios
- [ ] Crear __tests__/services/ (copiar estructura de GitHub)
- [ ] Crear tests para cada servicio
- [ ] Implementar tests de integración
- [ ] Implementar tests de unidad
- [ ] Ejecutar todos los tests

### 7.3 Tests de Seguridad
- [ ] Crear __tests__/security/ (copiar estructura de GitHub)
- [ ] Implementar tests de seguridad
- [ ] Implementar tests de SQL injection
- [ ] Implementar tests de XSS
- [ ] Implementar tests de CSRF
- [ ] Ejecutar todos los tests

### 7.4 Tests de Hooks
- [ ] Crear __tests__/hooks/ (copiar estructura de GitHub)
- [ ] Crear tests para cada hook
- [ ] Ejecutar todos los tests

### 7.5 Tests de Estrés
- [ ] Copiar /stress-test de GitHub
- [ ] Implementar tests de carga
- [ ] Implementar tests de rendimiento
- [ ] Ejecutar tests de estrés

### 7.6 Coverage
- [ ] Configurar coverage con vitest
- [ ] Ejecutar tests con coverage
- [ ] Verificar coverage > 80%

---

## FASE 8: Verificación Final y Entrega

### 8.1 Verificación de Integridad
- [ ] Verificar todas las tablas migradas
- [ ] Verificar todos los routers migrados
- [ ] Verificar todos los servicios migrados
- [ ] Verificar todas las páginas migradas
- [ ] Verificar todos los componentes migrados
- [ ] Verificar todas las integraciones migradas
- [ ] Verificar todos los assets migrados

### 8.2 Pruebas End-to-End
- [ ] Probar flujo completo de clientes
- [ ] Probar flujo completo de pianos
- [ ] Probar flujo completo de servicios
- [ ] Probar flujo completo de facturación
- [ ] Probar flujo completo de CRM
- [ ] Probar flujo completo de calendario
- [ ] Probar flujo completo de inventario
- [ ] Probar flujo completo de tienda
- [ ] Probar flujo completo de equipos
- [ ] Probar todos los módulos restantes

### 8.3 Pruebas de Responsividad
- [ ] Probar en móvil (320px, 375px, 414px)
- [ ] Probar en tablet (768px, 1024px)
- [ ] Probar en desktop (1280px, 1920px)
- [ ] Probar en landscape y portrait
- [ ] Verificar PWA en móvil
- [ ] Verificar PWA en desktop

### 8.4 Pruebas de Navegadores
- [ ] Probar en Chrome
- [ ] Probar en Firefox
- [ ] Probar en Safari
- [ ] Probar en Edge
- [ ] Probar en móviles iOS
- [ ] Probar en móviles Android

### 8.5 Documentación
- [ ] Actualizar README.md
- [ ] Crear documentación de API
- [ ] Crear guía de usuario
- [ ] Crear guía de despliegue
- [ ] Crear guía de mantenimiento

### 8.6 Despliegue
- [ ] Configurar variables de entorno en producción
- [ ] Configurar Redis en producción
- [ ] Configurar backups automáticos
- [ ] Desplegar en Vercel/producción
- [ ] Verificar funcionamiento en producción
- [ ] Configurar monitoreo y alertas

### 8.7 Entrega Final
- [ ] Crear checkpoint final
- [ ] Generar informe de migración completa
- [ ] Entregar al usuario

---

## Estimación de Tiempo

**Total estimado:** 4-6 semanas de trabajo continuo

- Fase 1: 1-2 días
- Fase 2: 3-5 días
- Fase 3: 1 semana
- Fase 4: 1-2 semanas
- Fase 5: 1 semana
- Fase 6: 2-3 semanas
- Fase 7: 3-5 días
- Fase 8: 2-3 días

---

## Notas Importantes

1. **Prioridad:** Migrar funcionalidades en orden de dependencias
2. **Testing:** Probar cada módulo antes de continuar
3. **Checkpoints:** Guardar checkpoint después de cada fase
4. **Documentación:** Documentar cada módulo migrado
5. **Responsividad:** Asegurar que cada página sea responsiva
6. **PWA:** Mantener funcionalidad PWA en todo momento
7. **Performance:** Optimizar rendimiento en cada módulo
8. **Seguridad:** Implementar seguridad en cada endpoint

---

**Estado actual:** FASE 1 - Iniciando migración de assets visuales
