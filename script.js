// ==========================================
// CONFIGURACIÓN DEL MOTOR TIKTOK (7sCORP)
// ==========================================
const RAPIDAPI_KEY = "b7e2969cdcmshca5a386054686e0p158a2djsnf9a96c7dc51f"; 
const RAPIDAPI_HOST = "tiktok-downloader-download-tiktok-videos-without-watermark.p.rapidapi.com";

// Variable de control (fija en tiktok por ahora)
let plataformaActual = 'tiktok';

// ==========================================
// FUNCIÓN PRINCIPAL DE PROCESAMIENTO
// ==========================================
async function procesarEnlaceZyncx() {
    try {
        const inputUsuario = document.getElementById("searchInput");
        if (!inputUsuario) return;

        const urlUsuario = inputUsuario.value.trim();

        if (!urlUsuario) {
            alert("Por favor, pega un enlace de TikTok primero, bro.");
            return;
        }

        mostrarCargando(true); 
        console.log("Zyncx Engine: Conectando a través del túnel comunitario seguro...");

        // Usamos el nuevo proxy que encontraste sin restricciones de activación
        const proxyUrl = "https://cors-anywhere.com/";
        const apiTarget = `https://${RAPIDAPI_HOST}/rich_response/index?url=${encodeURIComponent(urlUsuario)}`;

        // Pegamos el proxy antes de la URL de RapidAPI
        const respuesta = await fetch(proxyUrl + apiTarget, {
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

        const info = data.data || data;

        if (info) {
            const videoLimpio = info.video || info.nowatermark || (info.links && info.links.find(l => l.type === 'video')?.url) || info.url;
            const audioLimpio = info.music || info.audio || (info.links && info.links.find(l => l.type === 'audio')?.url) || "";
            const coverVideo = info.cover || info.dynamic_cover || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150";
            const tituloVideo = info.title || info.description || "Video de TikTok Sin Marca de Agua";

            if (!videoLimpio) {
                throw new Error("No se encontró un enlace de video directo en la respuesta.");
            }

            mostrarTarjetaDescarga({
                titulo: tituloVideo,
                cover: coverVideo,
                url_video: videoLimpio,
                url_audio: audioLimpio
            });

        } else {
            throw new Error("La estructura de la respuesta no es la esperada.");
        }

    } catch (error) {
        console.error("Zyncx Error Log:", error);
        alert(`Zyncx Engine: ${error.message}`);
    } finally {
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
                <span class="text-xs font-mono uppercase tracking-widest text-slate-400">Zyncx Engine rompiendo cifrado...</span>
            </div>
        `;
    }
}

function mostrarTarjetaDescarga(media) {
    const contenedor = document.getElementById("results");
    if (!contenedor) return;
    
    const btnAudioHTML = media.url_audio 
        ? `<a href="${media.url_audio}" download target="_blank" class="bg-white/5 hover:bg-white/10 text-white font-medium text-xs uppercase tracking-wider px-5 py-3 rounded-xl border border-white/10 active:scale-95 transition cursor-pointer"><i class="fas fa-music mr-1.5 text-pink-500"></i> Bajar MP3</a>`
        : "";

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

function cambiarPlataforma(plataforma) {
    if (plataforma === 'instagram') {
        alert("Modo Instagram en desarrollo, bro. ¡Primero dejamos perfecto TikTok!");
    }
}
