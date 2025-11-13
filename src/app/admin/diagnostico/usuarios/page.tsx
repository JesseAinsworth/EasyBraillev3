"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2, RefreshCw, Plus, Trash, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface User {
  _id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export default function DiagnosticoUsuariosPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  })
  const [logs, setLogs] = useState<string[]>([])
  const { toast } = useToast()

  // Cargar usuarios
  const loadUsers = async () => {
    try {
      setIsLoading(true)
      addLog("🔄 Cargando usuarios...")

      const response = await fetch("/api/debug/user-operations")
      const data = await response.json()

      if (data.success) {
        setUsers(data.users)
        addLog(`✅ ${data.users.length} usuarios cargados correctamente`)
      } else {
        addLog(`❌ Error al cargar usuarios: ${data.error}`)
        toast({
          title: "Error",
          description: data.error || "No se pudieron cargar los usuarios",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`)
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al cargar los usuarios",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Crear usuario
  const createUser = async () => {
    try {
      setIsProcessing(true)
      addLog(`🔄 Creando usuario: ${newUser.email}...`)

      const response = await fetch("/api/debug/user-operations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      })

      const data = await response.json()

      if (data.success) {
        addLog(`✅ Usuario creado correctamente: ${data.email}`)
        toast({
          title: "Usuario creado",
          description: `Usuario ${data.email} creado correctamente`,
        })

        // Limpiar formulario
        setNewUser({
          name: "",
          email: "",
          password: "",
          role: "user",
        })

        // Recargar usuarios
        loadUsers()
      } else {
        addLog(`❌ Error al crear usuario: ${data.error}`)
        toast({
          title: "Error",
          description: data.error || "No se pudo crear el usuario",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`)
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al crear el usuario",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Eliminar usuario
  const deleteUser = async (userId: string) => {
    try {
      setIsProcessing(true)
      addLog(`🔄 Eliminando usuario: ${userId}...`)

      const response = await fetch(`/api/debug/user-operations?id=${userId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        addLog(`✅ Usuario eliminado correctamente`)
        toast({
          title: "Usuario eliminado",
          description: "El usuario ha sido eliminado correctamente",
        })

        // Recargar usuarios
        loadUsers()
      } else {
        addLog(`❌ Error al eliminar usuario: ${data.error}`)
        toast({
          title: "Error",
          description: data.error || "No se pudo eliminar el usuario",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`)
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al eliminar el usuario",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Añadir log
  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers()
  }, [])

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/diagnostico">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Diagnóstico de Usuarios</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario para crear usuario */}
        <Card>
          <CardHeader>
            <CardTitle>Crear Usuario (Directo a DB)</CardTitle>
            <CardDescription>Crea un usuario directamente en la base de datos para probar la conexión</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Nombre del usuario"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="email@ejemplo.com"
                  type="email"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Contraseña</label>
                <Input
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Contraseña"
                  type="password"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Rol</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={isProcessing}
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <Button
                onClick={createUser}
                disabled={isProcessing || !newUser.name || !newUser.email}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Usuario
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de usuarios */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Usuarios en Base de Datos</CardTitle>
                <CardDescription>Lista de usuarios almacenados en MongoDB</CardDescription>
              </div>
              <Button variant="outline" onClick={loadUsers} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Cargando usuarios...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No hay usuarios en la base de datos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user._id} className="p-4 border rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ${
                              user.role === "admin" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {user.role === "admin" ? "Admin" : "Usuario"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => deleteUser(user._id)} disabled={isProcessing}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Logs */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Logs de Operaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md h-[200px] overflow-y-auto font-mono text-sm">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
