/**
 * Client Portal Dashboard
 * Piano Emotion Manager
 */

import { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { FileText, CreditCard, LogOut, Download, Eye } from 'lucide-react';

export default function ClientPortalDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const storedToken = localStorage.getItem('clientPortalToken');
    if (!storedToken) {
      setLocation('/client-portal/login');
      return;
    }
    setToken(storedToken);
  }, [setLocation]);

  // Verificar sesión
  const { data: sessionData, isLoading: sessionLoading, error: sessionError } = trpc.clientPortal.verifySession.useQuery(
    { token: token || '' },
    {
      enabled: !!token,
      retry: false,
    }
  );

  // Manejar error de sesión
  useEffect(() => {
    if (sessionError) {
      localStorage.removeItem('clientPortalToken');
      setLocation('/client-portal/login');
    }
  }, [sessionError, setLocation]);

  // Obtener facturas
  const { data: invoicesData, isLoading: invoicesLoading } = trpc.clientPortal.getInvoices.useQuery(
    { token: token || '' },
    {
      enabled: !!token,
    }
  );

  // Logout
  const logoutMutation = trpc.clientPortal.logout.useMutation({
    onSuccess: () => {
      localStorage.removeItem('clientPortalToken');
      toast.success('Sesión cerrada');
      setLocation('/client-portal/login');
    },
  });

  const handleLogout = () => {
    if (token) {
      logoutMutation.mutate({ token });
    }
  };

  // Mutación para crear sesión de pago
  const createCheckoutSessionMutation = trpc.stripe.createCheckoutSessionPublic.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank');
        toast.success('Redirigiendo a la página de pago');
      }
    },
    onError: (error) => {
      toast.error('Error al procesar el pago', {
        description: error.message,
      });
    },
  });

  const handlePay = (invoiceId: number, paymentToken: string) => {
    createCheckoutSessionMutation.mutate({ invoiceId, token: paymentToken });
  };

  if (sessionLoading || !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e07a5f] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const invoices = invoicesData?.invoices || [];
  const pendingInvoices = invoices.filter((inv) => inv.status === 'sent');
  const paidInvoices = invoices.filter((inv) => inv.status === 'paid');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Portal del Cliente</h1>
              <p className="text-sm text-gray-600 mt-1">{sessionData?.user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Facturas</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{invoices.length}</p>
              </div>
              <FileText className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-3xl font-bold text-[#e07a5f] mt-2">{pendingInvoices.length}</p>
              </div>
              <CreditCard className="w-12 h-12 text-[#e07a5f]" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pagadas</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{paidInvoices.length}</p>
              </div>
              <FileText className="w-12 h-12 text-green-600" />
            </div>
          </div>
        </div>

        {/* Pending Invoices */}
        {pendingInvoices.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Facturas Pendientes</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Número
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(invoice.date).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          €{parseFloat(invoice.total.toString()).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                            Pendiente
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            {invoice.paymentToken && (
                              <>
                                <Link
                                  href={`/pay/${invoice.paymentToken}`}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Ver
                                </Link>
                                <button
                                  onClick={() => handlePay(invoice.id, invoice.paymentToken!)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#e07a5f] text-white text-xs font-semibold rounded hover:bg-[#d06a4f] transition-colors"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  Pagar
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Paid Invoices */}
        {paidInvoices.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Facturas Pagadas</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Número
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paidInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(invoice.date).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          €{parseFloat(invoice.total.toString()).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Pagada
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {invoice.paymentToken && (
                            <Link
                              href={`/pay/${invoice.paymentToken}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Ver
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {invoices.length === 0 && !invoicesLoading && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes facturas</h3>
            <p className="text-gray-600">Tus facturas aparecerán aquí cuando estén disponibles</p>
          </div>
        )}
      </main>
    </div>
  );
}
