import { db } from '../../js/db.js';

export function loadSalesResi(container, titleEl) {
    titleEl.innerText = "Sales: Modul Entri, Database Pengiriman & Layanan";

    const renderUI = () => {
        // Tarik relasi data
        const customers = db.get('customers') || [];
        const services = db.get('services') || [{ id: 1, name: "REGULAR", price_per_kg: 10000 }, { id: 2, name: "EXPRESS", price_per_kg: 25000 }];
        const resiList = db.get('resi') || [];

        // Opsi Dinamis
        const customerOptions = customers.map(c => `<option value="${c.id}" data-discount="${c.discount}">${c.name} (Diskon: ${c.discount}%)</option>`).join('');
        const serviceOptions = services.map(s => `<option value="${s.price_per_kg}">${s.name} (Rp ${s.price_per_kg.toLocaleString('id-ID')}/Kg)</option>`).join('');

        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                <div class="flex border-b bg-gray-50">
                    <button class="tab-btn active-tab flex-1 py-3 font-bold text-indigo-700 border-b-2 border-indigo-700" data-target="tab-entry">1. Entri Resi Cash</button>
                    <button class="tab-btn flex-1 py-3 font-bold text-gray-500" data-target="tab-database">2. Database Pengiriman</button>
                    <button class="tab-btn flex-1 py-3 font-bold text-gray-500" data-target="tab-services">3. Manajemen Layanan</button>
                </div>

                <div class="p-6">
                    <div id="tab-entry" class="tab-content block">
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div class="lg:col-span-2">
                                <form id="form-resi" class="space-y-4">
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium">Pengirim (Customer)</label>
                                            <select id="customerId" class="w-full rounded border p-2"><option value="">-- Cash / Retail --</option>${customerOptions}</select>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium">Penerima</label>
                                            <input type="text" id="receiverName" class="w-full rounded border p-2" required>
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-3 gap-4">
                                        <div><label class="block text-sm font-medium">Berat (Kg)</label><input type="number" id="weight" value="1" class="w-full rounded border p-2 calc-trigger"></div>
                                        <div><label class="block text-sm font-medium">Layanan Dinamis</label><select id="serviceType" class="w-full rounded border p-2 calc-trigger">${serviceOptions}</select></div>
                                        <div><label class="block text-sm font-medium">Tipe Bayar</label><select id="paymentType" class="w-full rounded border p-2"><option>Cash</option><option>Credit</option></select></div>
                                    </div>
                                    <div class="pt-2"><button type="submit" class="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 font-bold">Cetak Resi</button></div>
                                </form>
                            </div>
                            <div class="bg-indigo-900 text-white rounded-xl p-6">
                                <h3 class="font-bold border-b border-indigo-700 pb-2 mb-2">Grand Total</h3>
                                <p class="text-4xl font-extrabold text-green-400 mt-4" id="lbl-grandtotal">Rp 0</p>
                            </div>
                        </div>
                    </div>

                    <div id="tab-database" class="tab-content hidden">
                        <h3 class="font-bold text-gray-800 mb-4">Histori Resi Tercetak</h3>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse text-sm">
                                <thead class="bg-indigo-50 text-indigo-900"><tr><th class="p-2">No. Resi</th><th class="p-2">Tanggal</th><th class="p-2">Penerima</th><th class="p-2">Tipe</th><th class="p-2 text-right">Nilai (Rp)</th><th class="p-2">Status</th></tr></thead>
                                <tbody>
                                    ${resiList.slice().reverse().map(r => `
                                        <tr class="border-b">
                                            <td class="p-2 font-bold">${r.no_resi}</td><td class="p-2">${new Date(r.timestamp).toLocaleDateString('id-ID')}</td>
                                            <td class="p-2">${r.receiver}</td><td class="p-2">${r.payment_type}</td>
                                            <td class="p-2 text-right text-green-600 font-bold">${r.grand_total.toLocaleString('id-ID')}</td>
                                            <td class="p-2"><span class="bg-gray-200 px-2 py-1 rounded text-xs font-bold">${r.status}</span></td>
                                        </tr>
                                    `).join('') || '<tr><td colspan="6" class="p-4 text-center">Belum ada transaksi.</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div id="tab-services" class="tab-content hidden">
                        <div class="flex gap-4 mb-4 border-b pb-4">
                            <input type="text" id="new-svc-name" placeholder="Nama Layanan Baru" class="p-2 border rounded">
                            <input type="number" id="new-svc-price" placeholder="Harga per Kg (Rp)" class="p-2 border rounded">
                            <button id="btn-add-svc" class="bg-green-600 text-white px-4 py-2 rounded font-bold">Tambah Layanan</button>
                        </div>
                        <table class="w-full text-left border-collapse text-sm">
                            <thead class="bg-green-50 text-green-900"><tr><th class="p-2">Nama Layanan</th><th class="p-2">Harga Dasar (Per Kg)</th></tr></thead>
                            <tbody>${services.map(s => `<tr class="border-b"><td class="p-2 font-bold">${s.name}</td><td class="p-2 text-green-700">Rp ${s.price_per_kg.toLocaleString('id-ID')}</td></tr>`).join('')}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Pengendali Tab
        const tabBtns = container.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => btn.onclick = () => {
            tabBtns.forEach(b => b.className = 'tab-btn flex-1 py-3 font-bold text-gray-500');
            container.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
            btn.className = 'tab-btn active-tab flex-1 py-3 font-bold text-indigo-700 border-b-2 border-indigo-700';
            container.querySelector(`#${btn.getAttribute('data-target')}`).classList.remove('hidden');
        });

        // Mesin Kalkulasi & Simpan Resi
        const calcTotal = () => {
            const w = parseFloat(document.getElementById('weight').value) || 0;
            const p = parseFloat(document.getElementById('serviceType').value) || 0;
            const total = w * p;
            document.getElementById('lbl-grandtotal').innerText = `Rp ${total.toLocaleString('id-ID')}`;
            return total;
        };

        document.querySelectorAll('.calc-trigger').forEach(el => el.addEventListener('input', calcTotal));
        
        document.getElementById('form-resi').onsubmit = (e) => {
            e.preventDefault();
            const total = calcTotal();
            const resiNo = `ZLG-${Math.floor(Date.now() / 1000)}`;
            db.insert('resi', {
                no_resi: resiNo,
                customer_id: document.getElementById('customerId').value || 'Retail',
                receiver: document.getElementById('receiverName').value,
                chargeable_weight: document.getElementById('weight').value,
                payment_type: document.getElementById('paymentType').value,
                grand_total: total,
                status: 'Booking',
                timestamp: new Date().toISOString()
            });
            alert(`Eksekusi Berhasil: Resi ${resiNo} tercipta.`);
            renderUI(); // Reload UI agar masuk ke Tab Database
        };

        // Mesin Simpan Layanan
        document.getElementById('btn-add-svc').onclick = () => {
            const name = document.getElementById('new-svc-name').value;
            const price = parseFloat(document.getElementById('new-svc-price').value);
            if(name && price) {
                db.insert('services', { name, price_per_kg: price });
                renderUI(); // Reload untuk memperbarui dropdown di Tab 1
            }
        };
    };

    renderUI();
}
