// Menginjeksi data referensi strategis sebagai baseline operasional
const defaultData = {
    users: [
        { id: 1, name: "Taufik Kulrahman", username: "admin", password: "admin123", role: "Super Admin" }
    ],
    roles: ["Super Admin", "CS Counter", "Customer Service", "Sales Executive", "Operasional", "Finance / AR"],
    customers: [
        { id: 1, name: "PT. Basiyah Kurnia Abadi (BKA)", type: "Contract", discount: 10 },
        { id: 2, name: "PT. Hujan Rezeki", type: "Retail", discount: 0 }
    ],
    resi: [],
    invoices: []
};

if (!localStorage.getItem('zolog_db')) {
    localStorage.setItem('zolog_db', JSON.stringify(defaultData));
}

export const db = {
    get: (table) => JSON.parse(localStorage.getItem('zolog_db'))[table],
    set: (table, data) => {
        let all = JSON.parse(localStorage.getItem('zolog_db'));
        all[table] = data;
        localStorage.setItem('zolog_db', JSON.stringify(all));
    },
    insert: (table, record) => {
        let current = db.get(table);
        record.id = current.length > 0 ? current[current.length - 1].id + 1 : 1;
        current.push(record);
        db.set(table, current);
        return record;
    }
};
