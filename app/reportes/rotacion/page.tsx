'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RotateCcw, TrendingUp, TrendingDown, Package, AlertCircle, Download } from 'lucide-react'
import { AppSidebar } from '@/components/AppSidebar'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
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

interface RotationData {
  averageRotation: number
  fastMoving: {
    name: string
    sku: string
    rotationRate: number
    daysToSellOut: number
  }[]
  slowMoving: {
    name: string
    sku: string
    rotationRate: number
    daysInStock: number
  }[]
  categoryRotation: {
    category: string
    rotationRate: number
    trend: 'up' | 'down' | 'stable'
  }[]
}

export default function ReporteRotacionPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<RotationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('3months')

  const exportToPDF = () => {
    if (!data || !user) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Header
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Reporte de Rotación de Inventario', pageWidth / 2, 20, { align: 'center' })

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const periodLabels: Record<string, string> = {
      '1month': '1 mes',
      '3months': '3 meses',
      '6months': '6 meses',
      '12months': '12 meses'
    }
    doc.text(`Período: ${periodLabels[period] || period}`, pageWidth / 2, 28, { align: 'center' })
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 33, { align: 'center' })
    doc.text(`Usuario: ${user.name}`, pageWidth / 2, 38, { align: 'center' })

    // Average rotation
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Rotación Promedio', 14, 50)
    doc.setFontSize(24)
    doc.text(`${data.averageRotation}x`, 14, 60)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('veces por año', 14, 66)

    // Fast moving products
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Productos de Alta Rotación', 14, 80)

    const fastMovingData = data.fastMoving.map(prod => [
      prod.name,
      prod.sku,
      `${prod.rotationRate}x`,
      `${prod.daysToSellOut} días`
    ])

    autoTable(doc, {
      startY: 85,
      head: [['Producto', 'SKU', 'Rotación', 'Se agota en']],
      body: fastMovingData,
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] }
    })

    // Slow moving products
    const finalY1 = (doc as any).lastAutoTable.finalY || 130
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Productos de Baja Rotación', 14, finalY1 + 10)

    const slowMovingData = data.slowMoving.map(prod => [
      prod.name,
      prod.sku,
      `${prod.rotationRate}x`,
      `${prod.daysInStock} días`
    ])

    autoTable(doc, {
      startY: finalY1 + 15,
      head: [['Producto', 'SKU', 'Rotación', 'Días en stock']],
      body: slowMovingData,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] }
    })

    // Category rotation
    const finalY2 = (doc as any).lastAutoTable.finalY || 180
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Rotación por Categoría', 14, finalY2 + 10)

    const categoryData = data.categoryRotation.map(cat => {
      const trendLabels = { up: '↑ Subiendo', down: '↓ Bajando', stable: '→ Estable' }
      return [
        cat.category,
        `${cat.rotationRate}x`,
        trendLabels[cat.trend]
      ]
    })

    autoTable(doc, {
      startY: finalY2 + 15,
      head: [['Categoría', 'Rotación', 'Tendencia']],
      body: categoryData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    })

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      )
    }

    doc.save(`reporte-rotacion-${period}-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      // Simulate loading data
      setTimeout(() => {
        setData({
          averageRotation: 4.2,
          fastMoving: [
            { name: 'Cable USB-C', sku: 'CABLE-USBC-001', rotationRate: 12.5, daysToSellOut: 15 },
            { name: 'Mouse Inalámbrico', sku: 'MOUSE-WIRE-001', rotationRate: 8.3, daysToSellOut: 22 },
            { name: 'Teclado Mecánico', sku: 'KEY-MECH-001', rotationRate: 6.7, daysToSellOut: 28 },
            { name: 'Monitor 24"', sku: 'MON-24-001', rotationRate: 5.2, daysToSellOut: 35 }
          ],
          slowMoving: [
            { name: 'Impresora Láser', sku: 'PRINT-LASER-001', rotationRate: 0.8, daysInStock: 180 },
            { name: 'Proyector HD', sku: 'PROJ-HD-001', rotationRate: 1.2, daysInStock: 150 },
            { name: 'Scanner Profesional', sku: 'SCAN-PRO-001', rotationRate: 1.5, daysInStock: 120 },
            { name: 'Tablet 10"', sku: 'TAB-10-001', rotationRate: 2.1, daysInStock: 90 }
          ],
          categoryRotation: [
            { category: 'Accesorios', rotationRate: 8.5, trend: 'up' },
            { category: 'Electrónicos', rotationRate: 4.2, trend: 'stable' },
            { category: 'Oficina', rotationRate: 3.1, trend: 'down' },
            { category: 'Mobiliario', rotationRate: 1.8, trend: 'down' }
          ]
        })
        setLoading(false)
      }, 1000)
    }
  }, [user, authLoading, router, period])

  const getRotationBadge = (rate: number) => {
    if (rate >= 6) return { variant: 'default' as const, label: 'Alta', color: 'text-success' }
    if (rate >= 3) return { variant: 'secondary' as const, label: 'Media', color: 'text-warning' }
    return { variant: 'destructive' as const, label: 'Baja', color: 'text-destructive' }
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
              <p className="copilot-text-sm copilot-text-muted">Calculando rotación...</p>
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
                <BreadcrumbPage className="copilot-text-sm">Rotación</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="copilot-flex copilot-flex-1 copilot-flex-col copilot-gap-3 sm:copilot-gap-4 copilot-p-2 sm:copilot-p-4 copilot-pt-0">
          <div className="copilot-space-y-6 copilot-mt-3 sm:copilot-mt-4">
            <div className="copilot-flex copilot-flex-col sm:copilot-flex-row copilot-justify-between copilot-items-start sm:copilot-items-center copilot-gap-4">
              <div>
                <h1 className="copilot-font-heading copilot-text-heading-5 copilot-font-semibold copilot-leading-none copilot-m-0">Reporte de Rotación</h1>
                <p className="copilot-text-muted">Análisis de la velocidad de movimiento del inventario</p>
              </div>
              <div className="copilot-flex copilot-gap-2">
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="copilot-w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1month">1 mes</SelectItem>
                    <SelectItem value="3months">3 meses</SelectItem>
                    <SelectItem value="6months">6 meses</SelectItem>
                    <SelectItem value="12months">12 meses</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={exportToPDF}>
                  <Download className="copilot-h-4 copilot-w-4 copilot-mr-2" />
                  Exportar PDF
                </Button>
              </div>
            </div>

            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="copilot-flex copilot-items-center copilot-gap-2">
                  <RotateCcw className="copilot-h-5 copilot-w-5" />
                  Rotación Promedio del Inventario
                </CardTitle>
                <CardDescription>Número promedio de veces que se renueva el inventario</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="copilot-text-4xl copilot-font-bold copilot-mb-2">{data.averageRotation}x</div>
                <p className="copilot-text-muted">veces por año</p>
              </CardContent>
            </Card>

            <div className="copilot-grid copilot-grid-cols-1 lg:copilot-grid-cols-2 copilot-gap-6">
              {/* Fast Moving Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="copilot-flex copilot-items-center copilot-gap-2">
                    <TrendingUp className="copilot-h-4 copilot-w-4 text-success" />
                    Productos de Alta Rotación
                  </CardTitle>
                  <CardDescription>Productos que se mueven más rápidamente</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="copilot-space-y-4">
                    {data.fastMoving.map((product, index) => (
                      <div key={index} className="copilot-flex copilot-items-center copilot-justify-between copilot-p-3 copilot-border copilot-rounded-copilot">
                        <div className="copilot-flex-1">
                          <div className="copilot-font-medium">{product.name}</div>
                          <div className="copilot-text-sm copilot-text-muted">SKU: {product.sku}</div>
                          <div className="copilot-text-sm copilot-text-muted">
                            Se agota en {product.daysToSellOut} días
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="copilot-text-lg copilot-font-bold text-success">
                            {product.rotationRate}x
                          </div>
                          <Badge {...getRotationBadge(product.rotationRate)}>
                            {getRotationBadge(product.rotationRate).label}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Slow Moving Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="copilot-flex copilot-items-center copilot-gap-2">
                    <TrendingDown className="copilot-h-4 copilot-w-4 text-destructive" />
                    Productos de Baja Rotación
                  </CardTitle>
                  <CardDescription>Productos que requieren atención especial</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="copilot-space-y-4">
                    {data.slowMoving.map((product, index) => (
                      <div key={index} className="copilot-flex copilot-items-center copilot-justify-between copilot-p-3 copilot-border copilot-rounded-copilot">
                        <div className="copilot-flex-1">
                          <div className="copilot-font-medium">{product.name}</div>
                          <div className="copilot-text-sm copilot-text-muted">SKU: {product.sku}</div>
                          <div className="copilot-text-sm copilot-text-muted">
                            {product.daysInStock} días en stock
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="copilot-text-lg copilot-font-bold text-destructive">
                            {product.rotationRate}x
                          </div>
                          <Badge {...getRotationBadge(product.rotationRate)}>
                            {getRotationBadge(product.rotationRate).label}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent></Card>
            </div>

            {/* Category Rotation */}
            <Card>
              <CardHeader>
                <CardTitle className="copilot-flex copilot-items-center copilot-gap-2">
                  <Package className="copilot-h-4 copilot-w-4" />
                  Rotación por Categoría
                </CardTitle>
                <CardDescription>Análisis de rotación por categorías de productos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="copilot-grid copilot-grid-cols-1 md:copilot-grid-cols-2 copilot-gap-4">
                  {data.categoryRotation.map((category, index) => (
                    <div key={index} className="copilot-flex copilot-items-center copilot-justify-between copilot-p-4 copilot-border copilot-rounded-copilot">
                      <div className="copilot-flex copilot-items-center copilot-gap-3">
                        <div>
                          <div className="copilot-font-medium">{category.category}</div>
                          <div className="copilot-text-sm copilot-text-muted">
                            {category.rotationRate}x por año
                          </div>
                        </div>
                      </div>
                      <div className="copilot-flex copilot-items-center copilot-gap-2">
                        {category.trend === 'up' && (
                          <TrendingUp className="copilot-h-4 copilot-w-4 text-success" />
                        )}
                        {category.trend === 'down' && (
                          <TrendingDown className="copilot-h-4 copilot-w-4 text-destructive" />
                        )}
                        {category.trend === 'stable' && (
                          <AlertCircle className="copilot-h-4 copilot-w-4 text-warning" />
                        )}
                        <Badge {...getRotationBadge(category.rotationRate)}>
                          {getRotationBadge(category.rotationRate).label}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}