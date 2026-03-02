import { db } from '../../js/db.js';

export function loadSalesResi(container, titleEl) {
    titleEl.innerText = "Sales: Entri Resi Cash";

    // Menarik referensi data master
    const customers = db.get('customers') || [];
    const customerOptions = customers.map(c => `<option value="${c.id}" data-discount="${c.discount}">${c.name} (Diskon: ${c.discount}%)</option>`).join('');

    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
                <h3 class="text-lg font-bold text-indigo-900 border-b pb-2 mb-4">Detail Pengiriman</h3>
                <form id="form-resi" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Pengirim (Customer Master)</label>
                            <select id="customerId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 p-2 border">
                                <option value="">-- Pilih Pengirim (Retail/Cash) --</option>
                                ${customerOptions}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Penerima</label>
                            <input type="text" id="receiverName" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" required placeholder="Nama Penerima">
                        </div>
                    </div>

                    <div class="grid grid-cols-4 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Koli</label>
                            <input type="number" id="qty" value="1" min="1" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border calc-trigger">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Berat Aktual (Kg)</label>
                            <input type="number" id="weight" value="1" min="0.1" step="0.1" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border calc-trigger">
                        </div>
                        <div class="col-span-2">
                            <label class="block text-sm font-medium text-gray-700">Dimensi (P x L x T) cm</label>
                            <div class="flex space-x-2 mt-1">
                                <input type="number" id="dimL" placeholder="P" class="w-full rounded-md border-gray-300 shadow-sm p-2 border calc-trigger">
                                <input type="number" id="dimW" placeholder="L" class="w-full rounded-md border-gray-300 shadow-sm p-2 border calc-trigger">
                                <input type="number" id="dimH" placeholder="T" class="w-full rounded-md border-gray-300 shadow-sm p-2 border calc-trigger">
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Layanan</label>
                            <select id="serviceType" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border calc-trigger">
                                <option value="10000">REGULAR (Rp 10.000/Kg)</option>
                                <option value="25000">EXPRESS (Rp 25.000/Kg)</option>
                                <option value="50000">CARGO (Rp 50.000/Kg)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Tipe Pembayaran</label>
                            <select id="paymentType" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                                <option value="Cash">Cash (Tunai)</option>
                                <option value="Credit">Credit (Invoice)</option>
                                <option value="COD">COD</option>
                            </select>
                        </div>
                    </div>

                    <div class="pt-4 flex justify-end">
                        <button type="submit" class="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 font-bold shadow-md">Simpan & Cetak Resi</button>
                    </div>
                </form>
            </div>

            <div class="bg-indigo-900 text-white rounded-xl shadow-md p-6 flex flex-col justify-between">
                <div>
                    <h3 class="text-lg font-bold border-b border-indigo-700 pb-2 mb-4">Kalkulasi Biaya</h3>
                    <div class="space-y-3 text-sm">
                        <div class="flex justify-between"><span>Berat Aktual:</span> <span id="lbl-actual">1 Kg</span></div>
                        <div class="flex justify-between"><span>Berat Volume:</span> <span id="lbl-volume">0 Kg</span></div>
                        <div class="flex justify-between text-indigo-300 font-bold"><span>Chargeable Weight:</span> <span id="lbl-chargeable">1 Kg</span></div>
                        <hr class="border-indigo-700">
                        <div class="flex justify-between"><span>Subtotal:</span> <span id="lbl-subtotal">Rp 10.000</span></div>
                        <div class="flex justify-between text-red-400"><span>Diskon:</span> <span id="lbl-discount">- Rp 0</span></div>
                    </div>
                </div>
                <div class="mt-6 border-t border-indigo-700 pt-4">
                    <p class="text-sm text-indigo-300">Grand Total</p>
                    <p class="text-3xl font-bold text-green-400" id="lbl-grandtotal">Rp 10.000</p>
                </div>
            </div>
        </div>
    `;

    // Engine Kalkulasi Reaktif
    const form = document.getElementById('form-resi');
    const triggers = document.querySelectorAll('.calc-trigger');
    const customerSelect = document.getElementById('customerId');

    const calculateTariff = () => {
        // Ambil nilai
        const weight = parseFloat(document.getElementById('weight').value) || 0;
        const l = parseFloat(document.getElementById('dimL').value) || 0;
        const w = parseFloat(document.getElementById('dimW').value) || 0;
        const h = parseFloat(document.getElementById('dimH').value) || 0;
        const basePrice = parseFloat(document.getElementById('serviceType').value) || 0;
        
        // Cek Diskon Customer
        const selectedCustomer = customerSelect.options[customerSelect.selectedIndex];
        const discountPercent = parseFloat(selectedCustomer.getAttribute('data-discount')) || 0;

        // Logika Volumetrik (Standar Darat pembagi 4000)
        const volumeWeight = (l * w * h) / 4000;
        const chargeableWeight = Math.max(weight, volumeWeight);

        // Finansial
        const subtotal = chargeableWeight * basePrice;
        const discountAmount = subtotal * (discountPercent / 100);
        const grandTotal = subtotal - discountAmount;

        // Update UI
        document.getElementById('lbl-actual').innerText = `${weight} Kg`;
        document.getElementById('lbl-volume').innerText = `${volumeWeight.toFixed(2)} Kg`;
        document.getElementById('lbl-chargeable').innerText = `${chargeableWeight.toFixed(2)} Kg`;
        document.getElementById('lbl-subtotal').innerText = `Rp ${subtotal.toLocaleString('id-ID')}`;
        document.getElementById('lbl-discount').innerText = `- Rp ${discountAmount.toLocaleString('id-ID')}`;
        document.getElementById('lbl-grandtotal').innerText = `Rp ${grandTotal.toLocaleString('id-ID')}`;

        return { chargeableWeight, subtotal, discountAmount, grandTotal };
    };

    // Pasang Listener
    triggers.forEach(el => el.addEventListener('input', calculateTariff));
    customerSelect.addEventListener('change', calculateTariff);

    // Proses Submit (Injeksi ke Mock DB)
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const calcData = calculateTariff();
        
        // Auto Generate Nomor Resi
        const noResi = `ZLG-CSH-${Math.floor(Date.now() / 1000)}`;
        
        const payload = {
            no_resi: noResi,
            customer_id: customerSelect.value || 'Umum/Retail',
            receiver: document.getElementById('receiverName').value,
            qty: document.getElementById('qty').value,
            chargeable_weight: calcData.chargeableWeight,
            payment_type: document.getElementById('paymentType').value,
            grand_total: calcData.grandTotal,
            status: 'Booking',
            timestamp: new Date().toISOString()
        };

        db.insert('resi', payload);
        
        alert(`SUKSES: Resi ${noResi} berhasil dibuat dengan status Booking.\nGrand Total: Rp ${calcData.grandTotal.toLocaleString('id-ID')}`);
        
        // Reset Form
        form.reset();
        calculateTariff();
    });
}
