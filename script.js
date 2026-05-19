// ==========================================
// CONFIGURACIÓN DEL MOTOR TIKTOK (7sCORP)
// ==========================================
const RAPIDAPI_KEY = "b7e2969cdcmshca5a386054686e0p158a2djsnf9a96c7dc51f"; // Tu llave activa
const RAPIDAPI_HOST = "tiktok-downloader-download-tiktok-videos-without-watermark.p.rapidapi.com"; // <-- REEMPLAZA AQUÍ SI EL HOST DE TU PANTALLA ES DISTINTO

// Variable de control (fija en tiktok por ahora)
let plataformaActual = 'tiktok';

// ==========================================
// FUNCIÓN PRINCIPAL DE PROCESAMIENTO
// ==========================================
async function procesarEnlaceZyncx() {
    try {
        // Capturamos la barra de búsqueda de tu HTML (id="searchInput")
        const inputUsuario = document.getElementById("searchInput");
        if (!inputUsuario) return;

        const urlUsuario = inputUsuario.value.trim();

        // Validación de barra vacía
        if (!urlUsuario) {
            alert("Por favor, pega un enlace de TikTok primero, bro.");
            return;
        }

        // Activamos la animación de carga premium en tu contenedor id="results"
        mostrarCargando(true); 
        console.log("Zyncx Engine: Conectando con API de 7sCORP para ->", urlUsuario);

        // Petición al endpoint de la API. (Ajustamos a /v1/index o el endpoint por defecto que use tu API)
        const respuesta = await fetch(`https://${RAPIDAPI_HOST}/v1/index?url=${encodeURIComponent(urlUsuario)}`, {
            method: "GET",
            headers: {
                "x-rapidapi-key": RAPIDAPI_KEY,
                "x-rapidapi-host": RAPIDAPI_HOST
            }
        });

        if (!respuesta.ok) {
            throw new Error(`El servidor puente respondió con error (Status: ${respuesta.status})`);
        }

        const data = await respuesta.json();
        console.log("Zyncx Engine: Datos crudos recibidos", data);

        // Mapeo inteligente de la respuesta para APIs estilo 7sCORP
        // Estas APIs suelen devolver las variables dentro de 'data' o directamente en la raíz
        const info = data.data || data;

        if (info && (info.video || info.nowatermark || info.hd_video || info.url)) {
            
            // Buscamos el link del video limpio sin logo
            const videoLimpio = info.hd_video || info.nowatermark || info.video || info.url;
            // Buscamos la pista de música MP3
            const audioLimpio = info.music || info.audio || "";
            // Buscamos la carátula o foto del creador
            const coverVideo = info.cover || info.avatar || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150";

            // Pintamos el resultado en la interfaz con diseño Glassmorphism
            mostrarTarjetaDescarga({
                titulo: info.title || "Video de TikTok Sin Marca de Agua",
                cover: coverVideo,
                url_video: videoLimpio,
                url_audio: audioLimpio
            });

        } else {
            throw new Error("No se encontraron enlaces de descarga directos en la respuesta de la API.");
        }

    } catch (error) {
        console.error("Zyncx Error Log:", error);
        alert(`Zyncx Engine Falló: ${error.message}. Asegúrate de que el enlace sea público.`);
    } finally {
        // Apagamos el estado de carga pase lo que pase
        mostrarCargando(false);
    }
}

// ==========================================
// COMPONENTES DINÁMICOS DE INTERFAZ (UI)
// ==========================================
function mostrarCargando(activado) {
    const contenedorResultado = document.getElementById("results");
    if (!contenedorResultado) return;
    
    if (activado) {
        contenedorResultado.innerHTML = `
            <div class="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center gap-3 animate-pulse">
                <i class="fas fa-circle-notch animate-spin text-2xl text-teal-400"></i>
                <span class="text-xs font-mono uppercase tracking-widest text-slate-400">Zyncx Engine extrayendo video limpio...</span>
            </div>
        `;
    }
}

function mostrarTarjetaDescarga(media) {
    const contenedor = document.getElementById("results");
    if (!contenedor) return;
    
    // Si la API nos dio audio, inyectamos el botón de MP3, si no, lo ocultamos
    const btnAudioHTML = media.url_audio 
        ? `<a href="${media.url_audio}" download target="_blank" class="bg-white/5 hover:bg-white/10 text-white font-medium text-xs uppercase tracking-wider px-5 py-3 rounded-xl border border-white/10 active:scale-95 transition cursor-pointer"><i class="fas fa-music mr-1.5 text-pink-500"></i> Bajar MP3</a>`
        : "";

    // Inyectamos el diseño Premium, limpio y adaptado 100% a tus clases de Tailwind CSS
    contenedor.innerHTML = `
        <div class="glass p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-5 border border-white/10 shadow-2xl animate-fade-in">
            <img src="${media.cover}" alt="Cover Zyncx" class="w-24 h-24 object-cover rounded-xl shadow-lg border border-white/10 flex-shrink-0">
            <div class="flex-grow text-center sm:text-left w-full">
                <h4 class="text-white font-semibold text-sm md:text-base leading-snug mb-4 line-clamp-2">${media.titulo}</h4>
                <div class="flex flex-wrap gap-3 justify-center sm:justify-start">
                    <a href="${media.url_video}" download target="_blank" class="bg-gradient-to-r from-teal-400 to-purple-500 text-slate-950 font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-lg active:scale-95 transition cursor-pointer">
                        <i class="fas fa-download mr-1.5"></i> Descargar Sin Marca de Agua
                    </a>
                    ${btnAudioHTML}
                </div>
            </div>
        </div>
    `;
}

// Función temporal para que el botón de IG del HTML no rompa nada
function cambiarPlataforma(plataforma) {
    if (plataforma === 'instagram') {
        alert("Modo Instagram en desarrollo, bro. ¡Primero dejamos perfecto TikTok!");
    }
}
