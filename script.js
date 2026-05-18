// CONFIGURACIÓN CENTRAL DE ZYNCX MOTOR v4.2 — ENLACE DIRECTO RENDER
const RENDER_API_BASE = 'https://zyncx-api.onrender.com/analizar';

let plataformaActual = 'youtube';

function cambiarPlataforma(plataforma, placeholderText) {
    plataformaActual = plataforma;
    const input = document.getElementById('searchInput');
    const icon = document.getElementById('input-icon');
    
    // Resetear diseño de botones de pestañas
    ['youtube', 'tiktok', 'instagram'].forEach(p => {
        document.getElementById(`btn-${p}`).classList.remove('tab-active');
        document.getElementById(`btn-${p}`).classList.add('text-slate-400', 'border-transparent');
    });

    // Activar pestaña seleccionada
    const btnActivo = document.getElementById(`btn-${plataforma}`);
    btnActivo.classList.add('tab-active');
    btnActivo.classList.remove('text-slate-400', 'border-transparent');

    // Cambiar placeholder e icono de la barra de entrada
    input.placeholder = `Pega el enlace de ${plataforma.charAt(0).toUpperCase() + plataforma.slice(1)} aquí...`;
    input.value = "";
    
    if(plataforma === 'youtube') icon.className = 'fab fa-youtube text-red-500';
    if(plataforma === 'tiktok') icon.className = 'fab fa-tiktok text-white';
    if(plataforma === 'instagram') icon.className = 'fab fa-instagram text-pink-500';
}

async function queryServerZyncx(urlMedia, soloAudio) {
    const response = await fetch(RENDER_API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlMedia, solo_audio: soloAudio })
    });
    return await response.json();
}

async function procesarEnlaceZyncx() {
    const linkInput = document.getElementById('searchInput').value.trim();
    const resultsContainer = document.getElementById('results');

    if (!linkInput) return;

    // Validación básica de dominio según la pestaña activa
    if (plataformaActual === 'youtube' && !linkInput.includes('youtube.com/') && !linkInput.includes('youtu.be/')) {
        mostrarError("Enlace de YouTube no válido."); return;
    }
    if (plataformaActual === 'tiktok' && !linkInput.includes('tiktok.com')) {
        mostrarError("Enlace de TikTok no válido."); return;
    }
    if (plataformaActual === 'instagram' && !linkInput.includes('instagram.com')) {
        mostrarError("Enlace de Instagram no válido."); return;
    }

    // Pantalla de carga futurista
    resultsContainer.innerHTML = `
        <div class="text-center py-10 glass rounded-2xl border border-cyan-500/10">
            <div class="animate-spin inline-block w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mb-3"></div>
            <p class="text-cyan-400 font-mono text-[10px] uppercase tracking-widest animate-pulse">Zyncx Core: Extrayendo flujos multimedia...</p>
        </div>`;

    try {
        // Ejecutamos la llamada por defecto (video) para obtener los metadatos y miniatura
        const data = await queryServerZyncx(linkInput, false);

        if (data.status === "ok") {
            const cleanTitle = data.titulo.replace(/['"]/g, "");
            const thumb = data.miniatura;
            
            // Renderizamos la tarjeta final ofreciéndole al usuario AMBAS OPCIONES (Audio o Video)
            resultsContainer.innerHTML = `
                <div class="glass p-6 rounded-2xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-center gap-6 animate-fadeIn">
                    <img src="${thumb}" class="w-full md:w-40 h-24 rounded-xl object-cover border border-white/10 shadow-md">
                    
                    <div class="flex-grow text-center md:text-left w-full overflow-hidden">
                        <h3 class="text-white font-bold text-sm mb-1 truncate">${cleanTitle}</h3>
                        <p class="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-4">Motor: ${data.plataforma || 'yt_dlp'}</p>
                        
                        <div class="grid grid-cols-2 gap-3">
                            <a href="${data.url_descarga}" target="_blank" class="bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-[11px] uppercase tracking-wider py-3 px-4 rounded-xl text-center shadow-lg shadow-cyan-500/10 transition-all flex items-center justify-center gap-2">
                                <i class="fas fa-video"></i> Video MP4
                            </a>
                            
                            <button onclick="descargarSoloAudioZyncx('${linkInput}', '${cleanTitle}')" class="bg-white/5 hover:bg-white/10 text-white font-bold text-[11px] uppercase tracking-wider py-3 px-4 rounded-xl text-center border border-white/10 transition-all flex items-center justify-center gap-2">
                                <i class="fas fa-music text-cyan-400"></i> Audio MP3
                            </button>
                        </div>
                    </div>
                </div>`;
        } else {
            throw new Error(data.msj);
        }
    } catch (err) {
        console.error(err);
        mostrarError("Tu servidor en Render no pudo resolver el enlace. Asegúrate de que el contenido sea público.");
    }
}

// Función secundaria por si el usuario presiona específicamente bajar solo audio
async function descargarSoloAudioZyncx(url, titulo) {
    const resultsContainer = document.getElementById('results');
    const backupHTML = resultsContainer.innerHTML;

    resultsContainer.innerHTML = `
        <div class="text-center py-10 glass rounded-2xl border border-cyan-500/10">
            <div class="animate-spin inline-block w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full mb-3"></div>
            <p class="text-cyan-400 font-mono text-[10px] uppercase tracking-widest animate-pulse">Aislando pista de audio...</p>
        </div>`;

    try {
        const data = await queryServerZyncx(url, true);
        if (data.status === "ok") {
            window.open(data.url_descarga, '_blank');
            resultsContainer.innerHTML = backupHTML; // Restauramos la vista original
        } else {
            throw new Error();
        }
    } catch (e) {
        mostrarError("No se pudo aislar el audio. Prueba descargando la versión en video.");
    }
}

function mostrarError(mensaje) {
    document.getElementById('results').innerHTML = `
        <div class="text-center p-5 glass rounded-2xl border border-red-500/20">
            <p class="text-red-400 font-bold text-xs mb-1"><i class="fas fa-exclamation-triangle mr-2"></i> Error de Procesamiento</p>
            <p class="text-slate-400 text-[11px]">${mensaje}</p>
        </div>`;
}
