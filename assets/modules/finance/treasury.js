import { db } from '../../js/db.js';

export function loadFinanceTreasury(container, titleEl) {
    titleEl.innerText = "ALE Bugapra | Treasury: Cash Register & Account Payable";

    // Injeksi Struktur Tab
    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <div class="flex border-b bg-gray-50">
                <button class="tab-btn active-tab flex-1 py-3 font-bold text-green-700 border-b-2 border-green-700 transition" data-target="tab-ar">Cash Register (Penerimaan Pembayaran)</button>
                <button class="tab-btn flex-1 py-3 font-bold text-gray-500 hover:text-red-600 transition" data-target="tab-ap">Account Payable (Pembayaran Vendor)</button>
            </div>

            <div class="p-6">
                <div id="tab-ar" class="tab-content block">
                    <h3 class="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Antrean Pelunasan Invoice</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-green-50 text-green-900 text-sm">
                                <tr><th class="p-3">No. Invoice</th><th class="p-3">Pelanggan</th><th class="p-3 text-right">Total Tagihan</th><th class="p-3 text-right">Sisa Outstanding</th><th class="p-3 text-center">Eksekusi Pembayaran</th></tr>
                            </thead>
                            <tbody id="grid-ar-payment"></tbody>
                        </table>
                    </div>
                </div>

                <div id="tab-ap" class="tab-content hidden">
                    <div class="flex justify-between items-center border-b pb-2 mb-4">
                        <h3 class="text-lg font-bold text-gray-800">Antrean Hutang Vendor (Berdasarkan Resi Delivered)</h3>
                        <span class="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded">Vendor Luar (Non-Internal)</span>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-red-50 text-red-900 text-sm">
                                <tr><th class="p-3">No. Resi</th><th class="p-3">Vendor Kurir</th><th class="p-3">Tanggal Selesai</th><th class="p-3 text-right">Estimasi Biaya Vendor</th><th class="p-3 text-center">Eksekusi Pencairan</th></tr>
                            </thead>
                            <tbody id="grid-ap-payment"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <div id="modal-payment" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded-xl shadow-xl w-96">
                <h3 class="text-lg font-bold text-gray-900 mb-4 border-b pb-2" id="modal-inv-title">Pelunasan Invoice</h3>
                <input type="hidden" id="pay-inv-no">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Nominal Bayar (Rp)</label>
                        <input type="number" id="pay-amount" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-green-500" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Metode Transaksi</label>
                        <select id="pay-method" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                            <option value="Transfer Bank">Transfer Bank</option>
                            <option value="Cash / Tunai">Cash / Tunai</option>
                            <option value="Giro / Cek">Giro / Cek</option>
                        </select>
                    </div>
                </div>
                <div class="mt-6 flex justify-end space-x-3">
                    <button id="btn-cancel-pay" class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-bold">Batal</button>
                    <button id="btn-confirm-pay" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold shadow-md">Proses Kasir</button>
                </div>
            </div>
        </div>
    `;

    // Logika Pengendali Tab Dinamis
    const tabBtns = container.querySelectorAll('.tab-btn');
    const tabContents = container.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => {
                b.classList.remove('active-tab', 'text-green-700', 'border-b-2', 'border-green-700', 'text-red-700', 'border-red-700');
                b.classList.add('text-gray-500');
            });
            tabContents.forEach(c => c.classList.add('hidden'));

            btn.classList.remove('text-gray-500');
            const targetId = btn.getAttribute('data-target');
            if(targetId === 'tab-ar') {
                btn.classList.add('active-tab', 'text-green-700', 'border-b-2', 'border-green-700');
            } else {
                btn.classList.add('active-tab', 'text-red-700', 'border-b-2', 'border-red-700');
            }
            container.querySelector(`#${targetId}`).classList.remove('hidden');
        });
    });

    // Rendering Data Matriks
    const renderGrids = () => {
        // --- Eksekusi AR (Piutang) ---
        const invoices = db.get('invoices') || [];
        const unpaidInvoices = invoices.filter(inv => inv.status !== 'Paid');
        
        document.getElementById('grid-ar-payment').innerHTML = unpaidInvoices.map(inv => {
            const paidAmount = inv.payments ? inv.payments.reduce((sum, p) => sum + p.amount, 0) : 0;
            const outstanding = inv.total_amount - paidAmount;
            
            return `
            <tr class="border-b hover:bg-green-50 text-sm">
                <td class="p-3 font-bold text-gray-800">${inv.invoice_no}</td>
                <td class="p-3">${inv.customer_name}</td>
                <td class="p-3 text-right text-gray-500">Rp ${inv.total_amount.toLocaleString('id-ID')}</td>
                <td class="p-3 text-right font-bold text-red-600">Rp ${outstanding.toLocaleString('id-ID')}</td>
                <td class="p-3 text-center">
                    <button data-inv="${inv.invoice_no}" data-out="${outstanding}" class="btn-open-pay bg-green-600 text-white px-3 py-1 rounded text-xs font-bold shadow hover:bg-green-700 transition">Bayar Kasir</button>
                </td>
            </tr>`;
        }).join('') || '<tr><td colspan="5" class="p-6 text-center text-gray-500 font-medium">Tidak ada antrean invoice untuk dilunasi.</td></tr>';

        // --- Eksekusi AP (Hutang Vendor) ---
        const resiList = db.get('resi') || [];
        // Asumsi: Vendor memiliki nama selain 'Internal', dan resi sudah Delivered tapi belum dibayar ke vendor
        const apList = resiList.filter(r => r.status === 'Delivered' && r.courier && !r.courier.includes('Internal') && !r.ap_status);

        document.getElementById('grid-ap-payment').innerHTML = apList.map(r => {
            // Simulasi Harga Vendor: 30% dari Grand Total Resi
            const vendorFee = r.grand_total * 0.3; 
            return `
            <tr class="border-b hover:bg-red-50 text-sm">
                <td class="p-3 font-bold text-gray-800">${r.no_resi}</td>
                <td class="p-3 font-medium text-indigo-700">${r.courier}</td>
                <td class="p-3">${new Date(r.pod_time).toLocaleDateString('id-ID')}</td>
                <td class="p-3 text-right font-bold text-red-600">Rp ${vendorFee.toLocaleString('id-ID')}</td>
                <td class="p-3 text-center">
                    <button data-resi="${r.no_resi}" data-fee="${vendorFee}" class="btn-pay-ap bg-red-600 text-white px-3 py-1 rounded text-xs font-bold shadow hover:bg-red-700 transition">Cairkan AP</button>
                </td>
            </tr>`;
        }).join('') || '<tr><td colspan="5" class="p-6 text-center text-gray-500 font-medium">Tidak ada tagihan vendor logistik yang menunggak.</td></tr>';

        attachEventListeners();
    };

    const attachEventListeners = () => {
        // Logika AR Modal
        const modal = document.getElementById('modal-payment');
        document.querySelectorAll('.btn-open-pay').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.getElementById('pay-inv-no').value = e.target.getAttribute('data-inv');
                document.getElementById('pay-amount').value = e.target.getAttribute('data-out'); // Default lunas
                document.getElementById('modal-inv-title').innerText = `Pelunasan: ${e.target.getAttribute('data-inv')}`;
                modal.classList.remove('hidden');
            });
        });

        document.getElementById('btn-cancel-pay').addEventListener('click', () => modal.classList.add('hidden'));

        // Logika Eksekusi AR Pembayaran
        document.getElementById('btn-confirm-pay').onclick = () => {
            const invNo = document.getElementById('pay-inv-no').value;
            const amount = parseFloat(document.getElementById('pay-amount').value);
            const method = document.getElementById('pay-method').value;

            if (isNaN(amount) || amount <= 0) return alert('Kalkulasi Ditolak: Nominal tidak valid.');

            let currentInvoices = db.get('invoices');
            currentInvoices = currentInvoices.map(inv => {
                if (inv.invoice_no === invNo) {
                    const newPayment = { amount, method, date: new Date().toISOString() };
                    const payments = inv.payments ? [...inv.payments, newPayment] : [newPayment];
                    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
                    
                    return { 
                        ...inv, 
                        payments, 
                        status: totalPaid >= inv.total_amount ? 'Paid' : 'Partial' 
                    };
                }
                return inv;
            });

            db.set('invoices', currentInvoices);
            alert(`KASIR DITERIMA: Dana sebesar Rp ${amount.toLocaleString('id-ID')} berhasil dibukukan untuk ${invNo}.`);
            modal.classList.add('hidden');
            renderGrids(); // Refresh Data UI
        };

        // Logika Eksekusi AP Pembayaran
        document.querySelectorAll('.btn-pay-ap').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const noResi = e.target.getAttribute('data-resi');
                const fee = parseFloat(e.target.getAttribute('data-fee'));
                
                if(!confirm(`Otorisasi AP: Cairkan dana Rp ${fee.toLocaleString('id-ID')} ke vendor untuk pengiriman ${noResi}?`)) return;

                let currentResi = db.get('resi');
                currentResi = currentResi.map(r => {
                    if (r.no_resi === noResi) {
                        return { ...r, ap_status: 'Paid', ap_time: new Date().toISOString() };
                    }
                    return r;
                });
                
                db.set('resi', currentResi);
                alert(`PENGELUARAN KAS BERHASIL: Hutang vendor untuk resi ${noResi} telah dilunasi.`);
                renderGrids();
            });
        });
    };

    renderGrids();
}
