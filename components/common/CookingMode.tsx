import React, { useState, useEffect } from 'react';
import { Recipe, RecipeStep } from '../../types';
import { Icon } from './Icon';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useTranslation } from '../../i18n';

interface CookingModeProps {
  recipe: Recipe;
  servings: number;
  scaledIngredients: Recipe['ingredients'];
  onClose: () => void;
}

export const CookingMode: React.FC<CookingModeProps> = ({
  recipe,
  servings,
  scaledIngredients,
  onClose
}) => {
  const { t, language } = useTranslation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [timer, setTimer] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);

  const steps = recipe.steps.filter(s => s.type === 'step');
  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const displayName = language === 'en' && recipe.name_en ? recipe.name_en : recipe.name;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && timer !== null && timer > 0) {
      interval = setInterval(() => {
        setTimer(t => (t! > 0 ? t! - 1 : 0));
      }, 1000);
    }
    if (timer === 0) {
      setTimerRunning(false);
      // Notification (if supported)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('⏰ Χρονόμετρο ολοκληρώθηκε!', {
          body: `Βήμα ${currentStepIndex + 1}: ${currentStep.content.substring(0, 50)}...`,
          icon: recipe.imageUrl || '/icon-192.png'
        });
      }
      // Vibrate (PWA)
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timer]);

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCompletedSteps(prev => new Set(prev).add(currentStepIndex));
      setCurrentStepIndex(prev => prev + 1);
      setTimer(null);
      setTimerRunning(false);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setTimer(null);
      setTimerRunning(false);
    }
  };

  const toggleTimer = (minutes: number) => {
    if (timerRunning) {
      setTimerRunning(false);
    } else {
      setTimer(minutes * 60);
      setTimerRunning(true);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-accent/30 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold truncate">{displayName}</h1>
            <p className="text-sm text-muted-foreground">
              {servings} {t('recipe_detail_servings')} • Βήμα {currentStepIndex + 1} από {steps.length}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="flex-shrink-0"
          >
            <Icon name="x" className="w-6 h-6" />
          </Button>
        </div>
        <Progress value={progress} className="mt-3 h-2" />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Current step */}
          <div className="bg-accent/20 rounded-2xl p-8 border-2 border-primary/30">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                {currentStepIndex + 1}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-bold leading-relaxed">
                  {currentStep.content}
                </h2>
              </div>
            </div>

            {/* Quick timers */}
            <div className="flex flex-wrap gap-3">
              <span className="text-sm font-medium text-muted-foreground self-center">
                Χρονόμετρα:
              </span>
              {[5, 10, 15, 20, 30].map(mins => (
                <Button
                  key={mins}
                  variant="outline"
                  size="sm"
                  onClick={() => toggleTimer(mins)}
                  disabled={timer !== null && timer > 0 && timerRunning}
                >
                  {mins} λεπτά
                </Button>
              ))}
            </div>

            {/* Active timer */}
            {timer !== null && (
              <div className="mt-6 p-6 bg-white dark:bg-slate-800 rounded-xl border-2 border-primary">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Χρονόμετρο</p>
                    <p className="text-5xl font-bold font-mono tabular-nums">
                      {formatTime(timer)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={timerRunning ? "destructive" : "default"}
                      size="lg"
                      onClick={() => setTimerRunning(!timerRunning)}
                    >
                      <Icon name={timerRunning ? "pause" : "play"} className="w-6 h-6" />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        setTimer(null);
                        setTimerRunning(false);
                      }}
                    >
                      <Icon name="x" className="w-6 h-6" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ingredients sidebar */}
          <details className="bg-accent/20 rounded-xl p-6 border border-border">
            <summary className="cursor-pointer font-semibold text-lg mb-4 flex items-center gap-2">
              <Icon name="list" className="w-5 h-5" />
              Υλικά για {servings} μερίδες
            </summary>
            <ul className="space-y-2 ml-7">
              {scaledIngredients.map((ing, idx) => (
                <li key={idx} className="text-lg">
                  <span className="font-medium">{ing.quantity.toFixed(1)}</span> {ing.unit} {ing.name}
                </li>
              ))}
            </ul>
          </details>

          {/* All steps overview */}
          <details className="bg-accent/20 rounded-xl p-6 border border-border">
            <summary className="cursor-pointer font-semibold text-lg mb-4 flex items-center gap-2">
              <Icon name="clipboard-list" className="w-5 h-5" />
              Όλα τα βήματα
            </summary>
            <div className="space-y-3 ml-7">
              {steps.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    idx === currentStepIndex
                      ? 'bg-primary text-primary-foreground'
                      : completedSteps.has(idx)
                      ? 'bg-success/10 text-success'
                      : 'bg-accent hover:bg-accent/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 font-bold">{idx + 1}.</span>
                    <span className="flex-1">{step.content}</span>
                    {completedSteps.has(idx) && (
                      <Icon name="check" className="w-5 h-5 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </details>
        </div>
      </div>

      {/* Footer navigation */}
      <div className="flex-shrink-0 border-t border-border bg-accent/30 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Button
            size="lg"
            variant="outline"
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="flex-1 md:flex-none md:min-w-[200px]"
          >
            <Icon name="arrow-left" className="w-5 h-5 mr-2" />
            Προηγούμενο
          </Button>

          <div className="hidden md:block text-center">
            <p className="text-sm text-muted-foreground">
              {currentStepIndex + 1} / {steps.length}
            </p>
            <p className="text-xs text-muted-foreground">
              {completedSteps.size} ολοκληρωμένα
            </p>
          </div>

          {currentStepIndex < steps.length - 1 ? (
            <Button
              size="lg"
              onClick={nextStep}
              className="flex-1 md:flex-none md:min-w-[200px]"
            >
              Επόμενο
              <Icon name="arrow-right" className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              size="lg"
              variant="default"
              onClick={onClose}
              className="flex-1 md:flex-none md:min-w-[200px] bg-success hover:bg-success/90"
            >
              <Icon name="check" className="w-5 h-5 mr-2" />
              Ολοκλήρωση
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookingMode;
