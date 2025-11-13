"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  SimpleLinearRegression,
  MultipleLinearRegression,
  RegressionUtils,
  type DataPoint,
  type MultipleDataPoint,
  type RegressionResult,
  type MultipleRegressionResult,
} from "@/lib/regression"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from "recharts"
import { TrendingUp, Calculator, Database, Download } from "lucide-react"

export function RegressionAnalyzer() {
  // Estados para regresión simple
  const [simpleData, setSimpleData] = useState<DataPoint[]>([])
  const [simpleResult, setSimpleResult] = useState<RegressionResult | null>(null)
  const [newX, setNewX] = useState("")
  const [newY, setNewY] = useState("")

  // Estados para regresión múltiple
  const [multipleData, setMultipleData] = useState<MultipleDataPoint[]>([])
  const [multipleResult, setMultipleResult] = useState<MultipleRegressionResult | null>(null)
  const [numFeatures, setNumFeatures] = useState(2)
  const [newFeatures, setNewFeatures] = useState<string[]>(["", ""])
  const [newTarget, setNewTarget] = useState("")

  // Estados generales
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Generar datos de ejemplo al cargar
    generateSampleData()
  }, [])

  const generateSampleData = () => {
    // Datos para regresión simple
    const sampleSimple = RegressionUtils.generateSyntheticData(20, 2.5, 1.2, 0.2)
    setSimpleData(sampleSimple)

    // Datos para regresión múltiple
    const sampleMultiple = RegressionUtils.generateMultipleSyntheticData(30, [1.5, -0.8], 2.0, 0.15)
    setMultipleData(sampleMultiple)

    toast({
      title: "Datos generados",
      description: "Se han generado datos de ejemplo para ambos tipos de regresión",
    })
  }

  const addSimpleDataPoint = () => {
    const x = Number.parseFloat(newX)
    const y = Number.parseFloat(newY)

    if (isNaN(x) || isNaN(y)) {
      toast({
        title: "Error",
        description: "Por favor ingresa valores numéricos válidos",
        variant: "destructive",
      })
      return
    }

    setSimpleData([...simpleData, { x, y }])
    setNewX("")
    setNewY("")
  }

  const addMultipleDataPoint = () => {
    const features = newFeatures.map((f) => Number.parseFloat(f))
    const target = Number.parseFloat(newTarget)

    if (features.some(isNaN) || isNaN(target)) {
      toast({
        title: "Error",
        description: "Por favor ingresa valores numéricos válidos",
        variant: "destructive",
      })
      return
    }

    setMultipleData([...multipleData, { features, target }])
    setNewFeatures(Array(numFeatures).fill(""))
    setNewTarget("")
  }

  const runSimpleRegression = async () => {
    setIsLoading(true)
    try {
      const validation = RegressionUtils.validateData(simpleData)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "))
      }

      const regression = new SimpleLinearRegression()
      const result = regression.fit(simpleData)
      setSimpleResult(result)

      toast({
        title: "Regresión completada",
        description: `R² = ${result.rSquared.toFixed(4)}, Correlación = ${result.correlation.toFixed(4)}`,
      })
    } catch (error: any) {
      toast({
        title: "Error en regresión",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const runMultipleRegression = async () => {
    setIsLoading(true)
    try {
      if (multipleData.length === 0) {
        throw new Error("No hay datos para analizar")
      }

      const regression = new MultipleLinearRegression()
      const result = regression.fit(multipleData)
      setMultipleResult(result)

      toast({
        title: "Regresión múltiple completada",
        description: `R² = ${result.rSquared.toFixed(4)}, RMSE = ${result.rmse.toFixed(4)}`,
      })
    } catch (error: any) {
      toast({
        title: "Error en regresión múltiple",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearData = (type: "simple" | "multiple") => {
    if (type === "simple") {
      setSimpleData([])
      setSimpleResult(null)
    } else {
      setMultipleData([])
      setMultipleResult(null)
    }
  }

  const exportResults = (type: "simple" | "multiple") => {
    const result = type === "simple" ? simpleResult : multipleResult
    const data = type === "simple" ? simpleData : multipleData

    if (!result) {
      toast({
        title: "Error",
        description: "No hay resultados para exportar",
        variant: "destructive",
      })
      return
    }

    const exportData = {
      type,
      timestamp: new Date().toISOString(),
      data,
      result,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `regression-${type}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Exportado",
      description: "Los resultados se han descargado como archivo JSON",
    })
  }

  // Preparar datos para gráficos
  const chartData = simpleData.map((point, index) => ({
    x: point.x,
    y: point.y,
    predicted: simpleResult?.predictions[index] || null,
    residual: simpleResult?.residuals[index] || null,
  }))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Analizador de Regresión Lineal
          </CardTitle>
          <CardDescription>
            Implementación completa de regresión lineal simple y múltiple con análisis estadístico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={generateSampleData} variant="outline">
              <Database className="mr-2 h-4 w-4" />
              Generar datos de ejemplo
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="simple" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="simple">Regresión Simple</TabsTrigger>
          <TabsTrigger value="multiple">Regresión Múltiple</TabsTrigger>
        </TabsList>

        <TabsContent value="simple" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Panel de entrada de datos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Datos de Entrada</CardTitle>
                <CardDescription>Agrega puntos de datos (X, Y) para la regresión</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="newX">Valor X</Label>
                    <Input
                      id="newX"
                      type="number"
                      step="any"
                      value={newX}
                      onChange={(e) => setNewX(e.target.value)}
                      placeholder="Ej: 1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newY">Valor Y</Label>
                    <Input
                      id="newY"
                      type="number"
                      step="any"
                      value={newY}
                      onChange={(e) => setNewY(e.target.value)}
                      placeholder="Ej: 3.2"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addSimpleDataPoint} className="flex-1">
                    Agregar Punto
                  </Button>
                  <Button onClick={() => clearData("simple")} variant="outline">
                    Limpiar
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Datos actuales ({simpleData.length} puntos):</Label>
                  <div className="max-h-32 overflow-y-auto border rounded p-2 text-sm">
                    {simpleData.length === 0 ? (
                      <p className="text-muted-foreground">No hay datos</p>
                    ) : (
                      simpleData.map((point, index) => (
                        <div key={index} className="flex justify-between">
                          <span>
                            ({point.x.toFixed(2)}, {point.y.toFixed(2)})
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={runSimpleRegression}
                    disabled={isLoading || simpleData.length < 2}
                    className="flex-1"
                  >
                    <Calculator className="mr-2 h-4 w-4" />
                    {isLoading ? "Calculando..." : "Ejecutar Regresión"}
                  </Button>
                  <Button onClick={() => exportResults("simple")} variant="outline" disabled={!simpleResult}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Panel de resultados */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resultados</CardTitle>
                <CardDescription>Estadísticas y métricas de la regresión</CardDescription>
              </CardHeader>
              <CardContent>
                {simpleResult ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Ecuación de la recta:</Label>
                        <p className="font-mono text-sm bg-muted p-2 rounded">
                          y = {simpleResult.slope.toFixed(4)}x + {simpleResult.intercept.toFixed(4)}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Coeficiente de determinación:</Label>
                        <p className="font-mono text-sm bg-muted p-2 rounded">
                          R² = {simpleResult.rSquared.toFixed(4)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-sm">Correlación:</Label>
                        <p className="text-sm">{simpleResult.correlation.toFixed(4)}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">RMSE:</Label>
                        <p className="text-sm">{simpleResult.rmse.toFixed(4)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-sm">MSE:</Label>
                        <p className="text-sm">{simpleResult.mse.toFixed(4)}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">MAE:</Label>
                        <p className="text-sm">{simpleResult.mae.toFixed(4)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Interpretación:</Label>
                      <div className="text-sm space-y-1">
                        <p>
                          • El modelo explica el <strong>{(simpleResult.rSquared * 100).toFixed(1)}%</strong> de la
                          varianza
                        </p>
                        <p>
                          • Correlación{" "}
                          <strong>
                            {Math.abs(simpleResult.correlation) > 0.7
                              ? "fuerte"
                              : Math.abs(simpleResult.correlation) > 0.3
                                ? "moderada"
                                : "débil"}
                          </strong>{" "}
                          {simpleResult.correlation > 0 ? "positiva" : "negativa"}
                        </p>
                        <p>
                          • Error promedio: <strong>{simpleResult.mae.toFixed(2)}</strong> unidades
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Ejecuta la regresión para ver los resultados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          {simpleResult && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Gráfico de Dispersión y Regresión</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="x" type="number" domain={["dataMin", "dataMax"]} />
                      <YAxis dataKey="y" type="number" domain={["dataMin", "dataMax"]} />
                      <Tooltip formatter={(value, name) => [Number(value).toFixed(3), name]} />
                      <Scatter dataKey="y" fill="#8884d8" name="Datos reales" />
                      <Line
                        dataKey="predicted"
                        stroke="#ff7300"
                        strokeWidth={2}
                        dot={false}
                        name="Línea de regresión"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Análisis de Residuos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="predicted" type="number" domain={["dataMin", "dataMax"]} />
                      <YAxis dataKey="residual" type="number" />
                      <Tooltip formatter={(value, name) => [Number(value).toFixed(3), name]} />
                      <Scatter dataKey="residual" fill="#82ca9d" name="Residuos" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="multiple" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Panel de entrada para regresión múltiple */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Datos de Entrada Múltiple</CardTitle>
                <CardDescription>Agrega datos con múltiples características</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="numFeatures">Número de características:</Label>
                  <Input
                    id="numFeatures"
                    type="number"
                    min="1"
                    max="10"
                    value={numFeatures}
                    onChange={(e) => {
                      const num = Number.parseInt(e.target.value) || 2
                      setNumFeatures(num)
                      setNewFeatures(Array(num).fill(""))
                    }}
                  />
                </div>

                <div className="space-y-2">
                  {Array(numFeatures)
                    .fill(0)
                    .map((_, index) => (
                      <div key={index}>
                        <Label htmlFor={`feature${index}`}>Característica {index + 1}:</Label>
                        <Input
                          id={`feature${index}`}
                          type="number"
                          step="any"
                          value={newFeatures[index]}
                          onChange={(e) => {
                            const updated = [...newFeatures]
                            updated[index] = e.target.value
                            setNewFeatures(updated)
                          }}
                          placeholder={`Valor ${index + 1}`}
                        />
                      </div>
                    ))}
                </div>

                <div>
                  <Label htmlFor="newTarget">Variable objetivo:</Label>
                  <Input
                    id="newTarget"
                    type="number"
                    step="any"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    placeholder="Valor objetivo"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={addMultipleDataPoint} className="flex-1">
                    Agregar Punto
                  </Button>
                  <Button onClick={() => clearData("multiple")} variant="outline">
                    Limpiar
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Datos actuales ({multipleData.length} puntos):</Label>
                  <div className="max-h-32 overflow-y-auto border rounded p-2 text-sm">
                    {multipleData.length === 0 ? (
                      <p className="text-muted-foreground">No hay datos</p>
                    ) : (
                      multipleData.slice(0, 5).map((point, index) => (
                        <div key={index} className="text-xs">
                          [{point.features.map((f) => f.toFixed(2)).join(", ")}] → {point.target.toFixed(2)}
                        </div>
                      ))
                    )}
                    {multipleData.length > 5 && (
                      <p className="text-xs text-muted-foreground">... y {multipleData.length - 5} más</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={runMultipleRegression}
                    disabled={isLoading || multipleData.length < numFeatures + 1}
                    className="flex-1"
                  >
                    <Calculator className="mr-2 h-4 w-4" />
                    {isLoading ? "Calculando..." : "Ejecutar Regresión"}
                  </Button>
                  <Button onClick={() => exportResults("multiple")} variant="outline" disabled={!multipleResult}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Panel de resultados múltiple */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resultados Múltiples</CardTitle>
                <CardDescription>Estadísticas de la regresión múltiple</CardDescription>
              </CardHeader>
              <CardContent>
                {multipleResult ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Ecuación del modelo:</Label>
                      <p className="font-mono text-xs bg-muted p-2 rounded">
                        y = {multipleResult.intercept.toFixed(4)} +{" "}
                        {multipleResult.coefficients.map((coeff, i) => `${coeff.toFixed(4)}*x${i + 1}`).join(" + ")}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-sm">R²:</Label>
                        <p className="text-sm">{multipleResult.rSquared.toFixed(4)}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">RMSE:</Label>
                        <p className="text-sm">{multipleResult.rmse.toFixed(4)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Coeficientes:</Label>
                      <div className="space-y-1">
                        <div className="text-sm">Intercepto: {multipleResult.intercept.toFixed(4)}</div>
                        {multipleResult.coefficients.map((coeff, index) => (
                          <div key={index} className="text-sm">
                            Característica {index + 1}: {coeff.toFixed(4)}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Importancia de características:</Label>
                      <div className="space-y-1">
                        {multipleResult.featureImportance.map((importance, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-sm w-20">Feat. {index + 1}:</span>
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div className="bg-primary h-2 rounded-full" style={{ width: `${importance * 100}%` }} />
                            </div>
                            <span className="text-xs w-12">{(importance * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Métricas de error:</Label>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>MSE: {multipleResult.mse.toFixed(4)}</div>
                        <div>MAE: {multipleResult.mae.toFixed(4)}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Ejecuta la regresión múltiple para ver los resultados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
