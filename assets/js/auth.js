import { db } from './db.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    // Bypass jika sudah login
    if (localStorage.getItem('zolog_session')) {
        window.location.href = '/dashboard.html';
        return;
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('username').value;
            const pass = document.getElementById('password').value;

            // Validasi Otoritatif
            const users = db.get('users');
            const validUser = users.find(u => u.username === user && u.password === pass);

            if (validUser) {
                // Injeksi sesi
                const sessionData = {
                    id: validUser.id,
                    name: validUser.name,
                    role: validUser.role,
                    timestamp: new Date().getTime()
                };
                localStorage.setItem('zolog_session', JSON.stringify(sessionData));
                
                // Redirect ke SPA Shell
                window.location.href = '/dashboard.html';
            } else {
                alert('Kredensial Ditolak: Username atau Password tidak valid.');
            }
        });
    }
});
