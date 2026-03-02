import { db } from '../../js/db.js';

export function loadARInvoice(container, titleEl) {
    titleEl.innerText = "Account Receivable: Proforma & Invoice Generator";

    // Ekstraksi Data Absolut
    const resiList = db.get('resi') || [];
    const invoices = db.get('invoices') || [];
    const customers = db.get('customers') || [];

    // Filter 1: Resi Valid untuk Ditagih (Delivered, Credit, Belum masuk Invoice manapun)
    const unbilledResi = resiList.filter(r => 
        r.status === 'Delivered' && 
        r.payment_type === 'Credit' && 
        !r.invoice_no
    );

    // Algoritma Pengelompokan (Grouping) berdasarkan Customer ID
    const pendingBilling = {};
    unbilledResi.forEach(r => {
        // Pemetaan ID ke Nama Customer dari Master Data
        const custData = customers.find(c => c.id.toString() === r.customer_id.toString());
        const custName = custData ? custData.name : `Customer ID: ${r.customer_id}`;

        if (!pendingBilling[r.customer_id]) {
            pendingBilling[r.customer_id] = {
                name: custName,
                resi_list: [],
                total_amount: 0,
                total_koli: 0
            };
        }
        pendingBilling[r.customer_id].resi_list.push(r.no_resi);
        pendingBilling[r.customer_id].total_amount += r.grand_total;
        pendingBilling[r.customer_id].total_koli += parseInt(r.qty);
    });

    // Render Tabel Antrean Tagihan (Unbilled)
    let pendingRows = Object.keys(pendingBilling).map(custId => {
        const data = pendingBilling[custId];
        return `
            <tr class="border-b hover:bg-red-50">
                <td class="p-3 font-bold text-gray-800">${data.name}</td>
                <td class="p-3 text-center"><span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold">${data.resi_list.length} Resi</span></td>
                <td class="p-3 text-right font-medium text-red-600">Rp ${data.total_amount.toLocaleString('id-ID')}</td>
                <td class="p-3 text-center">
                    <button data-cust="${custId}" class="btn-generate-inv bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-bold shadow-md transition">
                        Terbitkan Proforma
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // Render Tabel Invoice Eksisting
    let invoiceRows = invoices.map(inv => `
        <tr class="border-b hover:bg-gray-50 text-sm">
            <td class="p-3 font-bold text-indigo-700">${inv.invoice_no}</td>
            <td class="p-3">${new Date(inv.timestamp).toLocaleDateString('id-ID')}</td>
            <td class="p-3 font-medium">${inv.customer_name}</td>
            <td class="p-3 text-right font-bold text-gray-800">Rp ${inv.total_amount.toLocaleString('id-ID')}</td>
            <td class="p-3"><span class="px-2 py-1 rounded text-xs font-bold ${inv.status === 'Proforma' ? 'bg-yellow-100 text-yellow-800' : (inv.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800')}">${inv.status}</span></td>
            <td class="p-3 text-center"><button class="text-indigo-600 hover:text-indigo-900 font-bold">Cetak (PDF)</button></td>
        </tr>
    `).join('');

    // Injeksi UI
    container.innerHTML = `
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div class="xl:col-span-1 bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full">
                <div class="p-4 border-b bg-red-50">
                    <h3 class="font-bold text-red-900">Unbilled Resi (Menunggu Tagihan)</h3>
                </div>
                <div class="overflow-y-auto flex-1 p-4">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-gray-100 text-gray-600 text-xs uppercase">
                            <tr><th class="p-2">Customer</th><th class="p-2 text-center">Item</th><th class="p-2 text-right">Potensi (Rp)</th><th class="p-2 text-center">Aksi</th></tr>
                        </thead>
                        <tbody>
                            ${pendingRows || '<tr><td colspan="4" class="p-6 text-center text-gray-500 font-medium">Tidak ada resi kredit yang menggantung.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="xl:col-span-2 bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full">
                <div class="p-4 border-b bg-indigo-50 flex justify-between items-center">
                    <h3 class="font-bold text-indigo-900">Buku Besar Piutang (Invoice Ledger)</h3>
                </div>
                <div class="overflow-x-auto p-4 flex-1">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-indigo-900 text-white text-sm">
                            <tr>
                                <th class="p-3">No. Invoice</th>
                                <th class="p-3">Tanggal</th>
                                <th class="p-3">Customer</th>
                                <th class="p-3 text-right">Total Tagihan</th>
                                <th class="p-3">Status</th>
                                <th class="p-3 text-center">Dokumen</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoiceRows || '<tr><td colspan="6" class="p-6 text-center text-gray-500">Belum ada invoice yang diterbitkan.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Logika Eksekusi Pembuatan Invoice
    document.querySelectorAll('.btn-generate-inv').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const custId = e.target.getAttribute('data-cust');
            const data = pendingBilling[custId];
            
            if (!confirm(`Otorisasi Finansial: Terbitkan Proforma Invoice untuk ${data.name} senilai Rp ${data.total_amount.toLocaleString('id-ID')}?`)) return;

            // Generate Nomor Invoice Unik
            const invNo = `INV-${new Date().getFullYear()}${(new Date().getMonth()+1).toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

            // 1. Buat Record Invoice Baru
            const newInvoice = {
                invoice_no: invNo,
                customer_id: custId,
                customer_name: data.name,
                resi_list: data.resi_list,
                total_amount: data.total_amount,
                status: 'Proforma', // Status awal sesuai manual
                timestamp: new Date().toISOString()
            };

            db.insert('invoices', newInvoice);

            // 2. Mutasi Resi (Tandai resi agar tidak ditagih dua kali - Double Billing Prevention)
            let currentResi = db.get('resi');
            currentResi = currentResi.map(r => {
                if (data.resi_list.includes(r.no_resi)) {
                    return { ...r, invoice_no: invNo };
                }
                return r;
            });
            db.set('resi', currentResi);

            alert(`EKSEKUSI BERHASIL: Proforma Invoice ${invNo} telah diterbitkan.`);
            
            // Reload UI untuk mereset antrean
            loadARInvoice(container, titleEl);
        });
    });
}
