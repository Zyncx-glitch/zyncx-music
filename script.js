// ZYNCX CORE ENGINE v4.0 - Configuración Estable Total
const API_KEY_ZYNCX = 'b7e2969cdcmshca5a386054686e0p158a2djsnf9a96c7dc51f';
// Usaremos una API de búsqueda ultra-estable en RapidAPI
const HOST_SEARCH_ZYNCX = 'youtube-search-and-download.p.rapidapi.com';
const HOST_DOWNLOAD_ZYNCX = 'youtube-mp3-audio-video-downloader.p.rapidapi.com';

async function buscarMusica() {
    const queryInput = document.getElementById('searchInput').value.trim();
    const resultsContainer = document.getElementById('results');

    if (!queryInput) return;

    resultsContainer.innerHTML = `
        <div class="text-center py-10">
            <div class="animate-spin inline-block w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full mb-4"></div>
            <p class="text-cyan-400 font-mono text-[10px] uppercase tracking-widest">Zyncx Core: Buscando pistas...</p>
        </div>`;

    try {
        // Buscamos directamente usando una API nativa de RapidAPI (CORS 100% permitido)
        const response = await fetch(`https://${HOST_SEARCH_ZYNCX}/search?query=${encodeURIComponent(queryInput)}&type=v`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEY_ZYNCX,
                'x-rapidapi-host': HOST_SEARCH_ZYNCX
            }
        });

        if (!response.ok) throw new Error("Error en el servidor de búsqueda");

        const data = await response.json();
        resultsContainer.innerHTML = "";

        // Filtramos los videos devueltos por la API
        const videos = data.contents || [];

        if (videos.length > 0) {
            videos.slice(0, 6).forEach(item => {
                const video = item.video;
                if (video && video.videoId) {
                    const cleanTitle = video.title.replace(/['"]/g, "");
                    const thumb = video.thumbnails && video.thumbnails.length > 0 ? video.thumbnails[0].url : 'https://via.placeholder.com/160x90?text=Zyncx+Music';

                    resultsContainer.innerHTML += `
                    <div class="glass p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer mb-3 group animate-render" 
                         onclick="ejecutarDescargaRapidAPI('${video.videoId}', '${cleanTitle}')">
                        <div class="flex items-center gap-4 text-left">
                            <img src="${thumb}" class="w-20 h-14 rounded-lg object-cover shadow-lg border border-white/10">
                            <div>
                                <h3 class="font-bold text-white text-sm group-hover:text-cyan-400 transition truncate max-w-[180px] md:max-w-md">${video.title}</h3>
                                <p class="text-[10px] text-gray-500 font-mono uppercase tracking-widest">${video.lengthText || 'YouTube'}</p>
                            </div>
                        </div>
                        <div class="text-cyan-500 bg-cyan-500/10 p-3 rounded-xl group-hover:bg-cyan-500 group-hover:text-white transition shadow-md">
                            <i class="fas fa-download text-xs"></i>
                        </div>
                    </div>`;
                }
            });
        } else {
            resultsContainer.innerHTML = `<p class="text-center text-gray-400 italic">No se encontraron resultados para "${queryInput}".</p>`;
        }
    } catch (error) {
        console.error("Error global de búsqueda:", error);
        resultsContainer.innerHTML = `<p class="text-red-400 text-center font-bold">Servidor en mantenimiento. Intenta de nuevo.</p>`;
    }
}

async function ejecutarDescargaRapidAPI(id, titulo) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `
        <div class="text-center py-20">
            <div class="animate-spin inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mb-6"></div>
            <h2 class="text-xl font-bold text-white uppercase tracking-widest mb-2">Generando MP3</h2>
            <p class="text-cyan-400 text-xs animate-pulse">${titulo}</p>
        </div>`;

    try {
        const url = `https://${HOST_DOWNLOAD_ZYNCX}/get-video-info/${id}?response_mode=default`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEY_ZYNCX,
                'x-rapidapi-host': HOST_DOWNLOAD_ZYNCX,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        let audioUrl = "";

        if (data.links && data.links.mp3) {
            const mp3Keys = Object.keys(data.links.mp3);
            if (mp3Keys.length > 0) {
                audioUrl = data.links.mp3[mp3Keys[0]].url || data.links.mp3[mp3Keys[0]];
            }
        } else if (data.url) {
            audioUrl = data.url;
        }

        if (!audioUrl) throw new Error("No direct URL");

        resultsContainer.innerHTML = `
            <div class="glass p-10 rounded-[2.5rem] border border-cyan-500/30 text-center max-w-md mx-auto shadow-2xl">
                <div class="w-16 h-16 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-headphones-alt text-xl"></i>
                </div>
                <h3 class="text-white font-bold mb-8 text-sm leading-relaxed">${titulo}</h3>
                <a href="${audioUrl}" target="_blank" class="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black py-5 px-10 rounded-2xl transition-all hover:scale-105 inline-block shadow-xl shadow-cyan-500/40 uppercase tracking-widest text-xs text-center">
                    <i class="fas fa-cloud-download-alt mr-2"></i> DESCARGAR MP3
                </a>
                <button onclick="window.location.reload()" class="mt-8 text-[10px] text-gray-500 hover:text-white uppercase tracking-widest transition block w-full text-center">Nueva búsqueda</button>
            </div>`;
    } catch (err) {
        const backupUrl = `https://9xbuddy.com/process?url=https://www.youtube.com/watch?v=${id}`;
        resultsContainer.innerHTML = `
            <div class="glass p-10 rounded-[2.5rem] border border-cyan-500/30 text-center max-w-md mx-auto shadow-2xl">
                <h3 class="text-white font-bold mb-8 text-sm">${titulo}</h3>
                <a href="${backupUrl}" target="_blank" class="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black py-5 px-10 rounded-2xl inline-block text-center text-xs">
                    <i class="fas fa-cloud-download-alt mr-2"></i> PROCESAR ENLACE MP3
                </a>
                <button onclick="window.location.reload()" class="mt-8 text-[10px] text-gray-500 block w-full text-center">Volver</button>
            </div>`;
    }
}
