/**
 * Módulo de IA Avanzada
 * Piano Emotion Manager
 * 
 * Funcionalidades de IA para análisis predictivo y recomendaciones
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

interface Prediction {
  id: string;
  type: 'maintenance' | 'revenue' | 'client';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  date: string;
}

const SAMPLE_PREDICTIONS: Prediction[] = [
  {
    id: '1',
    type: 'maintenance',
    title: 'Piano Steinway Grand - Mantenimiento Preventivo',
    description: 'El análisis predictivo sugiere que este piano requerirá afinación en los próximos 15 días basado en el historial de servicios y condiciones ambientales.',
    confidence: 87,
    impact: 'high',
    date: '2026-02-12',
  },
  {
    id: '2',
    type: 'revenue',
    title: 'Oportunidad de Ingresos - Febrero',
    description: 'Se detecta un patrón de aumento de demanda en febrero. Recomendamos aumentar disponibilidad y promocionar servicios de afinación.',
    confidence: 92,
    impact: 'high',
    date: '2026-02-01',
  },
  {
    id: '3',
    type: 'client',
    title: 'Cliente en Riesgo - María García',
    description: 'Este cliente no ha solicitado servicios en 6 meses, superando su patrón habitual. Recomendamos contacto proactivo.',
    confidence: 78,
    impact: 'medium',
    date: '2026-01-30',
  },
];

export default function IAAvanzada() {
  const [predictions] = useState<Prediction[]>(SAMPLE_PREDICTIONS);

  const handleRunAnalysis = () => {
    toast.success('Análisis de IA iniciado. Resultados en unos minutos.');
  };

  const getImpactColor = (impact: Prediction['impact']) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
    }
  };

  const getTypeIcon = (type: Prediction['type']) => {
    switch (type) {
      case 'maintenance':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'revenue':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'client':
        return <Target className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-500" />
            IA Avanzada
          </h1>
          <p className="text-muted-foreground mt-1">
            Análisis predictivo y recomendaciones inteligentes
          </p>
        </div>
        <Button onClick={handleRunAnalysis}>
          <Sparkles className="h-4 w-4 mr-2" />
          Ejecutar Análisis
        </Button>
      </div>

      {/* Módulos de IA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-1">Predicción de Mantenimiento</h3>
            <p className="text-sm text-muted-foreground">
              Anticipa necesidades de servicio
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-1">Optimización de Ingresos</h3>
            <p className="text-sm text-muted-foreground">
              Identifica oportunidades de negocio
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-1">Análisis de Clientes</h3>
            <p className="text-sm text-muted-foreground">
              Detecta patrones y riesgos
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mb-3">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-1">Tendencias de Mercado</h3>
            <p className="text-sm text-muted-foreground">
              Analiza demanda y estacionalidad
            </p>
          </div>
        </Card>
      </div>

      {/* Predicciones activas */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Predicciones Activas</h2>
        <div className="space-y-4">
          {predictions.map((prediction) => (
            <Card key={prediction.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="mt-1">{getTypeIcon(prediction.type)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold">{prediction.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge className={getImpactColor(prediction.impact)}>
                        {prediction.impact === 'high' && 'Alto Impacto'}
                        {prediction.impact === 'medium' && 'Impacto Medio'}
                        {prediction.impact === 'low' && 'Bajo Impacto'}
                      </Badge>
                      <Badge variant="outline">
                        {prediction.confidence}% confianza
                      </Badge>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-3">{prediction.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Fecha estimada: {new Date(prediction.date).toLocaleDateString('es-ES')}
                    </span>
                    <Button variant="outline" size="sm">
                      <Lightbulb className="h-4 w-4 mr-1" />
                      Ver Recomendaciones
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Insights y recomendaciones */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Insights Rápidos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Mejor día para servicios</h4>
            <p className="text-sm text-muted-foreground">
              Los martes tienen 23% más conversión. Considera promociones específicas.
            </p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Servicio más rentable</h4>
            <p className="text-sm text-muted-foreground">
              Afinaciones completas generan 34% más margen que servicios básicos.
            </p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Retención de clientes</h4>
            <p className="text-sm text-muted-foreground">
              Clientes con más de 3 servicios tienen 87% de probabilidad de renovar.
            </p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Estacionalidad</h4>
            <p className="text-sm text-muted-foreground">
              Febrero y septiembre son meses pico. Planifica recursos con anticipación.
            </p>
          </div>
        </div>
      </Card>

      {/* Configuración de modelos */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Modelos de IA Activos</h3>
        <div className="space-y-3">
          {[
            { name: 'Predicción de Mantenimiento', accuracy: 87, status: 'active' },
            { name: 'Análisis de Sentimiento', accuracy: 92, status: 'active' },
            { name: 'Optimización de Rutas', accuracy: 78, status: 'training' },
            { name: 'Detección de Anomalías', accuracy: 85, status: 'active' },
          ].map((model) => (
            <div key={model.name} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <span className="font-medium">{model.name}</span>
                <p className="text-sm text-muted-foreground">Precisión: {model.accuracy}%</p>
              </div>
              <Badge variant={model.status === 'active' ? 'default' : 'outline'}>
                {model.status === 'active' ? 'Activo' : 'Entrenando'}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
