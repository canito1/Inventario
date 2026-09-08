'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      await login(email, password)
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-background px-4 py-6 sm:px-6 sm:py-8">
      <div className="w-full max-w-sm mx-auto">
        {/* Brand mark */}
        <div className="copilot-text-center copilot-mb-8">
          <div className="copilot-inline-flex copilot-items-center copilot-justify-center copilot-w-12 copilot-h-12 copilot-rounded-full copilot-bg-primary copilot-border copilot-border-foreground copilot-mb-4 copilot-mx-auto">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="9" fill="white" fillOpacity="0.3" />
              <circle cx="11" cy="11" r="4" fill="white" />
            </svg>
          </div>
          <h1 className="copilot-font-heading copilot-text-heading-4 copilot-font-bold copilot-text-foreground copilot-m-0">
            Bienvenido
          </h1>
          <p className="copilot-text-sm copilot-text-muted copilot-mt-2">
            Inicia sesión para continuar
          </p>
        </div>

        {/* Card */}
        <Card className="copilot-bg-muted copilot-border copilot-border-border copilot-rounded-copilot">
          <CardContent className="copilot-p-4 sm:copilot-p-6">
            <form onSubmit={handleSubmit} className="copilot-space-y-4">
              {/* Error */}
              {error && (
                <div className="copilot-text-sm copilot-text-destructive copilot-bg-destructive/10 copilot-border copilot-border-destructive/20 copilot-p-3 copilot-rounded-copilot">
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="copilot-space-y-2">
                <Label htmlFor="email" className="copilot-text-xs copilot-font-medium copilot-text-muted copilot-uppercase copilot-tracking-wider">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@inventario.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="copilot-h-10 copilot-rounded-copilot"
                />
              </div>

              {/* Password */}
              <div className="copilot-space-y-2">
                <div className="copilot-flex copilot-justify-between copilot-items-center">
                  <Label htmlFor="password" className="copilot-text-xs copilot-font-medium copilot-text-muted copilot-uppercase copilot-tracking-wider">
                    Contraseña
                  </Label>
                  <a
                    href="#"
                    className="copilot-text-xs copilot-text-primary copilot-hover:text-primary/80 copilot-transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <div className="copilot-relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="copilot-h-10 copilot-rounded-copilot copilot-pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="copilot-absolute copilot-right-3 copilot-top-1/2 -copilot-translate-y-1/2 copilot-text-muted copilot-hover:text-foreground copilot-transition-colors"
                  >
                    {showPassword ? <EyeOff className="copilot-h-4 copilot-w-4" /> : <Eye className="copilot-h-4 copilot-w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button type="submit" disabled={isLoading} className="copilot-w-full copilot-h-10 copilot-rounded-copilot">
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>

              {/* Divider */}
              <div className="copilot-flex copilot-items-center copilot-gap-3 copilot-mt-2">
                <div className="copilot-flex-1 copilot-h-px copilot-bg-border" />
                <span className="copilot-text-xs copilot-text-muted">O continúa con</span>
                <div className="copilot-flex-1 copilot-h-px copilot-bg-border" />
              </div>

              {/* Google button */}
              <Button type="button" variant="outline" className="copilot-w-full copilot-h-10 copilot-rounded-copilot copilot-gap-2">
                {/* Google icon */}
                <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                </svg>
                Iniciar con Google
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Register link */}
        <p className="copilot-text-center copilot-mt-6 copilot-text-sm copilot-text-muted">
          ¿No tienes una cuenta?{" "}
          <Link
            href="/register"
            className="copilot-font-medium copilot-text-primary copilot-hover:text-primary/80 copilot-transition-colors"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  )
}