'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, DollarSign, Package, Calendar, Download } from 'lucide-react'
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

interface ValuationData {
  totalValue: number
  averageValue: number
  highestValue: { name: string; value: number }
  lowestValue: { name: string; value: number }
  monthlyTrend: {
    month: string
    value: number
    change: number
  }[]
  categoryValues: {
    category: string
    value: number
    percentage: number
  }[]
}

export default function ReporteValoracionPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<ValuationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('6months')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      // Simulate loading data
      setTimeout(() => {
      setData({
        totalValue: 245680.50,
        averageValue: 1574.87,
        highestValue: { name: 'Laptop Dell XPS 13', value: 30000 },
        lowestValue: { name: 'Cable USB', value: 150 },
        monthlyTrend: [
          { month: 'Ene', value: 220000, change: 5.2 },
          { month: 'Feb', value: 225000, change: 2.3 },
          { month: 'Mar', value: 235000, change: 4.4 },
          { month: 'Abr', value: 240000, change: 2.1 },
          { month: 'May', value: 242000, change: 0.8 },
          { month: 'Jun', value: 245680.50, change: 1.5 }
        ],
        categoryValues: [
          { category: 'Electrónicos', value: 125000, percentage: 50.9 },
          { category: 'Oficina', value: 85000, percentage: 34.6 },
          { category: 'Mobiliario', value: 35680.50, percentage: 14.5 }
        ]
      })
      setLoading(false)
      }, 1000)
    }
  }, [user, authLoading, router, period])

  const handleExportToExcel = () => {
    if (!data) return

    setExporting(true)

    try {
      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,"

      // Header
      csvContent += "Reporte de Valoración de Inventario\n\n"

      // Summary section
      csvContent += "Resumen General\n"
      csvContent += "Métrica,Valor\n"
      csvContent += `Valor Total,S/ ${data.totalValue.toFixed(2)}\n`
      csvContent += `Valor Promedio,S/ ${data.averageValue.toFixed(2)}\n`
      csvContent += `Mayor Valor,"${data.highestValue.name}",S/ ${data.highestValue.value.toFixed(2)}\n`
      csvContent += `Menor Valor,"${data.lowestValue.name}",S/ ${data.lowestValue.value.toFixed(2)}\n`
      csvContent += "\n"

      // Monthly trend section
      csvContent += "Evolución Mensual\n"
      csvContent += "Mes,Valor,Cambio %\n"
      data.monthlyTrend.forEach(month => {
        csvContent += `${month.month},S/ ${month.value.toFixed(2)},${month.change >= 0 ? '+' : ''}${month.change}%\n`
      })
      csvContent += "\n"

      // Category values section
      csvContent += "Valor por Categoría\n"
      csvContent += "Categoría,Valor,Porcentaje\n"
      data.categoryValues.forEach(category => {
        csvContent += `${category.category},S/ ${category.value.toFixed(2)},${category.percentage}%\n`
      })

      // Create download link
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `reporte_valoracion_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      alert('Error al exportar el reporte')
    } finally {
      setExporting(false)
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

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="copilot-flex copilot-items-center copilot-justify-center copilot-h-64">
            <div className="text-center">
              <div className="copilot-h-8 copilot-w-8 copilot-rounded-full copilot-border-4 copilot-border-t-primary copilot-border-solid copilot-animate-spin mx-auto copilot-mb-4"></div>
              <p className="copilot-text-sm copilot-text-muted">Calculando valoración...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!data) return null

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
                <BreadcrumbLink href="/reportes" className="copilot-text-sm">Reportes</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="copilot-text-sm">Valoración</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="copilot-flex copilot-flex-1 copilot-flex-col copilot-gap-3 sm:copilot-gap-4 copilot-p-2 sm:copilot-p-4 copilot-pt-0">
          <div className="copilot-space-y-6 copilot-mt-3 sm:copilot-mt-4">
            <div className="copilot-flex copilot-flex-col sm:copilot-flex-row copilot-justify-between copilot-items-start sm:copilot-items-center copilot-gap-4">
              <div>
                <h1 className="copilot-font-heading copilot-text-heading-5 copilot-font-semibold copilot-leading-none copilot-m-0">Reporte de Valoración</h1>
                <p className="copilot-text-muted">Análisis del valor económico del inventario</p>
              </div>
              <div className="copilot-flex copilot-gap-2">
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="copilot-w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3months">3 meses</SelectItem>
                    <SelectItem value="6months">6 meses</SelectItem>
                    <SelectItem value="12months">12 meses</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleExportToExcel} disabled={exporting}>
                  <Download className="copilot-h-4 copilot-w-4 copilot-mr-2" />
                  {exporting ? 'Exportando...' : 'Exportar'}
                </Button>
              </div>
            </div>
            </div>

      {/* Summary Cards */}
      <div className="copilot-grid copilot-grid-cols-1 md:copilot-grid-cols-2 lg:copilot-grid-cols-4 copilot-gap-4">
        <Card>
          <CardHeader className="copilot-flex copilot-flex-row copilot-items-center copilot-justify-between copilot-space-y-0 copilot-pb-2">
            <CardTitle className="copilot-text-sm copilot-font-medium">Valor Total</CardTitle>
            <DollarSign className="copilot-h-4 copilot-w-4 copilot-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="copilot-text-2xl copilot-font-bold">
              {new Intl.NumberFormat("es-PE", {
                style: "currency",
                currency: "PEN",
              }).format(data.totalValue)}
            </div>
            <p className="copilot-text-xs text-success copilot-flex copilot-items-center">
              <TrendingUp className="copilot-h-3 copilot-w-3 copilot-mr-1" />
              +1.5% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="copilot-flex copilot-flex-row copilot-items-center copilot-justify-between copilot-space-y-0 copilot-pb-2">
            <CardTitle className="copilot-text-sm copilot-font-medium">Valor Promedio</CardTitle>
            <Package className="copilot-h-4 copilot-w-4 copilot-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="copilot-text-2xl copilot-font-bold">
              {new Intl.NumberFormat("es-PE", {
                style: "currency",
                currency: "PEN",
              }).format(data.averageValue)}
            </div>
            <p className="copilot-text-xs copilot-text-muted">por producto</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="copilot-flex copilot-flex-row copilot-items-center copilot-justify-between copilot-space-y-0 copilot-pb-2">
            <CardTitle className="copilot-text-sm copilot-font-medium">Mayor Valor</CardTitle>
            <TrendingUp className="copilot-h-4 copilot-w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="copilot-text-2xl copilot-font-bold">
              {new Intl.NumberFormat("es-PE", {
                style: "currency",
                currency: "PEN",
              }).format(data.highestValue.value)}
            </div>
            <p className="copilot-text-xs copilot-text-muted">{data.highestValue.name}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="copilot-flex copilot-flex-row copilot-items-center copilot-justify-between copilot-space-y-0 copilot-pb-2">
            <CardTitle className="copilot-text-sm copilot-font-medium">Menor Valor</CardTitle>
            <Package className="copilot-h-4 copilot-w-4 copilot-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="copilot-text-2xl copilot-font-bold">
              {new Intl.NumberFormat("es-PE", {
                style: "currency",
                currency: "PEN",
              }).format(data.lowestValue.value)}
            </div>
            <p className="copilot-text-xs copilot-text-muted">{data.lowestValue.name}</p>
          </CardContent>
        </Card>
      </div>

      <div className="copilot-grid copilot-grid-cols-1 lg:copilot-grid-cols-2 copilot-gap-6">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="copilot-flex copilot-items-center copilot-gap-2">
              <Calendar className="copilot-h-4 copilot-w-4" />
              Evolución Mensual
            </CardTitle>
            <CardDescription>Tendencia del valor total del inventario</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="copilot-space-y-4">
              {data.monthlyTrend.map((month, index) => (
                <div key={index} className="copilot-flex copilot-items-center copilot-justify-between copilot-p-3 copilot-border copilot-rounded-copilot">
                  <div className="copilot-flex copilot-items-center copilot-gap-3">
                    <div className="copilot-font-medium">{month.month}</div>
                    <div className="copilot-text-sm">
                      {new Intl.NumberFormat("es-PE", {
                        style: "currency",
                        currency: "PEN",
                      }).format(month.value)}
                    </div>
                  </div>
                  <div className={`copilot-text-sm copilot-font-medium copilot-flex copilot-items-center copilot-gap-1 ${
                    month.change >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {month.change >= 0 ? (
                      <TrendingUp className="copilot-h-3 copilot-w-3" />
                    ) : (
                      <TrendingUp className="copilot-h-3 copilot-w-3 copilot-rotate-180" />
                    )}
                    {month.change >= 0 ? '+' : ''}{month.change}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Values */}
        <Card>
          <CardHeader>
            <CardTitle className="copilot-flex copilot-items-center copilot-gap-2">
              <Package className="copilot-h-4 copilot-w-4" />
              Valor por Categoría
            </CardTitle>
            <CardDescription>Distribución del valor por categorías</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="copilot-space-y-4">
              {data.categoryValues.map((category, index) => (
                <div key={index} className="copilot-space-y-2">
                  <div className="copilot-flex copilot-items-center copilot-justify-between">
                    <span className="copilot-text-sm copilot-font-medium">{category.category}</span>
                    <span className="copilot-text-sm copilot-text-muted">{category.percentage}%</span>
                  </div>
                  <div className="copilot-flex copilot-items-center copilot-gap-3">
                    <div className="copilot-flex-1 copilot-bg-muted copilot-rounded-full copilot-h-2">
                      <div
                        className="copilot-h-2 copilot-rounded-full copilot-bg-primary"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <div className="copilot-text-sm copilot-font-semibold copilot-min-w-0">
                      {new Intl.NumberFormat("es-PE", {
                        style: "currency",
                        currency: "PEN",
                      }).format(category.value)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent></Card>
        </div>
      </div>
      </SidebarInset>
    </SidebarProvider>
  )
}