// C. Konstruksi Navigasi Dinamis Berdasarkan Otoritas (RBAC) - MODE DROPDOWN GRUP
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
        if (item.roles.includes(session.role)) {
            if (!groupedMenus[item.group]) {
                groupedMenus[item.group] = [];
            }
            groupedMenus[item.group].push(item);
        }
    });

    // Render HTML Berbasis Dropdown Accordion
    let menuHTML = '';
    for (const [groupName, items] of Object.entries(groupedMenus)) {
        // ID Unik untuk target Dropdown
        const groupId = groupName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        
        // Cetak Tombol Header Grup (Dropdown Trigger)
        menuHTML += `
        <div class="mb-1">
            <button class="dropdown-btn w-full flex justify-between items-center px-3 py-2 text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest hover:bg-indigo-900/50 rounded transition outline-none" data-target="dropdown-${groupId}">
                <span>${groupName}</span>
                <svg class="chevron-icon w-4 h-4 transition-transform duration-300 transform rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div id="dropdown-${groupId}" class="dropdown-content mt-1 space-y-1 block overflow-hidden">
        `;
        
        // Cetak Menu di dalam Grup (Indented)
        items.forEach(item => {
            menuHTML += `<a href="${item.path}" class="block px-3 py-2.5 rounded-lg hover:bg-indigo-800 transition text-sm font-semibold text-indigo-100 hover:text-white flex items-center gap-2 border border-transparent hover:border-indigo-700/50 ml-2">${item.label}</a>`;
        });
        
        // Penutup Grup & Garis Pemisah
        menuHTML += `</div></div><div class="my-2 border-b border-indigo-800/30"></div>`;
    }
    
    // Injeksi Konstruksi ke DOM
    sidebarMenu.innerHTML = menuHTML;

    // Logika Mekanis Eksekusi Dropdown (Event Listeners)
    const dropdownBtns = sidebarMenu.querySelectorAll('.dropdown-btn');
    dropdownBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const content = document.getElementById(targetId);
            const chevron = btn.querySelector('.chevron-icon');

            // Eksekusi Buka/Tutup
            if (content.classList.contains('hidden')) {
                content.classList.remove('hidden');
                content.classList.add('block');
                chevron.classList.remove('-rotate-180');
            } else {
                content.classList.remove('block');
                content.classList.add('hidden');
                chevron.classList.add('-rotate-180');
            }
        });
    });
