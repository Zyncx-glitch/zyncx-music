// ZYNCX CORE ENGINE - v3.0 (Anti-Cache & Anti-CORS)
const CLIENT_KEY_ZYNCX = 'b7e2969cdcmshca5a386054686e0p158a2djsnf9a96c7dc51f';
const HOST_DL_ZYNCX = 'youtube-mp3-audio-video-downloader.p.rapidapi.com';

async function buscarMusica() {
    const inputTerm = document.getElementById('searchInput').value.trim();
    const resultsContainer = document.getElementById('results');

    if (!inputTerm) return;

    resultsContainer.innerHTML = `
        <div class="text-center py-10">
            <div class="animate-spin inline-block w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full mb-4"></div>
            <p class="text-cyan-400 font-mono text-[10px] uppercase tracking-widest">Zyncx Core: Rompiendo Bloqueos...</p>
        </div>`;

    try {
        // Motor de búsqueda alternativo mediante proxy de datos AllOrigins para saltar CORS al 100%
        const targetUrl = `https://v2.api.invidious.io/api/v1/search?q=${encodeURIComponent(inputTerm)}&type=video`;
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}&_=` + new Date().getTime();

        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error("Proxy offline");
        
        const wrapper = await res.json();
        const data = JSON.parse(wrapper.contents);
        
        resultsContainer.innerHTML = "";
        
        if (data && data.length > 0) {
            data.forEach(video => {
                const cleanTitle = video.title.replace(/['"]/g, "");
                const vId = video.videoId;
                const thumb = video.videoThumbnails && video.videoThumbnails.length > 0 
                    ? video.videoThumbnails[0].url 
                    : 'https://via.placeholder.com/160x90?text=Zyncx+Music';

                resultsContainer.innerHTML += `
                <div class="glass p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer mb-3 group" 
                     onclick="prepararDescarga('${vId}', '${cleanTitle}')">
                    <div class="flex items-center gap-4 text-left">
                        <img src="${thumb}" class="w-20 h-14 rounded-lg object-cover shadow-lg border border-white/10">
                        <div>
                            <h3 class="font-bold text-white truncate text-sm group-hover:text-cyan-400 transition max-w-[180px] md:max-w-md">${video.title}</h3>
                            <p class="text-[10px] text-gray-500 font-mono">${video.author || 'YouTube'}</p>
                        </div>
                    </div>
                    <div class="text-cyan-500 bg-cyan-500/10 p-3 rounded-xl group-hover:bg-cyan-500 group-hover:text-white transition">
                        <i class="fas fa-download text-xs"></i>
                    </div>
                </div>`;
            });
        } else {
            resultsContainer.innerHTML = `<p class="text-center text-gray-400 italic">No se hallaron resultados. Intenta con otra palabra.</p>`;
        }
    } catch (e) {
        console.error("Error en Zyncx Search:", e);
        // Respaldo inmediato si el JSON falla: Usamos una API alternativa de sugerencias directas
        try {
            const fallbackRes = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=' + encodeURIComponent(inputTerm))}`);
            const fallbackWrapper = await fallbackRes.json();
            // Si llega aquí, es porque la red funciona pero Invidious está caído. Ofrecemos recarga directa
            resultsContainer.innerHTML = `
                <div class="text-center p-6 glass rounded-2xl">
                    <p class="text-cyan-400 font-bold mb-2">¡Sincronización en proceso!</p>
                    <p class="text-gray-400 text-xs mb-4">El servidor de búsqueda está saturado.</p>
                    <button onclick="buscarMusica()" class="bg-cyan-500 text-white px-4 py-2 rounded-xl text-xs uppercase font-bold">Reintentar Conexión</button>
                </div>`;
        } catch(err) {
            resultsContainer.innerHTML = `<p class="text-red-400 text-center font-bold">Error general de red. Reintenta en unos instantes.</p>`;
        }
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
        const url = `https://${HOST_DL_ZYNCX}/get-video-info/${id}?response_mode=default`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': CLIENT_KEY_ZYNCX,
                'x-rapidapi-host': HOST_DL_ZYNCX,
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
        } else if (data.formats) {
            const format = data.formats.find(f => f.mimeType && f.mimeType.includes('audio')) || data.formats[0];
            audioUrl = format ? format.url : null;
        } else if (data.url) {
            audioUrl = data.url;
        }

        if (!audioUrl) {
            audioUrl = `https://9xbuddy.com/process?url=https://www.youtube.com/watch?v=${id}`;
        }

        resultsContainer.innerHTML = `
            <div class="glass p-10 rounded-[2.5rem] border border-cyan-500/30 text-center max-w-md mx-auto shadow-2xl">
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
