// C. Konstruksi Navigasi Dinamis Berdasarkan Otoritas (RBAC) - MODE GRUP
    const sidebarMenu = document.getElementById('sidebar-menu');
    
    // Matriks Otoritas yang telah diklasifikasikan ke dalam "group"
    const menuStructure = [
        // GRUP 1: FRONT DESK & SALES
        { group: 'Front Desk & Sales', label: '🔍 Simulasi Tarif & Lacak', path: '#/sales-tracking', roles: ['Super Admin', 'CS Counter', 'Customer Service'] },
        { group: 'Front Desk & Sales', label: '🚚 Pick Up Runsheet', path: '#/sales-pickup', roles: ['Super Admin', 'CS Counter', 'Customer Service', 'Sales Executive'] },
        { group: 'Front Desk & Sales', label: '📦 Entri Resi Cash', path: '#/sales-resi', roles: ['Super Admin', 'CS Counter', 'Customer Service'] },

        // GRUP 2: OPERASIONAL & LOGISTIK
        { group: 'Operasional Logistik', label: '📊 Dashboard Ops', path: '#/ops-dashboard', roles: ['Super Admin', 'Operasional', 'CS Counter', 'Customer Service', 'Sales Executive'] },
        { group: 'Operasional Logistik', label: '🏢 Transit & Incoming', path: '#/ops-transit', roles: ['Super Admin', 'Operasional'] },
        { group: 'Operasional Logistik', label: '🚛 Outgoing Manifest', path: '#/ops-outgoing', roles: ['Super Admin', 'Operasional'] },
        { group: 'Operasional Logistik', label: '🛵 Dispatch Delivery', path: '#/ops-delivery', roles: ['Super Admin', 'Operasional'] },
        { group: 'Operasional Logistik', label: '✅ Entry POD', path: '#/ops-pod', roles: ['Super Admin', 'Operasional'] },

        // GRUP 3: FINANCE & ACCOUNTING
        { group: 'Finance & Accounting', label: '🧾 Proforma Invoice', path: '#/ar-invoice', roles: ['Super Admin', 'Finance / AR'] },
        { group: 'Finance & Accounting', label: '📈 Aging Report', path: '#/ar-report', roles: ['Super Admin', 'Finance / AR'] },
        { group: 'Finance & Accounting', label: '💰 Treasury (Kasir/AP)', path: '#/finance-treasury', roles: ['Super Admin', 'Finance / AR'] },

        // GRUP 4: ADMINISTRATOR
        { group: 'Administrator (Master)', label: '⚙️ Master Logistik', path: '#/master-logistik', roles: ['Super Admin', 'Operasional'] },
        { group: 'Administrator (Master)', label: '👥 Master Pengguna', path: '#/master-user', roles: ['Super Admin'] }
    ];

    // Algoritma Pemilahan (Sorting & Grouping)
    let groupedMenus = {};
    menuStructure.forEach(item => {
        // Hanya proses jika user memiliki otoritas
        if (item.roles.includes(session.role)) {
            if (!groupedMenus[item.group]) {
                groupedMenus[item.group] = [];
            }
            groupedMenus[item.group].push(item);
        }
    });

    // Render HTML Berbasis Grup
    let menuHTML = '';
    for (const [groupName, items] of Object.entries(groupedMenus)) {
        // Cetak Judul Grup (Header)
        menuHTML += `<div class="mt-4 mb-2 px-3 text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">${groupName}</div>`;
        
        // Cetak Menu di dalam Grup
        items.forEach(item => {
            menuHTML += `<a href="${item.path}" class="block px-3 py-2.5 mb-1 rounded-lg hover:bg-indigo-800 transition text-sm font-semibold text-indigo-100 hover:text-white flex items-center gap-2 border border-transparent hover:border-indigo-700/50">${item.label}</a>`;
        });
        
        // Pemisah antar grup
        menuHTML += `<div class="my-2 border-b border-indigo-800/30"></div>`;
    }
    
    // Injeksi ke DOM
    sidebarMenu.innerHTML = menuHTML;
