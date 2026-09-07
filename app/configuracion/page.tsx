'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Save, Globe, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AppSidebar } from '@/components/AppSidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useAuth } from '@/contexts/AuthContext'
import { CURRENCIES, Currency } from '@/lib/currency'
import { useSettings } from '@/hooks/useSettings'
import { ExchangeRateDisplay } from '@/components/ExchangeRateDisplay'

export default function ConfiguracionPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { settings, updateSettings } = useSettings()
  const [saving, setSaving] = useState(false)
  const [localSettings, setLocalSettings] = useState(settings)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
  }, [user, authLoading, router])

  // Sync local settings with global settings
  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleSave = async () => {
    try {
      setSaving(true)

      // Save settings to backend
      const result = await updateSettings(localSettings)

      if (result.success) {
        alert('Configuración guardada exitosamente')
      } else {
        alert(`Error: ${result.error || 'No se pudo guardar la configuración'}`)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error al guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) {
    return (
      <div className="copilot-flex copilot-items-center copilot-justify-center copilot-min-h-screen">
        <div className="copilot-h-8 copilot-w-8 copilot-rounded-full copilot-border-4 copilot-border-t-primary copilot-border-solid copilot-animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="copilot-flex copilot-h-14 sm:copilot-h-16 copilot-shrink-0 copilot-items-center copilot-gap-2 copilot-border-b copilot-px-2 sm:copilot-px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb className="copilot-flex-1 copilot-min-w-0">
            <BreadcrumbList>
              <BreadcrumbItem className="hidden sm:block">
                <BreadcrumbLink href="/" className="copilot-text-sm">Sistema de Inventario</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="copilot-text-sm">Configuración</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="copilot-flex copilot-flex-1 copilot-flex-col copilot-gap-3 sm:copilot-gap-4 copilot-p-2 sm:copilot-p-4 copilot-pt-0">
          <div className="copilot-space-y-8 copilot-mt-3 sm:copilot-mt-4">
            {/* Header */}
            <div className="copilot-flex copilot-flex-col sm:copilot-flex-row copilot-justify-between copilot-items-start sm:copilot-items-center copilot-gap-4">
              <div>
                <div className="copilot-flex copilot-items-center copilot-gap-3 copilot-mb-2">
                  <div className="copilot-inline-flex copilot-items-center copilot-gap-2 copilot-px-4 copilot-py-2 copilot-rounded-full copilot-text-sm copilot-font-medium copilot-bg-muted copilot-text-foreground copilot-border copilot-border-border">
                    <span className="copilot-text-base">⚙️</span>
                    Configuración
                  </div>
                  <h1 className="copilot-font-heading copilot-text-heading-5 copilot-font-semibold copilot-leading-none copilot-m-0">
                    Configuración General
                  </h1>
                </div>
                <p className="copilot-text-muted">
                  Configuración básica de la empresa y sistema
                </p>
              </div>
              <Button onClick={handleSave} disabled={saving} className="copilot-w-full sm:copilot-w-auto">
                <Save className="copilot-h-4 copilot-w-4 copilot-mr-2" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>

            {/* Company Settings */}
            <Card className="copilot-border copilot-border-border">
              <CardHeader>
                <CardTitle className="copilot-flex copilot-items-center copilot-gap-2">
                  <Settings className="copilot-h-5 copilot-w-5" />
                  Información de la Empresa
                </CardTitle>
                <CardDescription>
                  Configuración básica de la empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="copilot-space-y-4">
                <div className="copilot-grid copilot-grid-cols-1 sm:copilot-grid-cols-2 copilot-gap-4">
                  <div className="copilot-space-y-2">
                    <Label htmlFor="companyName" className="copilot-text-xs copilot-font-medium copilot-text-muted copilot-uppercase copilot-tracking-wider">Nombre de la Empresa</Label>
                    <Input
                      id="companyName"
                      value={localSettings.name}
                      onChange={(e) => setLocalSettings({ ...localSettings, name: e.target.value })}
                      placeholder="Mi Empresa"
                      className="copilot-h-10 copilot-rounded-copilot"
                    />
                  </div>
                  <div className="copilot-space-y-2">
                    <Label htmlFor="companyEmail" className="copilot-text-xs copilot-font-medium copilot-text-muted copilot-uppercase copilot-tracking-wider">Email de Contacto</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={localSettings.email}
                      onChange={(e) => setLocalSettings({ ...localSettings, email: e.target.value })}
                      placeholder="contacto@miempresa.com"
                      className="copilot-h-10 copilot-rounded-copilot"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Regional Settings */}
            <Card className="copilot-border copilot-border-border">
              <CardHeader>
                <CardTitle className="copilot-flex copilot-items-center copilot-gap-2">
                  <Globe className="copilot-h-5 copilot-w-5" />
                  Configuración Regional
                </CardTitle>
                <CardDescription>
                  Zona horaria y configuración regional
                </CardDescription>
              </CardHeader>
              <CardContent className="copilot-space-y-4">
                <div className="copilot-space-y-2">
                  <Label htmlFor="timezone" className="copilot-text-xs copilot-font-medium copilot-text-muted copilot-uppercase copilot-tracking-wider">Zona Horaria</Label>
                  <Select value={localSettings.timezone} onValueChange={(value) => setLocalSettings({ ...localSettings, timezone: value })}>
                    <SelectTrigger className="copilot-h-10 copilot-rounded-copilot">
                      <SelectValue placeholder="Seleccionar zona horaria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Lima">América/Lima (UTC-5)</SelectItem>
                      <SelectItem value="America/New_York">América/Nueva York (UTC-5)</SelectItem>
                      <SelectItem value="America/Mexico_City">América/Ciudad de México (UTC-6)</SelectItem>
                      <SelectItem value="America/Bogota">América/Bogotá (UTC-5)</SelectItem>
                      <SelectItem value="America/Santiago">América/Santiago (UTC-3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Currency Settings */}
            <Card className="copilot-border copilot-border-border">
              <CardHeader>
                <CardTitle className="copilot-flex copilot-items-center copilot-gap-2">
                  <DollarSign className="copilot-h-5 copilot-w-5" />
                  Configuración de Moneda
                </CardTitle>
                <CardDescription>
                  Configuración de moneda principal y tipo de cambio
                </CardDescription>
              </CardHeader>
              <CardContent className="copilot-space-y-4">
                <div className="copilot-grid copilot-grid-cols-1 sm:copilot-grid-cols-2 copilot-gap-4">
                  <div className="copilot-space-y-2">
                    <Label htmlFor="defaultCurrency" className="copilot-text-xs copilot-font-medium copilot-text-muted copilot-uppercase copilot-tracking-wider">Moneda Principal</Label>
                    <Select
                      value={localSettings.defaultCurrency}
                      onValueChange={(value: Currency) => setLocalSettings({ ...localSettings, defaultCurrency: value })}
                    >
                      <SelectTrigger className="copilot-h-10 copilot-rounded-copilot">
                        <SelectValue placeholder="Seleccionar moneda" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CURRENCIES).map(([code, config]) => (
                          <SelectItem key={code} value={code}>
                            <div className="copilot-flex copilot-items-center copilot-gap-2">
                              <span>{config.symbol}</span>
                              <span>{config.name} ({code})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="copilot-text-xs copilot-text-muted">
                      Esta será la moneda por defecto para nuevos productos y reportes
                    </p>
                  </div>

                  <div className="copilot-space-y-2">
                    <Label htmlFor="exchangeRate" className="copilot-text-xs copilot-font-medium copilot-text-muted copilot-uppercase copilot-tracking-wider">Tipo de Cambio Manual</Label>
                    <Input
                      id="exchangeRate"
                      type="number"
                      step="0.0001"
                      min="0.01"
                      max="20"
                      value={localSettings.exchangeRate}
                      onChange={(e) => setLocalSettings({ ...localSettings, exchangeRate: parseFloat(e.target.value) || 3.75 })}
                      placeholder="3.7500"
                      className="copilot-h-10 copilot-rounded-copilot"
                    />
                    <p className="copilot-text-xs copilot-text-muted">
                      Tipo de cambio de Dólar Americano a Sol Peruano (1 USD = X PEN)
                    </p>
                  </div>
                </div>

                <div className="copilot-bg-primary/10 copilot-p-4 copilot-rounded-copilot copilot-border copilot-border-primary/20">
                  <h4 className="copilot-text-sm copilot-font-medium copilot-mb-2">Información del Tipo de Cambio</h4>
                  <div className="copilot-space-y-2 copilot-text-sm">
                    <div className="copilot-flex copilot-justify-between">
                      <span className="copilot-text-muted">Moneda Base:</span>
                      <span className="copilot-font-medium">Dólar Americano (USD)</span>
                    </div>
                    <div className="copilot-flex copilot-justify-between">
                      <span className="copilot-text-muted">Tipo de Cambio:</span>
                      <span className="copilot-font-medium">1 USD = {localSettings.exchangeRate.toFixed(4)} PEN</span>
                    </div>
                  </div>
                </div>

                <div className="copilot-bg-warning/10 copilot-p-4 copilot-rounded-copilot copilot-border copilot-border-warning/20">
                  <h4 className="copilot-text-sm copilot-font-medium copilot-mb-2">Monedas Soportadas</h4>
                  <div className="copilot-grid copilot-grid-cols-1 sm:copilot-grid-cols-2 copilot-gap-2 copilot-text-sm">
                    {Object.entries(CURRENCIES).map(([code, config]) => (
                      <div key={code} className="copilot-flex copilot-items-center copilot-gap-2">
                        <span className="copilot-font-mono copilot-text-xs copilot-bg-background copilot-px-2 copilot-py-1 copilot-rounded-copilot copilot-border copilot-border-border">
                          {config.symbol}
                        </span>
                        <span>{config.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exchange Rate Display */}
            <ExchangeRateDisplay className="copilot-w-full" overrideExchangeRate={localSettings.exchangeRate} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}