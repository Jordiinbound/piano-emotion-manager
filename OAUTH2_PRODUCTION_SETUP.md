# Configuración de OAuth2 para Producción

Este documento explica cómo configurar las URIs de redirección de OAuth2 en Google Cloud Console y Azure AD cuando despliegues el proyecto en producción con un dominio personalizado.

## URLs Actuales

### Producción
- **Frontend**: https://www.pianoemotion.com
- **Gmail OAuth2 Callback**: https://www.pianoemotion.com/api/oauth/gmail/callback
- **Outlook OAuth2 Callback**: https://www.pianoemotion.com/api/oauth/outlook/callback

## 1. Configurar Gmail OAuth2 (Google Cloud Console)

1. Ve a https://console.cloud.google.com/
2. Selecciona tu proyecto → APIs & Services → Credentials
3. Edita tu OAuth 2.0 Client ID
4. En Authorized redirect URIs, agrega: https://www.pianoemotion.com/api/oauth/gmail/callback
5. Haz clic en Save

**Nota**: Google permite múltiples URIs, puedes mantener desarrollo y producción activas.

## 2. Configurar Outlook OAuth2 (Azure AD)

1. Ve a https://portal.azure.com/
2. Azure Active Directory → App registrations → Tu aplicación
3. Authentication → Platform configurations → Web
4. Actualiza la URI con: https://www.pianoemotion.com/api/oauth/outlook/callback
5. Haz clic en Save

**Limitación**: Azure AD (plan gratuito) solo permite 1 URI de redirección.

## 3. Credenciales Configuradas

### Gmail OAuth2
- Client ID: 140609149363-cbsv36hcob5kk5abrt8qji277n93s95n.apps.googleusercontent.com
- Client Secret: Configurado en variables de entorno

### Outlook OAuth2
- Application ID: 226c0b38-9cb0-45e0-84a3-d349f5343016
- Client Secret: Configurado en variables de entorno

## 4. Probar en Producción

1. Despliega el proyecto en https://www.pianoemotion.com
2. Ve a /configuracion/email
3. Haz clic en "Conectar con Gmail" o "Conectar con Outlook"
4. Autoriza la aplicación
5. Envía un email de prueba desde /facturacion

