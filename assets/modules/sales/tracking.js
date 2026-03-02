import { db } from '../../js/db.js';

export function loadSalesTracking(container, titleEl) {
    titleEl.innerText = "Solusi Cek Tarif Realtime, Jadwal Kapal & Tracking Barang";

    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-md overflow-hidden relative flex flex-col min-h-[500px]">
            <div class="absolute top-4 right-4 text-right">
                <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 font-bold mb-1 shadow-inner mx-auto">[3D]</div>
                <span class="text-xs font-bold text-indigo-900 italic">Siap Kirimkan...<br>Solusi pengiriman modern Ekspedisi Digital</span>
            </div>

            <div class="p-6 border-b mt-4">
                <h2 class="text-2xl font-bold text-indigo-900 uppercase tracking-wide">Trusted Logistics Partner</h2>
            </div>

            <div class="flex border-b bg-gray-50">
                <button class="tab-btn active-tab flex-1 py-3 font-bold text-indigo-700 border-b-2 border-indigo-700 transition" data-target="tab-track">Tracking Barang</button>
                <button class="tab-btn flex-1 py-3 font-bold text-gray-500 hover:text-indigo-600 transition" data-target="tab-tarif">Kalkulator Cargo</button>
            </div>

            <div class="p-6 flex-1">
                <div id="tab-track" class="tab-content block">
                    <div class="flex gap-4 mb-6">
                        <input type="text" id="track-resi" placeholder="Masukkan Nomor Resi..." class="flex-1 rounded-md border-gray-300 shadow-sm p-3 border focus:border-indigo-500">
                        <button id="btn-track" class="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-bold shadow-md">Update Kantor Pusat</button>
                    </div>
                    <div id="track-result" class="bg-gray-50 p-4 rounded-lg hidden border border-gray-200">
                        <h4 class="font-bold text-indigo-900 mb-2 border-b pb-2" id="res-no"></h4>
                        <div class="space-y-3 mt-3" id="res-timeline"></div>
                    </div>
                </div>

                <div id="tab-tarif" class="tab-content hidden">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Origin</label>
                            <input type="text" value="Jakarta" disabled class="mt-1 block w-full rounded-md border-gray-200 bg-gray-100 p-3 border text-gray-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Destination</label>
                            <input type="text" placeholder="Ketik cari daerah Tujuan kirim" class="mt-1 block w-full rounded-md border-gray-300 p-3 border focus:border-indigo-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Berat (Barang banyak)</label>
                            <input type="number" id="calc-weight" placeholder="Kg" class="mt-1 block w-full rounded-md border-gray-300 p-3 border focus:border-indigo-500">
                        </div>
                    </div>
                    <button id="btn-calc" class="w-full bg-green-600 text-white px-6 py-4 rounded-md hover:bg-green-700 font-bold shadow-md text-lg">Harga cepat</button>
                    <div id="calc-result" class="mt-8 hidden text-center p-6 bg-indigo-50 rounded-xl border border-indigo-100">
                        <p class="text-indigo-800 font-medium">Estimasi Biaya Pengiriman</p>
                        <p class="text-5xl font-extrabold text-indigo-900 mt-2" id="calc-price">Rp 0</p>
                    </div>
                </div>
            </div>

            <div class="mt-12 mb-2 text-center text-xs text-gray-400">ALE Bugapra - Bumi Galur Pratama &copy; 2026</div>
        </div>
    `;

    // Logika Tab
    const tabBtns = container.querySelectorAll('.tab-btn');
    const tabContents = container.querySelectorAll('.tab-content');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => {
                b.classList.remove('active-tab', 'text-indigo-700', 'border-b-2', 'border-indigo-700');
                b.classList.add('text-gray-500');
            });
            tabContents.forEach(c => c.classList.add('hidden'));
            btn.classList.remove('text-gray-500');
            btn.classList.add('active-tab', 'text-indigo-700', 'border-b-2', 'border-indigo-700');
            container.querySelector(`#${btn.getAttribute('data-target')}`).classList.remove('hidden');
        });
    });

    // Logika Lacak Resi (Track & Trace)
    document.getElementById('btn-track').addEventListener('click', () => {
        const noResi = document.getElementById('track-resi').value.trim();
        const resiList = db.get('resi') || [];
        const resi = resiList.find(r => r.no_resi === noResi);
        const resDiv = document.getElementById('track-result');
        
        if (!resi) {
            resDiv.innerHTML = `<p class="text-red-500 font-bold text-center py-4">Aset logistik tidak ditemukan di dalam sistem.</p>`;
        } else {
            document.getElementById('res-no').innerText = `Nomor Resi: ${resi.no_resi}`;
            
            // Rekonstruksi Timeline
            let timeline = `<div class="flex justify-between items-center text-sm"><span class="font-bold text-gray-700">Booking / Diterima</span><span class="text-gray-500">${new Date(resi.timestamp).toLocaleString('id-ID')}</span></div>`;
            
            if (resi.status !== 'Booking') {
                timeline += `<div class="flex justify-between items-center text-sm mt-2 border-t pt-2"><span class="font-bold text-blue-600">On Process (Gudang Asal)</span><span class="text-gray-500">Selesai</span></div>`;
            }
            if (resi.status === 'Transfer Location' || resi.status === 'Incoming Hub' || resi.status === 'On Delivery' || resi.status === 'Delivered') {
                timeline += `<div class="flex justify-between items-center text-sm mt-2 border-t pt-2"><span class="font-bold text-yellow-600">Transit (Transfer Location)</span><span class="text-gray-500">Tereksekusi</span></div>`;
            }
            if (resi.status === 'On Delivery' || resi.status === 'Delivered') {
                timeline += `<div class="flex justify-between items-center text-sm mt-2 border-t pt-2"><span class="font-bold text-orange-600">On Delivery (Armada Kurir)</span><span class="text-gray-500">${resi.courier || 'Kurir Aktif'}</span></div>`;
            }
            if (resi.status === 'Delivered') {
                timeline += `<div class="flex justify-between items-center text-sm mt-2 border-t pt-2"><span class="font-bold text-green-600">Delivered (Terkirim)</span><span class="text-gray-800 font-medium">Penerima: ${resi.pod_name}</span></div>`;
            }

            document.getElementById('res-timeline').innerHTML = timeline;
        }
        resDiv.classList.remove('hidden');
    });

    // Logika Kalkulator Harga
    document.getElementById('btn-calc').addEventListener('click', () => {
        const weight = parseFloat(document.getElementById('calc-weight').value) || 0;
        if (weight <= 0) return alert('Masukkan berat barang yang valid.');
        
        // Asumsi base price simulasi Rp 12.500 / Kg
        const estimate = weight * 12500; 
        document.getElementById('calc-price').innerText = `Rp ${estimate.toLocaleString('id-ID')}`;
        document.getElementById('calc-result').classList.remove('hidden');
    });
}
