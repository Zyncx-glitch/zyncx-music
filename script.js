// CONFIGURACIÓN CENTRAL DE ZYNCX MOTOR v4.3 — MULTI-SOCIAL
const RENDER_API_BASE = 'https://zyncx-api.onrender.com/analizar';

let plataformaActual = 'tiktok';

function cambiarPlataforma(plataforma) {
    plataformaActual = plataforma;
    const input = document.getElementById('searchInput');
    const icon = document.getElementById('input-icon');
    const btnTiktok = document.getElementById('btn-tiktok');
    const btnInstagram = document.getElementById('btn-instagram');
    
    // Resetear clases activas de ambos botones
    btnTiktok.className = "glass py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-transparent text-slate-500 text-xs font-bold uppercase tracking-wider";
    btnInstagram.className = "glass py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-transparent text-slate-500 text-xs font-bold uppercase tracking-wider";

    // Aplicar estilos según la plataforma elegida
    if (plataforma === 'tiktok') {
        btnTiktok.classList.add('tab-active-tiktok');
        input.placeholder = "Pega el enlace de TikTok aquí...";
        icon.className = 'fab fa-tiktok text-white';
    } else if (plataforma === 'instagram') {
        btnInstagram.classList.add('tab-active-instagram');
        input.placeholder = "Pega el enlace de Instagram Reel o Video aquí...";
        icon.className = 'fab fa-instagram text-pink-500';
    }
    
    input.value = "";
    document.getElementById('results').innerHTML = ""; // Limpiar resultados anteriores
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

    // Validaciones estrictas de dominio por pestaña activa
    if (plataformaActual === 'tiktok' && !linkInput.includes('tiktok.com')) {
        mostrarError("Por favor, introduce un enlace válido de TikTok."); return;
    }
    if (plataformaActual === 'instagram' && !linkInput.includes('instagram.com')) {
        mostrarError("Por favor, introduce un enlace válido de Instagram."); return;
    }

    // Loader Cyberpunk adaptado a redes sociales
    resultsContainer.innerHTML = `
        <div class="text-center py-10 glass rounded-2xl border border-pink-500/10">
            <div class="animate-spin inline-block w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mb-3"></div>
            <p class="text-pink-400 font-mono text-[10px] uppercase tracking-widest animate-pulse">Zyncx Social: Descifrando enlace de ${plataformaActual}...</p>
        </div>`;

    try {
        // Petición inicial para obtener Video MP4
        const data = await queryServerZyncx(linkInput, false);

        if (data.status === "ok") {
            const cleanTitle = data.titulo.replace(/['"]/g, "");
            const thumb = data.miniatura;
            
            // Tarjeta estética Glassmorphism para los resultados sin publicidad
            resultsContainer.innerHTML = `
                <div class="glass p-6 rounded-2xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-center gap-6">
                    <img src="${thumb}" class="w-full md:w-32 h-32 rounded-xl object-cover border border-white/10 shadow-md">
                    
                    <div class="flex-grow text-center md:text-left w-full overflow-hidden">
                        <span class="inline-block px-2.5 py-1 rounded-md text-[9px] font-mono uppercase tracking-widest bg-white/5 text-pink-400 border border-pink-500/20 mb-2">${data.plataforma}</span>
                        <h3 class="text-white font-bold text-sm mb-4 truncate max-w-xs mx-auto md:mx-0">${cleanTitle}</h3>
                        
                        <div class="grid grid-cols-2 gap-3">
                            <a href="${data.url_descarga}" target="_blank" class="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-bold text-[11px] uppercase tracking-wider py-3 px-4 rounded-xl text-center shadow-md transition-all flex items-center justify-center gap-2">
                                <i class="fas fa-video"></i> Video MP4
                            </a>
                            
                            <button onclick="descargarSoloAudioZyncx('${linkInput}')" class="bg-white/5 hover:bg-white/10 text-white font-bold text-[11px] uppercase tracking-wider py-3 px-4 rounded-xl text-center border border-white/10 transition-all flex items-center justify-center gap-2">
                                <i class="fas fa-music text-teal-400"></i> Audio MP3
                            </button>
                        </div>
                    </div>
                </div>`;
        } else {
            throw new Error(data.msj);
        }
    } catch (err) {
        console.error(err);
        mostrarError("No se pudo extraer el archivo. Verifica que el video sea público y que el link no esté roto.");
    }
}

async function descargarSoloAudioZyncx(url) {
    const resultsContainer = document.getElementById('results');
    const backupHTML = resultsContainer.innerHTML;

    resultsContainer.innerHTML = `
        <div class="text-center py-10 glass rounded-2xl border border-teal-500/10">
            <div class="animate-spin inline-block w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full mb-3"></div>
            <p class="text-teal-400 font-mono text-[10px] uppercase tracking-widest animate-pulse">Aislando pista de audio de la tendencia...</p>
        </div>`;

    try {
        const data = await queryServerZyncx(url, true);
        if (data.status === "ok") {
            window.open(data.url_descarga, '_blank');
            resultsContainer.innerHTML = backupHTML; // Regresar a la tarjeta con opciones
        } else {
            throw new Error();
        }
    } catch (e) {
        mostrarError("Esta publicación no contiene una pista de audio aislable.");
    }
}

function mostrarError(mensaje) {
    document.getElementById('results').innerHTML = `
        <div class="text-center p-5 glass rounded-2xl border border-red-500/20">
            <p class="text-red-400 font-bold text-xs mb-1"><i class="fas fa-exclamation-triangle mr-2"></i> Estado: No Procesado</p>
            <p class="text-slate-400 text-[11px]">${mensaje}</p>
        </div>`;
}
