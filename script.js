const API_KEY = 'b7e2969cdcmshca5a386054686e0p158a2djsnf9a96c7dc51f';
const API_HOST = 'youtube-media-downloader.p.rapidapi.com';

async function buscarMusica() {
    const queryInput = document.getElementById('searchInput').value.trim();
    const resultsContainer = document.getElementById('results');

    if (!queryInput) return;

    resultsContainer.innerHTML = `<div class="text-center py-10"><div class="animate-spin inline-block w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full mb-4"></div><p class="text-cyan-400">Buscando en Zyncx...</p></div>`;

    try {
        // Probamos con la ruta de búsqueda más básica y estable
        const response = await fetch(`https://${API_HOST}/v2/search?q=${encodeURIComponent(queryInput)}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST
            }
        });

        const data = await response.json();
        
        // Si la API nos da un error de suscripción o cuota, lo veremos aquí
        if (data.message) {
            console.log("Mensaje de la API:", data.message);
        }

        resultsContainer.innerHTML = "";
        // Intentamos capturar los videos de cualquier propiedad que use la API
        const videos = data.items || data.contents || data.videos || data.data;

        if (videos && videos.length > 0) {
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
                                <p class="text-[10px] text-gray-500 font-mono">YouTube • Zyncx Music</p>
                            </div>
                        </div>
                        <div class="text-cyan-500 bg-cyan-500/10 p-2 rounded-lg group-hover:bg-cyan-500 group-hover:text-white transition">
                            <i class="fas fa-download text-sm"></i>
                        </div>
                    </div>`;
                }
            });
        } else {
            resultsContainer.innerHTML = `<p class="text-center text-gray-400 italic">Sin resultados. Revisa tu suscripción en RapidAPI (Plan Free).</p>`;
        }
    } catch (error) {
        resultsContainer.innerHTML = `<p class="text-red-400 text-center">Error de conexión.</p>`;
    }
}

async function prepararDescarga(id, titulo) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `<div class="text-center py-20"><div class="animate-spin inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mb-6"></div><p class="text-cyan-400">Obteniendo MP3...</p></div>`;

    try {
        // Ruta de detalles exacta del curl
        const url = `https://${API_HOST}/v2/video/details?videoId=${id}&urlAccess=normal`;
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': API_HOST }
        });

        const data = await response.json();
        let audioUrl = "";

        if (data.audios && data.audios.items) {
            audioUrl = data.audios.items[0].url;
        } else if (data.formats) {
            const f = data.formats.find(f => f.mimeType && f.mimeType.includes('audio'));
            audioUrl = f ? f.url : data.formats[0].url;
        }

        if (audioUrl) {
            resultsContainer.innerHTML = `
                <div class="glass p-10 rounded-3xl text-center max-w-md mx-auto shadow-2xl border border-white/10">
                    <h3 class="text-white mb-8 text-sm font-bold">${titulo}</h3>
                    <a href="${audioUrl}" target="_blank" class="w-full bg-cyan-500 text-white font-bold py-4 px-8 rounded-xl inline-block shadow-lg shadow-cyan-500/20">
                        <i class="fas fa-download mr-2"></i> DESCARGAR AHORA
                    </a>
                    <button onclick="window.location.reload()" class="mt-6 text-gray-500 block w-full text-xs underline">Nueva búsqueda</button>
                </div>`;
        } else {
            alert("No se encontró el archivo. Intenta con otro video.");
            window.location.reload();
        }
    } catch (e) {
        alert("Error al procesar.");
        window.location.reload();
    }
}
