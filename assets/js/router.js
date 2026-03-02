export const router = {
    routes: {},
    add(path, handler) {
        this.routes[path] = handler;
    },
    navigate() {
        const path = location.hash.slice(1) || '/';
        const contentDiv = document.getElementById('app-content');
        const titleEl = document.getElementById('page-title');
        
        if (this.routes[path]) {
            this.routes[path](contentDiv, titleEl);
        } else {
            contentDiv.innerHTML = `<div class="text-center text-gray-500 mt-10">Modul tidak ditemukan atau akses ditolak.</div>`;
            titleEl.innerText = "Error 404";
        }
    },
    init() {
        window.addEventListener('hashchange', () => this.navigate());
        this.navigate();
    }
};
