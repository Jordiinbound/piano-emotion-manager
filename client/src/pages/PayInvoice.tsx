import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle2, XCircle, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export default function PayInvoice() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const token = params.token as string;
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: invoice, isLoading, error } = trpc.invoices.getByPaymentToken.useQuery(
    { token },
    { enabled: !!token }
  );

  const createCheckoutMutation = trpc.stripe.createCheckoutSessionPublic.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.success('Redirigiendo a la página de pago...');
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error('Error al procesar el pago: ' + error.message);
      setIsProcessing(false);
    },
  });

  const handlePay = async () => {
    if (!invoice) return;
    
    setIsProcessing(true);
    createCheckoutMutation.mutate({
      invoiceId: invoice.id,
      token,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Cargando factura...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Factura no encontrada</CardTitle>
            </div>
            <CardDescription>
              El enlace de pago no es válido o ha expirado.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => setLocation('/')}>
              Volver al inicio
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (invoice.status === 'paid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md border-green-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <CardTitle>Factura pagada</CardTitle>
            </div>
            <CardDescription>
              Esta factura ya ha sido pagada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Número de factura:</span>
                <span className="font-medium">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total pagado:</span>
                <span className="font-medium">€{Number(invoice.total).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => setLocation('/')}>
              Volver al inicio
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const items = invoice.items as Array<{ description: string; quantity: number; price: number }> || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Pagar Factura</CardTitle>
            <CardDescription>
              Complete el pago de forma segura con Stripe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Información de la factura */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Número de factura</p>
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">{new Date(invoice.date).toLocaleDateString('es-ES')}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">{invoice.clientName}</p>
                {invoice.clientEmail && (
                  <p className="text-sm text-muted-foreground">{invoice.clientEmail}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Items de la factura */}
            <div className="space-y-3">
              <h3 className="font-semibold">Detalle de servicios</h3>
              {items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-medium">{item.description}</p>
                    <p className="text-muted-foreground">Cantidad: {item.quantity}</p>
                  </div>
                  <p className="font-medium">€{(item.quantity * item.price).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <Separator />

            {/* Totales */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>€{Number(invoice.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA (21%)</span>
                <span>€{Number(invoice.taxAmount).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>€{Number(invoice.total).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              size="lg"
              onClick={handlePay}
              disabled={isProcessing || invoice.status !== 'sent'}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pagar €{Number(invoice.total).toFixed(2)}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Información de seguridad */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>🔒 Pago seguro procesado por Stripe</p>
          <p className="mt-1">Sus datos de pago están protegidos con encriptación de nivel bancario</p>
        </div>
      </div>
    </div>
  );
}
