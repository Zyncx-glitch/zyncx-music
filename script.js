// ZYNCX CORE ENGINE v3.1 - Configuración limpia sin problemas de CORS
const API_KEY_ZYNCX = 'b7e2969cdcmshca5a386054686e0p158a2djsnf9a96c7dc51f';
const HOST_DOWNLOAD = 'youtube-mp3-audio-video-downloader.p.rapidapi.com';

async function buscarMusica() {
    const queryInput = document.getElementById('searchInput').value.trim();
    const resultsContainer = document.getElementById('results');

    if (!queryInput) return;

    resultsContainer.innerHTML = `
        <div class="text-center py-10">
            <div class="animate-spin inline-block w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full mb-4"></div>
            <p class="text-cyan-400 font-mono text-[10px] uppercase tracking-widest">Zyncx Search: Buscando pistas...</p>
        </div>`;

    try {
        // Usamos un motor de búsqueda alternativo directo y compatible con CORS
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=' + encodeURIComponent(queryInput))}`);
        const wrapper = await response.json();
        
        // Extraemos las sugerencias limpias de YouTube
        const cleanData = JSON.parse(wrapper.contents);
        const sugerencias = cleanData[1] || [];

        resultsContainer.innerHTML = "";

        if (sugerencias.length > 0) {
            // Mostramos las coincidencias exactas listas para procesar
            for (let i = 0; i < Math.min(sugerencias.length, 6); i++) {
                const tituloTerm = sugerencias[i][0];
                
                // Generamos un identificador temporal basado en texto para buscar el ID real al hacer clic
                resultsContainer.innerHTML += `
                <div class="glass p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer mb-3 group animate-render" 
                     onclick="obtenerIDYDescargar('${tituloTerm.replace(/['"]/g, "")}')">
                    <div class="flex items-center gap-4 text-left">
                        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30 shadow-lg">
                            <i class="fas fa-music text-cyan-400 text-sm"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-white text-sm group-hover:text-cyan-400 transition truncate max-w-[200px] md:max-w-md">${tituloTerm}</h3>
                            <p class="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Pista Verificada • Zyncx</p>
                        </div>
                    </div>
                    <div class="text-cyan-500 bg-cyan-500/10 p-3 rounded-xl group-hover:bg-cyan-500 group-hover:text-white transition shadow-md">
                        <i class="fas fa-search text-xs"></i>
                    </div>
                </div>`;
            }
        } else {
            resultsContainer.innerHTML = `<p class="text-center text-gray-400 italic">No se encontraron sugerencias para "${queryInput}".</p>`;
        }
    } catch (error) {
        console.error("Error global de búsqueda:", error);
        resultsContainer.innerHTML = `<p class="text-red-400 text-center font-bold">Error de red. Intenta de nuevo en unos segundos.</p>`;
    }
}

// Esta función busca el video ID del tema seleccionado de forma automática
async function obtenerIDYDescargar(nombreTema) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `
        <div class="text-center py-20">
            <div class="animate-spin inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mb-6"></div>
            <h2 class="text-xl font-bold text-white uppercase tracking-widest mb-2">Localizando Servidores</h2>
            <p class="text-cyan-400 text-xs animate-pulse">${nombreTema}</p>
        </div>`;

    try {
        // Buscamos a través de un puente seguro para obtener un ID válido de YouTube sin CORS
        const proxyUrl = "https://api.allorigins.win/get?url=";
        const targetSearch = `https://vid.puffyan.us/api/v1/search?q=${encodeURIComponent(nombreTema)}&type=video`;
        
        const res = await fetch(proxyUrl + encodeURIComponent(targetSearch));
        const wrapper = await res.json();
        const data = JSON.parse(wrapper.contents);

        if (data && data.length > 0) {
            const videoId = data[0].videoId;
            // Pasamos a la descarga con tu API de RapidAPI
            ejecutarDescargaRapidAPI(videoId, nombreTema);
        } else {
            // Enlace alternativo si falla el buscador interno
            window.location.href = `https://9xbuddy.com/process?url=https://www.youtube.com/results?search_query=${encodeURIComponent(nombreTema)}`;
        }
    } catch (e) {
        window.location.href = `https://9xbuddy.com/process?url=https://www.youtube.com/results?search_query=${encodeURIComponent(nombreTema)}`;
    }
}

async function ejecutarDescargaRapidAPI(id, titulo) {
    const resultsContainer = document.getElementById('results');

    try {
        const url = `https://${HOST_DOWNLOAD}/get-video-info/${id}?response_mode=default`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEY_ZYNCX,
                'x-rapidapi-host': HOST_DOWNLOAD,
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

        if (!audioUrl) {
            audioUrl = `https://9xbuddy.com/process?url=https://www.youtube.com/watch?v=${id}`;
        }

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
                    <i class="fas fa-cloud-download-alt mr-2"></i> ENLACE DE RESPALDO MP3
                </a>
                <button onclick="window.location.reload()" class="mt-8 text-[10px] text-gray-500 block w-full text-center">Volver</button>
            </div>`;
    }
}
