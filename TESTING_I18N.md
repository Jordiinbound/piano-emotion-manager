# Plan de Pruebas Exhaustivas del Sistema i18n
## Piano Emotion Manager

Este documento describe las pruebas exhaustivas que se deben realizar para validar el sistema de internacionalización completado al 100%.

---

## 1. Pruebas del Selector de Idioma

### 1.1 Funcionalidad Básica
- [ ] Verificar que el selector de idioma aparece en el header de todas las páginas
- [ ] Verificar que muestra los 9 idiomas soportados: Español, English, Français, Deutsch, Italiano, Português, Dansk, Norsk, Svenska
- [ ] Verificar que cada idioma muestra su nombre nativo y bandera correctamente
- [ ] Verificar que el idioma actual está marcado/resaltado en el selector

### 1.2 Cambio de Idioma en Tiempo Real
- [ ] Cambiar idioma y verificar que TODOS los textos de la página actual se actualizan inmediatamente sin recargar
- [ ] Verificar que el cambio de idioma persiste al navegar entre páginas
- [ ] Verificar que el cambio de idioma persiste después de recargar la página (localStorage)
- [ ] Verificar que el idioma seleccionado se guarda en el backend para usuarios autenticados

### 1.3 Detección Automática
- [ ] Verificar que al primer acceso sin idioma guardado, se detecta el idioma del navegador
- [ ] Verificar que si el idioma del navegador no está soportado, se usa español como fallback

---

## 2. Pruebas por Página (52 páginas funcionales)

### 2.1 Páginas Principales
- [ ] **Home** - Verificar título, descripción, botones de acción
- [ ] **Clientes** - Verificar encabezados de tabla, botones, filtros, mensajes vacíos
- [ ] **ClienteNuevo** - Verificar labels de formulario, placeholders, botones, mensajes de validación
- [ ] **ClienteEditar** - Verificar que carga datos y traduce labels correctamente
- [ ] **Pianos** - Verificar tabla completa, estados, botones de acción
- [ ] **PianoNuevo** - Verificar formulario extenso con todos los campos
- [ ] **PianoEditar** - Verificar edición con traducciones aplicadas
- [ ] **Servicios** - Verificar listado, filtros, búsqueda
- [ ] **ServicioNuevo** - Verificar formulario de servicios
- [ ] **ServicioEditar** - Verificar edición de servicios
- [ ] **TiposServicio** - Verificar página compleja de 719 líneas con tarifas y categorías

### 2.2 Páginas de Gestión
- [ ] **Inventario** - Verificar tabla de inventario
- [ ] **InventarioNuevo** - Verificar formulario de inventario
- [ ] **InventarioEditar** - Verificar edición de inventario
- [ ] **Facturacion** - Verificar listado de facturas
- [ ] **FacturaNueva** - Verificar formulario complejo de facturación
- [ ] **FacturaEditar** - Verificar edición de facturas
- [ ] **Presupuestos** - Verificar listado de presupuestos
- [ ] **PresupuestoNuevo** - Verificar formulario extenso (480 líneas)
- [ ] **Agenda** - Verificar calendario y citas
- [ ] **CitaNueva** - Verificar formulario de citas
- [ ] **CitaEditar** - Verificar edición de citas

### 2.3 Páginas Administrativas
- [ ] **Configuracion** - Verificar todas las opciones de configuración
- [ ] **Reportes** - Verificar gráficos y etiquetas
- [ ] **Alertas** - Verificar mensajes de alerta
- [ ] **ConfiguracionAlertas** - Verificar configuración de alertas
- [ ] **AccesosRapidos** - Verificar accesos directos
- [ ] **HerramientasAvanzadas** - Verificar herramientas avanzadas
- [ ] **Workflows** - Verificar flujos de trabajo
- [ ] **Contabilidad** - Verificar contabilidad
- [ ] **Store** - Verificar tienda

