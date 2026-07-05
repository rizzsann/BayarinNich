// app.js - Main logic for BayarinNich

const app = {
    state: {
        currentView: 'dashboard',
        theme: localStorage.getItem('theme') || 'light',
        balance: localStorage.getItem('balance') ? parseInt(localStorage.getItem('balance')) : appData.user.balance,
        history: JSON.parse(localStorage.getItem('history')) || [],
        
        // Form states
        tagihanActiveTab: 'pln',
        currentPendingPayment: null, // Stores { type, service, amount, id, detailDesc }
        
        // SPP state
        sppData: [],
        sppSelectedIds: new Set(),
        
        // Pulsa state
        pulsaProvider: null,
        pulsaNominal: null
    },

    init() {
        this.applyTheme(this.state.theme);
        this.updateBalanceUI();
        this.loadHistory();
        this.renderPulsaOptions();
        
        // Set dynamic user name
        document.getElementById('user-name-display').innerText = appData.user.name;
        
        // Set initial view
        this.navigate('dashboard');
    },

    // --- Core Utilities ---

    formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    },

    formatDate(date) {
        return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
    },

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-blue-500 text-white'
        };
        
        const icons = {
            success: '<i class="fa-solid fa-circle-check"></i>',
            error: '<i class="fa-solid fa-circle-exclamation"></i>',
            info: '<i class="fa-solid fa-circle-info"></i>'
        };

        toast.className = `toast flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${colors[type]}`;
        toast.innerHTML = `${icons[type]} <span>${message}</span>`;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    async simulateLoading(buttonId, text = 'Memproses...') {
        const btn = document.getElementById(buttonId);
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner"></i> ${text}`;
        
        return new Promise(resolve => {
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = originalText;
                resolve();
            }, 1000 + Math.random() * 800); // 1-1.8s delay
        });
    },

    // --- Navigation & Theme ---

    navigate(viewId) {
        // Hide all views
        document.querySelectorAll('.view-section').forEach(el => {
            el.classList.add('hidden');
            el.classList.remove('active', 'animate-fade-in');
        });
        
        // Show target view
        const targetView = document.getElementById(`view-${viewId}`);
        targetView.classList.remove('hidden');
        // Force reflow
        void targetView.offsetWidth;
        targetView.classList.add('active', 'animate-fade-in');
        
        // Update Nav buttons
        document.querySelectorAll('.nav-btn, .mobile-nav-btn').forEach(btn => {
            if (btn.dataset.target === viewId) {
                btn.classList.add('active');
                if(btn.classList.contains('nav-btn')){
                    btn.classList.remove('text-gray-500');
                }
            } else {
                btn.classList.remove('active');
                if(btn.classList.contains('nav-btn')){
                    btn.classList.add('text-gray-500');
                }
            }
        });

        this.state.currentView = viewId;
        window.scrollTo(0, 0);
        document.getElementById('main-scroll-area').scrollTop = 0;
    },

    toggleTheme() {
        const newTheme = this.state.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    },

    applyTheme(theme) {
        this.state.theme = theme;
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    },

    updateBalanceUI() {
        document.getElementById('user-balance-display').innerText = this.formatCurrency(this.state.balance);
    },

    // --- Tagihan Logic ---

    switchTagihanTab(tab, btnElement) {
        this.state.tagihanActiveTab = tab;
        
        // Reset Tabs styling
        const tabs = btnElement.parentElement.children;
        for (let tab of tabs) {
            tab.classList.remove('border-primary', 'text-primary');
            tab.classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');
        }
        
        // Active Tab styling
        btnElement.classList.add('border-primary', 'text-primary');
        btnElement.classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
        
        // Update Icon
        const iconMap = { pln: 'fa-bolt', pdam: 'fa-droplet', internet: 'fa-wifi' };
        document.getElementById('tagihan-icon').innerHTML = `<i class="fa-solid ${iconMap[tab]}"></i>`;
        
        // Clear input and result
        document.getElementById('input-tagihan-id').value = '';
        document.getElementById('tagihan-result').classList.add('hidden');
        document.getElementById('tagihan-error').classList.add('hidden');
    },

    async checkTagihan() {
        const inputStr = document.getElementById('input-tagihan-id').value.trim();
        const errEl = document.getElementById('tagihan-error');
        
        // Basic Validation
        if (!/^\d{8,12}$/.test(inputStr) && this.state.tagihanActiveTab !== 'seminar') {
            errEl.innerText = "ID Pelanggan harus berupa 8-12 digit angka.";
            errEl.classList.remove('hidden');
            return;
        }
        errEl.classList.add('hidden');

        await this.simulateLoading('btn-cek-tagihan', 'Mencari data...');
        
        const dataSet = appData[this.state.tagihanActiveTab];
        let data = dataSet[inputStr];

        // Generate dummy data if not found, to allow arbitrary testing
        if (!data && this.state.tagihanActiveTab !== 'seminar') {
            data = {
                name: "Pelanggan Dummy (" + inputStr + ")",
                amount: Math.floor(Math.random() * 450000) + 50000,
                period: "Juli 2026",
                denda: 0
            };
        }

        if (data) {
            document.getElementById('res-nama').innerText = data.name;
            document.getElementById('res-periode').innerText = data.period;
            document.getElementById('res-amount').innerText = this.formatCurrency(data.amount);
            document.getElementById('res-denda').innerText = this.formatCurrency(data.denda);
            
            const total = data.amount + data.denda;
            document.getElementById('res-total').innerText = this.formatCurrency(total);
            
            document.getElementById('tagihan-result').classList.remove('hidden');
            
            // Set pending payment
            this.state.currentPendingPayment = {
                type: 'tagihan',
                service: this.state.tagihanActiveTab.toUpperCase(),
                id: inputStr,
                amount: total,
                detailDesc: `Tagihan ${this.state.tagihanActiveTab.toUpperCase()} a.n ${data.name}`
            };
        } else {
            this.showToast('ID Pelanggan tidak ditemukan.', 'error');
            document.getElementById('tagihan-result').classList.add('hidden');
        }
    },

    // --- SPP Logic ---

    async checkSPP() {
        const nim = document.getElementById('input-nim').value.trim();
        const errEl = document.getElementById('spp-error');
        
        if (nim.length < 5) {
            errEl.innerText = "NIM tidak valid.";
            errEl.classList.remove('hidden');
            return;
        }
        errEl.classList.add('hidden');

        await this.simulateLoading('btn-cek-spp');
        
        const data = appData.spp[nim];
        
        if (data) {
            this.state.sppData = data;
            this.state.sppSelectedIds.clear();
            this.renderSPPList();
            document.getElementById('spp-nim-badge').innerText = nim;
            document.getElementById('spp-result').classList.remove('hidden');
            
            // Auto scroll slightly
            document.getElementById('spp-result').scrollIntoView({behavior: "smooth", block: "center"});
        } else {
            this.showToast('NIM tidak terdaftar di sistem.', 'error');
            document.getElementById('spp-result').classList.add('hidden');
        }
    },

    renderSPPList() {
        const container = document.getElementById('spp-list-container');
        container.innerHTML = '';
        
        this.state.sppData.forEach(item => {
            const isPaid = item.status === 'paid';
            const isSelected = this.state.sppSelectedIds.has(item.id);
            
            const el = document.createElement('label');
            el.className = `flex items-center p-4 border rounded-xl transition-all ${isPaid ? 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 opacity-70' : 'cursor-pointer border-gray-200 dark:border-gray-700 hover:border-primary bg-white dark:bg-cardDark'} ${isSelected ? 'ring-1 ring-primary border-primary bg-teal-50 dark:bg-teal-900/10' : ''}`;
            
            el.innerHTML = `
                <input type="checkbox" class="w-5 h-5 text-primary rounded focus:ring-primary accent-primary" 
                    ${isPaid ? 'disabled checked' : ''} 
                    ${isSelected ? 'checked' : ''}
                    onchange="app.toggleSPPItem('${item.id}', this.checked)">
                <div class="ml-4 flex-1">
                    <p class="font-medium text-sm dark:text-gray-200 ${isPaid ? 'line-through text-gray-400' : ''}">${item.desc}</p>
                    <p class="text-xs text-gray-500 mt-1">Jatuh Tempo: ${item.dueDate}</p>
                </div>
                <div class="text-right">
                    <p class="font-bold text-primary">${this.formatCurrency(item.amount)}</p>
                    ${isPaid ? '<span class="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase font-bold mt-1 inline-block">Lunas</span>' : ''}
                </div>
            `;
            container.appendChild(el);
        });
        
        this.calculateSPPSelected();
    },

    toggleSPPItem(id, isChecked) {
        if (isChecked) {
            this.state.sppSelectedIds.add(id);
        } else {
            this.state.sppSelectedIds.delete(id);
        }
        
        // Simple visual update for the parent label
        const checkbox = document.querySelector(`input[onchange="app.toggleSPPItem('${id}', this.checked)"]`);
        if(checkbox) {
            const label = checkbox.parentElement;
            if(isChecked) {
                label.classList.add('ring-1', 'ring-primary', 'border-primary', 'bg-teal-50', 'dark:bg-teal-900/10');
            } else {
                label.classList.remove('ring-1', 'ring-primary', 'border-primary', 'bg-teal-50', 'dark:bg-teal-900/10');
            }
        }

        this.calculateSPPSelected();
    },

    calculateSPPSelected() {
        let total = 0;
        let count = 0;
        
        this.state.sppSelectedIds.forEach(id => {
            const item = this.state.sppData.find(x => x.id === id);
            if (item) {
                total += item.amount;
                count++;
            }
        });
        
        document.getElementById('spp-total-selected').innerText = this.formatCurrency(total);
        const btn = document.getElementById('btn-bayar-spp');
        
        if (count > 0) {
            btn.disabled = false;
            btn.innerText = `Bayar (${count})`;
            
            this.state.currentPendingPayment = {
                type: 'spp',
                service: 'SPP Kampus',
                id: document.getElementById('input-nim').value,
                amount: total,
                detailDesc: `Pembayaran ${count} cicilan SPP`
            };
        } else {
            btn.disabled = true;
            btn.innerText = 'Bayar Terpilih';
        }
    },

    // --- Pulsa Logic ---

    detectProvider(number) {
        const logoEl = document.getElementById('provider-logo');
        const optionsEl = document.getElementById('pulsa-options');
        const errEl = document.getElementById('pulsa-error');
        
        this.state.pulsaProvider = null;
        logoEl.className = 'absolute right-3 top-2 w-auto h-8 px-3 rounded-lg flex items-center justify-center text-white text-sm font-bold opacity-0 transition-opacity duration-300';
        optionsEl.classList.add('opacity-50', 'pointer-events-none');
        
        // Clear previous selection
        document.querySelectorAll('.pulsa-item').forEach(el => el.classList.remove('ring-2', 'ring-primary', 'bg-teal-50', 'dark:bg-teal-900/20'));

        if (number.length >= 4) {
            const prefix = number.substring(0, 4);
            const provider = appData.providers.find(p => p.prefixes.includes(prefix));
            
            if (provider) {
                this.state.pulsaProvider = provider;
                logoEl.innerHTML = `<i class="${provider.logo} mr-1"></i> ${provider.name}`;
                logoEl.className = `absolute right-3 top-2 w-auto h-8 px-3 rounded-lg flex items-center justify-center text-white text-xs font-bold transition-opacity duration-300 opacity-100 ${provider.color}`;
                
                if (number.length >= 10 && number.length <= 13) {
                    optionsEl.classList.remove('opacity-50', 'pointer-events-none');
                    errEl.classList.add('hidden');
                } else if (number.length > 13) {
                    errEl.innerText = "Nomor terlalu panjang.";
                    errEl.classList.remove('hidden');
                }
            } else {
                if(number.length >= 4) {
                    errEl.innerText = "Provider tidak dikenali.";
                    errEl.classList.remove('hidden');
                }
            }
        }
    },

    renderPulsaOptions() {
        const grid = document.getElementById('pulsa-grid');
        grid.innerHTML = '';
        
        appData.pulsaNominal.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'pulsa-item bg-white dark:bg-cardDark border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-left transition-all hover:border-primary focus:outline-none';
            btn.innerHTML = `
                <p class="font-bold text-lg dark:text-white">${item.label}</p>
                <p class="text-xs text-primary font-medium mt-1">Harga: ${this.formatCurrency(item.price)}</p>
            `;
            
            btn.onclick = () => {
                document.querySelectorAll('.pulsa-item').forEach(el => el.classList.remove('ring-2', 'ring-primary', 'bg-teal-50', 'dark:bg-teal-900/20'));
                btn.classList.add('ring-2', 'ring-primary', 'bg-teal-50', 'dark:bg-teal-900/20');
                
                this.state.currentPendingPayment = {
                    type: 'pulsa',
                    service: `Pulsa ${this.state.pulsaProvider.name}`,
                    id: document.getElementById('input-pulsa').value,
                    amount: item.price,
                    detailDesc: `Isi Pulsa ${item.label}`
                };
                
                this.openPaymentModal('pulsa');
            };
            
            grid.appendChild(btn);
        });
    },

    // --- Payment Flow ---

    openPaymentModal(sourceType) {
        if (!this.state.currentPendingPayment) return;
        
        const modal = document.getElementById('payment-modal');
        document.getElementById('modal-amount').innerText = this.formatCurrency(this.state.currentPendingPayment.amount);
        
        // Reset to step 1
        this.backToMethods();
        
        modal.classList.remove('hidden');
        // Force reflow
        void modal.offsetWidth;
        modal.classList.add('opacity-100');
        document.getElementById('payment-modal-content').classList.remove('scale-95');
        document.getElementById('payment-modal-content').classList.add('scale-100');
    },

    closePaymentModal() {
        const modal = document.getElementById('payment-modal');
        modal.classList.remove('opacity-100');
        document.getElementById('payment-modal-content').classList.remove('scale-100');
        document.getElementById('payment-modal-content').classList.add('scale-95');
        
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    },

    selectMethod(method) {
        // Handled by radio button state automatically, but we can hook here if needed
    },

    async proceedPaymentStep() {
        const method = document.querySelector('input[name="pay_method"]:checked').value;
        
        await this.simulateLoading('btn-lanjutkan', 'Menyiapkan...');
        
        document.getElementById('payment-method-selection').classList.add('hidden');
        document.getElementById('payment-instruction').classList.remove('hidden');
        
        // Hide all instructions
        ['va', 'qris', 'teller'].forEach(m => document.getElementById(`inst-${m}`).classList.add('hidden'));
        
        // Show selected
        document.getElementById(`inst-${method}`).classList.remove('hidden');
        
        // Generate content dynamically
        if (method === 'va') {
            const bankCode = '8800'; // Fake BCA VA code
            const suffix = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
            document.getElementById('va-number').innerText = bankCode + suffix;
        } else if (method === 'qris') {
            document.getElementById('qrcode-container').innerHTML = '';
            new QRCode(document.getElementById("qrcode-container"), {
                text: "https://qris.id/simulasi?amount=" + this.state.currentPendingPayment.amount,
                width: 150,
                height: 150,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.M
            });
            // Fake timer countdown logic could be added here
        } else if (method === 'teller') {
            const code = 'BYR' + Math.random().toString(36).substring(2, 8).toUpperCase();
            document.getElementById('teller-code').innerText = code;
        }
    },

    backToMethods() {
        document.getElementById('payment-method-selection').classList.remove('hidden');
        document.getElementById('payment-instruction').classList.add('hidden');
    },

    async executePayment() {
        // Check balance
        if (this.state.balance < this.state.currentPendingPayment.amount) {
            this.showToast('Saldo Anda tidak mencukupi untuk simulasi ini.', 'error');
            this.closePaymentModal();
            return;
        }

        await this.simulateLoading('btn-final-pay', 'Memverifikasi...');
        
        // Deduct balance
        this.state.balance -= this.state.currentPendingPayment.amount;
        localStorage.setItem('balance', this.state.balance);
        this.updateBalanceUI();
        
        // Save to History
        this.saveHistory(this.state.currentPendingPayment);
        
        // Update SPP state if it was SPP
        if (this.state.currentPendingPayment.type === 'spp') {
            this.state.sppSelectedIds.forEach(id => {
                const item = appData.spp[this.state.currentPendingPayment.id].find(x => x.id === id);
                if(item) item.status = 'paid';
            });
        }

        this.closePaymentModal();
        
        // Show success modal
        document.getElementById('success-amount').innerText = this.formatCurrency(this.state.currentPendingPayment.amount);
        const successModal = document.getElementById('success-modal');
        successModal.classList.remove('hidden');
        void successModal.offsetWidth;
        successModal.classList.add('opacity-100');
        document.getElementById('success-modal-content').classList.remove('scale-95');
        document.getElementById('success-modal-content').classList.add('scale-100');
    },

    closeSuccessAndGoHome() {
        const successModal = document.getElementById('success-modal');
        successModal.classList.remove('opacity-100');
        document.getElementById('success-modal-content').classList.remove('scale-100');
        document.getElementById('success-modal-content').classList.add('scale-95');
        
        setTimeout(() => {
            successModal.classList.add('hidden');
            this.navigate('dashboard');
            
            // Clean up forms
            document.getElementById('form-tagihan').reset();
            document.getElementById('tagihan-result').classList.add('hidden');
            document.getElementById('form-spp').reset();
            document.getElementById('spp-result').classList.add('hidden');
            document.getElementById('input-pulsa').value = '';
            this.detectProvider(''); // reset provider UI
            
            this.state.currentPendingPayment = null;
        }, 300);
    },

    // --- History Logic ---

    saveHistory(payment) {
        const historyItem = {
            date: new Date().toISOString(),
            service: payment.service,
            detail: payment.detailDesc,
            amount: payment.amount,
            status: 'Berhasil'
        };
        
        this.state.history.unshift(historyItem); // Add to beginning
        if (this.state.history.length > 50) this.state.history.pop(); // Keep max 50
        
        localStorage.setItem('history', JSON.stringify(this.state.history));
        this.loadHistory(); // Re-render table
    },

    loadHistory() {
        const tbody = document.getElementById('history-table-body');
        const emptyState = document.getElementById('empty-history');
        const tableHeader = tbody.parentElement.querySelector('thead');
        
        tbody.innerHTML = '';
        
        if (this.state.history.length === 0) {
            emptyState.classList.remove('hidden');
            tableHeader.parentElement.classList.add('hidden'); // Hide table
        } else {
            emptyState.classList.add('hidden');
            tableHeader.parentElement.classList.remove('hidden');
            
            this.state.history.forEach((item, index) => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors';
                
                tr.innerHTML = `
                    <td class="p-4 whitespace-nowrap text-gray-500 dark:text-gray-400">${this.formatDate(new Date(item.date))}</td>
                    <td class="p-4 font-medium dark:text-white">${item.service}</td>
                    <td class="p-4 text-gray-600 dark:text-gray-300 max-w-xs truncate" title="${item.detail}">${item.detail}</td>
                    <td class="p-4 font-bold text-gray-800 dark:text-white">${this.formatCurrency(item.amount)}</td>
                    <td class="p-4 text-right">
                        <span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase">${item.status}</span>
                    </td>
                    <td class="p-4 text-center">
                        <button class="text-primary hover:text-primaryDark" onclick="app.printReceiptFromHistory(${index})"><i class="fa-solid fa-file-invoice"></i></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    },

    clearHistory() {
        if(confirm('Apakah Anda yakin ingin menghapus semua riwayat transaksi?')) {
            this.state.history = [];
            localStorage.removeItem('history');
            this.loadHistory();
            this.showToast('Riwayat berhasil dihapus', 'info');
        }
    },

    // --- PDF / Print ---
    printReceipt() {
        if (!this.state.currentPendingPayment) return;
        const data = {
            date: new Date().toISOString(),
            service: this.state.currentPendingPayment.service,
            detail: this.state.currentPendingPayment.detailDesc,
            amount: this.state.currentPendingPayment.amount,
            status: 'Berhasil'
        };
        this.generateReceiptWindow(data);
    },

    printReceiptFromHistory(index) {
        const data = this.state.history[index];
        if (data) {
            this.generateReceiptWindow(data);
        }
    },

    generateReceiptWindow(data) {
        const receiptWindow = window.open('', '_blank', 'width=600,height=800');
        if (!receiptWindow) {
            this.showToast('Gagal membuka pop-up. Izinkan pop-up pada browser Anda.', 'error');
            return;
        }

        const html = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <title>Struk Pembayaran - BayarinNich</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                }
            </style>
        </head>
        <body class="bg-gray-100 p-6 flex flex-col items-center justify-center min-h-screen">
            <div class="bg-white p-8 rounded-2xl shadow-md w-full max-w-md border border-gray-200 relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-emerald-500"></div>
                
                <!-- Logo & Header -->
                <div class="text-center border-b border-dashed pb-6 mb-6">
                    <div class="inline-flex items-center gap-2 mb-2">
                        <img src="logo-bayarinnich.png" alt="Logo BayarinNich" class="w-24 h-10 object-contain">
                        <h2 class="text-2xl font-bold text-teal-600 tracking-tight">BayarinNich</h2>
                    </div>
                    <p class="text-xs text-gray-400">Bukti Transaksi Pembayaran Resmi (Simulasi)</p>
                </div>
                
                <!-- Details -->
                <div class="space-y-4 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-500">Tanggal Transaksi</span>
                        <span class="font-medium text-gray-800">${this.formatDate(new Date(data.date))}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">Nomor Referensi</span>
                        <span class="font-mono font-medium text-gray-800">${Math.floor(100000000000 + Math.random() * 900000000000)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">Layanan</span>
                        <span class="font-medium text-gray-800">${data.service}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">Keterangan</span>
                        <span class="font-medium text-gray-800 text-right max-w-[200px] break-words">${data.detail}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">Status Pembayaran</span>
                        <span class="font-bold text-emerald-600 uppercase text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">SUKSES</span>
                    </div>
                    
                    <div class="border-t border-dashed pt-4 flex justify-between text-base font-bold text-gray-800">
                        <span>Total Bayar</span>
                        <span class="text-teal-600 text-lg">${this.formatCurrency(data.amount)}</span>
                    </div>
                </div>

                <!-- Footer & Student Info -->
                <div class="border-t border-dashed mt-6 pt-6 text-center">
                    <p class="text-xs font-semibold text-gray-600">Pelanggan/Siswa:</p>
                    <p class="text-xs text-gray-800 mt-1">Muhammad Rizki Hasan</p>
                    <p class="text-[10px] text-gray-400 font-mono">NIM: 211011450409</p>
                    <p class="mt-4 text-[10px] text-gray-400 italic">Terima kasih telah melakukan pembayaran melalui BayarinNich.</p>
                </div>
            </div>
            
            <!-- Controls (Not printed) -->
            <div class="mt-6 flex gap-4 no-print">
                <button onclick="window.print()" class="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition-colors flex items-center gap-2"><i class="fa-solid fa-print"></i> Cetak / Save PDF</button>
                <button onclick="window.close()" class="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2.5 px-6 rounded-xl transition-colors">Tutup Halaman</button>
            </div>
            
            <script>
                // Auto trigger print dialog slightly after load
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 500);
                }
            </script>
        </body>
        </html>
        `;

        receiptWindow.document.write(html);
        receiptWindow.document.close();
    }
};

// Initialize App when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
