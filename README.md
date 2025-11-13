# EasyBraille - Frontend

Frontend web de EasyBraille construido con **Next.js 14**, **React 18**, **TypeScript** y **Tailwind CSS**.

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/JesseAinsworth/EasyBraille-Frontend.git
cd EasyBraille-Frontend

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Construcción para Producción

```bash
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
src/
├── app/              # Rutas y layouts principales
├── components/       # Componentes reutilizables
├── hooks/           # Custom hooks
├── lib/             # Utilidades y helpers
├── models/          # Tipos y modelos TypeScript
├── services/        # Servicios y APIs
└── types/           # Definiciones de tipos
public/
├── images/          # Activos estáticos
```

## 🔗 Conexión con Backend

El frontend se conecta al backend en `http://localhost:5000` (configurable en `package.json`).

### Variables de Entorno

Crea un archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 📚 Tecnologías Principales

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **UI Components**: Radix UI, Lucide Icons
- **Autenticación**: NextAuth
- **Gráficos**: Chart.js, Recharts
- **Herramientas**: ESLint, PostCSS

## 🧪 Testing

```bash
npm run lint
```

## 📖 Documentación Adicional

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)

## 📝 Licencia

Este proyecto es parte de EasyBraille.

## 👥 Contribuir

Las contribuciones son bienvenidas. Por favor, crea un fork, realiza tus cambios y envía un pull request.