### 2.4 Sistema de Licencias y Partners
- [ ] **LicensesAdmin** - Verificar administración de licencias (217 líneas)
- [ ] **ActivationCodesAdmin** - Verificar códigos de activación (328 líneas)
- [ ] **LicenseNotifications** - Verificar notificaciones (253 líneas)
- [ ] **LicenseReminders** - Verificar recordatorios (214 líneas)
- [ ] **PartnersAdmin** - Verificar administración de partners (324 líneas)
- [ ] **PartnerDashboard** - Verificar dashboard de partners (335 líneas)
- [ ] **GlobalAnalytics** - Verificar analíticas globales (289 líneas)
- [ ] **PaymentStats** - Verificar estadísticas de pagos (319 líneas)
- [ ] **OrganizationSettings** - Verificar configuración organizacional (355 líneas)
- [ ] **RolesManagement** - Verificar gestión de roles (246 líneas)

### 2.5 Portal de Clientes
- [ ] **ClientPortalLogin** - Verificar login de clientes
- [ ] **ClientPortalRegister** - Verificar registro de clientes (227 líneas)
- [ ] **ClientPortalDashboard** - Verificar dashboard de clientes (303 líneas)
- [ ] **PayInvoice** - Verificar pago de facturas (217 líneas)
- [ ] **ActivateLicense** - Verificar activación de licencias
- [ ] **RenewalSuccess** - Verificar confirmación de renovación

### 2.6 Configuración Avanzada
- [ ] **EmailConfig** - Verificar configuración de email (332 líneas)
- [ ] **ConfiguracionSMTP** - Verificar configuración SMTP (281 líneas)

### 2.7 Páginas Especiales
- [ ] **NotFound** - Verificar página 404
- [ ] **TranslationManager** - Verificar gestor de traducciones (nueva página)

---

## 3. Pruebas de Formularios Complejos

### 3.1 Validación de Campos
- [ ] Verificar que los mensajes de error de validación están traducidos
- [ ] Verificar que los placeholders están traducidos
- [ ] Verificar que los labels de campos obligatorios están traducidos
- [ ] Verificar que los tooltips/hints están traducidos

### 3.2 Mensajes de Éxito/Error
- [ ] Crear un cliente nuevo y verificar mensaje de éxito traducido
- [ ] Editar un piano y verificar mensaje de éxito traducido
- [ ] Intentar guardar un formulario inválido y verificar errores traducidos
- [ ] Eliminar un registro y verificar mensaje de confirmación traducido

### 3.3 Selectores y Dropdowns
- [ ] Verificar que las opciones de selectores están traducidas
- [ ] Verificar que los placeholders de selectores están traducidos
- [ ] Verificar que los mensajes "No hay opciones" están traducidos

---

## 4. Pruebas de TranslationManager

### 4.1 Funcionalidad Básica
- [ ] Acceder a TranslationManager desde el menú ADMINISTRACIÓN
- [ ] Verificar que muestra las 948 claves de traducción
- [ ] Verificar que el filtro por idioma funciona correctamente
- [ ] Verificar que la búsqueda por clave/valor funciona correctamente

### 4.2 Edición de Traducciones
- [ ] Editar una traducción y verificar que se guarda correctamente
- [ ] Verificar que la traducción editada se aplica inmediatamente en la interfaz
- [ ] Verificar que no se puede guardar un valor vacío
- [ ] Verificar que se puede cancelar la edición

### 4.3 Estadísticas de Completitud
- [ ] Verificar que muestra estadísticas de completitud para los 9 idiomas
- [ ] Verificar que los porcentajes son correctos
- [ ] Verificar que los idiomas al 100% muestran el icono de check verde

### 4.4 Exportación de Traducciones
- [ ] Hacer clic en "Exportar" y verificar que descarga un archivo CSV
- [ ] Abrir el archivo CSV y verificar que contiene todas las claves
- [ ] Verificar que el CSV tiene columnas para todos los 9 idiomas
- [ ] Verificar que los valores con comas y comillas están correctamente escapados

