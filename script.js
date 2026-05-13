const API_KEY = 'b7e2969cdcmshca5a386054686e0p158a2djsnf9a96c7dc51f';
const API_HOST = 'youtube-media-downloader.p.rapidapi.com';

async function buscarMusica() {
    const queryInput = document.getElementById('searchInput').value.trim();
    const resultsContainer = document.getElementById('results');

    if (!queryInput) return;

    resultsContainer.innerHTML = `
        <div class="text-center py-10">
            <div class="animate-spin inline-block w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full mb-4"></div>
            <p class="text-cyan-400 font-bold uppercase tracking-widest text-[10px]">Zyncx Search: Buscando...</p>
        </div>`;

    try {
        // Limpiamos la búsqueda de cualquier cosa que no sea texto o espacios
        const cleanQuery = queryInput.replace(/[^a-zA-Z0-9 ]/g, "");
        
        const response = await fetch(`https://${API_HOST}/v2/video/search?q=${encodeURIComponent(cleanQuery)}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST
            }
        });

        const data = await response.json();
        resultsContainer.innerHTML = "";

        // La API a veces devuelve 'items', a veces 'contents'
        const videos = data.items || data.contents || [];

        if (videos.length > 0) {
            videos.forEach(video => {
                const vId = video.id || video.videoId;
                if (vId && video.title) {
                    const cleanTitle = video.title.replace(/['"]/g, "");
                    const thumb = video.thumbnails ? video.thumbnails[0].url : 'https://via.placeholder.com/150';

                    resultsContainer.innerHTML += `
                    <div class="glass p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer mb-3 group" 
                         onclick="prepararDescarga('${vId}', '${cleanTitle}')">
                        <div class="flex items-center gap-4 text-left">
                            <img src="${thumb}" class="w-20 h-14 rounded-lg object-cover shadow-lg border border-white/10">
                            <div class="max-w-[200px] md:max-w-md">
                                <h3 class="font-bold text-white truncate text-sm group-hover:text-cyan-400 transition">${video.title}</h3>
                                <p class="text-[10px] text-gray-500 font-mono">${video.author?.name || 'YouTube'}</p>
                            </div>
                        </div>
                        <div class="text-cyan-500 bg-cyan-500/10 p-2 rounded-lg group-hover:bg-cyan-500 group-hover:text-white transition">
                            <i class="fas fa-download text-sm"></i>
                        </div>
                    </div>`;
                }
            });
        } else {
            resultsContainer.innerHTML = `<p class="text-center text-gray-400 italic">No se encontraron resultados para "${cleanQuery}".</p>`;
        }
    } catch (error) {
        console.error("Error:", error);
        resultsContainer.innerHTML = `<p class="text-red-400 text-center">Error al conectar con Zyncx Server.</p>`;
    }
}

async function prepararDescarga(id, titulo) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `
        <div class="text-center py-20">
            <div class="animate-spin inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mb-6"></div>
            <p class="text-cyan-400">Generando enlace de descarga...</p>
        </div>`;

    try {
        // Usamos la ruta exacta del CURL que funcionó
        const url = `https://${API_HOST}/v2/video/details?videoId=${id}&urlAccess=normal&videos=auto&audios=auto`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST
            }
        });

        const data = await response.json();
        
        // Buscamos el audio en la nueva estructura que vimos en el CURL
        let audioUrl = "";
        if (data.audios && data.audios.items && data.audios.items.length > 0) {
            audioUrl = data.audios.items[0].url;
        } else if (data.formats) {
            const format = data.formats.find(f => f.mimeType && f.mimeType.includes('audio'));
            audioUrl = format ? format.url : data.formats[0].url;
        }

        if (audioUrl) {
            resultsContainer.innerHTML = `
                <div class="glass p-10 rounded-3xl border border-cyan-500/30 text-center max-w-md mx-auto shadow-2xl">
                    <div class="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-check text-green-400 text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-bold mb-8 text-white">${titulo}</h3>
                    <a href="${audioUrl}" target="_blank" class="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-5 px-12 rounded-2xl transition-all hover:scale-105 inline-block shadow-lg shadow-cyan-500/40 text-center">
                        <i class="fas fa-cloud-download-alt mr-2"></i> DESCARGAR MP3
                    </a>
                    <button onclick="window.location.reload()" class="mt-8 text-xs text-gray-500 hover:text-white uppercase tracking-widest underline italic">Nueva búsqueda</button>
                </div>`;
        } else {
            alert("No se pudo obtener el audio directo. Intenta con otro video.");
            window.location.reload();
        }
    } catch (e) {
        alert("Error al procesar la descarga.");
        window.location.reload();
    }
}
