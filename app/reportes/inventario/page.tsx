'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart3, Package, TrendingUp, TrendingDown, AlertTriangle, Download } from 'lucide-react'
import { AppSidebar } from '@/components/AppSidebar'
import { formatCurrency, DEFAULT_CURRENCY } from '@/lib/currency'
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

interface InventoryReport {
  totalProducts: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  categories: {
    name: string
    count: number
    value: number
  }[]
  topProducts: {
    name: string
    sku: string
    quantity: number
    value: number
  }[]
}

export default function ReporteInventarioPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [report, setReport] = useState<InventoryReport | null>(null)
  const [loading, setLoading] = useState(true)

  const exportToPDF = () => {
    if (!report || !user) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Header
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Reporte de Inventario', pageWidth / 2, 20, { align: 'center' })

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 28, { align: 'center' })
    doc.text(`Usuario: ${user.name}`, pageWidth / 2, 33, { align: 'center' })

    // Summary section
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Resumen General', 14, 45)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const summaryData = [
      ['Total Productos', report.totalProducts.toString()],
      ['Valor Total', formatCurrency(report.totalValue, DEFAULT_CURRENCY)],
      ['Stock Bajo', report.lowStockItems.toString()],
      ['Sin Stock', report.outOfStockItems.toString()]
    ]

    autoTable(doc, {
      startY: 50,
      head: [['Métrica', 'Valor']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    })

    // Categories section
    const finalY1 = (doc as any).lastAutoTable.finalY || 90
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Inventario por Categoría', 14, finalY1 + 10)

    const categoryData = report.categories.map(cat => [
      cat.name,
      cat.count.toString(),
      formatCurrency(cat.value, DEFAULT_CURRENCY)
    ])

    autoTable(doc, {
      startY: finalY1 + 15,
      head: [['Categoría', 'Cantidad', 'Valor']],
      body: categoryData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }
    })

    // Top products section
    const finalY2 = (doc as any).lastAutoTable.finalY || 140
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Productos de Mayor Valor', 14, finalY2 + 10)

    const productData = report.topProducts.map(prod => [
      prod.name,
      prod.sku,
      prod.quantity.toString(),
      formatCurrency(prod.value, DEFAULT_CURRENCY)
    ])

    autoTable(doc, {
      startY: finalY2 + 15,
      head: [['Producto', 'SKU', 'Cantidad', 'Valor']],
      body: productData,
      theme: 'striped',
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

    doc.save(`reporte-inventario-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      // Simulate loading data
      setTimeout(() => {
        setReport({
          totalProducts: 156,
          totalValue: 245680.50,
          lowStockItems: 12,
          outOfStockItems: 3,
          categories: [
            { name: 'Electrónicos', count: 45, value: 125000 },
            { name: 'Oficina', count: 67, value: 85000 },
            { name: 'Mobiliario', count: 23, value: 35680.50 },
            { name: 'Accesorios', count: 21, value: 15000 }
          ],
          topProducts: [
            { name: 'Laptop Dell XPS 13', sku: 'DELL-XPS13-001', quantity: 25, value: 30000 },
            { name: 'Monitor Samsung 27"', sku: 'SAM-MON27-001', quantity: 40, value: 24000 },
            { name: 'Silla Ergonómica', sku: 'CHAIR-ERG-001', quantity: 15, value: 18000 },
            { name: 'Teclado Mecánico', sku: 'KEY-MECH-001', quantity: 60, value: 12000 }
          ]
        })
        setLoading(false)
      }, 1000)
    }
  }, [user, authLoading, router])

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
              <p className="copilot-text-sm copilot-text-muted">Generando reporte...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!report) return null

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
                <BreadcrumbPage className="copilot-text-sm">Inventario</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="copilot-flex copilot-flex-1 copilot-flex-col copilot-gap-3 sm:copilot-gap-4 copilot-p-2 sm:copilot-p-4 copilot-pt-0">
          <div className="copilot-space-y-6 copilot-mt-3 sm:copilot-mt-4">
            <div className="copilot-flex copilot-flex-col sm:copilot-flex-row copilot-justify-between copilot-items-start sm:copilot-items-center copilot-gap-4">
              <div>
                <h1 className="copilot-font-heading copilot-text-heading-5 copilot-font-semibold copilot-leading-none copilot-m-0">Reporte de Inventario</h1>
                <p className="copilot-text-muted">Análisis completo del estado actual del inventario</p>
              </div>
              <Button onClick={exportToPDF}>
                <Download className="copilot-h-4 copilot-w-4 copilot-mr-2" />
                Exportar PDF
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="copilot-grid copilot-grid-cols-1 md:copilot-grid-cols-2 lg:copilot-grid-cols-4 copilot-gap-4">
              <Card>
                <CardHeader className="copilot-flex copilot-flex-row copilot-items-center copilot-justify-between copilot-space-y-0 copilot-pb-2">
                  <CardTitle className="copilot-text-sm copilot-font-medium">Total Productos</CardTitle>
                  <Package className="copilot-h-4 copilot-w-4 copilot-text-muted" />
                </CardHeader>
                <CardContent>
                  <div className="copilot-text-2xl copilot-font-bold">{report.totalProducts}</div>
                  <p className="copilot-text-xs copilot-text-muted">productos en inventario</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="copilot-flex copilot-flex-row copilot-items-center copilot-justify-between copilot-space-y-0 copilot-pb-2">
                  <CardTitle className="copilot-text-sm copilot-font-medium">Valor Total</CardTitle>
                  <TrendingUp className="copilot-h-4 copilot-w-4 copilot-text-muted" />
                </CardHeader>
                <CardContent>
                  <div className="copilot-text-2xl copilot-font-bold">
                    {formatCurrency(report.totalValue, DEFAULT_CURRENCY)}
                  </div>
                  <p className="copilot-text-xs copilot-text-muted">valor del inventario</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="copilot-flex copilot-flex-row copilot-items-center copilot-justify-between copilot-space-y-0 copilot-pb-2">
                  <CardTitle className="copilot-text-sm copilot-font-medium">Stock Bajo</CardTitle>
                  <AlertTriangle className="copilot-h-4 copilot-w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="copilot-text-2xl copilot-font-bold text-warning">{report.lowStockItems}</div>
                  <p className="copilot-text-xs copilot-text-muted">productos con stock bajo</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="copilot-flex copilot-flex-row copilot-items-center copilot-justify-between copilot-space-y-0 copilot-pb-2">
                  <CardTitle className="copilot-text-sm copilot-font-medium">Sin Stock</CardTitle>
                  <TrendingDown className="copilot-h-4 copilot-w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="copilot-text-2xl copilot-font-bold text-destructive">{report.outOfStockItems}</div>
                  <p className="copilot-text-xs copilot-text-muted">productos agotados</p>
                </CardContent>
              </Card>
            </div>

            <div className="copilot-grid copilot-grid-cols-1 lg:copilot-grid-cols-2 copilot-gap-6">
              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="copilot-flex copilot-items-center copilot-gap-2">
                    <BarChart3 className="copilot-h-4 copilot-w-4" />
                    Inventario por Categoría
                  </CardTitle>
                  <CardDescription>Distribución de productos y valor por categoría</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="copilot-space-y-4">
                    {report.categories.map((category, index) => (
                      <div key={index} className="copilot-flex copilot-items-center copilot-justify-between">
                        <div className="copilot-flex-1">
                          <div className="copilot-flex copilot-items-center copilot-justify-between copilot-mb-1">
                            <span className="copilot-text-sm copilot-font-medium">{category.name}</span>
                            <span className="copilot-text-sm copilot-text-muted">{category.count} productos</span>
                          </div>
                          <div className="copilot-w-full copilot-bg-muted copilot-rounded-full copilot-h-2">
                            <div
                              className="copilot-h-2 copilot-rounded-full copilot-bg-primary"
                              style={{ width: `${(category.value / report.totalValue) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="copilot-ml-4 text-right">
                          <div className="copilot-text-sm copilot-font-semibold">
                            {formatCurrency(category.value, DEFAULT_CURRENCY)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="copilot-flex copilot-items-center copilot-gap-2">
                    <Package className="copilot-h-4 copilot-w-4" />
                    Productos de Mayor Valor
                  </CardTitle>
                  <CardDescription>Productos con mayor valor en inventario</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="copilot-space-y-4">
                    {report.topProducts.map((product, index) => (
                      <div key={index} className="copilot-flex copilot-items-center copilot-justify-between copilot-p-3 copilot-border copilot-rounded-copilot">
                        <div className="copilot-flex-1">
                          <div className="copilot-font-medium">{product.name}</div>
                          <div className="copilot-text-sm copilot-text-muted">SKU: {product.sku}</div>
                          <div className="copilot-text-sm copilot-text-muted">Cantidad: {product.quantity}</div>
                        </div>
                        <div className="text-right">
                          <div className="copilot-font-semibold">
                            {formatCurrency(product.value, DEFAULT_CURRENCY)}
                          </div>
                          <Badge variant="outline" className="copilot-mt-1">
                            #{index + 1}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent></Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}