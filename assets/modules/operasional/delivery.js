import { db } from '../../js/db.js';

export function loadOpsDelivery(container, titleEl) {
    titleEl.innerText = "Operasional: Dispatch & Delivery Manifest";

    const resiList = db.get('resi') || [];
    // Filter hanya aset yang sedang "On Process"
    const processResi = resiList.filter(r => r.status === 'On Process');

    // Injeksi Kurir (Fallback jika Master Kurir kosong)
    const couriers = db.get('couriers') || [
        { id: 'C01', name: 'Kurir Internal - Budi' },
        { id: 'C02', name: 'Vendor - Lalamove' }
    ];
    const courierOptions = couriers.map(c => `<option value="${c.name}">${c.name}</option>`).join('');

    let rows = processResi.map(r => `
        <tr class="border-b hover:bg-gray-50">
            <td class="p-3 text-center"><input type="checkbox" class="del-checkbox w-4 h-4 text-orange-600 rounded" value="${r.no_resi}"></td>
            <td class="p-3 font-bold text-orange-600">${r.no_resi}</td>
            <td class="p-3">${r.receiver}</td>
            <td class="p-3 text-sm text-gray-600">${r.chargeable_weight} Kg</td>
            <td class="p-3"><span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold">${r.status}</span></td>
        </tr>
    `).join('');

    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-md overflow-hidden flex flex-col lg:flex-row">
            <div class="w-full lg:w-2/3 border-r">
                <div class="p-4 border-b bg-orange-50">
                    <h3 class="font-bold text-orange-900">Aset Transit (Menunggu Dispatch)</h3>
                </div>
                <div class="overflow-x-auto h-[500px]">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-orange-600 text-white text-sm sticky top-0">
                            <tr>
                                <th class="p-3 text-center w-10"><input type="checkbox" id="check-all-del" class="w-4 h-4 rounded"></th>
                                <th class="p-3">Nomor Resi</th>
                                <th class="p-3">Tujuan/Penerima</th>
                                <th class="p-3">Berat</th>
                                <th class="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows || '<tr><td colspan="5" class="p-6 text-center text-gray-500 font-medium">Tidak ada aset transit.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="w-full lg:w-1/3 p-6 bg-gray-50">
                <h3 class="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Otorisasi Dispatch</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Pilih Kurir / Vendor</label>
                        <select id="courierSelect" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-orange-500">
                            ${courierOptions}
                        </select>
                    </div>
                    <button id="btn-dispatch" class="w-full bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 font-bold shadow-md transition disabled:opacity-50">
                        Mutasi ke 'On Delivery'
                    </button>
                </div>
            </div>
        </div>
    `;

    // Logika UI & Eksekusi Absolut
    const checkAll = document.getElementById('check-all-del');
    const checkboxes = document.querySelectorAll('.del-checkbox');
    const btnDispatch = document.getElementById('btn-dispatch');

    if (checkAll) {
        checkAll.addEventListener('change', (e) => checkboxes.forEach(cb => cb.checked = e.target.checked));
    }

    if (btnDispatch) {
        btnDispatch.addEventListener('click', () => {
            const selectedResi = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
            const courier = document.getElementById('courierSelect').value;
            
            if (selectedResi.length === 0) return alert('Kalkulasi Gagal: Pilih minimal satu resi untuk dispatch.');

            let currentData = db.get('resi');
            currentData = currentData.map(r => {
                if (selectedResi.includes(r.no_resi)) {
                    return { ...r, status: 'On Delivery', courier: courier, dispatch_time: new Date().toISOString() };
                }
                return r;
            });
            
            db.set('resi', currentData);
            alert(`EKSEKUSI BERHASIL: ${selectedResi.length} resi diserahkan ke kurir [${courier}] dan berstatus 'On Delivery'.`);
            loadOpsDelivery(container, titleEl);
        });
    }
}
