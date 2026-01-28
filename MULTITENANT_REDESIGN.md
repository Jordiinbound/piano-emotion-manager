# Rediseño del Sistema Multi-Tenant
## Piano Emotion Manager - Modelo de Negocio Real

---

## 📋 Modelo de Negocio

### Cadena de Valor
```
Fabricantes/Distribuidores (Partners)
    ↓ venden licencias a
Técnicos Individuales o Empresas de Técnicos
    ↓ prestan servicios a
Clientes Finales (propietarios de pianos)
```

### Tipos de Usuarios

1. **Técnicos Individuales**
   - Compran licencia directamente de Piano Emotion
   - Trabajan solos
   - Tienen sus propios: clientes, pianos, inventario, facturas
   - Store integrada: ecommerce de Piano Emotion

2. **Empresas de Técnicos (Organizaciones)**
   - Compran licencias directamente de Piano Emotion
   - Tienen múltiples técnicos empleados
   - Permisos configurables por el administrador
   - Pueden compartir: clientes, pianos, inventario, agenda
   - Store integrada: ecommerce de Piano Emotion

3. **Fabricantes/Distribuidores (Partners)**
   - Compran paquetes de licencias en bloque
   - Revenden o ceden licencias a técnicos
   - Tienen su propio ecommerce integrado en la app
   - NO comparten datos con sus clientes
   - NO ven estadísticas de uso de sus clientes

---

## 🗄️ Esquema de Base de Datos Propuesto

### 1. Tabla `users` (ya existe)
Usuarios individuales del sistema (técnicos, administradores de organizaciones)

```typescript
users {
  id: int
  clerkId: string
  email: string
  name: string
  role: 'admin' | 'user'
  // ... otros campos existentes
}
```

### 2. Tabla `organizations` (ya existe, mantener)
Empresas de técnicos con múltiples empleados

```typescript
organizations {
  id: int
  name: string
  slug: string
  ownerId: int → users.id
  subscriptionPlan: enum
  maxMembers: int
  // ... campos existentes
}
```

### 3. Tabla `organizationMembers` (ya existe, mantener)
Técnicos empleados de una organización

```typescript
organizationMembers {
  id: int
  organizationId: int → organizations.id
  userId: int → users.id
  role: 'owner' | 'admin' | 'technician'
  permissions: json // permisos específicos
}
```

### 4. Tabla `organizationSettings` (NUEVA)
Configuración de permisos compartidos de una organización

