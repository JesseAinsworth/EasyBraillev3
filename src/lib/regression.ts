/**
 * Implementación de Regresión Lineal
 * Incluye regresión simple y múltiple con análisis estadístico
 */

export interface DataPoint {
  x: number
  y: number
}

export interface MultipleDataPoint {
  features: number[]
  target: number
}

export interface RegressionResult {
  slope: number
  intercept: number
  rSquared: number
  correlation: number
  predictions: number[]
  residuals: number[]
  mse: number // Mean Squared Error
  rmse: number // Root Mean Squared Error
  mae: number // Mean Absolute Error
}

export interface MultipleRegressionResult {
  coefficients: number[]
  intercept: number
  rSquared: number
  predictions: number[]
  residuals: number[]
  mse: number
  rmse: number
  mae: number
  featureImportance: number[]
}

/**
 * Regresión Lineal Simple (una variable)
 */
export class SimpleLinearRegression {
  private slope = 0
  private intercept = 0
  private fitted = false

  /**
   * Entrena el modelo con los datos proporcionados
   */
  fit(data: DataPoint[]): RegressionResult {
    if (data.length < 2) {
      throw new Error("Se necesitan al menos 2 puntos de datos")
    }

    const n = data.length
    const sumX = data.reduce((sum, point) => sum + point.x, 0)
    const sumY = data.reduce((sum, point) => sum + point.y, 0)
    const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0)
    const sumXX = data.reduce((sum, point) => sum + point.x * point.x, 0)
    const sumYY = data.reduce((sum, point) => sum + point.y * point.y, 0)

    // Calcular pendiente e intercepto usando mínimos cuadrados
    const denominator = n * sumXX - sumX * sumX
    if (Math.abs(denominator) < 1e-10) {
      throw new Error("No se puede calcular la regresión: datos colineales")
    }

    this.slope = (n * sumXY - sumX * sumY) / denominator
    this.intercept = (sumY - this.slope * sumX) / n
    this.fitted = true

    // Calcular métricas de evaluación
    const predictions = data.map((point) => this.predict(point.x))
    const residuals = data.map((point, i) => point.y - predictions[i])

    // R-cuadrado
    const meanY = sumY / n
    const totalSumSquares = data.reduce((sum, point) => sum + Math.pow(point.y - meanY, 2), 0)
    const residualSumSquares = residuals.reduce((sum, residual) => sum + residual * residual, 0)
    const rSquared = 1 - residualSumSquares / totalSumSquares

    // Coeficiente de correlación
    const correlation = (n * sumXY - sumX * sumY) / Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY))

    // Métricas de error
    const mse = residualSumSquares / n
    const rmse = Math.sqrt(mse)
    const mae = residuals.reduce((sum, residual) => sum + Math.abs(residual), 0) / n

    return {
      slope: this.slope,
      intercept: this.intercept,
      rSquared,
      correlation,
      predictions,
      residuals,
      mse,
      rmse,
      mae,
    }
  }

  /**
   * Predice un valor para una entrada dada
   */
  predict(x: number): number {
    if (!this.fitted) {
      throw new Error("El modelo debe ser entrenado antes de hacer predicciones")
    }
    return this.slope * x + this.intercept
  }

  /**
   * Predice múltiples valores
   */
  predictMultiple(xValues: number[]): number[] {
    return xValues.map((x) => this.predict(x))
  }

  /**
   * Obtiene los parámetros del modelo
   */
  getParameters(): { slope: number; intercept: number } {
    return { slope: this.slope, intercept: this.intercept }
  }
}

/**
 * Regresión Lineal Múltiple
 */
export class MultipleLinearRegression {
  private coefficients: number[] = []
  private intercept = 0
  private fitted = false

