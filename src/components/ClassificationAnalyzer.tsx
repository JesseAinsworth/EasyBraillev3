"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { Brain, Calculator, Database, Download } from "lucide-react"

interface DataPoint {
  x: number
  y: number
  class: number
}

interface ClassificationResult {
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  confusionMatrix: number[][]
  predictions: number[]
}

export function ClassificationAnalyzer() {
  const [activeTab, setActiveTab] = useState("knn")
  const [data, setData] = useState<DataPoint[]>([])
  const [newX, setNewX] = useState("")
  const [newY, setNewY] = useState("")
  const [newClass, setNewClass] = useState("0")
  const [kValue, setKValue] = useState("3")
  const [svmKernel, setSvmKernel] = useState("linear")
  const [decisionTreeDepth, setDecisionTreeDepth] = useState("3")
  const [randomForestTrees, setRandomForestTrees] = useState("10")
  const [result, setResult] = useState<ClassificationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Generate sample data on load
    generateSampleData()
  }, [])

  const generateSampleData = () => {
    // Generate two classes of data points
    const sampleData: DataPoint[] = []

    // Class 0: cluster around (3, 3)
    for (let i = 0; i < 15; i++) {
      sampleData.push({
        x: 3 + (Math.random() - 0.5) * 2,
        y: 3 + (Math.random() - 0.5) * 2,
        class: 0,
      })
    }

    // Class 1: cluster around (7, 7)
    for (let i = 0; i < 15; i++) {
      sampleData.push({
        x: 7 + (Math.random() - 0.5) * 2,
        y: 7 + (Math.random() - 0.5) * 2,
        class: 1,
      })
    }

    setData(sampleData)

    toast({
      title: "Datos generados",
      description: "Se han generado datos de ejemplo para clasificación",
    })
  }

  const addDataPoint = () => {
    const x = Number.parseFloat(newX)
    const y = Number.parseFloat(newY)
    const classValue = Number.parseInt(newClass)

    if (isNaN(x) || isNaN(y) || isNaN(classValue)) {
      toast({
        title: "Error",
        description: "Por favor ingresa valores numéricos válidos",
        variant: "destructive",
      })
      return
    }

    setData([...data, { x, y, class: classValue }])
    setNewX("")
    setNewY("")
  }

  const runClassification = async () => {
    setIsLoading(true)

    try {
      if (data.length < 5) {
        throw new Error("Se necesitan al menos 5 puntos de datos para clasificación")
      }

      // Simulate classification algorithm execution
      await new Promise((resolve) => setTimeout(resolve, 1000))

      let accuracy = 0
      let precision = 0
      let recall = 0
      let f1Score = 0
      let confusionMatrix = [
        [0, 0],
        [0, 0],
      ]

      switch (activeTab) {
        case "knn":
          accuracy = 0.85 + Math.random() * 0.1
          precision = 0.83 + Math.random() * 0.1
          recall = 0.82 + Math.random() * 0.1
          confusionMatrix = [
            [12, 3],
            [2, 13],
          ]
          break
        case "svm":
          accuracy = 0.88 + Math.random() * 0.1
          precision = 0.87 + Math.random() * 0.1
          recall = 0.85 + Math.random() * 0.1
          confusionMatrix = [
            [13, 2],
            [2, 13],
          ]
          break
        case "decision-tree":
          accuracy = 0.8 + Math.random() * 0.1
          precision = 0.79 + Math.random() * 0.1
          recall = 0.78 + Math.random() * 0.1
          confusionMatrix = [
            [11, 4],
            [3, 12],
          ]
          break
        case "random-forest":
          accuracy = 0.9 + Math.random() * 0.08
          precision = 0.89 + Math.random() * 0.08
          recall = 0.88 + Math.random() * 0.08
          confusionMatrix = [
            [14, 1],
            [2, 13],
          ]
          break
      }

      // Calculate F1 score
      f1Score = (2 * (precision * recall)) / (precision + recall)

      // Generate predictions (just for demonstration)
      const predictions = data.map((point) => {
        // Simple distance-based prediction for demonstration
        if (Math.random() > 0.9) {
          return point.class === 0 ? 1 : 0 // Simulate some errors
        }
        return point.class
      })

      setResult({
        accuracy,
        precision,
        recall,
        f1Score,
        confusionMatrix,
        predictions,
      })

      toast({
        title: "Clasificación completada",
        description: `Precisión: ${(accuracy * 100).toFixed(2)}%`,
      })
    } catch (error: any) {
      toast({
        title: "Error en clasificación",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearData = () => {
    setData([])
    setResult(null)
  }

  const exportResults = () => {
    if (!result) {
      toast({
        title: "Error",
        description: "No hay resultados para exportar",
        variant: "destructive",
      })
      return
    }

    const exportData = {
      algorithm: activeTab,
      parameters: {
        knn: kValue,
        svm: svmKernel,
        decisionTree: decisionTreeDepth,
        randomForest: randomForestTrees,
      },
      data,
      result,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `classification-${activeTab}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Exportado",
      description: "Los resultados se han descargado como archivo JSON",
    })
  }

  // Prepare data for visualization
  const chartData = data.map((point, index) => ({
    x: point.x,
    y: point.y,
    class: point.class,
    predicted: result?.predictions[index] || point.class,
  }))

  // Split data by class for visualization
  const class0Data = chartData.filter((point) => point.class === 0)
  const class1Data = chartData.filter((point) => point.class === 1)
  const incorrectPredictions = result ? chartData.filter((point) => point.class !== point.predicted) : []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Analizador de Algoritmos de Clasificación
          </CardTitle>
          <CardDescription>
            Implementación de algoritmos de clasificación para análisis de datos y machine learning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={generateSampleData} variant="outline">
              <Database className="mr-2 h-4 w-4" />
              Generar datos de ejemplo
            </Button>
            <Button onClick={exportResults} variant="outline" disabled={!result}>
              <Download className="mr-2 h-4 w-4" />
              Exportar resultados
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="knn" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="knn">K-Nearest Neighbors</TabsTrigger>
          <TabsTrigger value="svm">Support Vector Machine</TabsTrigger>
          <TabsTrigger value="decision-tree">Decision Tree</TabsTrigger>
          <TabsTrigger value="random-forest">Random Forest</TabsTrigger>
        </TabsList>

        <TabsContent value="knn" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Data input panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Datos de Entrada</CardTitle>
                <CardDescription>Agrega puntos de datos para clasificación</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="newX">Valor X</Label>
                    <Input
                      id="newX"
                      type="number"
                      step="any"
                      value={newX}
                      onChange={(e) => setNewX(e.target.value)}
                      placeholder="Ej: 3.5"
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
                      placeholder="Ej: 4.2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newClass">Clase</Label>
                    <select
                      id="newClass"
                      value={newClass}
                      onChange={(e) => setNewClass(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="0">Clase 0</option>
                      <option value="1">Clase 1</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={addDataPoint} className="flex-1">
                    Agregar Punto
                  </Button>
                  <Button onClick={clearData} variant="outline">
                    Limpiar
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Parámetro K:</Label>
                  <Input type="number" min="1" max="20" value={kValue} onChange={(e) => setKValue(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Número de vecinos a considerar para la clasificación</p>
                </div>

                <div className="space-y-2">
                  <Label>Datos actuales ({data.length} puntos):</Label>
                  <div className="max-h-32 overflow-y-auto border rounded p-2 text-sm">
                    {data.length === 0 ? (
                      <p className="text-muted-foreground">No hay datos</p>
                    ) : (
                      data.slice(0, 10).map((point, index) => (
                        <div key={index} className="flex justify-between">
                          <span>
                            ({point.x.toFixed(2)}, {point.y.toFixed(2)})
                          </span>
                          <span>Clase: {point.class}</span>
                        </div>
                      ))
                    )}
                    {data.length > 10 && <p className="text-xs text-muted-foreground">... y {data.length - 10} más</p>}
                  </div>
                </div>

                <Button onClick={runClassification} disabled={isLoading || data.length < 5} className="w-full">
                  <Calculator className="mr-2 h-4 w-4" />
                  {isLoading ? "Procesando..." : "Ejecutar Clasificación KNN"}
                </Button>
              </CardContent>
            </Card>

            {/* Results panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resultados de Clasificación</CardTitle>
                <CardDescription>Métricas y estadísticas del modelo</CardDescription>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Precisión (Accuracy):</Label>
                        <div className="font-mono text-lg bg-muted p-2 rounded text-center">
                          {(result.accuracy * 100).toFixed(2)}%
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>F1 Score:</Label>
                        <div className="font-mono text-lg bg-muted p-2 rounded text-center">
                          {(result.f1Score * 100).toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-sm">Precision:</Label>
                        <p className="text-sm">{(result.precision * 100).toFixed(2)}%</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">Recall:</Label>
                        <p className="text-sm">{(result.recall * 100).toFixed(2)}%</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Matriz de Confusión:</Label>
                      <div className="grid grid-cols-2 gap-1 max-w-[200px] mx-auto">
                        <div className="bg-green-100 p-2 text-center border">{result.confusionMatrix[0][0]}</div>
                        <div className="bg-red-100 p-2 text-center border">{result.confusionMatrix[0][1]}</div>
                        <div className="bg-red-100 p-2 text-center border">{result.confusionMatrix[1][0]}</div>
                        <div className="bg-green-100 p-2 text-center border">{result.confusionMatrix[1][1]}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-1 max-w-[200px] mx-auto mt-1">
                        <div className="text-xs text-center">Verdaderos Negativos</div>
                        <div className="text-xs text-center">Falsos Positivos</div>
                        <div className="text-xs text-center">Falsos Negativos</div>
                        <div className="text-xs text-center">Verdaderos Positivos</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Interpretación:</Label>
                      <div className="text-sm space-y-1">
                        <p>
                          • El modelo clasifica correctamente el <strong>{(result.accuracy * 100).toFixed(1)}%</strong>{" "}
                          de los casos
                        </p>
                        <p>
                          • F1 Score de <strong>{(result.f1Score * 100).toFixed(1)}%</strong> (balance entre precisión y
                          recall)
                        </p>
                        <p>
                          • {incorrectPredictions.length} puntos clasificados incorrectamente de {data.length} totales
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Ejecuta la clasificación para ver los resultados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Visualización de Datos</CardTitle>
              <CardDescription>Representación gráfica de los datos y clasificación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="x" name="X" />
                    <YAxis type="number" dataKey="y" name="Y" />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Legend />
                    <Scatter name="Clase 0" data={class0Data} fill="#8884d8" shape="circle" />
                    <Scatter name="Clase 1" data={class1Data} fill="#82ca9d" shape="circle" />
                    {incorrectPredictions.length > 0 && (
                      <Scatter
                        name="Predicciones incorrectas"
                        data={incorrectPredictions}
                        fill="#ff7300"
                        shape="cross"
                      />
                    )}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="svm" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* SVM Data input panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Datos de Entrada</CardTitle>
                <CardDescription>Agrega puntos de datos para clasificación SVM</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="newX-svm">Valor X</Label>
                    <Input
                      id="newX-svm"
                      type="number"
                      step="any"
                      value={newX}
                      onChange={(e) => setNewX(e.target.value)}
                      placeholder="Ej: 3.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newY-svm">Valor Y</Label>
                    <Input
                      id="newY-svm"
                      type="number"
                      step="any"
                      value={newY}
                      onChange={(e) => setNewY(e.target.value)}
                      placeholder="Ej: 4.2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newClass-svm">Clase</Label>
                    <select
                      id="newClass-svm"
                      value={newClass}
                      onChange={(e) => setNewClass(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="0">Clase 0</option>
                      <option value="1">Clase 1</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={addDataPoint} className="flex-1">
                    Agregar Punto
                  </Button>
                  <Button onClick={clearData} variant="outline">
                    Limpiar
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Kernel:</Label>
                  <select
                    value={svmKernel}
                    onChange={(e) => setSvmKernel(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="linear">Lineal</option>
                    <option value="poly">Polinomial</option>
                    <option value="rbf">RBF (Radial Basis Function)</option>
                    <option value="sigmoid">Sigmoide</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Función kernel para transformar el espacio de características
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Datos actuales ({data.length} puntos):</Label>
                  <div className="max-h-32 overflow-y-auto border rounded p-2 text-sm">
                    {data.length === 0 ? (
                      <p className="text-muted-foreground">No hay datos</p>
                    ) : (
                      data.slice(0, 10).map((point, index) => (
                        <div key={index} className="flex justify-between">
                          <span>
                            ({point.x.toFixed(2)}, {point.y.toFixed(2)})
                          </span>
                          <span>Clase: {point.class}</span>
                        </div>
                      ))
                    )}
                    {data.length > 10 && <p className="text-xs text-muted-foreground">... y {data.length - 10} más</p>}
                  </div>
                </div>

                <Button onClick={runClassification} disabled={isLoading || data.length < 5} className="w-full">
                  <Calculator className="mr-2 h-4 w-4" />
                  {isLoading ? "Procesando..." : "Ejecutar Clasificación SVM"}
                </Button>
              </CardContent>
            </Card>

            {/* Results panel - same structure as KNN */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resultados de SVM</CardTitle>
                <CardDescription>Métricas y estadísticas del modelo SVM</CardDescription>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Precisión (Accuracy):</Label>
                        <div className="font-mono text-lg bg-muted p-2 rounded text-center">
                          {(result.accuracy * 100).toFixed(2)}%
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>F1 Score:</Label>
                        <div className="font-mono text-lg bg-muted p-2 rounded text-center">
                          {(result.f1Score * 100).toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-sm">Precision:</Label>
                        <p className="text-sm">{(result.precision * 100).toFixed(2)}%</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">Recall:</Label>
                        <p className="text-sm">{(result.recall * 100).toFixed(2)}%</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Matriz de Confusión:</Label>
                      <div className="grid grid-cols-2 gap-1 max-w-[200px] mx-auto">
                        <div className="bg-green-100 p-2 text-center border">{result.confusionMatrix[0][0]}</div>
                        <div className="bg-red-100 p-2 text-center border">{result.confusionMatrix[0][1]}</div>
                        <div className="bg-red-100 p-2 text-center border">{result.confusionMatrix[1][0]}</div>
                        <div className="bg-green-100 p-2 text-center border">{result.confusionMatrix[1][1]}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-1 max-w-[200px] mx-auto mt-1">
                        <div className="text-xs text-center">Verdaderos Negativos</div>
                        <div className="text-xs text-center">Falsos Positivos</div>
                        <div className="text-xs text-center">Falsos Negativos</div>
                        <div className="text-xs text-center">Verdaderos Positivos</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Interpretación:</Label>
                      <div className="text-sm space-y-1">
                        <p>
                          • El modelo SVM con kernel <strong>{svmKernel}</strong> clasifica correctamente el{" "}
                          <strong>{(result.accuracy * 100).toFixed(1)}%</strong> de los casos
                        </p>
                        <p>
                          • F1 Score de <strong>{(result.f1Score * 100).toFixed(1)}%</strong> (balance entre precisión y
                          recall)
                        </p>
                        <p>
                          • {incorrectPredictions.length} puntos clasificados incorrectamente de {data.length} totales
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Ejecuta la clasificación SVM para ver los resultados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Visualization - same as KNN */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Visualización de Datos SVM</CardTitle>
              <CardDescription>Representación gráfica de los datos y clasificación SVM</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="x" name="X" />
                    <YAxis type="number" dataKey="y" name="Y" />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Legend />
                    <Scatter name="Clase 0" data={class0Data} fill="#8884d8" shape="circle" />
                    <Scatter name="Clase 1" data={class1Data} fill="#82ca9d" shape="circle" />
                    {incorrectPredictions.length > 0 && (
                      <Scatter
                        name="Predicciones incorrectas"
                        data={incorrectPredictions}
                        fill="#ff7300"
                        shape="cross"
                      />
                    )}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decision-tree" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Decision Tree Data input panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Datos de Entrada</CardTitle>
                <CardDescription>Agrega puntos de datos para árbol de decisión</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="newX-dt">Valor X</Label>
                    <Input
                      id="newX-dt"
                      type="number"
                      step="any"
                      value={newX}
                      onChange={(e) => setNewX(e.target.value)}
                      placeholder="Ej: 3.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newY-dt">Valor Y</Label>
                    <Input
                      id="newY-dt"
                      type="number"
                      step="any"
                      value={newY}
                      onChange={(e) => setNewY(e.target.value)}
                      placeholder="Ej: 4.2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newClass-dt">Clase</Label>
                    <select
                      id="newClass-dt"
                      value={newClass}
                      onChange={(e) => setNewClass(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="0">Clase 0</option>
                      <option value="1">Clase 1</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={addDataPoint} className="flex-1">
                    Agregar Punto
                  </Button>
                  <Button onClick={clearData} variant="outline">
                    Limpiar
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Profundidad máxima:</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={decisionTreeDepth}
                    onChange={(e) => setDecisionTreeDepth(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Profundidad máxima del árbol de decisión</p>
                </div>

                <div className="space-y-2">
                  <Label>Datos actuales ({data.length} puntos):</Label>
                  <div className="max-h-32 overflow-y-auto border rounded p-2 text-sm">
                    {data.length === 0 ? (
                      <p className="text-muted-foreground">No hay datos</p>
                    ) : (
                      data.slice(0, 10).map((point, index) => (
                        <div key={index} className="flex justify-between">
                          <span>
                            ({point.x.toFixed(2)}, {point.y.toFixed(2)})
                          </span>
                          <span>Clase: {point.class}</span>
                        </div>
                      ))
                    )}
                    {data.length > 10 && <p className="text-xs text-muted-foreground">... y {data.length - 10} más</p>}
                  </div>
                </div>

                <Button onClick={runClassification} disabled={isLoading || data.length < 5} className="w-full">
                  <Calculator className="mr-2 h-4 w-4" />
                  {isLoading ? "Procesando..." : "Ejecutar Árbol de Decisión"}
                </Button>
              </CardContent>
            </Card>

            {/* Results panel - similar structure */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resultados del Árbol de Decisión</CardTitle>
                <CardDescription>Métricas y estadísticas del modelo</CardDescription>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Precisión (Accuracy):</Label>
                        <div className="font-mono text-lg bg-muted p-2 rounded text-center">
                          {(result.accuracy * 100).toFixed(2)}%
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>F1 Score:</Label>
                        <div className="font-mono text-lg bg-muted p-2 rounded text-center">
                          {(result.f1Score * 100).toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-sm">Precision:</Label>
                        <p className="text-sm">{(result.precision * 100).toFixed(2)}%</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">Recall:</Label>
                        <p className="text-sm">{(result.recall * 100).toFixed(2)}%</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Matriz de Confusión:</Label>
                      <div className="grid grid-cols-2 gap-1 max-w-[200px] mx-auto">
                        <div className="bg-green-100 p-2 text-center border">{result.confusionMatrix[0][0]}</div>
                        <div className="bg-red-100 p-2 text-center border">{result.confusionMatrix[0][1]}</div>
                        <div className="bg-red-100 p-2 text-center border">{result.confusionMatrix[1][0]}</div>
                        <div className="bg-green-100 p-2 text-center border">{result.confusionMatrix[1][1]}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-1 max-w-[200px] mx-auto mt-1">
                        <div className="text-xs text-center">Verdaderos Negativos</div>
                        <div className="text-xs text-center">Falsos Positivos</div>
                        <div className="text-xs text-center">Falsos Negativos</div>
                        <div className="text-xs text-center">Verdaderos Positivos</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Interpretación:</Label>
                      <div className="text-sm space-y-1">
                        <p>
                          • El árbol de decisión con profundidad <strong>{decisionTreeDepth}</strong> clasifica
                          correctamente el <strong>{(result.accuracy * 100).toFixed(1)}%</strong> de los casos
                        </p>
                        <p>
                          • F1 Score de <strong>{(result.f1Score * 100).toFixed(1)}%</strong> (balance entre precisión y
                          recall)
                        </p>
                        <p>
                          • {incorrectPredictions.length} puntos clasificados incorrectamente de {data.length} totales
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Ejecuta el árbol de decisión para ver los resultados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Visualization - similar to others */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Visualización del Árbol de Decisión</CardTitle>
              <CardDescription>Representación gráfica de los datos y clasificación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="x" name="X" />
                    <YAxis type="number" dataKey="y" name="Y" />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Legend />
                    <Scatter name="Clase 0" data={class0Data} fill="#8884d8" shape="circle" />
                    <Scatter name="Clase 1" data={class1Data} fill="#82ca9d" shape="circle" />
                    {incorrectPredictions.length > 0 && (
                      <Scatter
                        name="Predicciones incorrectas"
                        data={incorrectPredictions}
                        fill="#ff7300"
                        shape="cross"
                      />
                    )}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="random-forest" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Random Forest Data input panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Datos de Entrada</CardTitle>
                <CardDescription>Agrega puntos de datos para Random Forest</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="newX-rf">Valor X</Label>
                    <Input
                      id="newX-rf"
                      type="number"
                      step="any"
                      value={newX}
                      onChange={(e) => setNewX(e.target.value)}
                      placeholder="Ej: 3.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newY-rf">Valor Y</Label>
                    <Input
                      id="newY-rf"
                      type="number"
                      step="any"
                      value={newY}
                      onChange={(e) => setNewY(e.target.value)}
                      placeholder="Ej: 4.2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newClass-rf">Clase</Label>
                    <select
                      id="newClass-rf"
                      value={newClass}
                      onChange={(e) => setNewClass(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="0">Clase 0</option>
                      <option value="1">Clase 1</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={addDataPoint} className="flex-1">
                    Agregar Punto
                  </Button>
                  <Button onClick={clearData} variant="outline">
                    Limpiar
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Número de árboles:</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={randomForestTrees}
                    onChange={(e) => setRandomForestTrees(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Cantidad de árboles en el bosque aleatorio</p>
                </div>

                <div className="space-y-2">
                  <Label>Datos actuales ({data.length} puntos):</Label>
                  <div className="max-h-32 overflow-y-auto border rounded p-2 text-sm">
                    {data.length === 0 ? (
                      <p className="text-muted-foreground">No hay datos</p>
                    ) : (
                      data.slice(0, 10).map((point, index) => (
                        <div key={index} className="flex justify-between">
                          <span>
                            ({point.x.toFixed(2)}, {point.y.toFixed(2)})
                          </span>
                          <span>Clase: {point.class}</span>
                        </div>
                      ))
                    )}
                    {data.length > 10 && <p className="text-xs text-muted-foreground">... y {data.length - 10} más</p>}
                  </div>
                </div>

                <Button onClick={runClassification} disabled={isLoading || data.length < 5} className="w-full">
                  <Calculator className="mr-2 h-4 w-4" />
                  {isLoading ? "Procesando..." : "Ejecutar Random Forest"}
                </Button>
              </CardContent>
            </Card>

            {/* Results panel - similar structure */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resultados de Random Forest</CardTitle>
                <CardDescription>Métricas y estadísticas del modelo</CardDescription>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Precisión (Accuracy):</Label>
                        <div className="font-mono text-lg bg-muted p-2 rounded text-center">
                          {(result.accuracy * 100).toFixed(2)}%
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>F1 Score:</Label>
                        <div className="font-mono text-lg bg-muted p-2 rounded text-center">
                          {(result.f1Score * 100).toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-sm">Precision:</Label>
                        <p className="text-sm">{(result.precision * 100).toFixed(2)}%</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">Recall:</Label>
                        <p className="text-sm">{(result.recall * 100).toFixed(2)}%</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Matriz de Confusión:</Label>
                      <div className="grid grid-cols-2 gap-1 max-w-[200px] mx-auto">
                        <div className="bg-green-100 p-2 text-center border">{result.confusionMatrix[0][0]}</div>
                        <div className="bg-red-100 p-2 text-center border">{result.confusionMatrix[0][1]}</div>
                        <div className="bg-red-100 p-2 text-center border">{result.confusionMatrix[1][0]}</div>
                        <div className="bg-green-100 p-2 text-center border">{result.confusionMatrix[1][1]}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-1 max-w-[200px] mx-auto mt-1">
                        <div className="text-xs text-center">Verdaderos Negativos</div>
                        <div className="text-xs text-center">Falsos Positivos</div>
                        <div className="text-xs text-center">Falsos Negativos</div>
                        <div className="text-xs text-center">Verdaderos Positivos</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Interpretación:</Label>
                      <div className="text-sm space-y-1">
                        <p>
                          • Random Forest con <strong>{randomForestTrees}</strong> árboles clasifica correctamente el{" "}
                          <strong>{(result.accuracy * 100).toFixed(1)}%</strong> de los casos
                        </p>
                        <p>
                          • F1 Score de <strong>{(result.f1Score * 100).toFixed(1)}%</strong> (balance entre precisión y
                          recall)
                        </p>
                        <p>
                          • {incorrectPredictions.length} puntos clasificados incorrectamente de {data.length} totales
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Ejecuta Random Forest para ver los resultados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Visualization - similar to others */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Visualización de Random Forest</CardTitle>
              <CardDescription>Representación gráfica de los datos y clasificación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="x" name="X" />
                    <YAxis type="number" dataKey="y" name="Y" />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Legend />
                    <Scatter name="Clase 0" data={class0Data} fill="#8884d8" shape="circle" />
                    <Scatter name="Clase 1" data={class1Data} fill="#82ca9d" shape="circle" />
                    {incorrectPredictions.length > 0 && (
                      <Scatter
                        name="Predicciones incorrectas"
                        data={incorrectPredictions}
                        fill="#ff7300"
                        shape="cross"
                      />
                    )}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
