'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Users, Search, Mail, Calendar, Shield } from 'lucide-react'
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

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'employee'
  status: 'active' | 'inactive'
  lastLogin: string
  createdAt: string
}

export default function UsuariosPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      // Simulate loading data
      setTimeout(() => {
      setUsers([
        {
          id: '1',
          name: 'Admin Principal',
          email: 'admin@empresa.com',
          role: 'admin',
          status: 'active',
          lastLogin: new Date(Date.now() - 3600000).toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
        },
        {
          id: '2',
          name: 'María García',
          email: 'maria.garcia@empresa.com',
          role: 'manager',
          status: 'active',
          lastLogin: new Date(Date.now() - 7200000).toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 15).toISOString()
        },
        {
          id: '3',
          name: 'Juan Pérez',
          email: 'juan.perez@empresa.com',
          role: 'employee',
          status: 'active',
          lastLogin: new Date(Date.now() - 86400000).toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
        },
        {
          id: '4',
          name: 'Ana López',
          email: 'ana.lopez@empresa.com',
          role: 'employee',
          status: 'inactive',
          lastLogin: new Date(Date.now() - 86400000 * 5).toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 20).toISOString()
        }
      ])
      setLoading(false)
      }, 1000)
    }
  }, [user, authLoading, router])

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { variant: 'default' as const, label: 'Administrador', icon: Shield }
      case 'manager':
        return { variant: 'secondary' as const, label: 'Gerente', icon: Users }
      case 'employee':
        return { variant: 'outline' as const, label: 'Empleado', icon: Users }
      default:
        return { variant: 'outline' as const, label: role, icon: Users }
    }
  }

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? { variant: 'default' as const, label: 'Activo', className: "copilot-bg-success/10 text-success copilot-border-success/20" }
      : { variant: 'secondary' as const, label: 'Inactivo', className: "copilot-bg-muted copilot-text-muted copilot-border-border" }
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
              <p className="copilot-text-sm copilot-text-muted">Cargando usuarios...</p>
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
                <BreadcrumbPage className="copilot-text-sm">Usuarios</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="copilot-flex copilot-flex-1 copilot-flex-col copilot-gap-3 sm:copilot-gap-4 copilot-p-2 sm:copilot-p-4 copilot-pt-0">
          <div className="copilot-space-y-6 copilot-mt-3 sm:copilot-mt-4">
            <div className="copilot-flex copilot-flex-col sm:copilot-flex-row copilot-justify-between copilot-items-start sm:copilot-items-center copilot-gap-4">
              <div>
                <h1 className="copilot-font-heading copilot-text-heading-5 copilot-font-semibold copilot-leading-none copilot-m-0">Gestión de Usuarios</h1>
                <p className="copilot-text-muted">Administra los usuarios del sistema</p>
              </div>
            </div>

      <div className="copilot-flex copilot-flex-col sm:copilot-flex-row copilot-gap-4">
        <div className="copilot-relative copilot-flex-1">
          <Search className="copilot-absolute copilot-left-3 copilot-top-1/2 copilot-transform -copilot-translate-y-1/2 copilot-h-4 copilot-w-4 copilot-text-muted" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="copilot-pl-10"
          />
        </div>
      </div>
      </div>

      <div className="copilot-grid copilot-gap-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="copilot-flex copilot-flex-col copilot-items-center copilot-justify-center copilot-py-12">
              <Users className="copilot-h-12 copilot-w-12 copilot-text-muted copilot-mb-4" />
              <h3 className="copilot-text-lg copilot-font-semibold copilot-mb-2">No se encontraron usuarios</h3>
              <p className="copilot-text-muted copilot-text-center">
                {searchTerm
                  ? 'Intenta ajustar los términos de búsqueda'
                  : 'No hay usuarios registrados en el sistema'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <div className="copilot-flex copilot-items-center copilot-justify-between">
                  <div className="copilot-flex copilot-items-center copilot-gap-4">
                    <Avatar className="copilot-h-12 copilot-w-12">
                      <AvatarFallback className="copilot-text-lg">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="copilot-text-lg">{user.name}</CardTitle>
                      <CardDescription className="copilot-flex copilot-items-center copilot-gap-1">
                        <Mail className="copilot-h-3 copilot-w-3" />
                        {user.email}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="copilot-flex copilot-items-center copilot-gap-2">
                    <Badge {...getStatusBadge(user.status)}>
                      {getStatusBadge(user.status).label}
                    </Badge>
                    <Badge {...getRoleBadge(user.role)}>
                      {getRoleBadge(user.role).label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="copilot-grid copilot-grid-cols-1 md:copilot-grid-cols-3 copilot-gap-4 copilot-text-sm">
                  <div>
                    <p className="copilot-text-muted">Último acceso</p>
                    <p className="copilot-font-medium copilot-flex copilot-items-center copilot-gap-1">
                      <Calendar className="copilot-h-3 copilot-w-3" />
                      {new Date(user.lastLogin).toLocaleDateString('es-ES')} {new Date(user.lastLogin).toLocaleTimeString('es-ES')}
                    </p>
                  </div>
                  <div>
                    <p className="copilot-text-muted">Fecha de registro</p>
                    <p className="copilot-font-medium copilot-flex copilot-items-center copilot-gap-1">
                      <Calendar className="copilot-h-3 copilot-w-3" />
                      {new Date(user.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="copilot-flex copilot-justify-end copilot-gap-2">
                    <Button
                      variant={user.status === 'active' ? 'destructive' : 'default'}
                      size="sm"
                    >
                      {user.status === 'active' ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
          </div>
          </div>
        </SidebarInset>
    </SidebarProvider>
  )
}