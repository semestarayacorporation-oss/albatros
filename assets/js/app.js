// C. Konstruksi Navigasi Dinamis Berdasarkan Otoritas (RBAC) - MODE DROPDOWN GRUP
    const sidebarMenu = document.getElementById('sidebar-menu');
    
    // Matriks Identifikasi Menu Berdasarkan Kelompok (Group)
    const menuStructure = [
        { group: 'Penjualan & Front Desk', label: '🔍 Cek Tarif & Lacak', path: '#/sales-tracking', roles: ['Super Admin', 'CS Counter', 'Customer Service'] },
        { group: 'Penjualan & Front Desk', label: '🚚 Pick Up Runsheet', path: '#/sales-pickup', roles: ['Super Admin', 'CS Counter', 'Customer Service', 'Sales Executive'] },
        { group: 'Penjualan & Front Desk', label: '📦 Entri Resi Cash', path: '#/sales-resi', roles: ['Super Admin', 'CS Counter', 'Customer Service'] },

        { group: 'Logistik & Operasional', label: '📊 Dashboard Ops', path: '#/ops-dashboard', roles: ['Super Admin', 'Operasional', 'CS Counter', 'Customer Service', 'Sales Executive'] },
        { group: 'Logistik & Operasional', label: '🏢 Transit & Incoming', path: '#/ops-transit', roles: ['Super Admin', 'Operasional'] },
        { group: 'Logistik & Operasional', label: '🚛 Outgoing Manifest', path: '#/ops-outgoing', roles: ['Super Admin', 'Operasional'] },
        { group: 'Logistik & Operasional', label: '🛵 Dispatch Delivery', path: '#/ops-delivery', roles: ['Super Admin', 'Operasional'] },
        { group: 'Logistik & Operasional', label: '✅ Entry POD (Selesai)', path: '#/ops-pod', roles: ['Super Admin', 'Operasional'] },

        { group: 'Keuangan & Akuntansi', label: '🧾 Proforma Invoice', path: '#/ar-invoice', roles: ['Super Admin', 'Finance / AR'] },
        { group: 'Keuangan & Akuntansi', label: '📈 Aging Report', path: '#/ar-report', roles: ['Super Admin', 'Finance / AR'] },
        { group: 'Keuangan & Akuntansi', label: '💰 Treasury (Kasir / AP)', path: '#/finance-treasury', roles: ['Super Admin', 'Finance / AR'] },

        { group: 'Data Master Induk', label: '⚙️ Aset & Rute Logistik', path: '#/master-logistik', roles: ['Super Admin', 'Operasional'] },
        { group: 'Data Master Induk', label: '👥 Otoritas Pengguna', path: '#/master-user', roles: ['Super Admin'] }
    ];

    // Proses Pengelompokan (Grouping) Menu sesuai Hak Akses
    let groupedMenus = {};
    menuStructure.forEach(item => {
        if (item.roles.includes(session.role)) {
            if (!groupedMenus[item.group]) {
                groupedMenus[item.group] = [];
            }
            groupedMenus[item.group].push(item);
        }
    });

    // Proses Rendering HTML dengan struktur Tombol Dropdown
    let menuHTML = '';
    let groupIndex = 0;

    for (const [groupName, items] of Object.entries(groupedMenus)) {
        groupIndex++;
        // Bangun Tombol Header Dropdown
        menuHTML += `
        <div class="mb-2">
            <button class="menu-dropdown-btn w-full flex justify-between items-center px-3 py-2 text-xs font-extrabold text-indigo-300 uppercase tracking-wider hover:bg-indigo-800 rounded-md transition outline-none" data-target="group-${groupIndex}">
                <span>${groupName}</span>
                <svg class="chevron-icon w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div id="group-${groupIndex}" class="menu-dropdown-content mt-1 space-y-1 block overflow-hidden pl-2">
        `;
        
        // Bangun Link di dalam Grup
        items.forEach(item => {
            menuHTML += `<a href="${item.path}" class="block px-3 py-2.5 rounded-md hover:bg-indigo-700 hover:text-white transition text-sm font-semibold text-indigo-100 flex items-center gap-2 border border-transparent">${item.label}</a>`;
        });
        
        menuHTML += `</div></div>`;
    }
    
    // Suntikkan ke Sidebar
    sidebarMenu.innerHTML = menuHTML;

    // Logika Klik Dropdown Accordion
    const dropdownBtns = sidebarMenu.querySelectorAll('.menu-dropdown-btn');
    dropdownBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const content = document.getElementById(targetId);
            const chevron = btn.querySelector('.chevron-icon');

            if (content.classList.contains('hidden')) {
                // Buka Dropdown
                content.classList.remove('hidden');
                content.classList.add('block');
                chevron.classList.remove('-rotate-90'); // Putar icon panah ke bawah
            } else {
                // Tutup Dropdown
                content.classList.remove('block');
                content.classList.add('hidden');
                chevron.classList.add('-rotate-90'); // Putar icon panah ke kanan
            }
        });
    });
