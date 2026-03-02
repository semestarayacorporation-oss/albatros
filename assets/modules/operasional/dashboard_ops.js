import { db } from '../../js/db.js';

export function loadOpsDashboard(container, titleEl) {
    titleEl.innerText = "Operasional: Command Dashboard";

    // Tarik data absolut dari database
    const resiList = db.get('resi') || [];
    
    // Kalkulasi Metrik Distribusi
    const stats = {
        booking: resiList.filter(r => r.status === 'Booking').length,
        onProcess: resiList.filter(r => r.status === 'On Process').length,
        onDelivery: resiList.filter(r => r.status === 'On Delivery').length,
        delivered: resiList.filter(r => r.status === 'Delivered').length,
    };
    const totalOrder = resiList.length;

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div class="bg-white p-4 rounded-xl shadow-md border-l-4 border-indigo-600">
                <p class="text-sm text-gray-500 font-semibold">Total Order</p>
                <p class="text-2xl font-bold text-indigo-900">${totalOrder}</p>
            </div>
            <div class="bg-white p-4 rounded-xl shadow-md border-l-4 border-blue-400">
                <p class="text-sm text-gray-500 font-semibold">Booking / Staging</p>
                <p class="text-2xl font-bold text-blue-600">${stats.booking}</p>
            </div>
            <div class="bg-white p-4 rounded-xl shadow-md border-l-4 border-yellow-400">
                <p class="text-sm text-gray-500 font-semibold">On Process</p>
                <p class="text-2xl font-bold text-yellow-600">${stats.onProcess}</p>
            </div>
            <div class="bg-white p-4 rounded-xl shadow-md border-l-4 border-orange-400">
                <p class="text-sm text-gray-500 font-semibold">On Delivery</p>
                <p class="text-2xl font-bold text-orange-600">${stats.onDelivery}</p>
            </div>
            <div class="bg-white p-4 rounded-xl shadow-md border-l-4 border-green-500">
                <p class="text-sm text-gray-500 font-semibold">Delivered (POD)</p>
                <p class="text-2xl font-bold text-green-600">${stats.delivered}</p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white p-6 rounded-xl shadow-md">
                <h3 class="text-lg font-bold text-indigo-900 mb-4 border-b pb-2">Status Pengiriman</h3>
                <canvas id="statusChart" height="250"></canvas>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-md">
                <h3 class="text-lg font-bold text-indigo-900 mb-4 border-b pb-2">Top Transaksi Terbaru</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm border-collapse">
                        <thead class="bg-gray-100 text-gray-600">
                            <tr><th class="p-2">No. Resi</th><th class="p-2">Tujuan</th><th class="p-2">Status</th></tr>
                        </thead>
                        <tbody>
                            ${resiList.slice(-5).reverse().map(r => `
                                <tr class="border-b">
                                    <td class="p-2 font-medium text-indigo-600">${r.no_resi}</td>
                                    <td class="p-2">${r.receiver}</td>
                                    <td class="p-2"><span class="px-2 py-1 bg-gray-200 rounded text-xs font-bold">${r.status}</span></td>
                                </tr>
                            `).join('') || '<tr><td colspan="3" class="p-4 text-center text-gray-500">Belum ada data</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Render Eksekusi Chart.js
    const ctx = document.getElementById('statusChart');
    if (ctx && window.Chart) {
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Booking', 'On Process', 'On Delivery', 'Delivered'],
                datasets: [{
                    data: [stats.booking, stats.onProcess, stats.onDelivery, stats.delivered],
                    backgroundColor: ['#60a5fa', '#facc15', '#fb923c', '#22c55e'],
                    borderWidth: 0
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
}