  /**
   * Entrena el modelo con múltiples características
   */
  fit(data: MultipleDataPoint[]): MultipleRegressionResult {
    if (data.length === 0) {
      throw new Error("Se necesitan datos para entrenar el modelo")
    }

    const numFeatures = data[0].features.length
    const n = data.length

    // Verificar consistencia de datos
    if (data.some((point) => point.features.length !== numFeatures)) {
      throw new Error("Todas las muestras deben tener el mismo número de características")
    }

    if (n <= numFeatures) {
      throw new Error("Se necesitan más muestras que características")
    }

    // Crear matriz de diseño X (incluye columna de unos para el intercepto)
    const X: number[][] = data.map((point) => [1, ...point.features])
    const y: number[] = data.map((point) => point.target)

    // Resolver usando ecuaciones normales: β = (X^T * X)^(-1) * X^T * y
    const XTranspose = this.transpose(X)
    const XTX = this.matrixMultiply(XTranspose, X)
    const XTXInverse = this.matrixInverse(XTX)
    const XTy = this.matrixVectorMultiply(XTranspose, y)
    const beta = this.matrixVectorMultiply(XTXInverse, XTy)

    this.intercept = beta[0]
    this.coefficients = beta.slice(1)
    this.fitted = true

    // Calcular métricas
    const predictions = data.map((point) => this.predict(point.features))
    const residuals = data.map((point, i) => point.target - predictions[i])

    // R-cuadrado
    const meanY = y.reduce((sum, val) => sum + val, 0) / n
    const totalSumSquares = y.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0)
    const residualSumSquares = residuals.reduce((sum, residual) => sum + residual * residual, 0)
    const rSquared = 1 - residualSumSquares / totalSumSquares

    // Métricas de error
    const mse = residualSumSquares / n
    const rmse = Math.sqrt(mse)
    const mae = residuals.reduce((sum, residual) => sum + Math.abs(residual), 0) / n

    // Importancia de características (valor absoluto de coeficientes normalizados)
    const maxCoeff = Math.max(...this.coefficients.map(Math.abs))
    const featureImportance = this.coefficients.map((coeff) => Math.abs(coeff) / maxCoeff)

    return {
      coefficients: this.coefficients,
      intercept: this.intercept,
      rSquared,
      predictions,
      residuals,
      mse,
      rmse,
      mae,
      featureImportance,
    }
  }

  /**
   * Predice un valor para características dadas
   */
  predict(features: number[]): number {
    if (!this.fitted) {
      throw new Error("El modelo debe ser entrenado antes de hacer predicciones")
    }

    if (features.length !== this.coefficients.length) {
      throw new Error("El número de características debe coincidir con el modelo entrenado")
    }

    return this.intercept + features.reduce((sum, feature, i) => sum + feature * this.coefficients[i], 0)
  }

  /**
   * Predice múltiples valores
   */
  predictMultiple(featuresArray: number[][]): number[] {
    return featuresArray.map((features) => this.predict(features))
  }

  // Métodos auxiliares para álgebra lineal
  private transpose(matrix: number[][]): number[][] {
    return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]))
  }

  private matrixMultiply(a: number[][], b: number[][]): number[][] {
    const result: number[][] = []
    for (let i = 0; i < a.length; i++) {
      result[i] = []
      for (let j = 0; j < b[0].length; j++) {
        let sum = 0
        for (let k = 0; k < b.length; k++) {
          sum += a[i][k] * b[k][j]
        }
        result[i][j] = sum
      }
    }
    return result
  }

  private matrixVectorMultiply(matrix: number[][], vector: number[]): number[] {
    return matrix.map((row) => row.reduce((sum, val, i) => sum + val * vector[i], 0))
  }

  private matrixInverse(matrix: number[][]): number[][] {
    const n = matrix.length
    const identity = Array(n)
      .fill(0)
      .map((_, i) =>
        Array(n)
          .fill(0)
          .map((_, j) => (i === j ? 1 : 0)),
      )

    // Crear matriz aumentada
    const augmented = matrix.map((row, i) => [...row, ...identity[i]])

    // Eliminación gaussiana
    for (let i = 0; i < n; i++) {
      // Encontrar pivote
      let maxRow = i
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k
        }
      }
      // Intercambiar filas
      ;[augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]]

      // Verificar que el pivote no sea cero
      if (Math.abs(augmented[i][i]) < 1e-10) {
        throw new Error("La matriz no es invertible")
      }

      // Hacer el pivote igual a 1
      const pivot = augmented[i][i]
      for (let j = 0; j < 2 * n; j++) {
        augmented[i][j] /= pivot
      }

      // Eliminar columna
      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = augmented[k][i]
          for (let j = 0; j < 2 * n; j++) {
            augmented[k][j] -= factor * augmented[i][j]
          }
        }
      }
    }

    // Extraer matriz inversa
    return augmented.map((row) => row.slice(n))
  }
}

