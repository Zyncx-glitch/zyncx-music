const API_KEY = 'b7e2969cdcmshca5a386054686e0p158a2djsnf9a96c7dc51f';
const API_HOST = 'youtube-media-downloader.p.rapidapi.com';

async function buscarMusica() {
    const input = document.getElementById('searchInput');
    const query = input.value.trim().toLowerCase();
    const resultsContainer = document.getElementById('results');

    if (!query) return;

    // Efecto de carga Zyncx
    resultsContainer.innerHTML = `
        <div class="text-center py-10 animate-pulse">
            <div class="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="text-cyan-400 font-mono text-xs tracking-[0.3em] uppercase">Conectando con Zyncx Server...</p>
        </div>`;

    try {
        // Intentamos con la ruta de búsqueda que verificaste en el Test Endpoint
        const response = await fetch(`https://${API_HOST}/v2/search?q=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST
            }
        });

        const data = await response.json();
        resultsContainer.innerHTML = "";

        // Revisamos todas las posibles formas en que la API entrega los videos
        const videos = data.items || data.contents || data.videos || data.data || [];

        if (videos.length > 0) {
            videos.forEach(video => {
                const id = video.id || video.videoId;
                if (id && video.title) {
                    const cleanTitle = video.title.replace(/['"]/g, "");
                    const thumb = video.thumbnails ? video.thumbnails[0].url : 'https://via.placeholder.com/160x90?text=Zyncx+Music';

                    resultsContainer.innerHTML += `
                    <div class="glass p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer mb-3 group animate-render" 
                         onclick="prepararDescarga('${id}', '${cleanTitle}')">
                        <div class="flex items-center gap-4 text-left">
                            <div class="relative w-20 h-14 shrink-0">
                                <img src="${thumb}" class="w-full h-full rounded-lg object-cover shadow-lg border border-white/10">
                                <div class="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition rounded-lg"></div>
                            </div>
                            <div class="max-w-[200px] md:max-w-md">
                                <h3 class="font-bold text-white truncate text-sm group-hover:text-cyan-400 transition">${video.title}</h3>
                                <p class="text-[10px] text-gray-500 font-mono uppercase tracking-tighter italic">YouTube Source • ${video.durationText || 'Audio'}</p>
                            </div>
                        </div>
                        <div class="text-cyan-500 bg-cyan-500/10 p-3 rounded-xl group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-lg">
                            <i class="fas fa-download text-xs"></i>
                        </div>
                    </div>`;
                }
            });
        } else {
            resultsContainer.innerHTML = `
                <div class="text-center p-10 glass rounded-3xl border border-white/5">
                    <p class="text-gray-400 italic text-sm">No se encontraron resultados para "${query}".</p>
                    <p class="text-[10px] text-cyan-500/50 mt-2 uppercase">Verifica que el servicio esté activo en RapidAPI</p>
                </div>`;
        }
    } catch (error) {
        console.error("Error Zyncx:", error);
        resultsContainer.innerHTML = `<p class="text-red-400 text-center font-bold p-10">Error de enlace. Reintenta en unos segundos.</p>`;
    }
}

async function prepararDescarga(id, titulo) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `
        <div class="text-center py-20 animate-render">
            <div class="relative inline-block mb-6">
                <div class="w-16 h-16 border-4 border-cyan-500/20 rounded-full"></div>
                <div class="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <h2 class="text-xl font-black text-white uppercase tracking-widest mb-2">Procesando Audio</h2>
            <p class="text-cyan-400 text-xs animate-pulse">${titulo}</p>
        </div>`;

    try {
        const response = await fetch(`https://${API_HOST}/v2/video/details?videoId=${id}&urlAccess=normal`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST
            }
        });

        const data = await response.json();
        let audioUrl = "";

        if (data.audios?.items?.length > 0) {
            audioUrl = data.audios.items[0].url;
        } else if (data.formats) {
            const f = data.formats.find(f => f.mimeType?.includes('audio')) || data.formats[0];
            audioUrl = f.url;
        }

        if (audioUrl) {
            resultsContainer.innerHTML = `
                <div class="glass p-10 rounded-[2.5rem] border border-cyan-500/30 text-center max-w-md mx-auto shadow-[0_0_50px_rgba(6,182,212,0.15)] animate-render">
                    <div class="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/30">
                        <i class="fas fa-headphones-alt text-cyan-400 text-3xl"></i>
                    </div>
                    <h3 class="text-white font-bold mb-8 text-sm leading-relaxed">${titulo}</h3>
                    <a href="${audioUrl}" target="_blank" class="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black py-5 px-10 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 inline-block shadow-xl shadow-cyan-500/40 uppercase tracking-widest text-xs">
                        Descargar MP3
                    </a>
                    <button onclick="window.location.reload()" class="mt-8 text-[10px] text-gray-500 hover:text-white uppercase tracking-[0.2em] transition">Nueva búsqueda</button>
                </div>`;
        } else {
            alert("El servidor de YouTube no permitió la descarga directa. Intenta con otro video.");
            window.location.reload();
        }
    } catch (e) {
        alert("Error de respuesta. Por favor intenta de nuevo.");
        window.location.reload();
    }
}
