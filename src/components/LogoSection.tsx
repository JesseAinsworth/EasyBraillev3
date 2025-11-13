import Link from "next/link"

interface LogoSectionProps {
  size?: "small" | "medium" | "large"
  showText?: boolean
}

export function LogoSection({ size = "medium", showText = true }: LogoSectionProps) {
  // Determinar el tamaño del logo basado en el prop
  const dimensions = {
    small: { width: 32, height: 32 },
    medium: { width: 48, height: 48 },
    large: { width: 96, height: 96 },
  }

  const { width, height } = dimensions[size]

  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="relative" style={{ width, height }}>
        <img
          src="/images/logo22.png"
          alt="EasyBraille Logo"
          className="h-full w-auto object-contain rounded"
          width={width}
          height={height}
        />
      </div>
      {showText && <span className="text-xl font-bold">EasyBraille</span>}
    </Link>
  )
}
