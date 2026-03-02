import { db } from '../../js/db.js';

export function loadMasterLogistics(container, titleEl) {
    titleEl.innerText = "Data Master: Aset & Teritori Logistik";

    const renderUI = () => {
        const couriers = db.get('couriers') || [];
        const armadas = db.get('armadas') || [];
        const coverages = db.get('coverages') || [];

        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-md overflow-hidden">
                <div class="flex border-b bg-gray-50">
                    <button class="tab-btn active-tab flex-1 py-3 font-bold text-indigo-700 border-b-2 border-indigo-700" data-target="tab-courier">Data Kurir / Vendor</button>
                    <button class="tab-btn flex-1 py-3 font-bold text-gray-500" data-target="tab-armada">Data Armada Kendaraan</button>
                    <button class="tab-btn flex-1 py-3 font-bold text-gray-500" data-target="tab-coverage">Cakupan Area (Coverage)</button>
                </div>

                <div class="p-6">
                    <div id="tab-courier" class="tab-content block">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-bold text-gray-800">Direktori Kurir</h3>
                            <button id="btn-add-courier" class="bg-indigo-600 text-white px-4 py-2 rounded-md font-bold">+ Registrasi Kurir</button>
                        </div>
                        <table class="w-full text-left border-collapse text-sm">
                            <thead class="bg-indigo-50 text-indigo-900"><tr><th class="p-3">ID / Nama</th><th class="p-3">Tipe</th><th class="p-3">Aksi</th></tr></thead>
                            <tbody>${couriers.map(c => `<tr class="border-b"><td class="p-3 font-bold">${c.name}</td><td class="p-3">${c.type}</td><td class="p-3 text-red-600 cursor-pointer font-bold" onclick="alert('Fungsi Hapus ID ${c.id} Terkunci')">Hapus</td></tr>`).join('') || '<tr><td colspan="3" class="p-3 text-center">Kosong</td></tr>'}</tbody>
                        </table>
                    </div>

                    <div id="tab-armada" class="tab-content hidden">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-bold text-gray-800">Direktori Armada</h3>
                            <button id="btn-add-armada" class="bg-indigo-600 text-white px-4 py-2 rounded-md font-bold">+ Tambah Armada</button>
                        </div>
                        <table class="w-full text-left border-collapse text-sm">
                            <thead class="bg-indigo-50 text-indigo-900"><tr><th class="p-3">No. Polisi</th><th class="p-3">Tipe Kendaraan</th><th class="p-3">Kapasitas</th></tr></thead>
                            <tbody>${armadas.map(a => `<tr class="border-b"><td class="p-3 font-bold">${a.nopol}</td><td class="p-3">${a.type}</td><td class="p-3">${a.capacity} Kg</td></tr>`).join('') || '<tr><td colspan="3" class="p-3 text-center">Kosong</td></tr>'}</tbody>
                        </table>
                    </div>

                    <div id="tab-coverage" class="tab-content hidden">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-bold text-gray-800">Matriks Rute</h3>
                            <button id="btn-add-coverage" class="bg-indigo-600 text-white px-4 py-2 rounded-md font-bold">+ Rute Baru</button>
                        </div>
                        <table class="w-full text-left border-collapse text-sm">
                            <thead class="bg-indigo-50 text-indigo-900"><tr><th class="p-3">Origin</th><th class="p-3">Destination</th><th class="p-3">Lead Time</th></tr></thead>
                            <tbody>${coverages.map(c => `<tr class="border-b"><td class="p-3 font-bold">${c.origin}</td><td class="p-3 font-bold">${c.dest}</td><td class="p-3">${c.leadtime}</td></tr>`).join('') || '<tr><td colspan="3" class="p-3 text-center">Kosong</td></tr>'}</tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div id="modal-logistics" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
                <div class="bg-white p-6 rounded-xl shadow-xl w-96">
                    <h3 id="modal-title" class="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Entry Data</h3>
                    <div id="modal-body" class="space-y-3"></div>
                    <div class="flex justify-end gap-2 pt-4">
                        <button id="btn-close-log" class="px-4 py-2 bg-gray-200 rounded font-bold">Batal</button>
                        <button id="btn-save-log" class="px-4 py-2 bg-indigo-600 text-white rounded font-bold">Simpan Absolut</button>
                    </div>
                </div>
            </div>
        `;

        // Logika Tab Dinamis
        const tabBtns = container.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => btn.onclick = () => {
            tabBtns.forEach(b => b.className = 'tab-btn flex-1 py-3 font-bold text-gray-500');
            container.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
            btn.className = 'tab-btn active-tab flex-1 py-3 font-bold text-indigo-700 border-b-2 border-indigo-700';
            container.querySelector(`#${btn.getAttribute('data-target')}`).classList.remove('hidden');
        });

        // Logika Modal Universal
        const modal = document.getElementById('modal-logistics');
        const modalBody = document.getElementById('modal-body');
        let currentTarget = '';

        document.getElementById('btn-close-log').onclick = () => modal.classList.add('hidden');

        document.getElementById('btn-add-courier').onclick = () => {
            currentTarget = 'couriers'; document.getElementById('modal-title').innerText = "Registrasi Kurir";
            modalBody.innerHTML = `<input type="text" id="i-name" placeholder="Nama Kurir / Vendor" class="w-full p-2 border rounded"><select id="i-type" class="w-full p-2 border rounded"><option value="Internal">Internal</option><option value="Vendor">Vendor</option></select>`;
            modal.classList.remove('hidden');
        };

        document.getElementById('btn-add-armada').onclick = () => {
            currentTarget = 'armadas'; document.getElementById('modal-title').innerText = "Tambah Armada";
            modalBody.innerHTML = `<input type="text" id="i-nopol" placeholder="Nomor Polisi" class="w-full p-2 border rounded"><input type="text" id="i-type" placeholder="Tipe (CDE/CDD/Wingbox)" class="w-full p-2 border rounded"><input type="number" id="i-cap" placeholder="Kapasitas (Kg)" class="w-full p-2 border rounded">`;
            modal.classList.remove('hidden');
        };

        document.getElementById('btn-add-coverage').onclick = () => {
            currentTarget = 'coverages'; document.getElementById('modal-title').innerText = "Definisi Rute Baru";
            modalBody.innerHTML = `<input type="text" id="i-ori" placeholder="Kota Asal" class="w-full p-2 border rounded"><input type="text" id="i-dest" placeholder="Kota Tujuan" class="w-full p-2 border rounded"><input type="text" id="i-lead" placeholder="Lead Time (ex: 2 Hari)" class="w-full p-2 border rounded">`;
            modal.classList.remove('hidden');
        };

        document.getElementById('btn-save-log').onclick = () => {
            let payload = {};
            if(currentTarget === 'couriers') payload = { name: document.getElementById('i-name').value, type: document.getElementById('i-type').value };
            if(currentTarget === 'armadas') payload = { nopol: document.getElementById('i-nopol').value, type: document.getElementById('i-type').value, capacity: document.getElementById('i-cap').value, status: 'Ready' };
            if(currentTarget === 'coverages') payload = { origin: document.getElementById('i-ori').value, dest: document.getElementById('i-dest').value, leadtime: document.getElementById('i-lead').value };
            
            db.insert(currentTarget, payload);
            renderUI(); // Render ulang absolut
        };
    };
    renderUI();
}
