import { router } from './router.js';

// 1. Ekstraksi Modul Master
import { loadUserMaster } from '../modules/master/user.js';
import { loadMasterLogistics } from '../modules/master/logistics.js';

// 2. Ekstraksi Modul Sales
import { loadSalesResi } from '../modules/sales/resi.js';
import { loadSalesPickup } from '../modules/sales/pickup.js';
import { loadSalesTracking } from '../modules/sales/tracking.js'; // Pastikan file ini ada dari iterasi sebelumnya
// 3. Ekstraksi Modul Operasional
import { loadOpsDashboard } from '../modules/operasional/dashboard_ops.js';
import { loadOpsOutgoing } from '../modules/operasional/outgoing.js';
import { loadOpsDelivery } from '../modules/operasional/delivery.js';
import { loadOpsPOD } from '../modules/operasional/pod.js';
import { loadOpsTransit } from '../modules/operasional/transit.js';

// 4. Ekstraksi Modul Finansial (AR & Treasury)
import { loadARInvoice } from '../modules/ar/invoice.js';
import { loadARReport } from '../modules/ar/report.js';
import { loadFinanceTreasury } from '../modules/finance/treasury.js';

document.addEventListener('DOMContentLoaded', () => {
    // A. Verifikasi Keamanan Sesi Absolut
    const sessionRaw = localStorage.getItem('zolog_session');
    if (!sessionRaw) {
        window.location.href = '/index.html';
        return;
    }
    
    const session = JSON.parse(sessionRaw);
    document.getElementById('user-display').innerText = `${session.name} (${session.role})`;

    // B. Registrasi Matriks Rute (Router Integration)
    // Default / Fallback Route
    router.add('/', loadOpsDashboard); 
    
    // Master Routes
    router.add('/master-user', loadUserMaster);
    router.add('/master-logistik', loadMasterLogistics);
    
    // Sales Routes
    router.add('/sales-resi', loadSalesResi);
    router.add('/sales-pickup', loadSalesPickup);
router.add('/sales-tracking', loadSalesTracking);
    
    // Operational Routes
    router.add('/ops-dashboard', loadOpsDashboard);
    router.add('/ops-outgoing', loadOpsOutgoing);
    router.add('/ops-delivery', loadOpsDelivery);
    router.add('/ops-pod', loadOpsPOD);
    router.add('/sales-tracking', loadSalesTracking);
router.add('/ops-transit', loadOpsTransit);
    
    // Financial & AR Routes
    router.add('/ar-invoice', loadARInvoice);
    router.add('/ar-report', loadARReport);
    router.add('/finance-treasury', loadFinanceTreasury);

    // Inisialisasi Engine Rute
    router.init();

    // C. Konstruksi Navigasi Dinamis Berdasarkan Otoritas (RBAC)
    const sidebarMenu = document.getElementById('sidebar-menu');
    
    // Matriks Otoritas Absolut sesuai Instruksi
    const menuStructure = [
        { label: '📊 Dashboard Ops', path: '#/ops-dashboard', roles: ['Super Admin', 'Operasional', 'CS Counter', 'Customer Service', 'Sales Executive'] },
        { label: '🔍 Cek Tarif & Lacak', path: '#/sales-tracking', roles: ['Super Admin', 'CS Counter', 'Customer Service'] },
   { label: '🚚 Pick Up Runsheet', path: '#/sales-pickup', roles: ['Super Admin', 'CS Counter', 'Customer Service', 'Sales Executive'] },
{ label: '🏢 Transit & Incoming', path: '#/ops-transit', roles: ['Super Admin', 'Operasional'] },
        { label: '📦 Entri Resi Cash', path: '#/sales-resi', roles: ['Super Admin', 'CS Counter', 'Customer Service'] },
        { label: '🚛 Outgoing Manifest', path: '#/ops-outgoing', roles: ['Super Admin', 'Operasional'] },
        { label: '🛵 Dispatch Delivery', path: '#/ops-delivery', roles: ['Super Admin', 'Operasional'] },
        { label: '✅ Entry POD', path: '#/ops-pod', roles: ['Super Admin', 'Operasional'] },
        { label: '🧾 Proforma Invoice', path: '#/ar-invoice', roles: ['Super Admin', 'Finance / AR'] },
        { label: '📈 Aging Report', path: '#/ar-report', roles: ['Super Admin', 'Finance / AR'] },
        { label: '💰 Treasury (Kasir/AP)', path: '#/finance-treasury', roles: ['Super Admin', 'Finance / AR'] },
        { label: '⚙️ Master Logistik', path: '#/master-logistik', roles: ['Super Admin', 'Operasional'] },
        { label: '👥 Master Pengguna', path: '#/master-user', roles: ['Super Admin'] }
    ];

    let menuHTML = '';
    menuStructure.forEach(item => {
        // Validasi Otoritas: Menu hanya digambar jika Role user terdapat di dalam array roles
        if (item.roles.includes(session.role)) {
            menuHTML += `<a href="${item.path}" class="block p-3 rounded-md hover:bg-indigo-800 transition text-sm font-medium text-indigo-100 hover:text-white border-b border-indigo-800/50">${item.label}</a>`;
        }
    });
    sidebarMenu.innerHTML = menuHTML;

    // D. Protokol Terminasi Sesi (Logout)
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('zolog_session');
        window.location.href = '/index.html';
    });
});
