import { db } from '../../js/db.js';

export function loadOpsPOD(container, titleEl) {
    titleEl.innerText = "Operasional: Entry POD (Proof of Delivery)";

    const resiList = db.get('resi') || [];
    const deliveryResi = resiList.filter(r => r.status === 'On Delivery');

    let rows = deliveryResi.map(r => `
        <tr class="border-b hover:bg-gray-50">
            <td class="p-3 font-bold text-green-700">${r.no_resi}</td>
            <td class="p-3 text-sm">${r.courier || '-'}</td>
            <td class="p-3">
                <input type="text" id="penerima-${r.no_resi}" placeholder="Nama Penerima Asli" class="w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" required>
            </td>
            <td class="p-3">
                <button data-resi="${r.no_resi}" class="btn-pod bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm font-bold shadow-sm transition">
                    Selesaikan POD
                </button>
            </td>
        </tr>
    `).join('');

    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-md p-6">
            <h3 class="font-bold text-green-900 mb-4 border-b pb-2">Daftar Manifest Pengiriman Aktif</h3>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-green-100 text-green-900 text-sm">
                        <tr>
                            <th class="p-3 w-1/4">Nomor Resi</th>
                            <th class="p-3 w-1/4">Kurir</th>
                            <th class="p-3 w-1/3">Detail Penerima Barang (POD)</th>
                            <th class="p-3 w-auto">Aksi Eksekusi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows || '<tr><td colspan="4" class="p-6 text-center text-gray-500 font-medium">Seluruh pengiriman telah selesai. Tidak ada armada di lapangan.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Intersep Tombol POD
    document.querySelectorAll('.btn-pod').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const noResi = e.target.getAttribute('data-resi');
            const inputPenerima = document.getElementById(`penerima-${noResi}`);
            const namaPenerima = inputPenerima.value.trim();

            if (!namaPenerima) return alert('Validasi Gagal: Nama penerima absolut wajib diisi.');

            let currentData = db.get('resi');
            currentData = currentData.map(r => {
                if (r.no_resi === noResi) {
                    return { 
                        ...r, 
                        status: 'Delivered', 
                        pod_name: namaPenerima, 
                        pod_time: new Date().toISOString() 
                    };
                }
                return r;
            });

            db.set('resi', currentData);
            alert(`TERMINASI LOGISTIK: Resi ${noResi} sukses terkirim. Diterima oleh: ${namaPenerima}.`);
            loadOpsPOD(container, titleEl); // Reload UI
        });
    });
}
