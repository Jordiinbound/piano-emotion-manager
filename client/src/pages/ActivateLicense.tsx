import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2, Key } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";

export function ActivateLicense() {
  const { t } = useTranslation();
  const [activationCode, setActivationCode] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const activateMutation = trpc.licenses.activateWithCode.useMutation({
    onSuccess: (data) => {
      setIsSuccess(true);
      setErrorMessage("");
      toast.success(t('activateLicense.licenseActivatedSuccessfully'));
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
      setErrorMessage(t('activateLicense.pleaseEnterActivationCode'));
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
          <CardTitle className="text-2xl">{t('activateLicense.title')}</CardTitle>
          <CardDescription>
            {t('activateLicense.description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">{t('activateLicense.activationCode')}</Label>
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
                  {t('activateLicense.codeProvidedBySupplier')}
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
                    {t('activateLicense.activating')}
                  </>
                ) : (
                  t('activateLicense.activateLicense')
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  {t('activateLicense.successMessage')}
                </AlertDescription>
              </Alert>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✓ {t('activateLicense.feature1')}</p>
                <p>✓ {t('activateLicense.feature2')}</p>
                <p>✓ {t('activateLicense.feature3')}</p>
                <p>✓ {t('activateLicense.feature4')}</p>
                <p>✓ {t('activateLicense.feature5')}</p>
              </div>

              <Button
                className="w-full"
                onClick={() => (window.location.href = "/")}
              >
                {t('activateLicense.goToDashboard')}
              </Button>
            </div>
          )}

          <div className="pt-4 border-t text-center text-sm text-muted-foreground">
            <p>{t('activateLicense.noActivationCode')}</p>
            <a href="/contact" className="text-primary hover:underline">
              {t('activateLicense.contactSupplier')}
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
