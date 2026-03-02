import { db } from '../../js/db.js';

export function loadMasterLogistics(container, titleEl) {
    titleEl.innerText = "Data Master: Aset & Teritori Logistik";

    // Injeksi struktur dasar Antarmuka Bertab
    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <div class="flex border-b bg-gray-50">
                <button class="tab-btn active-tab flex-1 py-3 font-bold text-indigo-700 border-b-2 border-indigo-700 transition" data-target="tab-courier">Data Kurir / Vendor</button>
                <button class="tab-btn flex-1 py-3 font-bold text-gray-500 hover:text-indigo-600 transition" data-target="tab-armada">Data Armada Kendaraan</button>
                <button class="tab-btn flex-1 py-3 font-bold text-gray-500 hover:text-indigo-600 transition" data-target="tab-coverage">Cakupan Area (Coverage)</button>
            </div>

            <div class="p-6">
                <div id="tab-courier" class="tab-content block">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold text-gray-800">Direktori Kurir Aktif</h3>
                        <button class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm shadow-sm font-semibold" onclick="alert('Form Registrasi Kurir (Modal) akan dimuat di sini.')">+ Registrasi Kurir</button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-indigo-50 text-indigo-900 text-sm">
                                <tr><th class="p-3">ID Kurir</th><th class="p-3">Nama Lengkap</th><th class="p-3">Tipe (Internal/Vendor)</th><th class="p-3">Kontak</th><th class="p-3">Status</th></tr>
                            </thead>
                            <tbody id="grid-courier"></tbody>
                        </table>
                    </div>
                </div>

                <div id="tab-armada" class="tab-content hidden">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold text-gray-800">Direktori Armada Kendaraan</h3>
                        <button class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm shadow-sm font-semibold" onclick="alert('Form Registrasi Armada (Modal) akan dimuat di sini.')">+ Tambah Armada</button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-indigo-50 text-indigo-900 text-sm">
                                <tr><th class="p-3">No. Polisi</th><th class="p-3">Tipe Kendaraan</th><th class="p-3">Kapasitas (Kg)</th><th class="p-3">Tahun</th><th class="p-3">Kondisi</th></tr>
                            </thead>
                            <tbody id="grid-armada"></tbody>
                        </table>
                    </div>
                </div>

                <div id="tab-coverage" class="tab-content hidden">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold text-gray-800">Matriks Rute & Lead Time</h3>
                        <button class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm shadow-sm font-semibold" onclick="alert('Form Routing (Modal) akan dimuat di sini.')">+ Definisikan Rute Baru</button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-indigo-50 text-indigo-900 text-sm">
                                <tr><th class="p-3">Origin (Asal)</th><th class="p-3">Destination (Tujuan)</th><th class="p-3">Layanan</th><th class="p-3">Lead Time (Hari)</th><th class="p-3">Status Rute</th></tr>
                            </thead>
                            <tbody id="grid-coverage"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Logika Pengendali Tab Dinamis
    const tabBtns = container.querySelectorAll('.tab-btn');
    const tabContents = container.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Reset Semua Tab
            tabBtns.forEach(b => {
                b.classList.remove('active-tab', 'text-indigo-700', 'border-b-2', 'border-indigo-700');
                b.classList.add('text-gray-500');
            });
            tabContents.forEach(c => c.classList.add('hidden'));

            // Aktivasi Tab Terpilih
            btn.classList.remove('text-gray-500');
            btn.classList.add('active-tab', 'text-indigo-700', 'border-b-2', 'border-indigo-700');
            const targetId = btn.getAttribute('data-target');
            container.querySelector(`#${targetId}`).classList.remove('hidden');
        });
    });

    // Injeksi Data ke Grid (Ekstraksi dari Mock DB)
    const renderData = () => {
        // 1. Render Kurir
        const couriers = db.get('couriers') || [
            { id: 'C-001', name: 'Budi Santoso', type: 'Internal', phone: '0812-XXXX', status: 'Aktif' },
            { id: 'V-001', name: 'Lalamove JKT', type: 'Vendor', phone: '021-XXXX', status: 'Aktif' }
        ];
        document.getElementById('grid-courier').innerHTML = couriers.map(c => `
            <tr class="border-b hover:bg-gray-50 text-sm">
                <td class="p-3 font-medium">${c.id}</td><td class="p-3">${c.name}</td>
                <td class="p-3"><span class="px-2 py-1 rounded text-xs font-bold ${c.type === 'Internal' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}">${c.type}</span></td>
                <td class="p-3">${c.phone}</td><td class="p-3 text-green-600 font-bold">${c.status}</td>
            </tr>
        `).join('');

        // 2. Render Armada
        const armadas = db.get('armadas') || [
            { nopol: 'B 1234 CD', type: 'Blind Van (Granmax)', capacity: 700, year: 2022, status: 'Ready' },
            { nopol: 'B 9876 EF', type: 'CDD Long', capacity: 4000, year: 2020, status: 'Maintenance' }
        ];
        document.getElementById('grid-armada').innerHTML = armadas.map(a => `
            <tr class="border-b hover:bg-gray-50 text-sm">
                <td class="p-3 font-bold">${a.nopol}</td><td class="p-3">${a.type}</td><td class="p-3">${a.capacity}</td><td class="p-3">${a.year}</td>
                <td class="p-3"><span class="px-2 py-1 rounded text-xs font-bold ${a.status === 'Ready' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${a.status}</span></td>
            </tr>
        `).join('');

        // 3. Render Coverage
        const coverages = db.get('coverages') || [
            { origin: 'JKT (Jakarta)', dest: 'BDO (Bandung)', service: 'PRIORITY', leadtime: '1 Hari', status: 'Buka' },
            { origin: 'JKT (Jakarta)', dest: 'MES (Medan)', service: 'CARGO LAUT', leadtime: '7-10 Hari', status: 'Buka' }
        ];
        document.getElementById('grid-coverage').innerHTML = coverages.map(cv => `
            <tr class="border-b hover:bg-gray-50 text-sm">
                <td class="p-3">${cv.origin}</td><td class="p-3">${cv.dest}</td><td class="p-3 font-medium">${cv.service}</td>
                <td class="p-3">${cv.leadtime}</td><td class="p-3 text-green-600 font-bold">${cv.status}</td>
            </tr>
        `).join('');
    };

    renderData();
}