### 4.5 Importación de Traducciones
- [ ] Modificar el archivo CSV exportado
- [ ] Hacer clic en "Importar" y seleccionar el archivo modificado
- [ ] Verificar que muestra mensaje de éxito con número de traducciones actualizadas
- [ ] Verificar que las traducciones importadas se aplican correctamente
- [ ] Intentar importar un CSV inválido y verificar mensaje de error

---

## 5. Pruebas de Rendimiento

### 5.1 Lazy Loading
- [ ] Abrir DevTools y verificar que solo se carga el archivo del idioma seleccionado
- [ ] Cambiar de idioma y verificar que se carga el nuevo archivo dinámicamente
- [ ] Verificar que los archivos de idioma se cachean en memoria
- [ ] Medir el tamaño del bundle inicial antes y después del lazy loading

### 5.2 Tiempo de Cambio de Idioma
- [ ] Medir el tiempo que tarda en cambiar de idioma (debe ser < 500ms)
- [ ] Verificar que no hay parpadeo visible durante el cambio
- [ ] Verificar que no hay errores en la consola durante el cambio

---

## 6. Pruebas de los 9 Idiomas

Repetir las siguientes pruebas para CADA uno de los 9 idiomas:

**Idiomas implementados:** Español (es), English (en), Français (fr), Deutsch (de), Italiano (it), Português (pt), Dansk (da), Norsk (no), Svenska (sv)

### 6.1 Español (es)
- [ ] Verificar Home, Clientes, Pianos, Servicios
- [ ] Verificar formularios: ClienteNuevo, PianoNuevo
- [ ] Verificar mensajes de error/éxito
- [ ] Verificar TranslationManager

### 6.2 English (en)
- [ ] Verificar Home, Clientes, Pianos, Servicios
- [ ] Verificar formularios: ClienteNuevo, PianoNuevo
- [ ] Verificar mensajes de error/éxito
- [ ] Verificar TranslationManager

### 6.3 Français (fr)
- [ ] Verificar Home, Clientes, Pianos, Servicios
- [ ] Verificar formularios: ClienteNuevo, PianoNuevo
- [ ] Verificar mensajes de error/éxito
- [ ] Verificar TranslationManager

### 6.4 Deutsch (de)
- [ ] Verificar Home, Clientes, Pianos, Servicios
- [ ] Verificar formularios: ClienteNuevo, PianoNuevo
- [ ] Verificar mensajes de error/éxito
- [ ] Verificar TranslationManager

### 6.5 Italiano (it)
- [ ] Verificar Home, Clientes, Pianos, Servicios
- [ ] Verificar formularios: ClienteNuevo, PianoNuevo
- [ ] Verificar mensajes de error/éxito
- [ ] Verificar TranslationManager

### 6.6 Português (pt)
- [ ] Verificar Home, Clientes, Pianos, Servicios
- [ ] Verificar formularios: ClienteNuevo, PianoNuevo
- [ ] Verificar mensajes de error/éxito
- [ ] Verificar TranslationManager

### 6.7 Dansk (da)
- [ ] Verificar Home, Clientes, Pianos, Servicios
- [ ] Verificar formularios: ClienteNuevo, PianoNuevo
- [ ] Verificar mensajes de error/éxito
- [ ] Verificar TranslationManager

### 6.8 Norsk (no)
- [ ] Verificar Home, Clientes, Pianos, Servicios
- [ ] Verificar formularios: ClienteNuevo, PianoNuevo
- [ ] Verificar mensajes de error/éxito
- [ ] Verificar TranslationManager

### 6.9 Svenska (sv)
- [ ] Verificar Home, Clientes, Pianos, Servicios
- [ ] Verificar formularios: ClienteNuevo, PianoNuevo
- [ ] Verificar mensajes de error/éxito
- [ ] Verificar TranslationManager

---

## 7. Pruebas de Casos Especiales

