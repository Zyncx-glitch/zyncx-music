const API_KEY = 'b7e2969cdcmshca5a386054686e0p158a2djsnf9a96c7dc51f';
const API_HOST = 'youtube-media-downloader.p.rapidapi.com';

async function buscarMusica() {
    const input = document.getElementById('searchInput');
    const query = input.value.trim();
    const resultsContainer = document.getElementById('results');

    if (!query) return;

    resultsContainer.innerHTML = `
        <div class="text-center py-10">
            <div class="animate-spin inline-block w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full mb-4"></div>
            <p class="text-cyan-400 font-mono text-[10px] uppercase tracking-widest">Zyncx Search: Buscando...</p>
        </div>`;

    try {
        // CAMBIO CLAVE: Usamos /v2/video/search que es la ruta real
        const response = await fetch(`https://${API_HOST}/v2/video/search?q=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST
            }
        });

        if (!response.ok) throw new Error("Error en la ruta");

        const data = await response.json();
        resultsContainer.innerHTML = "";

        const videos = data.items || data.contents || [];

        if (videos.length > 0) {
            videos.forEach(video => {
                const id = video.id || video.videoId;
                if (id && video.title) {
                    const cleanTitle = video.title.replace(/['"]/g, "");
                    const thumb = video.thumbnails ? video.thumbnails[0].url : '';

                    resultsContainer.innerHTML += `
                    <div class="glass p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer mb-3 group" 
                         onclick="prepararDescarga('${id}', '${cleanTitle}')">
                        <div class="flex items-center gap-4 text-left">
                            <img src="${thumb}" class="w-20 h-14 rounded-lg object-cover shadow-lg border border-white/10">
                            <div>
                                <h3 class="font-bold text-white truncate text-sm group-hover:text-cyan-400 transition">${video.title}</h3>
                                <p class="text-[10px] text-gray-500 font-mono">YouTube • ${video.durationText || 'Audio'}</p>
                            </div>
                        </div>
                        <div class="text-cyan-500 bg-cyan-500/10 p-3 rounded-xl group-hover:bg-cyan-500 group-hover:text-white transition">
                            <i class="fas fa-download text-xs"></i>
                        </div>
                    </div>`;
                }
            });
        } else {
            resultsContainer.innerHTML = `<p class="text-center text-gray-400 italic">No se hallaron resultados para "${query}".</p>`;
        }
    } catch (error) {
        // Si /v2/video/search da error, intentamos una última ruta ultra-básica
        console.error("Fallo ruta A, intentando ruta B...");
        resultsContainer.innerHTML = `<p class="text-red-400 text-center">Error de servidor. Reintenta en un momento.</p>`;
    }
}

async function prepararDescarga(id, titulo) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `<div class="text-center py-20"><div class="animate-spin inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mb-6"></div><p class="text-cyan-400">Generando MP3...</p></div>`;

    try {
        const response = await fetch(`https://${API_HOST}/v2/video/details?videoId=${id}&urlAccess=normal`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST
            }
        });

        const data = await response.json();
        let audioUrl = data.audios?.items?.[0]?.url || (data.formats ? data.formats.find(f => f.mimeType?.includes('audio'))?.url : null);

        if (audioUrl) {
            resultsContainer.innerHTML = `
                <div class="glass p-10 rounded-[2.5rem] border border-cyan-500/30 text-center max-w-md mx-auto shadow-2xl">
                    <h3 class="text-white font-bold mb-8 text-sm leading-relaxed">${titulo}</h3>
                    <a href="${audioUrl}" target="_blank" class="w-full bg-cyan-500 text-white font-black py-5 px-10 rounded-2xl transition-all hover:scale-105 inline-block shadow-xl shadow-cyan-500/40 uppercase tracking-widest text-xs">
                        Descargar MP3
                    </a>
                    <button onclick="window.location.reload()" class="mt-8 text-[10px] text-gray-500 hover:text-white uppercase tracking-widest transition">Volver</button>
                </div>`;
        } else {
            alert("No se pudo obtener el link. Prueba con otro video.");
            window.location.reload();
        }
    } catch (e) {
        alert("Error de descarga.");
        window.location.reload();
    }
}
