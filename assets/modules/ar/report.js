import { db } from '../../js/db.js';

export function loadARReport(container, titleEl) {
    // Sinkronisasi dengan identitas inti sistem
    titleEl.innerText = "ALE Bugapra - Bumi Galur Pratama | Laporan Aging & Outstanding AR";

    // Tarik Buku Besar Piutang
    const invoices = db.get('invoices') || [];
    
    // Filter: Hanya tagihan yang belum lunas (Proforma & Final)
    const outstandingInvoices = invoices.filter(inv => inv.status !== 'Paid');

    // Matriks Kalkulasi
    let totalOutstanding = 0;
    const agingBuckets = {
        '0_30': 0,
        '31_60': 0,
        '61_90': 0,
        'over_90': 0
    };

    const customerLedger = {};

    const today = new Date();

    outstandingInvoices.forEach(inv => {
        totalOutstanding += inv.total_amount;

        // Kalkulasi Umur Piutang (Hari)
        const invDate = new Date(inv.timestamp);
        const diffTime = Math.abs(today - invDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        let bucket = '';
        if (diffDays <= 30) { bucket = '0_30'; agingBuckets['0_30'] += inv.total_amount; }
        else if (diffDays <= 60) { bucket = '31_60'; agingBuckets['31_60'] += inv.total_amount; }
        else if (diffDays <= 90) { bucket = '61_90'; agingBuckets['61_90'] += inv.total_amount; }
        else { bucket = 'over_90'; agingBuckets['over_90'] += inv.total_amount; }

        // Agregasi per Customer
        if (!customerLedger[inv.customer_id]) {
            customerLedger[inv.customer_id] = {
                name: inv.customer_name,
                total: 0,
                '0_30': 0, '31_60': 0, '61_90': 0, 'over_90': 0
            };
        }
        customerLedger[inv.customer_id].total += inv.total_amount;
        customerLedger[inv.customer_id][bucket] += inv.total_amount;
    });

    // Render Tabel Aging per Customer
    let rows = Object.keys(customerLedger).map(custId => {
        const data = customerLedger[custId];
        return `
            <tr class="border-b hover:bg-gray-50 text-sm">
                <td class="p-3 font-bold text-gray-800">${data.name}</td>
                <td class="p-3 text-right font-medium">Rp ${data['0_30'].toLocaleString('id-ID')}</td>
                <td class="p-3 text-right font-medium text-yellow-600">Rp ${data['31_60'].toLocaleString('id-ID')}</td>
                <td class="p-3 text-right font-medium text-orange-600">Rp ${data['61_90'].toLocaleString('id-ID')}</td>
                <td class="p-3 text-right font-bold text-red-600">Rp ${data['over_90'].toLocaleString('id-ID')}</td>
                <td class="p-3 text-right font-bold bg-indigo-50 text-indigo-900">Rp ${data.total.toLocaleString('id-ID')}</td>
                <td class="p-3 text-center">
                    <button class="text-indigo-600 hover:text-indigo-900 font-bold text-xs bg-indigo-100 px-2 py-1 rounded">Detail</button>
                </td>
            </tr>
        `;
    }).join('');

    // Injeksi UI Dashboard Finance
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="bg-indigo-900 text-white p-6 rounded-xl shadow-md border-b-4 border-indigo-400">
                <p class="text-indigo-200 text-sm font-semibold uppercase tracking-wider">Total Piutang Berjalan (Outstanding)</p>
                <h2 class="text-3xl font-bold mt-2">Rp ${totalOutstanding.toLocaleString('id-ID')}</h2>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-md border-b-4 border-red-500">
                <p class="text-gray-500 text-sm font-semibold uppercase tracking-wider">Risiko Tinggi (> 60 Hari)</p>
                <h2 class="text-3xl font-bold text-red-600 mt-2">Rp ${(agingBuckets['61_90'] + agingBuckets['over_90']).toLocaleString('id-ID')}</h2>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-md border-b-4 border-green-500">
                <p class="text-gray-500 text-sm font-semibold uppercase tracking-wider">Status Aman (0-30 Hari)</p>
                <h2 class="text-3xl font-bold text-green-600 mt-2">Rp ${agingBuckets['0_30'].toLocaleString('id-ID')}</h2>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <div class="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 class="font-bold text-gray-800">Matriks Aging Piutang per Pelanggan</h3>
                <button class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-bold shadow-sm flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Export ke Excel (Simulasi)
                </button>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-indigo-900 text-white text-sm">
                        <tr>
                            <th class="p-3 w-1/4">Nama Pelanggan / Entitas</th>
                            <th class="p-3 text-right">0 - 30 Hari</th>
                            <th class="p-3 text-right">31 - 60 Hari</th>
                            <th class="p-3 text-right">61 - 90 Hari</th>
                            <th class="p-3 text-right">> 90 Hari</th>
                            <th class="p-3 text-right bg-indigo-800">Total Piutang (Rp)</th>
                            <th class="p-3 text-center w-24">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows || '<tr><td colspan="7" class="p-8 text-center text-gray-500 font-medium">Buku besar bersih. Tidak ada piutang tertunggak saat ini.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}
