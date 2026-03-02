import { db } from '../../js/db.js';

export function loadOpsOutgoing(container, titleEl) {
    titleEl.innerText = "Operasional: Outgoing / Pemrosesan Manifest";

    const resiList = db.get('resi') || [];
    // Hanya filter aset yang siap diproses
    const bookingResi = resiList.filter(r => r.status === 'Booking');

    let rows = bookingResi.map(r => `
        <tr class="border-b hover:bg-gray-50">
            <td class="p-3 text-center"><input type="checkbox" class="resi-checkbox w-4 h-4 text-indigo-600 rounded" value="${r.no_resi}"></td>
            <td class="p-3 font-medium text-indigo-700">${r.no_resi}</td>
            <td class="p-3">${new Date(r.timestamp).toLocaleDateString('id-ID')}</td>
            <td class="p-3">${r.receiver}</td>
            <td class="p-3">${r.chargeable_weight} Kg</td>
            <td class="p-3"><span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">${r.status}</span></td>
        </tr>
    `).join('');

    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <div class="p-4 border-b flex justify-between items-center bg-indigo-50">
                <h3 class="font-bold text-indigo-900">Daftar Antrean Staging (Booking)</h3>
                <button id="btn-process" class="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 font-bold shadow-md transition disabled:opacity-50">
                    Eksekusi ke 'On Process'
                </button>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-indigo-900 text-white text-sm">
                        <tr>
                            <th class="p-3 text-center w-10"><input type="checkbox" id="check-all" class="w-4 h-4 rounded"></th>
                            <th class="p-3">Nomor Resi</th>
                            <th class="p-3">Tanggal</th>
                            <th class="p-3">Penerima</th>
                            <th class="p-3">CW (Kg)</th>
                            <th class="p-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows || '<tr><td colspan="6" class="p-6 text-center text-gray-500 font-medium">Tidak ada antrean logistik saat ini.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Logika Seleksi Massal
    const checkAll = document.getElementById('check-all');
    const checkboxes = document.querySelectorAll('.resi-checkbox');
    const btnProcess = document.getElementById('btn-process');

    if (checkAll) {
        checkAll.addEventListener('change', (e) => {
            checkboxes.forEach(cb => cb.checked = e.target.checked);
        });
    }

    // Logika Mutasi Status
    if (btnProcess && checkboxes.length > 0) {
        btnProcess.addEventListener('click', () => {
            const selectedResi = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
            
            if (selectedResi.length === 0) {
                alert('Peringatan: Pilih setidaknya satu resi untuk dieksekusi.');
                return;
            }

            // Eksekusi Mutasi di Mock DB
            let currentData = db.get('resi');
            currentData = currentData.map(r => {
                if (selectedResi.includes(r.no_resi)) {
                    return { ...r, status: 'On Process' }; // Mutasi Absolut
                }
                return r;
            });
            
            db.set('resi', currentData);
            alert(`EKSEKUSI BERHASIL: ${selectedResi.length} resi telah dimutasi ke status 'On Process'.`);
            
            // Muat ulang tampilan secara instan
            loadOpsOutgoing(container, titleEl);
        });
    }
}
