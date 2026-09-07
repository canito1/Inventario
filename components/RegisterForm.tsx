'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from '@/lib/auth'
import { Logo } from '@/components/Logo'
import Link from 'next/link'

export function RegisterForm() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            await authService.register({ name, email, password })
            router.push('/')
        } catch (error: any) {
            setError(error.message || 'Error al registrar usuario')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="copilot-flex copilot-min-h-screen copilot-w-full copilot-items-center copilot-justify-center copilot-p-4 sm:copilot-p-6 copilot-bg-background">
            <div className="copilot-w-full copilot-max-w-sm">
                <div className="copilot-flex copilot-justify-center copilot-mb-6">
                    <Logo size="lg" />
                </div>
                <Card className="copilot-bg-muted copilot-border copilot-border-border copilot-rounded-copilot">
                    <CardHeader className="copilot-space-y-1">
                        <CardTitle className="copilot-font-heading copilot-text-heading-5 copilot-font-semibold copilot-leading-none copilot-m-0">Crear Cuenta</CardTitle>
                        <CardDescription className="copilot-text-sm copilot-text-muted">Ingresa tus datos para registrarte</CardDescription>
                    </CardHeader>
                    <CardContent className="copilot-p-4 sm:copilot-p-6">
                        <form onSubmit={handleSubmit} className="copilot-space-y-4">
                            {error && (
                                <div className="copilot-text-sm copilot-text-destructive copilot-bg-destructive/10 copilot-border copilot-border-destructive/20 copilot-p-3 copilot-rounded-copilot">
                                    {error}
                                </div>
                            )}
                            <div className="copilot-space-y-2">
                                <Label htmlFor="name" className="copilot-text-xs copilot-font-medium copilot-text-muted copilot-uppercase copilot-tracking-wider">Nombre</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Tu nombre"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="copilot-h-10 copilot-rounded-copilot"
                                />
                            </div>
                            <div className="copilot-space-y-2">
                                <Label htmlFor="email" className="copilot-text-xs copilot-font-medium copilot-text-muted copilot-uppercase copilot-tracking-wider">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="copilot-h-10 copilot-rounded-copilot"
                                />
                            </div>
                            <div className="copilot-space-y-2">
                                <Label htmlFor="password" className="copilot-text-xs copilot-font-medium copilot-text-muted copilot-uppercase copilot-tracking-wider">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="********"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="copilot-h-10 copilot-rounded-copilot"
                                />
                            </div>
                            <Button type="submit" className="copilot-w-full copilot-h-10 copilot-rounded-copilot" disabled={isLoading}>
                                {isLoading ? "Registrando..." : "Registrarse"}
                            </Button>
                            <div className="copilot-text-center copilot-text-xs sm:copilot-text-sm copilot-text-muted">
                                ¿Ya tienes una cuenta?{" "}
                                <Link href="/login" className="copilot-underline copilot-hover:text-primary copilot-transition-colors">
                                    Inicia Sesión
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}