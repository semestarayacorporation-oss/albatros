import { router } from './router.js';
import { loadUserMaster } from '../modules/master/user.js';
// Modul lain akan diimport di sini pada fase berikutnya

document.addEventListener('DOMContentLoaded', () => {
    // 1. Verifikasi Keamanan Sesi
    const sessionRaw = localStorage.getItem('zolog_session');
    if (!sessionRaw) {
        window.location.href = '/index.html';
        return;
    }
    
    const session = JSON.parse(sessionRaw);
    document.getElementById('user-display').innerText = `${session.name} (${session.role})`;

    // 2. Registrasi Rute (Routing Matrix)
    router.add('/', (el, title) => {
        title.innerText = "Dashboard Utama";
        el.innerHTML = `<div class="bg-indigo-50 border border-indigo-200 p-6 rounded-xl shadow-sm">
            <h3 class="text-xl font-bold text-indigo-900 mb-2">Sistem Operasional ZOLOG Aktif</h3>
            <p class="text-gray-700">Otoritas Anda: <span class="font-bold">${session.role}</span>. Pilih modul di sidebar untuk memulai eksekusi.</p>
        </div>`;
    });
    router.add('/master-user', loadUserMaster);
    
    // Inisialisasi Router
    router.init();

    // 3. Konstruksi Sidebar Berdasarkan Matriks Otoritas
    const sidebarMenu = document.getElementById('sidebar-menu');
    const menuStructure = [
        { label: 'Dashboard', path: '#/', roles: ['Super Admin', 'CS Counter', 'Customer Service', 'Sales Executive', 'Operasional', 'Finance / AR'] },
        { label: 'Data Master: User', path: '#/master-user', roles: ['Super Admin'] },
        { label: 'Sales: Entri Resi', path: '#/sales-resi', roles: ['Super Admin', 'CS Counter', 'Customer Service'] },
        { label: 'Ops: Outgoing', path: '#/ops-outgoing', roles: ['Super Admin', 'Operasional'] },
        { label: 'AR: Invoice', path: '#/ar-invoice', roles: ['Super Admin', 'Finance / AR'] }
    ];

    let menuHTML = '';
    menuStructure.forEach(item => {
        if (item.roles.includes(session.role)) {
            menuHTML += `<a href="${item.path}" class="block p-3 rounded-md hover:bg-indigo-800 transition text-sm font-medium text-indigo-100 hover:text-white">${item.label}</a>`;
        }
    });
    sidebarMenu.innerHTML = menuHTML;

    // 4. Protokol Terminasi (Logout)
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('zolog_session');
        window.location.href = '/index.html';
    });
});
