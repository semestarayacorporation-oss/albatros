import { router } from './router.js';

// --- 1. IMPORT SELURUH MODUL ABSOLUT ---
import { loadUserMaster } from '../modules/master/user.js';
import { loadMasterLogistics } from '../modules/master/logistics.js';

import { loadSalesResi } from '../modules/sales/resi.js';
import { loadSalesPickup } from '../modules/sales/pickup.js';
import { loadSalesTracking } from '../modules/sales/tracking.js';

import { loadOpsDashboard } from '../modules/operasional/dashboard_ops.js';
import { loadOpsOutgoing } from '../modules/operasional/outgoing.js';
import { loadOpsDelivery } from '../modules/operasional/delivery.js';
import { loadOpsPOD } from '../modules/operasional/pod.js';
import { loadOpsTransit } from '../modules/operasional/transit.js';

import { loadARInvoice } from '../modules/ar/invoice.js';
import { loadARReport } from '../modules/ar/report.js';
import { loadFinanceTreasury } from '../modules/finance/treasury.js';

// --- 2. ENGINE INISIALISASI (ANTI-RACE CONDITION) ---
const initSystem = () => {
    // A. Verifikasi Sesi Kunci
    const sessionRaw = localStorage.getItem('zolog_session');
    if (!sessionRaw) {
        window.location.href = '/index.html';
        return;
    }
    
    const session = JSON.parse(sessionRaw);
    const userDisplay = document.getElementById('user-display');
    if(userDisplay) userDisplay.innerText = `${session.name} (${session.role})`;

    // B. Pendaftaran Matriks Rute (Router Registration)
    router.add('/', loadOpsDashboard); // Default Fallback
    
    router.add('/master-user', loadUserMaster);
    router.add('/master-logistik', loadMasterLogistics);
    
    router.add('/sales-resi', loadSalesResi);
    router.add('/sales-pickup', loadSalesPickup);
    router.add('/sales-tracking', loadSalesTracking);
    
    router.add('/ops-dashboard', loadOpsDashboard);
    router.add('/ops-transit', loadOpsTransit);
    router.add('/ops-outgoing', loadOpsOutgoing);
    router.add('/ops-delivery', loadOpsDelivery);
    router.add('/ops-pod', loadOpsPOD);
    
    router.add('/ar-invoice', loadARInvoice);
    router.add('/ar-report', loadARReport);
    router.add('/finance-treasury', loadFinanceTreasury);

    // TEMBAKKAN ROUTER (Sangat Krusial untuk memuat Workspace)
    router.init();

    // C. Pembangunan Menu Dropdown Otomatis
    const sidebarMenu = document.getElementById('sidebar-menu');
    if (!sidebarMenu) return; // Mencegah error jika elemen tidak ada
    
    const menuStructure = [
        { group: 'Penjualan & Front Desk', label: '🔍 Cek Tarif & Lacak', path: '#/sales-tracking', roles: ['Super Admin', 'CS Counter', 'Customer Service'] },
        { group: 'Penjualan & Front Desk', label: '🚚 Pick Up Runsheet', path: '#/sales-pickup', roles: ['Super Admin', 'CS Counter', 'Customer Service', 'Sales Executive'] },
        { group: 'Penjualan & Front Desk', label: '📦 Entri Resi Cash', path: '#/sales-resi', roles: ['Super Admin', 'CS Counter', 'Customer Service'] },

        { group: 'Logistik & Operasional', label: '📊 Dashboard Ops', path: '#/ops-dashboard', roles: ['Super Admin', 'Operasional', 'CS Counter', 'Customer Service', 'Sales Executive'] },
        { group: 'Logistik & Operasional', label: '🏢 Transit & Incoming', path: '#/ops-transit', roles: ['Super Admin', 'Operasional'] },
        { group: 'Logistik & Operasional', label: '🚛 Outgoing Manifest', path: '#/ops-outgoing', roles: ['Super Admin', 'Operasional'] },
        { group: 'Logistik & Operasional', label: '🛵 Dispatch Delivery', path: '#/ops-delivery', roles: ['Super Admin', 'Operasional'] },
        { group: 'Logistik & Operasional', label: '✅ Entry POD', path: '#/ops-pod', roles: ['Super Admin', 'Operasional'] },

        { group: 'Keuangan & Akuntansi', label: '🧾 Proforma Invoice', path: '#/ar-invoice', roles: ['Super Admin', 'Finance / AR'] },
        { group: 'Keuangan & Akuntansi', label: '📈 Aging Report', path: '#/ar-report', roles: ['Super Admin', 'Finance / AR'] },
        { group: 'Keuangan & Akuntansi', label: '💰 Treasury (Kasir / AP)', path: '#/finance-treasury', roles: ['Super Admin', 'Finance / AR'] },

        { group: 'Data Master Induk', label: '⚙️ Aset & Rute Logistik', path: '#/master-logistik', roles: ['Super Admin', 'Operasional'] },
        { group: 'Data Master Induk', label: '👥 Otoritas Pengguna', path: '#/master-user', roles: ['Super Admin'] }
    ];

    let groupedMenus = {};
    menuStructure.forEach(item => {
        if (item.roles.includes(session.role)) {
            if (!groupedMenus[item.group]) {
                groupedMenus[item.group] = [];
            }
            groupedMenus[item.group].push(item);
        }
    });

    let menuHTML = '';
    let groupIndex = 0;

    for (const [groupName, items] of Object.entries(groupedMenus)) {
        groupIndex++;
        menuHTML += `
        <div class="mb-2">
            <button class="menu-dropdown-btn w-full flex justify-between items-center px-3 py-2 text-xs font-extrabold text-indigo-300 uppercase tracking-wider hover:bg-indigo-800 rounded-md transition outline-none" data-target="group-${groupIndex}">
                <span>${groupName}</span>
                <svg class="chevron-icon w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div id="group-${groupIndex}" class="menu-dropdown-content mt-1 space-y-1 block overflow-hidden pl-2">
        `;
        
        items.forEach(item => {
            menuHTML += `<a href="${item.path}" class="block px-3 py-2.5 rounded-md hover:bg-indigo-700 hover:text-white transition text-sm font-semibold text-indigo-100 flex items-center gap-2 border border-transparent">${item.label}</a>`;
        });
        
        menuHTML += `</div></div>`;
    }
    
    sidebarMenu.innerHTML = menuHTML;

    // Logika Klik Dropdown Accordion
    const dropdownBtns = sidebarMenu.querySelectorAll('.menu-dropdown-btn');
    dropdownBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const content = document.getElementById(targetId);
            const chevron = btn.querySelector('.chevron-icon');

            if (content.classList.contains('hidden')) {
                content.classList.remove('hidden');
                content.classList.add('block');
                chevron.classList.remove('-rotate-90'); 
            } else {
                content.classList.remove('block');
                content.classList.add('hidden');
                chevron.classList.add('-rotate-90'); 
            }
        });
    });

    // D. Protokol Logout
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('zolog_session');
            window.location.href = '/index.html';
        });
    }
};

// Eksekusi Pemicu Cerdas
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSystem);
} else {
    initSystem();
}