```typescript
organizationSettings {
  id: int
  organizationId: int → organizations.id
  
  // Permisos de compartición
  shareClients: boolean
  sharePianos: boolean
  shareInventory: boolean
  shareAgenda: boolean
  shareInvoices: boolean
  shareQuotes: boolean
  
  // Permisos de visibilidad
  membersCanViewOthersClients: boolean
  membersCanEditOthersClients: boolean
  membersCanViewOthersServices: boolean
  membersCanViewOthersInvoices: boolean
  
  // Configuración de asignación de trabajos
  autoAssignServices: boolean
  requireApprovalForInvoices: boolean
  
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 5. Tabla `partners` (REDISEÑAR COMPLETAMENTE)
Fabricantes y distribuidores que venden licencias

**Cambios:**
- Eliminar campos relacionados con técnicos (businessMode, emailClientPreference, etc.)
- Agregar campos relacionados con venta de licencias

```typescript
partners {
  id: int
  name: string
  slug: string
  email: string
  
  // Tipo de partner
  partnerType: 'manufacturer' | 'distributor'
  
  // Branding
  logo: text
  primaryColor: string
  secondaryColor: string
  brandName: string
  
  // Ecommerce
  ecommerceUrl: string
  ecommerceApiKey: string (encrypted)
  ecommerceType: 'woocommerce' | 'shopify' | 'custom' | null
  
  // Datos fiscales
  legalName: string
  taxId: string
  address: text
  city: string
  postalCode: string
  country: string
  
  // Contacto
  contactName: string
  contactEmail: string
  contactPhone: string
  
  // Estado
  status: 'active' | 'suspended' | 'inactive'
  
  // Licencias
  totalLicensesPurchased: int
  licensesAvailable: int
  licensesAssigned: int
  
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 6. Tabla `licenses` (NUEVA)
Licencias de uso de la aplicación

```typescript
licenses {
  id: int
  
  // A quién pertenece la licencia
  userId: int → users.id (nullable)
  organizationId: int → organizations.id (nullable)
  // Uno de los dos debe estar presente
  
  // Origen de la licencia
  licenseType: 'direct' | 'partner'
  partnerId: int → partners.id (nullable, solo si licenseType = 'partner')
  activationCodeId: int → activationCodes.id (nullable)
  
  // Estado
  status: 'active' | 'expired' | 'suspended' | 'cancelled'
  
  // Fechas
  activatedAt: timestamp
  expiresAt: timestamp
  renewsAt: timestamp
  
  // Facturación
  billingCycle: 'monthly' | 'yearly'
  price: decimal
  currency: string
  
  // Store integrada
  storeUrl: string // URL del ecommerce (Piano Emotion o del partner)
  storePartnerId: int → partners.id (nullable)
  
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 7. Tabla `activationCodes` (NUEVA)
Códigos de activación generados por partners

```typescript
activationCodes {
  id: int
  partnerId: int → partners.id
  
  // Código
  code: string (unique, ej: "PIANO-ACME-XYZ123")
  
  // Tipo
  codeType: 'single_use' | 'multi_use'
  maxUses: int (nullable, solo para multi_use)
  usesCount: int
  
  // Estado
  status: 'active' | 'used' | 'expired' | 'revoked'
  
  // Configuración de licencia
  billingCycle: 'monthly' | 'yearly'
  durationMonths: int
  
  // Fechas
  expiresAt: timestamp (nullable)
  
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 8. Tabla `licenseTransactions` (NUEVA)
Historial de compras y renovaciones de licencias

```typescript
licenseTransactions {
  id: int
  licenseId: int → licenses.id
  
  // Tipo de transacción
  transactionType: 'purchase' | 'renewal' | 'upgrade' | 'downgrade' | 'cancellation'
  
  // Montos
  amount: decimal
  currency: string
  
  // Pago
  paymentMethod: 'stripe' | 'invoice' | 'partner'
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  stripePaymentIntentId: string (nullable)
  
  // Fechas
  transactionDate: timestamp
  
  createdAt: timestamp
}
```

---

## 🔄 Cambios Necesarios

### Tablas a MANTENER
- ✅ `users`
- ✅ `organizations`
- ✅ `organizationMembers`

### Tablas a CREAR
- ➕ `organizationSettings`
- ➕ `licenses`
- ➕ `activationCodes`
- ➕ `licenseTransactions`

### Tablas a REDISEÑAR
- 🔄 `partners` (cambiar de técnicos colaboradores a vendedores de licencias)

### Tablas a ELIMINAR
- ❌ `technicianMetrics` (no aplica al modelo de negocio)
- ❌ `partnerPricing` (reemplazado por sistema de licencias)

---

## 🔌 Routers tRPC Necesarios

### Routers a MANTENER
- ✅ `organizations.router.ts` (agregar endpoints de settings)

### Routers a CREAR
- ➕ `licenses.router.ts`
- ➕ `activationCodes.router.ts`
- ➕ `partners.router.ts` (reescribir completamente)

### Routers a ELIMINAR
- ❌ `technicianMetrics.router.ts`

---

## 🎯 Flujos de Usuario

### Flujo 1: Técnico Individual (Compra Directa)
1. Técnico se registra en pianoemotion.com
2. Selecciona plan (mensual/anual)
3. Paga con Stripe
4. Se crea `license` con `licenseType = 'direct'`
5. `storeUrl` = ecommerce de Piano Emotion
6. Empieza a usar la app

### Flujo 2: Empresa de Técnicos (Compra Directa)
1. Administrador se registra
2. Crea organización
3. Selecciona plan y número de licencias
4. Paga con Stripe
5. Se crean N `licenses` con `organizationId`
6. Invita técnicos empleados
7. Configura permisos en `organizationSettings`
8. Técnicos empiezan a trabajar

### Flujo 3: Técnico con Código de Partner
1. Fabricante/Distribuidor compra paquete de licencias
2. Piano Emotion genera códigos de activación
3. Partner entrega código a su cliente (técnico)
4. Técnico se registra con código
5. Se crea `license` con `licenseType = 'partner'` y `partnerId`
6. `storeUrl` = ecommerce del partner
7. Técnico usa la app con store del partner integrada

---

## 🔐 Permisos y Aislamiento

### Aislamiento de Datos
- Cada `user` solo ve sus propios datos
- Cada `organization` solo ve sus propios datos
- Los `partners` NO ven datos de sus clientes
- Los técnicos con licencia de partner NO comparten datos con el partner

### Permisos en Organizaciones
- Configurables por el administrador en `organizationSettings`
- Pueden compartir o aislar: clientes, pianos, inventario, agenda, facturas
- Roles: owner, admin, technician
- Permisos granulares por recurso

---

## 📊 Métricas y Analytics

### Para Piano Emotion (interno)
- Total de licencias activas
- Licencias directas vs partner
- Revenue por tipo de licencia
- Tasa de renovación
- Partners más activos

### Para Partners
- ❌ NO tienen acceso a métricas de sus clientes
- Solo ven: licencias compradas, disponibles, asignadas
- Pueden generar códigos de activación

### Para Técnicos/Organizaciones
- Sus propias métricas de negocio
- Estadísticas de servicios, ingresos, clientes
- NO ven información del partner que les vendió

---

## ✅ Validación del Modelo

Este modelo cumple con:
- ✅ Aislamiento total de datos entre clientes finales
- ✅ Partners como vendedores, no como colaboradores
- ✅ Sistema de licencias flexible (directo o partner)
- ✅ Permisos configurables para organizaciones
- ✅ Integración de ecommerce por partner
- ✅ Pedidos automáticos a la store configurada
- ✅ Escalable para miles de técnicos
- ✅ Modelo híbrido de facturación

---

## 🚀 Plan de Implementación

1. **Fase 1:** Crear nuevas tablas en schema.ts
2. **Fase 2:** Migrar datos existentes (si hay)
3. **Fase 3:** Rediseñar partners.router.ts
4. **Fase 4:** Crear licenses.router.ts
5. **Fase 5:** Crear activationCodes.router.ts
6. **Fase 6:** Actualizar organizations.router.ts
7. **Fase 7:** Eliminar technicianMetrics.router.ts
8. **Fase 8:** Crear interfaces de usuario
9. **Fase 9:** Probar flujos completos
10. **Fase 10:** Documentar y entregar
