import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, ArrowRight, X } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const STEP_INFO = {
  welcome: {
    title: "¡Bienvenido a Piano Emotion Manager!",
    description: "Vamos a configurar tu cuenta paso a paso para que puedas empezar a gestionar tus servicios de pianos.",
  },
  profile_setup: {
    title: "Completa tu perfil",
    description: "Añade tu información personal y de contacto en la configuración de tu cuenta.",
    action: "Ir a Perfil",
    route: "/perfil",
  },
  organization_setup: {
    title: "Configura tu organización",
    description: "Si trabajas en equipo, crea tu organización y configura los permisos de tus colaboradores.",
    action: "Configurar Organización",
    route: "/organization/settings",
  },
  first_client: {
    title: "Añade tu primer cliente",
    description: "Registra la información de tu primer cliente para empezar a gestionar sus pianos.",
    action: "Añadir Cliente",
    route: "/clientes/nuevo",
  },
  first_piano: {
    title: "Registra tu primer piano",
    description: "Añade el primer piano de tu cliente con toda su información técnica.",
    action: "Añadir Piano",
    route: "/pianos/nuevo",
  },
  first_service: {
    title: "Crea tu primer servicio",
    description: "Registra un servicio de afinación, reparación o mantenimiento.",
    action: "Crear Servicio",
    route: "/servicios/nuevo",
  },
  complete: {
    title: "¡Felicidades!",
    description: "Has completado la configuración inicial. Ya puedes empezar a usar todas las funcionalidades de Piano Emotion Manager.",
  },
};

export function OnboardingWizard() {
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { data: progress, refetch } = trpc.onboarding.getProgress.useQuery();
  const completeStepMutation = trpc.onboarding.completeStep.useMutation();

  useEffect(() => {
    if (progress && !progress.isComplete) {
      // Mostrar el wizard automáticamente si no está completo
      setIsOpen(true);
    }
  }, [progress]);

  const currentStepIndex = progress?.steps.findIndex(s => !s.completed) ?? 0;
  const currentStep = progress?.steps[currentStepIndex];

  const handleNextStep = async () => {
    if (!currentStep) return;

    const stepInfo = STEP_INFO[currentStep.step as keyof typeof STEP_INFO];

    if (stepInfo.route) {
      // Navegar a la ruta correspondiente
      setLocation(stepInfo.route);
      setIsOpen(false);
    } else if (currentStep.step === 'welcome') {
      // Marcar bienvenida como completada
      try {
        await completeStepMutation.mutateAsync({ step: 'welcome' });
        await refetch();
        toast.success("¡Empecemos!");
      } catch (error) {
        toast.error("Error al avanzar");
      }
    } else if (currentStep.step === 'complete') {
      // Cerrar el wizard
      setIsOpen(false);
    }
  };

  const handleSkip = () => {
    setIsOpen(false);
  };

  if (!progress || progress.isComplete) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{STEP_INFO[currentStep?.step as keyof typeof STEP_INFO]?.title}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            {STEP_INFO[currentStep?.step as keyof typeof STEP_INFO]?.description}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progreso</span>
            <span className="font-medium">{progress.percentage}%</span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {progress.completedCount} de {progress.totalSteps} pasos completados
          </p>
        </div>

        {/* Steps List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {progress.steps.map((step, index) => {
            const stepInfo = STEP_INFO[step.step as keyof typeof STEP_INFO];
            const isCurrent = index === currentStepIndex;

            return (
              <div
                key={step.step}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  isCurrent ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="mt-0.5">
                  {step.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className={`h-5 w-5 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${isCurrent ? 'text-primary' : ''}`}>
                    {stepInfo.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {stepInfo.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleSkip}>
            Saltar por ahora
          </Button>
          <Button onClick={handleNextStep}>
            {currentStep?.step === 'welcome' ? 'Empezar' : 
             currentStep?.step === 'complete' ? 'Finalizar' : 
             'Continuar'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
