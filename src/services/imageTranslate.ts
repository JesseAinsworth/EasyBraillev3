export async function translateBrailleImage(file: File) {
  // Crear el formulario con la imagen
  const formData = new FormData();
  formData.append("image", file);

  // Leer la URL del backend desde la variable de entorno
  // (Configurada en AWS Amplify → Environment variables)
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://easybraille-backend.up.railway.app";

  try {
    // Llamada al backend de Flask en Railway
    const res = await fetch(`${API_URL}/api/braille-image`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Error al traducir la imagen: ${res.status} ${res.statusText}`);
    }

    // Devolver respuesta en formato JSON
    const data = await res.json();
    return data;

  } catch (error: any) {
    console.error("Error en translateBrailleImage:", error);
    throw new Error(
      "No se pudo conectar con el servicio de traducción. " +
      "Verifica la conexión con el backend."
    );
  }
}
