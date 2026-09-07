"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CurrencySelector } from "@/components/CurrencySelector";
import { useCurrency } from "@/hooks/use-currency";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Currency, CURRENCIES } from "@/lib/currency";
import { Coins, Loader2, AlertCircle } from "lucide-react";

export function CurrencySettings() {
  const { preferredCurrency, setPreferredCurrency } = useCurrency();
  const { settings, loading, error, updateSettings, fetchSettings } =
    useSettings();
  const { user } = useAuth();
  const { toast } = useToast();

  const [exchangeRate, setExchangeRate] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string>("");

  const isAdmin = user?.role === "admin";

  // Update local exchange rate when settings load
  useEffect(() => {
    if (settings?.exchangeRate) {
      setExchangeRate(settings.exchangeRate.toString());
    }
  }, [settings]);

  const validateExchangeRate = (value: string): boolean => {
    setValidationError("");

    if (!value || value.trim() === "") {
      setValidationError("La tasa de cambio es requerida");
      return false;
    }

    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      setValidationError("Debe ser un número válido");
      return false;
    }

    if (numValue <= 0) {
      setValidationError("La tasa de cambio debe ser mayor que 0");
      return false;
    }

    if (numValue < 0.01) {
      setValidationError("La tasa de cambio debe ser al menos 0.01");
      return false;
    }

    if (numValue > 20) {
      setValidationError("La tasa de cambio no puede ser mayor que 20");
      return false;
    }

    // Check decimal precision (max 4 decimals)
    const decimalPart = value.split(".")[1];
    if (decimalPart && decimalPart.length > 4) {
      setValidationError("Máximo 4 decimales permitidos");
      return false;
    }

    return true;
  };

  const handleExchangeRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setExchangeRate(value);

    // Clear validation error when user types
    if (validationError) {
      setValidationError("");
    }
  };

  const handleSaveExchangeRate = async () => {
    if (!validateExchangeRate(exchangeRate)) {
      toast({
        title: "Error de validación",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const result = await updateSettings({
        exchangeRate: parseFloat(exchangeRate),
      });

      if (result.success) {
        toast({
          title: "Éxito",
          description: "Tasa de cambio actualizada correctamente",
          variant: "default",
        });
      } else {
        toast({
          title: "Error al actualizar",
          description:
            result.error || "No se pudo actualizar la tasa de cambio",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Unexpected error saving exchange rate:", err);
      toast({
        title: "Error inesperado",
        description:
          "Ocurrió un error al guardar la configuración. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetryLoad = async () => {
    toast({
      title: "Recargando...",
      description: "Intentando cargar la configuración nuevamente",
      variant: "default",
      duration: 2000,
    });
    await fetchSettings();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="copilot-flex copilot-items-center copilot-gap-2">
          <Coins className="copilot-h-5 copilot-w-5" />
          Configuración de Moneda
        </CardTitle>
        <CardDescription>
          Configura tu moneda preferida y la tasa de cambio
        </CardDescription>
      </CardHeader>
      <CardContent className="copilot-space-y-4">
        {/* Loading State */}
        {loading && (
          <div className="copilot-flex copilot-items-center copilot-justify-center copilot-py-4">
            <Loader2 className="copilot-h-6 copilot-w-6 copilot-animate-spin copilot-text-muted" />
            <span className="copilot-ml-2 copilot-text-sm copilot-text-muted">
              Cargando configuración...
            </span>
          </div>
        )}

        {/* Error State with Retry */}
        {error && !loading && (
          <div className="copilot-border-destructive/30 copilot-bg-destructive/10 copilot-rounded-copilot copilot-p-3">
            <div className="copilot-flex copilot-items-start copilot-gap-2">
              <AlertCircle className="copilot-h-5 copilot-w-5 copilot-text-destructive copilot-mt-0.5 copilot-flex-shrink-0" />
              <div className="copilot-flex-1">
                <p className="copilot-text-sm copilot-font-medium copilot-text-destructive">
                  Error al cargar configuración
                </p>
                <p className="copilot-text-xs copilot-text-destructive/80 copilot-mt-1">{error}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetryLoad}
              className="copilot-mt-3 copilot-w-full copilot-h-10 copilot-rounded-copilot"
            >
              Reintentar
            </Button>
          </div>
        )}

        {/* Currency Selector */}
        {!loading && (
          <>
            <div className="copilot-space-y-2">
              <Label htmlFor="currency">Moneda Preferida</Label>
              <CurrencySelector
                value={preferredCurrency}
                onValueChange={setPreferredCurrency}
              />
            </div>

            <div className="copilot-text-sm copilot-text-muted">
              <p>
                Moneda seleccionada:{" "}
                <strong>{CURRENCIES[preferredCurrency].name}</strong>
              </p>
              <p>
                Símbolo: <strong>{CURRENCIES[preferredCurrency].symbol}</strong>
              </p>
            </div>

            {/* Exchange Rate Configuration */}
            <div className="copilot-border-t copilot-pt-4 copilot-space-y-3">
              <div className="copilot-space-y-2">
                <Label htmlFor="exchangeRate">
                  Tasa de Cambio (Dólar a Sol Peruano)
                  {!isAdmin && (
                    <span className="copilot-text-xs copilot-text-muted copilot-ml-2">
                      (Solo lectura)
                    </span>
                  )}
                </Label>
                <div className="copilot-flex copilot-gap-2">
                  <div className="copilot-relative copilot-flex-1">
                    <Input
                      id="exchangeRate"
                      type="number"
                      step="0.0001"
                      min="0.01"
                      max="20"
                      value={exchangeRate}
                      onChange={handleExchangeRateChange}
                      disabled={!isAdmin || isSaving}
                      placeholder="Ej: 3.7500"
                      className={validationError ? "copilot-border-destructive" : ""}
                    />
                    {isSaving && (
                      <div className="copilot-absolute copilot-right-3 copilot-top-1/2 -copilot-translate-y-1/2">
                        <Loader2 className="copilot-h-4 copilot-w-4 copilot-animate-spin copilot-text-muted" />
                      </div>
                    )}
                  </div>
                  {isAdmin && (
                    <Button
                      onClick={handleSaveExchangeRate}
                      disabled={isSaving || !exchangeRate || !!validationError}
                      className="copilot-h-10 copilot-rounded-copilot"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="copilot-h-4 copilot-w-4 copilot-animate-spin copilot-mr-2" />
                          Guardando...
                        </>
                      ) : (
                        "Guardar"
                      )}
                    </Button>
                  )}
                </div>

                {/* Validation Error */}
                {validationError && (
                  <div className="copilot-border-destructive/30 copilot-bg-destructive/10 copilot-rounded-md copilot-p-2">
                    <p className="copilot-text-xs copilot-text-destructive copilot-flex copilot-items-center copilot-gap-1">
                      <AlertCircle className="copilot-h-3 copilot-w-3 copilot-flex-shrink-0" />
                      {validationError}
                    </p>
                  </div>
                )}

                {/* Current Exchange Rate Display */}
                {settings?.exchangeRate && !validationError && (
                  <p className="copilot-text-xs copilot-text-muted">
                    Tasa actual: 1 USD ={" "}
                    <strong>{settings.exchangeRate.toFixed(4)}</strong> Soles Peruanos (PEN)
                  </p>
                )}
              </div>

              {/* Admin Permission Message */}
              {!isAdmin && (
                <div className="copilot-bg-warning/10 copilot-border copilot-border-warning/20 copilot-rounded-copilot copilot-p-3">
                  <p className="copilot-text-xs copilot-text-warning">
                    Solo los administradores pueden modificar la tasa de cambio
                  </p>
                </div>
              )}
            </div>

            {/* Information Section */}
            <div className="copilot-bg-primary/10 copilot-p-3 copilot-rounded-copilot copilot-border copilot-border-primary/20">
              <h4 className="copilot-text-sm copilot-font-medium copilot-mb-2">Información</h4>
              <ul className="copilot-text-xs copilot-text-muted copilot-space-y-1">
                <li>
                  • Los precios se mostrarán en tu moneda preferida cuando sea
                  posible
                </li>
                <li>
                  • Puedes convertir entre monedas usando el botón de conversión
                </li>
                <li>
                  • La tasa de cambio se sincroniza automáticamente con todos
                  los usuarios
                </li>
                <li>
                  • Los cambios en la tasa de cambio se reflejan inmediatamente
                  en toda la aplicación
                </li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}