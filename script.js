const API_KEY = 'b7e2969cdcmshca5a386054686e0p158a2djsnf9a96c7dc51f';
const API_HOST = 'youtube-mp3-audio-video-downloader.p.rapidapi.com';

async function buscarMusica() {
    const queryInput = document.getElementById('searchInput').value.trim();
    const resultsContainer = document.getElementById('results');

    if (!queryInput) return;

    resultsContainer.innerHTML = `
        <div class="text-center py-10">
            <div class="animate-spin inline-block w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full mb-4"></div>
            <p class="text-cyan-400 font-mono text-[10px] uppercase tracking-widest">Zyncx Core: Buscando Música...</p>
        </div>`;

    try {
        // Motor de búsqueda universal y ultra-estable (Invidious) para evitar errores 404
        const res = await fetch(`https://invidious.io.lol/api/v1/search?q=${encodeURIComponent(queryInput)}&type=video`);
        const data = await res.json();
        
        resultsContainer.innerHTML = "";
        
        if (data && data.length > 0) {
            data.forEach(video => {
                const cleanTitle = video.title.replace(/['"]/g, "");
                const thumb = video.videoThumbnails && video.videoThumbnails.length > 0 
                    ? video.videoThumbnails[0].url 
                    : 'https://via.placeholder.com/160x90?text=Zyncx+Music';

                resultsContainer.innerHTML += `
                <div class="glass p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer mb-3 group" 
                     onclick="prepararDescarga('${video.videoId}', '${cleanTitle}')">
                    <div class="flex items-center gap-4 text-left">
                        <img src="${thumb}" class="w-20 h-14 rounded-lg object-cover shadow-lg border border-white/10">
                        <div>
                            <h3 class="font-bold text-white truncate text-sm group-hover:text-cyan-400 transition max-w-[180px] md:max-w-md">${video.title}</h3>
                            <p class="text-[10px] text-gray-500 font-mono">${video.author || 'YouTube Source'}</p>
                        </div>
                    </div>
                    <div class="text-cyan-500 bg-cyan-500/10 p-3 rounded-xl group-hover:bg-cyan-500 group-hover:text-white transition">
                        <i class="fas fa-download text-xs"></i>
                    </div>
                </div>`;
            });
        } else {
            resultsContainer.innerHTML = `<p class="text-center text-gray-400 italic">No se encontraron resultados para "${queryInput}".</p>`;
        }
    } catch (e) {
        console.error("Error de búsqueda:", e);
        resultsContainer.innerHTML = `<p class="text-red-400 text-center font-bold">Error de conexión con el servidor. Intenta de nuevo.</p>`;
    }
}

async function prepararDescarga(id, titulo) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `
        <div class="text-center py-20">
            <div class="animate-spin inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mb-6"></div>
            <h2 class="text-xl font-bold text-white uppercase tracking-widest mb-2">Procesando Audio</h2>
            <p class="text-cyan-400 text-xs animate-pulse">${titulo}</p>
        </div>`;

    try {
        // Usamos la ruta exacta del curl que nos funcionó en el test
        const url = `https://${API_HOST}/get-video-info/${id}?response_mode=default`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log("Datos de descarga recibidos:", data);

        let audioUrl = "";

        // Verificamos cómo estructuró los enlaces tu nueva API
        if (data.links && data.links.mp3) {
            const mp3Keys = Object.keys(data.links.mp3);
            if (mp3Keys.length > 0) {
                audioUrl = data.links.mp3[mp3Keys[0]].url || data.links.mp3[mp3Keys[0]];
            }
        } else if (data.formats) {
            const format = data.formats.find(f => f.mimeType && f.mimeType.includes('audio')) || data.formats[0];
            audioUrl = format ? format.url : null;
        } else if (data.url) {
            audioUrl = data.url;
        }

        // Si la API no generó el link directo, usamos el conversor de emergencia integrado
        if (!audioUrl) {
            audioUrl = `https://9xbuddy.com/process?url=https://www.youtube.com/watch?v=${id}`;
        }

        resultsContainer.innerHTML = `
            <div class="glass p-10 rounded-[2.5rem] border border-cyan-500/30 text-center max-w-md mx-auto shadow-2xl animate-render">
                <div class="w-16 h-16 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-music text-xl"></i>
                </div>
                <h3 class="text-white font-bold mb-8 text-sm leading-relaxed">${titulo}</h3>
                <a href="${audioUrl}" target="_blank" class="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black py-5 px-10 rounded-2xl transition-all hover:scale-105 inline-block shadow-xl shadow-cyan-500/40 uppercase tracking-widest text-xs text-center">
                    <i class="fas fa-cloud-download-alt mr-2"></i> DESCARGAR MP3
                </a>
                <button onclick="window.location.reload()" class="mt-8 text-[10px] text-gray-500 hover:text-white uppercase tracking-widest transition block w-full text-center">Nueva búsqueda</button>
            </div>`;

    } catch (error) {
        console.error("Error al procesar la API de descarga:", error);
        const backupUrl = `https://9xbuddy.com/process?url=https://www.youtube.com/watch?v=${id}`;
        resultsContainer.innerHTML = `
            <div class="glass p-10 rounded-[2.5rem] border border-cyan-500/30 text-center max-w-md mx-auto shadow-2xl">
                <h3 class="text-white font-bold mb-8 text-sm">${titulo}</h3>
                <a href="${backupUrl}" target="_blank" class="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black py-5 px-10 rounded-2xl inline-block text-center text-xs">
                    <i class="fas fa-cloud-download-alt mr-2"></i> ENLACE DE RESPALDO MP3
                </a>
                <button onclick="window.location.reload()" class="mt-8 text-[10px] text-gray-500 block w-full text-center">Volver</button>
            </div>`;
    }
}
