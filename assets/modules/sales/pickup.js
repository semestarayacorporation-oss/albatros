import { db } from '../../js/db.js';

export function loadSalesPickup(container, titleEl) {
    titleEl.innerText = "Sales (CS Counter): Entri Pick Up Runsheet";

    const renderUI = () => {
        // Ekstraksi entitas relasional
        const pickups = db.get('pickups') || [];
        const customers = db.get('customers') || [];
        const couriers = db.get('couriers') || [];

        // Pembuatan Opsi Dropdown
        const custOptions = customers.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
        const courierOptions = couriers.map(c => `<option value="${c.name}">${c.name} (${c.type})</option>`).join('');

        container.innerHTML = `
            <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div class="xl:col-span-1 bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full">
                    <div class="p-4 border-b bg-indigo-50">
                        <h3 class="font-bold text-indigo-900">Form Permintaan Penjemputan</h3>
                    </div>
                    <form id="form-pickup" class="p-4 space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Pelanggan (Customer)</label>
                            <select id="p-cust" class="mt-1 w-full p-2 border border-gray-300 rounded focus:border-indigo-500" required>
                                <option value="">-- Pilih Customer --</option>
                                ${custOptions}
                                <option value="Retail/Umum">Retail / Umum (Non-Member)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Alamat Penjemputan Absolut</label>
                            <textarea id="p-address" rows="3" class="mt-1 w-full p-2 border border-gray-300 rounded focus:border-indigo-500" placeholder="Detail jalan, RT/RW, dsb." required></textarea>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Tanggal Pick Up</label>
                                <input type="date" id="p-date" class="mt-1 w-full p-2 border border-gray-300 rounded" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Estimasi Koli</label>
                                <input type="number" id="p-qty" class="mt-1 w-full p-2 border border-gray-300 rounded" placeholder="Jml Barang" required>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Alokasi Kurir (Runsheet)</label>
                            <select id="p-courier" class="mt-1 w-full p-2 border border-gray-300 rounded focus:border-indigo-500" required>
                                <option value="">-- Tugaskan Kurir --</option>
                                ${courierOptions}
                            </select>
                        </div>
                        <div class="pt-2">
                            <button type="submit" class="w-full bg-indigo-600 text-white px-4 py-2 rounded-md font-bold shadow-md hover:bg-indigo-700">Terbitkan Runsheet</button>
                        </div>
                    </form>
                </div>

                <div class="xl:col-span-2 bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full">
                    <div class="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <h3 class="font-bold text-gray-800">Direktori Pick Up Runsheet (Aktif)</h3>
                    </div>
                    <div class="overflow-x-auto p-0 flex-1">
                        <table class="w-full text-left border-collapse text-sm">
                            <thead class="bg-indigo-900 text-white sticky top-0">
                                <tr>
                                    <th class="p-3">ID Runsheet</th>
                                    <th class="p-3">Tanggal</th>
                                    <th class="p-3">Customer</th>
                                    <th class="p-3">Kurir Penjemput</th>
                                    <th class="p-3">Status</th>
                                    <th class="p-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pickups.slice().reverse().map((p, idx) => `
                                    <tr class="border-b hover:bg-gray-50">
                                        <td class="p-3 font-bold text-indigo-700">${p.id_runsheet}</td>
                                        <td class="p-3">${p.date}</td>
                                        <td class="p-3 font-medium">${p.customer}</td>
                                        <td class="p-3">${p.courier}</td>
                                        <td class="p-3">
                                            <span class="px-2 py-1 text-xs rounded font-bold ${p.status === 'Requested' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">${p.status}</span>
                                        </td>
                                        <td class="p-3 text-center">
                                            ${p.status === 'Requested' ? `<button class="btn-done-pickup bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700" data-id="${p.id_runsheet}">Barang Tiba</button>` : `<span class="text-gray-400 font-bold text-xs">Selesai</span>`}
                                        </td>
                                    </tr>
                                `).join('') || '<tr><td colspan="6" class="p-8 text-center text-gray-500 font-medium">Belum ada jadwal penjemputan.</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Logika Penyimpanan Pick Up Absolut
        document.getElementById('form-pickup').onsubmit = (e) => {
            e.preventDefault();
            const idRunsheet = `PU-${Math.floor(Date.now() / 1000)}`;
            const payload = {
                id_runsheet: idRunsheet,
                customer: document.getElementById('p-cust').value,
                address: document.getElementById('p-address').value,
                date: document.getElementById('p-date').value,
                qty: document.getElementById('p-qty').value,
                courier: document.getElementById('p-courier').value,
                status: 'Requested',
                timestamp: new Date().toISOString()
            };

            let currentPickups = db.get('pickups') || [];
            currentPickups.push(payload);
            db.set('pickups', currentPickups);
            
            alert(`EKSEKUSI BERHASIL: Runsheet Penjemputan ${idRunsheet} telah diterbitkan untuk kurir ${payload.courier}.`);
            renderUI();
        };

        // Logika Penyelesaian Pick Up (Barang Tiba di Counter)
        document.querySelectorAll('.btn-done-pickup').forEach(btn => {
            btn.onclick = (e) => {
                const id = e.target.getAttribute('data-id');
                if(!confirm(`Konfirmasi Kedatangan: Apakah barang dari Runsheet ${id} sudah tiba di counter/gudang?`)) return;

                let currentPickups = db.get('pickups') || [];
                currentPickups = currentPickups.map(p => p.id_runsheet === id ? { ...p, status: 'Picked Up (Di Counter)' } : p);
                db.set('pickups', currentPickups);
                
                renderUI();
            };
        });
    };

    renderUI();
}
