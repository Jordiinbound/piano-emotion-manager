import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2, Key } from "lucide-react";
import { toast } from "sonner";

export function ActivateLicense() {
  const [activationCode, setActivationCode] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const activateMutation = trpc.licenses.activateWithCode.useMutation({
    onSuccess: (data) => {
      setIsSuccess(true);
      setErrorMessage("");
      toast.success("¡Licencia activada exitosamente!");
    },
    onError: (error) => {
      setIsSuccess(false);
      setErrorMessage(error.message);
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activationCode.trim()) {
      setErrorMessage("Por favor ingresa un código de activación");
      return;
    }
    activateMutation.mutate({ code: activationCode.trim().toUpperCase() });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Key className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Activar Licencia</CardTitle>
          <CardDescription>
            Ingresa tu código de activación para comenzar a usar Piano Emotion Manager
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código de Activación</Label>
                <Input
                  id="code"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  className="font-mono text-center text-lg tracking-wider"
                  maxLength={19}
                  disabled={activateMutation.isPending}
                />
                <p className="text-xs text-muted-foreground">
                  El código fue proporcionado por tu proveedor
                </p>
              </div>

              {errorMessage && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={activateMutation.isPending || !activationCode.trim()}
              >
                {activateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Activando...
                  </>
                ) : (
                  "Activar Licencia"
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Tu licencia ha sido activada exitosamente. Ya puedes comenzar a usar todas las
                  funcionalidades de Piano Emotion Manager.
                </AlertDescription>
              </Alert>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Acceso completo a todas las funcionalidades</p>
                <p>✓ Gestión ilimitada de clientes y pianos</p>
                <p>✓ Facturación y presupuestos</p>
                <p>✓ Control de inventario</p>
                <p>✓ Reportes y estadísticas</p>
              </div>

              <Button
                className="w-full"
                onClick={() => (window.location.href = "/")}
              >
                Ir al Dashboard
              </Button>
            </div>
          )}

          <div className="pt-4 border-t text-center text-sm text-muted-foreground">
            <p>¿No tienes un código de activación?</p>
            <a href="/contact" className="text-primary hover:underline">
              Contacta con tu proveedor
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
