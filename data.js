// data.js - Mock data for BayarinNich

const appData = {
    user: {
        name: "Muhammad Rizki Hasan",
        balance: 15000000,
        avatar: "https://ui-avatars.com/api/?name=Muhammad+Rizki+Hasan&background=0d9488&color=fff"
    },
    pln: {
        "123456789012": { name: "Budi Santoso", amount: 245000, period: "Juli 2026", denda: 0 },
        "987654321098": { name: "Siti Aminah", amount: 150000, period: "Juli 2026", denda: 15000 },
        "112233445566": { name: "Ahmad Dahlan", amount: 560000, period: "Juli 2026", denda: 0 },
        "665544332211": { name: "Rina Nose", amount: 85000, period: "Juli 2026", denda: 0 },
        "102030405060": { name: "Joko Anwar", amount: 320000, period: "Juli 2026", denda: 25000 }
    },
    pdam: {
        "11112222": { name: "Keluarga Budi", amount: 85000, period: "Juni 2026", denda: 0 },
        "33334444": { name: "Keluarga Siti", amount: 125000, period: "Juni 2026", denda: 5000 },
        "55556666": { name: "Keluarga Ahmad", amount: 60000, period: "Juni 2026", denda: 0 }
    },
    internet: {
        "88881111": { name: "Budi (IndiHome)", amount: 350000, period: "Juli 2026", denda: 0 },
        "88882222": { name: "Siti (Biznet)", amount: 450000, period: "Juli 2026", denda: 0 },
        "88883333": { name: "Ahmad (FirstMedia)", amount: 275000, period: "Juli 2026", denda: 0 }
    },
    seminar: {
        "SEM-001": { name: "Webinar Frontend 2026", amount: 150000, period: "Agustus 2026", denda: 0 },
        "SEM-002": { name: "Workshop React JS", amount: 500000, period: "September 2026", denda: 0 }
    },
    spp: {
        "202310001": [ // Example valid NIM
            { id: "SPP-20231-1", desc: "SPP Semester Ganjil 2026/2027 - Cicilan ke-1", amount: 1500000, status: "unpaid", dueDate: "10 Agustus 2026" },
            { id: "SPP-20231-2", desc: "SPP Semester Ganjil 2026/2027 - Cicilan ke-2", amount: 1500000, status: "unpaid", dueDate: "10 September 2026" },
            { id: "SPP-20231-3", desc: "SPP Semester Ganjil 2026/2027 - Cicilan ke-3", amount: 1500000, status: "unpaid", dueDate: "10 Oktober 2026" },
            { id: "SPP-20231-4", desc: "SPP Semester Ganjil 2026/2027 - Cicilan ke-4", amount: 1500000, status: "unpaid", dueDate: "10 November 2026" },
            { id: "SPP-20231-5", desc: "SPP Semester Ganjil 2026/2027 - Cicilan ke-5", amount: 1500000, status: "unpaid", dueDate: "10 Desember 2026" },
            { id: "SPP-20231-6", desc: "SPP Semester Ganjil 2026/2027 - Cicilan ke-6", amount: 1500000, status: "unpaid", dueDate: "10 Januari 2027" }
        ],
        "202310003": [
            { id: "SPP-20233-1", desc: "SPP Semester Ganjil 2026/2027 - Cicilan ke-1", amount: 2000000, status: "paid", dueDate: "10 Agustus 2026" },
            { id: "SPP-20233-2", desc: "SPP Semester Ganjil 2026/2027 - Cicilan ke-2", amount: 2000000, status: "unpaid", dueDate: "10 September 2026" },
            { id: "SPP-20233-3", desc: "SPP Semester Ganjil 2026/2027 - Cicilan ke-3", amount: 2000000, status: "unpaid", dueDate: "10 Oktober 2026" }
        ],
        "211011450409": [ // Format NIM User
            { id: "SPP-211-1", desc: "SPP Semester Ganjil 2026/2027 - Cicilan ke-1", amount: 500000, status: "unpaid", dueDate: "15 Agustus 2026" },
            { id: "SPP-211-2", desc: "SPP Semester Ganjil 2026/2027 - Cicilan ke-2", amount: 500000, status: "unpaid", dueDate: "15 September 2026" },
            { id: "SPP-211-3", desc: "SPP Semester Ganjil 2026/2027 - Cicilan ke-3", amount: 500000, status: "unpaid", dueDate: "15 Oktober 2026" },
            { id: "SPP-211-4", desc: "SPP Semester Ganjil 2026/2027 - Cicilan ke-4", amount: 500000, status: "unpaid", dueDate: "15 November 2026" },
            { id: "SPP-211-5", desc: "SPP Semester Ganjil 2026/2027 - Cicilan ke-5", amount: 500000, status: "unpaid", dueDate: "15 Desember 2026" },
            { id: "SPP-211-6", desc: "SPP Semester Ganjil 2026/2027 - Cicilan ke-6", amount: 500000, status: "unpaid", dueDate: "15 Januari 2027" }
        ]
    },
    providers: [
        { id: "telkomsel", name: "Telkomsel", color: "bg-red-600", logo: "fa-solid fa-signal", prefixes: ["0811", "0812", "0813", "0821", "0822", "0852", "0853"] },
        { id: "indosat", name: "Indosat Ooredoo", color: "bg-yellow-500", logo: "fa-solid fa-broadcast-tower", prefixes: ["0814", "0815", "0816", "0855", "0856", "0857", "0858"] },
        { id: "xl", name: "XL Axiata", color: "bg-blue-600", logo: "fa-solid fa-satellite-dish", prefixes: ["0817", "0818", "0819", "0859", "0877", "0878"] },
        { id: "tri", name: "Tri (3)", color: "bg-gray-800", logo: "fa-solid fa-network-wired", prefixes: ["0895", "0896", "0897", "0898", "0899"] },
        { id: "smartfren", name: "Smartfren", color: "bg-pink-600", logo: "fa-solid fa-wifi", prefixes: ["0881", "0882", "0883", "0884", "0885", "0886", "0887", "0888", "0889"] }
    ],
    pulsaNominal: [
        { label: "10.000", price: 11500 },
        { label: "25.000", price: 26500 },
        { label: "50.000", price: 51500 },
        { label: "100.000", price: 101500 },
        { label: "200.000", price: 201500 }
    ]
};
