// Configuración de la API Puente para Zyncx
const RAPIDAPI_KEY = "b7e2969cdcmshca5a386054686e0p158a2djsnf9a96c7dc51f"; // <-- PEGA AQUÍ TU LLAVE DE RAPIDAPI
const RAPIDAPI_HOST = "tiktok-video-downloader-no-watermark.p.rapidapi.com"; // O el host de la API que elijas

async function procesarEnlaceZyncx(urlUsuario) {
    try {
        // Mostrar animación de carga en la interfaz de Zyncx
        mostrarCargando(true); 

        console.log("Zyncx Engine: Procesando URL ->", urlUsuario);

        // Llamada directa a la API puente que resuelve acortadores y limpia el video
        const respuesta = await fetch(`https://${RAPIDAPI_HOST}/index?url=${encodeURIComponent(urlUsuario)}`, {
            method: "GET",
            headers: {
                "x-rapidapi-key": RAPIDAPI_KEY,
                "x-rapidapi-host": RAPIDAPI_HOST
            }
        });

        if (!respuesta.ok) {
            throw new Error(`Error en el servidor puente: ${respuesta.status}`);
        }

        const data = await respuesta.json();
        console.log("Zyncx Engine: Datos recibidos con éxito", data);

        // Validamos que la API nos haya devuelto los links reales
        if (data && data.video) {
            // Renderizar la tarjeta Premium en tu interfaz de Zyncx
            mostrarTarjetaDescarga({
                titulo: data.title || "Video de TikTok",
                cover: data.cover || "https://via.placeholder.com/160x90?text=Zyncx+Media",
                // El link 'video' de estas APIs ya viene SIN marca de agua por defecto
                url_video: data.video, 
                url_audio: data.music
            });
        } else {
            alert("No se pudo extraer el video limpio de esta URL. Verifica que sea un video público.");
        }

    } catch (error) {
        console.error("Zyncx Error Log:", error);
        alert("Zyncx Engine falló al conectar. Detalles en consola.");
    } finally {
        mostrarCargando(false);
    }
}
