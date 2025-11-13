"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RegressionAnalyzer } from "@/components/RegressionAnalyzer"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Loader2 } from "lucide-react"

export default function RegressionPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in and is an admin
    const checkAdminAccess = () => {
      const storedUser = localStorage.getItem("user")

      if (!storedUser) {
        toast({
          title: "Acceso denegado",
          description: "Debes iniciar sesión para acceder a esta página",
          variant: "destructive",
        })
        router.push("/login?redirectTo=/regression")
        return
      }

      try {
        const userData = JSON.parse(storedUser)
        if (userData.role !== "admin") {
          toast({
            title: "Acceso restringido",
            description: "Esta herramienta está disponible solo para administradores",
            variant: "destructive",
          })
          router.push("/")
          return
        }

        setIsAdmin(true)
      } catch (error) {
        console.error("Error parsing user data:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminAccess()
  }, [router, toast])

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // This will prevent content flash before redirect
  }

  return (
    <div className="container py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Análisis de Regresión Lineal</h1>
        <p className="text-muted-foreground">
          Herramienta avanzada para análisis de regresión lineal simple y múltiple con visualizaciones interactivas
        </p>
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <p className="text-sm text-blue-700">
            Esta herramienta está disponible exclusivamente para administradores del sistema
          </p>
        </div>
      </div>
      <RegressionAnalyzer />
    </div>
  )
}
