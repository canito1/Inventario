'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Edit, Trash2, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Category, categoriesService, CreateCategoryData } from '@/lib/categories'

interface CategoryWithExtras extends Category {
  productCount: number
  color: string
}

export default function CategoriasPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<CategoryWithExtras[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithExtras | null>(null)
  const [loading, setLoading] = useState(true)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6'
  })

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ]

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchCategories()
    }
  }, [user, authLoading, router])

  const fetchCategories = async () => {
    try {
      const backendCategories = await categoriesService.getCategories()

      // Transform backend categories to include UI properties
      const categoriesWithExtras: CategoryWithExtras[] = backendCategories.map((cat, index) => ({
        ...cat,
        productCount: Math.floor(Math.random() * 30), // TODO: Get real count from backend
        color: colors[index % colors.length] // Assign colors cyclically
      }))

      setCategories(categoriesWithExtras)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleCreateCategory = async () => {
    try {
      const categoryData: CreateCategoryData = {
        name: formData.name,
        description: formData.description
      }

      const newCategory = await categoriesService.createCategory(categoryData)
      const categoryWithExtras: CategoryWithExtras = {
        ...newCategory,
        productCount: 0,
        color: formData.color
      }

      setCategories([...categories, categoryWithExtras])
      setIsCreateDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  const handleEditCategory = async () => {
    if (!selectedCategory) return

    try {
      const updateData: Partial<CreateCategoryData> = {
        name: formData.name,
        description: formData.description
      }

      const updatedCategory = await categoriesService.updateCategory(selectedCategory._id, updateData)

      const updatedCategories = categories.map(cat =>
        cat._id === selectedCategory._id
          ? { ...updatedCategory, productCount: cat.productCount, color: formData.color }
          : cat
      )

      setCategories(updatedCategories)
      setIsEditDialogOpen(false)
      setSelectedCategory(null)
      resetForm()
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      try {
        await categoriesService.deleteCategory(categoryId)
        setCategories(categories.filter(cat => cat._id !== categoryId))
      } catch (error) {
        console.error('Error deleting category:', error)
      }
    }
  }

  const openEditDialog = (category: CategoryWithExtras) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3b82f6'
    })
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
              <p className="copilot-text-sm copilot-text-muted">Cargando categorías...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
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
                <BreadcrumbPage className="copilot-text-sm">Categorías</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="copilot-flex copilot-flex-1 copilot-flex-col copilot-gap-3 sm:copilot-gap-4 copilot-p-2 sm:copilot-p-4 copilot-pt-0">
          <div className="copilot-space-y-6 copilot-mt-3 sm:copilot-mt-4">
      {/* Header */}
      <div className="copilot-flex copilot-flex-col sm:copilot-flex-row copilot-justify-between copilot-items-start sm:copilot-items-center copilot-gap-4">
        <div>
          <h1 className="copilot-font-heading copilot-text-heading-5 copilot-font-semibold copilot-leading-none copilot-m-0">Categorías</h1>
          <p className="copilot-text-muted">
            Organiza tus productos por categorías
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="copilot-w-full sm:copilot-w-auto">
          <Plus className="copilot-h-4 copilot-w-4 copilot-mr-2" />
          Nueva Categoría
        </Button>
      </div>

      {/* Search */}
      <div className="copilot-relative copilot-max-w-md">
        <Search className="copilot-absolute copilot-left-3 copilot-top-1/2 copilot-transform -copilot-translate-y-1/2 copilot-text-muted copilot-h-4 copilot-w-4" />
        <Input
          placeholder="Buscar categorías..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="copilot-pl-10"
        />
      </div>

      {/* Stats */}
      <div className="copilot-grid copilot-grid-cols-1 sm:copilot-grid-cols-3 copilot-gap-4">
        <Card>
          <CardHeader className="copilot-flex copilot-flex-row copilot-items-center copilot-justify-between copilot-space-y-0 copilot-pb-2">
            <CardTitle className="copilot-text-sm copilot-font-medium">Total Categorías</CardTitle>
            <Tag className="copilot-h-4 copilot-w-4 copilot-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="copilot-text-2xl copilot-font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="copilot-flex copilot-flex-row copilot-items-center copilot-justify-between copilot-space-y-0 copilot-pb-2">
            <CardTitle className="copilot-text-sm copilot-font-medium">Total Productos</CardTitle>
            <Tag className="copilot-h-4 copilot-w-4 copilot-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="copilot-text-2xl copilot-font-bold">
              {categories.reduce((sum, cat) => sum + cat.productCount, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="copilot-flex copilot-flex-row copilot-items-center copilot-justify-between copilot-space-y-0 copilot-pb-2">
            <CardTitle className="copilot-text-sm copilot-font-medium">Promedio por Categoría</CardTitle>
            <Tag className="copilot-h-4 copilot-w-4 copilot-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="copilot-text-2xl copilot-font-bold">
              {categories.length > 0
                ? Math.round(categories.reduce((sum, cat) => sum + cat.productCount, 0) / categories.length)
                : 0
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="copilot-grid copilot-grid-cols-1 md:copilot-grid-cols-2 lg:copilot-grid-cols-3 copilot-gap-4">
        {filteredCategories.map((category) => (
          <Card key={category._id} className="copilot-transition-all copilot-duration-200 hover:copilot-border-primary/30">
            <CardHeader>
              <div className="copilot-flex copilot-justify-between copilot-items-start">
                <div className="copilot-flex copilot-items-center copilot-space-x-3">
                  <div
                    className="copilot-w-4 copilot-h-4 copilot-rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <CardTitle className="copilot-text-lg">{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
                <div className="copilot-flex copilot-space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(category)}
                  >
                    <Edit className="copilot-h-4 copilot-w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category._id)}
                    className="copilot-text-destructive copilot-hover:copilot-text-destructive/80"
                  >
                    <Trash2 className="copilot-h-4 copilot-w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="copilot-flex copilot-justify-between copilot-items-center">
                <span className="copilot-text-sm copilot-text-muted">Productos:</span>
                <Badge variant="secondary">{category.productCount}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center copilot-py-12">
          <Tag className="copilot-h-12 copilot-w-12 copilot-text-muted copilot-mx-auto copilot-mb-4" />
          <h3 className="copilot-text-lg copilot-font-medium copilot-mb-2">No se encontraron categorías</h3>
          <p className="copilot-text-muted copilot-mb-4">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza creando tu primera categoría'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="copilot-h-4 copilot-w-4 copilot-mr-2" />
              Crear Categoría
            </Button>
          )}
        </div>
      )}

      {/* Create Category Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="copilot-w-[95vw] copilot-max-w-[480px] copilot-p-4 sm:copilot-p-6">
          <DialogHeader>
            <DialogTitle className="copilot-font-heading copilot-text-heading-5 copilot-font-semibold copilot-leading-none copilot-m-0">Nueva Categoría</DialogTitle>
            <DialogDescription className="copilot-text-sm copilot-text-muted">
              Crea una nueva categoría para organizar tus productos.
            </DialogDescription>
          </DialogHeader>
          <div className="copilot-space-y-4">
            <div>
              <Label htmlFor="name" className="copilot-text-sm copilot-font-medium">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre de la categoría"
                className="copilot-mt-2"
              />
            </div>
            <div>
              <Label htmlFor="description" className="copilot-text-sm copilot-font-medium">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción opcional"
                className="copilot-mt-2"
              />
            </div>
            <div>
              <Label className="copilot-text-sm copilot-font-medium">Color</Label>
              <div className="copilot-flex copilot-space-x-2 copilot-mt-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`copilot-w-8 copilot-h-8 copilot-rounded-full copilot-border-2 ${
                      formData.color === color ? 'copilot-border-foreground' : 'copilot-border-border'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="copilot-flex copilot-flex-col sm:copilot-flex-row copilot-gap-2 sm:copilot-gap-0">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="copilot-w-full sm:copilot-w-auto">
              Cancelar
            </Button>
            <Button onClick={handleCreateCategory} disabled={!formData.name.trim()} className="copilot-w-full sm:copilot-w-auto">
              Crear Categoría
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="copilot-w-[95vw] copilot-max-w-[480px] copilot-p-4 sm:copilot-p-6">
          <DialogHeader>
            <DialogTitle className="copilot-font-heading copilot-text-heading-5 copilot-font-semibold copilot-leading-none copilot-m-0">Editar Categoría</DialogTitle>
            <DialogDescription className="copilot-text-sm copilot-text-muted">
              Modifica los detalles de la categoría.
            </DialogDescription>
          </DialogHeader>
          <div className="copilot-space-y-4">
            <div>
              <Label htmlFor="edit-name" className="copilot-text-sm copilot-font-medium">Nombre</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre de la categoría"
                className="copilot-mt-2"
              />
            </div>
            <div>
              <Label htmlFor="edit-description" className="copilot-text-sm copilot-font-medium">Descripción</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción opcional"
                className="copilot-mt-2"
              />
            </div>
            <div>
              <Label className="copilot-text-sm copilot-font-medium">Color</Label>
              <div className="copilot-flex copilot-space-x-2 copilot-mt-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`copilot-w-8 copilot-h-8 copilot-rounded-full copilot-border-2 ${
                      formData.color === color ? 'copilot-border-foreground' : 'copilot-border-border'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="copilot-flex copilot-flex-col sm:copilot-flex-row copilot-gap-2 sm:copilot-gap-0">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="copilot-w-full sm:copilot-w-auto">
              Cancelar
            </Button>
            <Button onClick={handleEditCategory} disabled={!formData.name.trim()} className="copilot-w-full sm:copilot-w-auto">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}