### 7.1 Traducciones Faltantes
- [ ] Eliminar temporalmente una clave de traducción
- [ ] Verificar que se muestra la clave en lugar de texto vacío
- [ ] Verificar que se registra un warning en la consola
- [ ] Verificar que se usa el fallback al idioma por defecto (español)

### 7.2 Interpolación de Variables
- [ ] Verificar traducciones con variables: "Bienvenido {{name}}"
- [ ] Verificar que las variables se reemplazan correctamente
- [ ] Verificar traducciones con múltiples variables

### 7.3 Pluralización (si aplica)
- [ ] Verificar traducciones con plurales: "1 cliente" vs "2 clientes"
- [ ] Verificar que funciona correctamente en todos los idiomas

---

## 8. Pruebas de Integración

### 8.1 Persistencia de Idioma
- [ ] Seleccionar un idioma y cerrar el navegador
- [ ] Abrir nuevamente y verificar que mantiene el idioma seleccionado
- [ ] Limpiar localStorage y verificar que detecta el idioma del navegador

### 8.2 Sincronización con Backend
- [ ] Cambiar idioma estando autenticado
- [ ] Cerrar sesión y volver a iniciar sesión
- [ ] Verificar que el idioma se mantiene (guardado en backend)

### 8.3 Múltiples Pestañas
- [ ] Abrir la aplicación en dos pestañas
- [ ] Cambiar idioma en una pestaña
- [ ] Verificar que la otra pestaña se actualiza automáticamente (si aplica)

---

## 9. Pruebas de Accesibilidad

### 9.1 Lectores de Pantalla
- [ ] Verificar que el selector de idioma es accesible con teclado
- [ ] Verificar que los labels de formulario están correctamente asociados
- [ ] Verificar que los mensajes de error son anunciados por lectores de pantalla

### 9.2 Navegación con Teclado
- [ ] Navegar por el selector de idioma solo con teclado (Tab, Enter, Flechas)
- [ ] Verificar que el foco es visible en todo momento
- [ ] Verificar que se puede cambiar idioma sin usar el mouse

---

## 10. Pruebas de Regresión

### 10.1 Funcionalidad Existente
- [ ] Verificar que todas las funcionalidades existentes siguen funcionando
- [ ] Verificar que no hay errores en la consola
- [ ] Verificar que no hay warnings inesperados

### 10.2 Rendimiento General
- [ ] Verificar que la aplicación carga en tiempo razonable
- [ ] Verificar que no hay lag al navegar entre páginas
- [ ] Verificar que el uso de memoria es normal

---

## Resumen de Cobertura

- **Total de páginas traducidas:** 52 páginas funcionales
- **Total de claves de traducción:** 948 claves
- **Idiomas soportados:** 9 idiomas (es, en, fr, de, it, pt, da, no, sv)
- **Líneas de código traducidas:** ~15,000 líneas en 52 archivos
- **Optimizaciones implementadas:** Lazy loading, caché en memoria, exportación/importación CSV

---

## Criterios de Aceptación

✅ **El sistema i18n se considera completamente funcional si:**

1. Todas las 52 páginas funcionales muestran textos traducidos correctamente en los 9 idiomas
2. El cambio de idioma es instantáneo y sin errores
3. Las traducciones persisten después de recargar la página
4. TranslationManager permite editar, exportar e importar traducciones sin errores
5. No hay claves faltantes en ningún idioma
6. Los mensajes de error/éxito están traducidos en todos los formularios
7. El rendimiento de la aplicación no se ve afectado negativamente
8. No hay errores en la consola del navegador relacionados con i18n

---

## Notas Adicionales

- Este documento debe actualizarse si se agregan nuevas páginas o funcionalidades
- Se recomienda realizar estas pruebas en diferentes navegadores (Chrome, Firefox, Safari, Edge)
- Se recomienda realizar estas pruebas en diferentes dispositivos (desktop, tablet, móvil)
- Cualquier error encontrado debe ser reportado con capturas de pantalla y pasos para reproducir
