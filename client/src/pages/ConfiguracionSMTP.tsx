/**
 * SMTP Configuration Page
 * Piano Emotion Manager
 */

import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Mail, Server, Lock, User, ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/use-translation';

export default function ConfiguracionSMTP() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    smtpSecure: false,
    smtpFromName: '',
  });

  // Obtener configuración actual del usuario
  const { data: userData, isLoading } = trpc.auth.me.useQuery();

  useEffect(() => {
    if (userData && userData.smtpHost) {
      setFormData({
        smtpHost: userData.smtpHost || '',
        smtpPort: userData.smtpPort || 587,
        smtpUser: userData.smtpUser || '',
        smtpPassword: '', // No mostrar la contraseña por seguridad
        smtpSecure: userData.smtpSecure === 1,
        smtpFromName: userData.smtpFromName || '',
      });
    }
  }, [userData]);

  // Mutación para actualizar configuración SMTP
  const updateSmtpMutation = trpc.users.updateSmtpConfig.useMutation({
    onSuccess: () => {
      toast.success(t('smtpConfig.smtpConfigurationSaved'), {
        description: t('smtpConfig.nowYouCanSendInvoices'),
      });
    },
    onError: (error: any) => {
      toast.error(t('smtpConfig.errorSavingConfiguration'), {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.smtpHost || !formData.smtpUser) {
      toast.error(t('smtpConfig.pleaseCompleteRequiredFields'));
      return;
    }

    // Si no hay contraseña nueva, no la incluimos en la actualización
    const dataToSend: any = {
      smtpHost: formData.smtpHost,
      smtpPort: formData.smtpPort,
      smtpUser: formData.smtpUser,
      smtpSecure: formData.smtpSecure,
      smtpFromName: formData.smtpFromName,
    };

    // Solo incluir contraseña si se ingresó una nueva
    if (formData.smtpPassword) {
      dataToSend.smtpPassword = formData.smtpPassword;
    }

    updateSmtpMutation.mutate(dataToSend);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e07a5f] mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/configuracion">
              <button className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
                {t('common.back')}
              </button>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('smtpConfig.title')}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {t('smtpConfig.description')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>{t('smtpConfig.noteTitle')}</strong> {t('smtpConfig.noteDescription')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Servidor SMTP */}
            <div>
              <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700 mb-2">
                {t('smtpConfig.smtpServer')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Server className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="smtpHost"
                  type="text"
                  value={formData.smtpHost}
                  onChange={(e) => handleChange('smtpHost', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e07a5f] focus:border-transparent"
                  placeholder="smtp.gmail.com"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {t('smtpConfig.smtpServerExamples')}
              </p>
            </div>

            {/* Puerto */}
            <div>
              <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700 mb-2">
                {t('smtpConfig.port')} <span className="text-red-500">*</span>
              </label>
              <input
                id="smtpPort"
                type="number"
                value={formData.smtpPort}
                onChange={(e) => handleChange('smtpPort', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e07a5f] focus:border-transparent"
                placeholder="587"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('smtpConfig.commonPort')}
              </p>
            </div>

            {/* Usuario/Email */}
            <div>
              <label htmlFor="smtpUser" className="block text-sm font-medium text-gray-700 mb-2">
                {t('smtpConfig.userEmail')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="smtpUser"
                  type="email"
                  value={formData.smtpUser}
                  onChange={(e) => handleChange('smtpUser', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e07a5f] focus:border-transparent"
                  placeholder={t('smtpConfig.userEmailPlaceholder')}
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {t('smtpConfig.password')} {userData?.smtpPassword ? t('smtpConfig.passwordOptional') : <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="smtpPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.smtpPassword}
                  onChange={(e) => handleChange('smtpPassword', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e07a5f] focus:border-transparent"
                  placeholder={userData?.smtpPassword ? '••••••••' : t('smtpConfig.passwordPlaceholder')}
                  required={!userData?.smtpPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {t('smtpConfig.passwordHint')} <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{t('smtpConfig.appPassword')}</a>
              </p>
            </div>

            {/* Nombre del remitente */}
            <div>
              <label htmlFor="smtpFromName" className="block text-sm font-medium text-gray-700 mb-2">
                {t('smtpConfig.senderName')}
              </label>
              <input
                id="smtpFromName"
                type="text"
                value={formData.smtpFromName}
                onChange={(e) => handleChange('smtpFromName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e07a5f] focus:border-transparent"
                placeholder={user?.name || 'Piano Emotion'}
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('smtpConfig.senderNameHint')}
              </p>
            </div>

            {/* Conexión segura */}
            <div className="flex items-center gap-3">
              <input
                id="smtpSecure"
                type="checkbox"
                checked={formData.smtpSecure}
                onChange={(e) => handleChange('smtpSecure', e.target.checked)}
                className="w-5 h-5 text-[#e07a5f] border-gray-300 rounded focus:ring-[#e07a5f]"
              />
              <label htmlFor="smtpSecure" className="text-sm font-medium text-gray-700">
                {t('smtpConfig.useSecureConnection')}
              </label>
            </div>

            {/* Botón de guardar */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <Link href="/configuracion">
                <button
                  type="button"
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </Link>
              <button
                type="submit"
                disabled={updateSmtpMutation.isPending}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#e07a5f] text-white rounded-lg font-semibold hover:bg-[#d06a4f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {updateSmtpMutation.isPending ? t('common.saving') : t('smtpConfig.saveConfiguration')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