/**
 * Funciones utilitarias para análisis de regresión
 */
export class RegressionUtils {
  /**
   * Genera datos sintéticos para pruebas
   */
  static generateSyntheticData(n: number, slope = 2, intercept = 1, noiseLevel = 0.1): DataPoint[] {
    const data: DataPoint[] = []
    for (let i = 0; i < n; i++) {
      const x = Math.random() * 10
      const noise = (Math.random() - 0.5) * noiseLevel * 10
      const y = slope * x + intercept + noise
      data.push({ x, y })
    }
    return data
  }

  /**
   * Genera datos múltiples sintéticos
   */
  static generateMultipleSyntheticData(
    n: number,
    coefficients: number[],
    intercept = 0,
    noiseLevel = 0.1,
  ): MultipleDataPoint[] {
    const data: MultipleDataPoint[] = []
    for (let i = 0; i < n; i++) {
      const features = coefficients.map(() => Math.random() * 10)
      const noise = (Math.random() - 0.5) * noiseLevel * 10
      const target = intercept + features.reduce((sum, feature, j) => sum + feature * coefficients[j], 0) + noise
      data.push({ features, target })
    }
    return data
  }

  /**
   * Calcula intervalos de confianza para predicciones
   */
  static calculateConfidenceInterval(
    predictions: number[],
    residuals: number[],
    confidenceLevel = 0.95,
  ): { lower: number[]; upper: number[] } {
    const n = residuals.length
    const mse = residuals.reduce((sum, r) => sum + r * r, 0) / (n - 2)
    const standardError = Math.sqrt(mse)

    // t-value para el nivel de confianza dado
    const alpha = 1 - confidenceLevel
    const tValue = this.getTValue(alpha / 2, n - 2)

    const margin = tValue * standardError

    return {
      lower: predictions.map((pred) => pred - margin),
      upper: predictions.map((pred) => pred + margin),
    }
  }

  /**
   * Aproximación de t-value (para grados de libertad > 30, aproxima a z-score)
   */
  private static getTValue(alpha: number, df: number): number {
    if (df > 30) {
      // Aproximación usando distribución normal
      return this.getZScore(alpha)
    }
    // Valores aproximados para t-distribution
    const tTable: { [key: number]: number } = {
      0.025: 2.228, // 95% confidence, df=10
      0.05: 1.812, // 90% confidence, df=10
    }
    return tTable[alpha] || 2.0
  }

  /**
   * Z-score para distribución normal estándar
   */
  private static getZScore(alpha: number): number {
    const zTable: { [key: number]: number } = {
      0.025: 1.96, // 95% confidence
      0.05: 1.645, // 90% confidence
      0.005: 2.576, // 99% confidence
    }
    return zTable[alpha] || 1.96
  }

  /**
   * Valida los datos de entrada
   */
  static validateData(data: DataPoint[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (data.length === 0) {
      errors.push("No hay datos para analizar")
    }

    if (data.length < 2) {
      errors.push("Se necesitan al menos 2 puntos de datos")
    }

    const hasInvalidData = data.some((point) => !isFinite(point.x) || !isFinite(point.y))
    if (hasInvalidData) {
      errors.push("Los datos contienen valores no válidos (NaN o Infinity)")
    }

    const allSameX = data.every((point) => point.x === data[0].x)
    if (allSameX) {
      errors.push("Todos los valores de X son iguales (no se puede calcular regresión)")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}
