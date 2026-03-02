import { db } from '../../js/db.js';

export function loadOpsTransit(container, titleEl) {
    titleEl.innerText = "Operasional: Transfer Location & Incoming Hub";

    const resiList = db.get('resi') || [];
    
    // Filter Mid-Mile
    const transferResi = resiList.filter(r => r.status === 'On Process');
    const incomingResi = resiList.filter(r => r.status === 'Transfer Location');

    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-[600px]">
                <div class="p-4 border-b bg-yellow-50 flex justify-between items-center">
                    <h3 class="font-bold text-yellow-900">Transfer Location (Barang Keluar Hub)</h3>
                    <button id="btn-transfer" class="bg-yellow-600 text-white px-3 py-1 rounded text-sm font-bold shadow hover:bg-yellow-700">Kirim ke Cabang Tujuan</button>
                </div>
                <div class="overflow-y-auto flex-1 p-0">
                    <table class="w-full text-left border-collapse text-sm">
                        <thead class="bg-gray-100 text-gray-700 sticky top-0">
                            <tr><th class="p-3 w-10 text-center"><input type="checkbox" id="chk-all-tf"></th><th class="p-3">No. Resi</th><th class="p-3">Tujuan</th></tr>
                        </thead>
                        <tbody>
                            ${transferResi.map(r => `
                                <tr class="border-b hover:bg-gray-50">
                                    <td class="p-3 text-center"><input type="checkbox" class="chk-tf w-4 h-4 text-yellow-600" value="${r.no_resi}"></td>
                                    <td class="p-3 font-bold text-gray-800">${r.no_resi}</td>
                                    <td class="p-3 text-gray-600">${r.receiver}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="3" class="p-6 text-center text-gray-500">Tidak ada barang siap transfer.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-[600px]">
                <div class="p-4 border-b bg-blue-50 flex justify-between items-center">
                    <h3 class="font-bold text-blue-900">Incoming (Penerimaan Barang Cabang)</h3>
                    <button id="btn-incoming" class="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold shadow hover:bg-blue-700">Terima Kedatangan Barang</button>
                </div>
                <div class="overflow-y-auto flex-1 p-0">
                    <table class="w-full text-left border-collapse text-sm">
                        <thead class="bg-gray-100 text-gray-700 sticky top-0">
                            <tr><th class="p-3 w-10 text-center"><input type="checkbox" id="chk-all-in"></th><th class="p-3">No. Resi</th><th class="p-3">Tujuan</th></tr>
                        </thead>
                        <tbody>
                            ${incomingResi.map(r => `
                                <tr class="border-b hover:bg-gray-50">
                                    <td class="p-3 text-center"><input type="checkbox" class="chk-in w-4 h-4 text-blue-600" value="${r.no_resi}"></td>
                                    <td class="p-3 font-bold text-gray-800">${r.no_resi}</td>
                                    <td class="p-3 text-gray-600">${r.receiver}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="3" class="p-6 text-center text-gray-500">Tidak ada armada transit yang masuk.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Eksekusi Logika Transfer
    document.getElementById('chk-all-tf')?.addEventListener('change', e => document.querySelectorAll('.chk-tf').forEach(cb => cb.checked = e.target.checked));
    document.getElementById('btn-transfer')?.addEventListener('click', () => {
        const selected = Array.from(document.querySelectorAll('.chk-tf')).filter(cb => cb.checked).map(cb => cb.value);
        if(!selected.length) return;
        let data = db.get('resi').map(r => selected.includes(r.no_resi) ? { ...r, status: 'Transfer Location' } : r);
        db.set('resi', data);
        loadOpsTransit(container, titleEl);
    });

    // Eksekusi Logika Incoming
    document.getElementById('chk-all-in')?.addEventListener('change', e => document.querySelectorAll('.chk-in').forEach(cb => cb.checked = e.target.checked));
    document.getElementById('btn-incoming')?.addEventListener('click', () => {
        const selected = Array.from(document.querySelectorAll('.chk-in')).filter(cb => cb.checked).map(cb => cb.value);
        if(!selected.length) return;
        let data = db.get('resi').map(r => selected.includes(r.no_resi) ? { ...r, status: 'Incoming Hub' } : r);
        db.set('resi', data);
        loadOpsTransit(container, titleEl);
    });
}
