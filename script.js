// ==========================================
// CONFIGURACIÓN DE LA API PUENTE PARA ZYNCX
// ==========================================
const RAPIDAPI_KEY = "b7e2969cdcmshca5a386054686e0p158a2djsnf9a96c7dc51f"; 
const RAPIDAPI_HOST = "youtube-media-downloader.p.rapidapi.com"; // Tu API real descubierta

// Variable global para rastrear si el usuario está en la pestaña TikTok o Instagram
let plataformaActual = 'tiktok';

// ==========================================
// FUNCIÓN PRINCIPAL DE PROCESAMIENTO
// ==========================================
async function procesarEnlaceZyncx() {
    try {
        // Captura el valor exacto desde tu id="searchInput" del HTML
        const inputUsuario = document.getElementById("searchInput");
        if (!inputUsuario) return;

        const urlUsuario = inputUsuario.value.trim();

        // Validación de seguridad para evitar peticiones vacías
        if (!urlUsuario) {
            alert(`Por favor, pega un enlace de ${plataformaActual === 'tiktok' ? 'TikTok' : 'Instagram'} primero, bro.`);
            return;
        }

        // Activamos la animación de carga en tu contenedor "results"
        mostrarCargando(true); 
        console.log(`Zyncx Engine [${plataformaActual.toUpperCase()}]: Procesando URL ->`, urlUsuario);

        // Petición a la API de Youtube Media Downloader pasando el enlace codificado
        const respuesta = await fetch(`https://${RAPIDAPI_HOST}/v2/video/details?url=${encodeURIComponent(urlUsuario)}`, {
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
        console.log("Zyncx Engine: Datos crudos recibidos", data);

        // Procesamos la respuesta adaptándonos a la estructura estándar de descargas
        if (data && (data.videos || data.audios || data.medias)) {
            
            // Extraer el mejor link de video disponible (prioriza los de alta definición o limpios)
            let videoUrl = "";
            if (data.videos && data.videos.items && data.videos.items.length > 0) {
                videoUrl = data.videos.items[0].url; // Primer formato de video disponible
            } else if (data.medias && data.medias.length > 0) {
                videoUrl = data.medias[0].url;
            }

            // Extraer el link del archivo de audio MP3
            let audioUrl = "";
            if (data.audios && data.audios.items && data.audios.items.length > 0) {
                audioUrl = data.audios.items[0].url;
            }

            // Renderizar la tarjeta con diseño Glassmorphism premium
            mostrarTarjetaDescarga({
                titulo: data.title || `${plataformaActual === 'tiktok' ? 'TikTok' : 'Instagram'} Media`,
                cover: data.thumbnail || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150",
                url_video: videoUrl, 
                url_audio: audioUrl
            });

        } else {
            alert("No se encontraron formatos de descarga válidos para este enlace, bro. Asegúrate de que el contenido no sea privado.");
        }

    } catch (error) {
        console.error("Zyncx Error Log:", error);
        alert("Zyncx Engine falló al conectar con la API. Verifica tu cuota en RapidAPI o la consola.");
    } finally {
        // Apagamos el cargando al finalizar todo el proceso
        mostrarCargando(false);
    }
}

// ==========================================
// CONTROL DE PESTAÑAS (TIKTOK / INSTAGRAM)
// ==========================================
function cambiarPlataforma(plataforma) {
    plataformaActual = plataforma;
    
    const btnTiktok = document.getElementById("btn-tiktok");
    const btnInstagram = document.getElementById("btn-instagram");
    const inputIcon = document.getElementById("input-icon");
    const searchInput = document.getElementById("searchInput");

    // Limpiamos los contenedores visuales de resultados previos
    const contenedorResultado = document.getElementById("results");
    if (contenedorResultado) contenedorResultado.innerHTML = "";

    if (plataforma === 'tiktok') {
        // Cambiar clases del botón TikTok a Activo (Estilo Glass Blanco)
        btnTiktok.className = "tab-active-tiktok glass py-3 rounded-xl flex items-center justify-center gap-2 transition-all border text-xs font-bold uppercase tracking-wider text-white";
        // Apagar botón Instagram
        btnInstagram.className = "glass py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-transparent text-slate-500 text-xs font-bold uppercase tracking-wider";
        
        // Cambiar iconos y placeholders
        inputIcon.className = "fab fa-tiktok";
        searchInput.placeholder = "Pega el enlace de TikTok aquí...";
    } else {
        // Cambiar clases del botón Instagram a Activo (Estilo Neon Rosa/Fucsia)
        btnInstagram.className = "tab-active-instagram glass py-3 rounded-xl flex items-center justify-center gap-2 transition-all border text-xs font-bold uppercase tracking-wider text-pink-400";
        // Apagar botón TikTok
        btnTiktok.className = "glass py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-transparent text-slate-500 text-xs font-bold uppercase tracking-wider";
        
        // Cambiar iconos y placeholders
        inputIcon.className = "fab fa-instagram";
        searchInput.placeholder = "Pega el enlace de Instagram Reels o Video aquí...";
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
                <span class="text-xs font-mono uppercase tracking-widest text-slate-400">Zyncx Engine extrayendo archivos...</span>
            </div>
        `;
    }
}

function mostrarTarjetaDescarga(media) {
    const contenedor = document.getElementById("results");
    if (!contenedor) return;
    
    // Si no se encuentra URL de video, mostramos una alerta o deshabilitamos el botón
    const linkVideoValido = media.url_video ? `href="${media.url_video}"` : `onclick="alert('No se detectó flujo directo de video para este archivo.')"`;
    const linkAudioValido = media.url_audio ? `href="${media.url_audio}"` : `onclick="alert('Este archivo no cuenta con una pista de audio independiente extraíble.')"`;

    // Renderizado Premium estético y adaptivo integrado con Tailwind CSS
    contenedor.innerHTML = `
        <div class="glass p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-5 border border-white/10 shadow-2xl animate-fade-in">
            <img src="${media.cover}" alt="Cover Zyncx" class="w-24 h-24 object-cover rounded-xl shadow-lg border border-white/10 flex-shrink-0">
            <div class="flex-grow text-center sm:text-left w-full">
                <h4 class="text-white font-semibold text-sm md:text-base leading-snug mb-4 line-clamp-2">${media.titulo}</h4>
                <div class="flex flex-wrap gap-3 justify-center sm:justify-start">
                    <a ${linkVideoValido} target="_blank" class="bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-lg shadow-teal-400/10 active:scale-95 transition cursor-pointer">
                        <i class="fas fa-video mr-1.5"></i> Descargar MP4
                    </a>
                    <a ${linkAudioValido} target="_blank" class="bg-white/5 hover:bg-white/10 text-white font-medium text-xs uppercase tracking-wider px-5 py-3 rounded-xl border border-white/10 active:scale-95 transition cursor-pointer">
                        <i class="fas fa-music mr-1.5 text-pink-400"></i> Bajar MP3
                    </a>
                </div>
            </div>
        </div>
    `;
}
