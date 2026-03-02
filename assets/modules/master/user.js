import { db } from '../../js/db.js';

export function loadUserMaster(container, titleEl) {
    titleEl.innerText = "Data Master: Pengguna";
    const users = db.get('users');
    
    let rows = users.map(u => `
        <tr class="border-b hover:bg-gray-50">
            <td class="p-3">${u.id}</td>
            <td class="p-3 font-medium">${u.name}</td>
            <td class="p-3">${u.role}</td>
            <td class="p-3">
                <button class="text-indigo-600 hover:text-indigo-900 text-sm">Edit</button>
            </td>
        </tr>
    `).join('');

    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <div class="p-4 border-b flex justify-between items-center">
                <h3 class="font-semibold">Daftar Pengguna</h3>
                <button class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm">+ Tambah User</button>
            </div>
            <table class="w-full text-left border-collapse">
                <thead class="bg-gray-100 text-gray-600 text-sm">
                    <tr><th class="p-3">ID</th><th class="p-3">Nama Lengkap</th><th class="p-3">Otoritas</th><th class="p-3">Aksi</th></tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}
