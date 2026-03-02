import { db } from '../../js/db.js';

export function loadMasterLogistics(container, titleEl) {
    titleEl.innerText = "Data Master: Aset & Teritori Logistik";

    const renderUI = () => {
        // Ekstraksi aman: Jika kosong, jadikan array []
        const couriers = db.get('couriers') || [];
        const armadas = db.get('armadas') || [];
        const coverages = db.get('coverages') || [];

        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-md overflow-hidden">
                <div class="flex border-b bg-gray-50">
                    <button class="tab-btn active-tab flex-1 py-3 font-bold text-indigo-700 border-b-2 border-indigo-700" data-target="tab-courier">Data Kurir / Vendor</button>
                    <button class="tab-btn flex-1 py-3 font-bold text-gray-500 hover:text-indigo-600 transition" data-target="tab-armada">Data Armada Kendaraan</button>
                    <button class="tab-btn flex-1 py-3 font-bold text-gray-500 hover:text-indigo-600 transition" data-target="tab-coverage">Cakupan Area (Coverage)</button>
                </div>

                <div class="p-6">
                    <div id="tab-courier" class="tab-content block">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-bold text-gray-800">Direktori Kurir</h3>
                            <button id="btn-add-courier" class="bg-indigo-600 text-white px-4 py-2 rounded-md font-bold shadow-sm hover:bg-indigo-700">+ Registrasi Kurir</button>
                        </div>
                        <table class="w-full text-left border-collapse text-sm">
                            <thead class="bg-indigo-50 text-indigo-900"><tr><th class="p-3">ID / Nama</th><th class="p-3">Tipe</th><th class="p-3">Aksi</th></tr></thead>
                            <tbody>
                                ${couriers.map((c, idx) => `
                                    <tr class="border-b hover:bg-gray-50">
                                        <td class="p-3 font-bold">${c.name}</td>
                                        <td class="p-3"><span class="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded font-bold">${c.type}</span></td>
                                        <td class="p-3"><button class="text-red-600 font-bold hover:text-red-800 btn-del-log" data-type="couriers" data-idx="${idx}">Hapus</button></td>
                                    </tr>
                                `).join('') || '<tr><td colspan="3" class="p-6 text-center text-gray-500">Belum ada data Kurir/Vendor.</td></tr>'}
                            </tbody>
                        </table>
                    </div>

                    <div id="tab-armada" class="tab-content hidden">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-bold text-gray-800">Direktori Armada</h3>
                            <button id="btn-add-armada" class="bg-indigo-600 text-white px-4 py-2 rounded-md font-bold shadow-sm hover:bg-indigo-700">+ Tambah Armada</button>
                        </div>
                        <table class="w-full text-left border-collapse text-sm">
                            <thead class="bg-indigo-50 text-indigo-900"><tr><th class="p-3">No. Polisi</th><th class="p-3">Tipe Kendaraan</th><th class="p-3">Kapasitas</th><th class="p-3">Aksi</th></tr></thead>
                            <tbody>
                                ${armadas.map((a, idx) => `
                                    <tr class="border-b hover:bg-gray-50">
                                        <td class="p-3 font-bold text-indigo-700">${a.nopol}</td>
                                        <td class="p-3">${a.type}</td>
                                        <td class="p-3 font-medium text-gray-600">${a.capacity} Kg</td>
                                        <td class="p-3"><button class="text-red-600 font-bold hover:text-red-800 btn-del-log" data-type="armadas" data-idx="${idx}">Hapus</button></td>
                                    </tr>
                                `).join('') || '<tr><td colspan="4" class="p-6 text-center text-gray-500">Belum ada data Armada Kendaraan.</td></tr>'}
                            </tbody>
                        </table>
                    </div>

                    <div id="tab-coverage" class="tab-content hidden">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-bold text-gray-800">Matriks Rute & Lead Time</h3>
                            <button id="btn-add-coverage" class="bg-indigo-600 text-white px-4 py-2 rounded-md font-bold shadow-sm hover:bg-indigo-700">+ Rute Baru</button>
                        </div>
                        <table class="w-full text-left border-collapse text-sm">
                            <thead class="bg-indigo-50 text-indigo-900"><tr><th class="p-3">Origin (Asal)</th><th class="p-3">Destination (Tujuan)</th><th class="p-3">Lead Time</th><th class="p-3">Aksi</th></tr></thead>
                            <tbody>
                                ${coverages.map((c, idx) => `
                                    <tr class="border-b hover:bg-gray-50">
                                        <td class="p-3 font-bold text-gray-800">${c.origin}</td>
                                        <td class="p-3 font-bold text-indigo-700">${c.dest}</td>
                                        <td class="p-3"><span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">${c.leadtime}</span></td>
                                        <td class="p-3"><button class="text-red-600 font-bold hover:text-red-800 btn-del-log" data-type="coverages" data-idx="${idx}">Hapus</button></td>
                                    </tr>
                                `).join('') || '<tr><td colspan="4" class="p-6 text-center text-gray-500">Belum ada data Cakupan Area.</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div id="modal-logistics" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
                <div class="bg-white p-6 rounded-xl shadow-xl w-96">
                    <h3 id="modal-title" class="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Entry Data</h3>
                    <div id="modal-body" class="space-y-4"></div>
                    <div class="flex justify-end gap-3 pt-6">
                        <button id="btn-close-log" class="px-4 py-2 bg-gray-200 text-gray-800 rounded font-bold hover:bg-gray-300">Batal</button>
                        <button id="btn-save-log" class="px-4 py-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700 shadow-md">Simpan Data</button>
                    </div>
                </div>
            </div>
        `;

        // 1. Logika Tab Dinamis
        const tabBtns = container.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => btn.onclick = () => {
            tabBtns.forEach(b => {
                b.classList.remove('active-tab', 'text-indigo-700', 'border-b-2', 'border-indigo-700');
                b.classList.add('text-gray-500');
            });
            container.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
            btn.classList.remove('text-gray-500');
            btn.classList.add('active-tab', 'text-indigo-700', 'border-b-2', 'border-indigo-700');
            container.querySelector(`#${btn.getAttribute('data-target')}`).classList.remove('hidden');
        });

        // 2. Logika Pemanggilan Modal
        const modal = document.getElementById('modal-logistics');
        const modalBody = document.getElementById('modal-body');
        let currentTarget = '';

        document.getElementById('btn-close-log').onclick = () => modal.classList.add('hidden');

        document.getElementById('btn-add-courier').onclick = () => {
            currentTarget = 'couriers'; 
            document.getElementById('modal-title').innerText = "Registrasi Kurir / Vendor";
            modalBody.innerHTML = `
                <div><label class="block text-sm font-medium text-gray-700">Nama Kurir</label><input type="text" id="i-name" placeholder="Nama Lengkap" class="mt-1 w-full p-2 border border-gray-300 rounded focus:border-indigo-500" required></div>
                <div><label class="block text-sm font-medium text-gray-700">Tipe Entitas</label><select id="i-type" class="mt-1 w-full p-2 border border-gray-300 rounded"><option value="Internal">Internal</option><option value="Vendor">Vendor</option></select></div>
            `;
            modal.classList.remove('hidden');
        };

        document.getElementById('btn-add-armada').onclick = () => {
            currentTarget = 'armadas'; 
            document.getElementById('modal-title').innerText = "Tambah Armada Kendaraan";
            modalBody.innerHTML = `
                <div><label class="block text-sm font-medium text-gray-700">Nomor Polisi</label><input type="text" id="i-nopol" placeholder="B 1234 CD" class="mt-1 w-full p-2 border border-gray-300 rounded" required></div>
                <div><label class="block text-sm font-medium text-gray-700">Tipe Kendaraan</label><input type="text" id="i-type" placeholder="Blind Van / CDD" class="mt-1 w-full p-2 border border-gray-300 rounded" required></div>
                <div><label class="block text-sm font-medium text-gray-700">Kapasitas Maksimal (Kg)</label><input type="number" id="i-cap" placeholder="Contoh: 1500" class="mt-1 w-full p-2 border border-gray-300 rounded" required></div>
            `;
            modal.classList.remove('hidden');
        };

        document.getElementById('btn-add-coverage').onclick = () => {
            currentTarget = 'coverages'; 
            document.getElementById('modal-title').innerText = "Definisi Rute Baru";
            modalBody.innerHTML = `
                <div><label class="block text-sm font-medium text-gray-700">Kota Asal (Origin)</label><input type="text" id="i-ori" placeholder="Jakarta" class="mt-1 w-full p-2 border border-gray-300 rounded" required></div>
                <div><label class="block text-sm font-medium text-gray-700">Kota Tujuan (Destination)</label><input type="text" id="i-dest" placeholder="Bandung" class="mt-1 w-full p-2 border border-gray-300 rounded" required></div>
                <div><label class="block text-sm font-medium text-gray-700">Estimasi Lead Time</label><input type="text" id="i-lead" placeholder="1-2 Hari" class="mt-1 w-full p-2 border border-gray-300 rounded" required></div>
            `;
            modal.classList.remove('hidden');
        };

        // 3. Mesin Penyimpanan Absolut (Force DB Set)
        document.getElementById('btn-save-log').onclick = () => {
            let payload = {};
            
            // Validasi Input & Konstruksi Payload
            if(currentTarget === 'couriers') {
                const name = document.getElementById('i-name').value;
                if(!name) return alert('Kalkulasi Ditolak: Nama Kurir wajib diisi.');
                payload = { name: name, type: document.getElementById('i-type').value, id: Date.now() };
            }
            else if(currentTarget === 'armadas') {
                const nopol = document.getElementById('i-nopol').value;
                const type = document.getElementById('i-type').value;
                const cap = document.getElementById('i-cap').value;
                if(!nopol || !type || !cap) return alert('Kalkulasi Ditolak: Semua kolom Armada wajib diisi.');
                payload = { nopol: nopol, type: type, capacity: cap, status: 'Ready', id: Date.now() };
            }
            else if(currentTarget === 'coverages') {
                const ori = document.getElementById('i-ori').value;
                const dest = document.getElementById('i-dest').value;
                const lead = document.getElementById('i-lead').value;
                if(!ori || !dest || !lead) return alert('Kalkulasi Ditolak: Semua kolom Coverage wajib diisi.');
                payload = { origin: ori, dest: dest, leadtime: lead, id: Date.now() };
            }
            
            // Bypass db.insert dan paksa set array ke dalam localStorage
            let currentData = db.get(currentTarget) || [];
            currentData.push(payload);
            db.set(currentTarget, currentData);

            // Tutup Modal dan Muat Ulang Tampilan
            modal.classList.add('hidden');
            renderUI(); 
        };

        // 4. Eksekusi Hapus Data (Delete Engine)
        document.querySelectorAll('.btn-del-log').forEach(btn => {
            btn.onclick = (e) => {
                const type = e.target.getAttribute('data-type');
                const idx = e.target.getAttribute('data-idx');
                
                if(!confirm(`Otorisasi Penghancuran: Yakin ingin menghapus data ini dari Master ${type}?`)) return;

                let currentData = db.get(type) || [];
                currentData.splice(idx, 1); // Buang 1 array dari index yang dipilih
                db.set(type, currentData);
                
                renderUI(); // Render ulang
            };
        });
    };

    renderUI();
}
