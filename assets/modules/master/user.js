import { db } from '../../js/db.js';

export function loadUserMaster(container, titleEl) {
    titleEl.innerText = "Data Master: Manajemen Pengguna";

    const renderUI = () => {
        const users = db.get('users') || [];
        const roles = db.get('roles') || ["Super Admin", "CS Counter", "Customer Service", "Sales Executive", "Operasional", "Finance / AR"];
        
        let rows = users.map(u => `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-3 font-medium">${u.username}</td>
                <td class="p-3">${u.name}</td>
                <td class="p-3"><span class="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded font-bold">${u.role}</span></td>
                <td class="p-3">
                    <button data-id="${u.id}" class="btn-delete-user text-red-600 hover:text-red-900 text-sm font-bold">Hapus</button>
                </td>
            </tr>
        `).join('');

        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-md overflow-hidden relative">
                <div class="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 class="font-bold text-gray-800">Direktori Otoritas Sistem</h3>
                    <button id="btn-add-user" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-bold shadow-sm">+ Registrasi Pengguna</button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-indigo-900 text-white text-sm">
                            <tr><th class="p-3">Username</th><th class="p-3">Nama Lengkap</th><th class="p-3">Otoritas (Role)</th><th class="p-3">Aksi</th></tr>
                        </thead>
                        <tbody>${rows || '<tr><td colspan="4" class="p-4 text-center text-gray-500">Data kosong.</td></tr>'}</tbody>
                    </table>
                </div>
            </div>

            <div id="modal-user" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
                <div class="bg-white p-6 rounded-xl shadow-xl w-96">
                    <h3 class="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Registrasi Entitas Baru</h3>
                    <form id="form-user" class="space-y-4">
                        <input type="text" id="u-name" placeholder="Nama Lengkap" class="w-full p-2 border rounded" required>
                        <input type="text" id="u-username" placeholder="Username (Login)" class="w-full p-2 border rounded" required>
                        <input type="password" id="u-password" placeholder="Password Sistem" class="w-full p-2 border rounded" required>
                        <select id="u-role" class="w-full p-2 border rounded" required>
                            <option value="">-- Pilih Otoritas --</option>
                            ${roles.map(r => `<option value="${r}">${r}</option>`).join('')}
                        </select>
                        <div class="flex justify-end gap-2 pt-4">
                            <button type="button" id="btn-close-user" class="px-4 py-2 bg-gray-200 rounded font-bold">Batal</button>
                            <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded font-bold">Eksekusi</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Logika Eksekusi
        const modal = document.getElementById('modal-user');
        document.getElementById('btn-add-user').onclick = () => modal.classList.remove('hidden');
        document.getElementById('btn-close-user').onclick = () => modal.classList.add('hidden');

        document.getElementById('form-user').onsubmit = (e) => {
            e.preventDefault();
            const payload = {
                name: document.getElementById('u-name').value,
                username: document.getElementById('u-username').value,
                password: document.getElementById('u-password').value,
                role: document.getElementById('u-role').value
            };
            db.insert('users', payload);
            renderUI();
        };

        document.querySelectorAll('.btn-delete-user').forEach(btn => {
            btn.onclick = (e) => {
                if(!confirm('Otorisasi Penghancuran: Hapus pengguna ini?')) return;
                const id = parseInt(e.target.getAttribute('data-id'));
                let current = db.get('users');
                db.set('users', current.filter(u => u.id !== id));
                renderUI();
            };
        });
    };

    renderUI();
}
