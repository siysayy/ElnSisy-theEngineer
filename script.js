// ==================== SCRIPT.JS ====================
// C on Time - Canteen Management System

// ==================== DATA STORE ====================
let products = [
    { id: 1, name: "Nasi Goreng Spesial", price: 12000, category: "makanan", stock: 50, image: "🍚" },
    { id: 2, name: "Mie Ayam Bakso", price: 11000, category: "makanan", stock: 45, image: "🍜" },
    { id: 3, name: "Ayam Geprek", price: 13000, category: "makanan", stock: 40, image: "🍗" },
    { id: 4, name: "Es Teh Manis", price: 3000, category: "minuman", stock: 100, image: "🥤" },
    { id: 5, name: "Es Jeruk", price: 4000, category: "minuman", stock: 90, image: "🍊" },
    { id: 6, name: "Kopi Susu", price: 5000, category: "minuman", stock: 80, image: "☕" },
    { id: 7, name: "Kentang Goreng", price: 7000, category: "snack", stock: 60, image: "🍟" },
    { id: 8, name: "Pisang Goreng", price: 5000, category: "snack", stock: 55, image: "🍌" },
    { id: 9, name: "Donat", price: 4000, category: "snack", stock: 70, image: "🍩" },
    { id: 10, name: "Roti Bakar", price: 8000, category: "snack", stock: 45, image: "🍞" }
];

// 5 Ustadz Member (diskon 20%)
const MEMBERS = [
    { id: 1, name: "Ust. Ali Wahyudi", username: "ust_ali", discount: 0.2, phone: "081234567890" },
    { id: 2, name: "Ust. Rajab", username: "ust_rajab", discount: 0.2, phone: "081234567891" },
    { id: 3, name: "Usth. Hilmia", username: "usth_hilmia", discount: 0.2, phone: "081234567892" },
    { id: 4, name: "Ust. Sabar", username: "ust_sabar", discount: 0.2, phone: "081234567893" },
    { id: 5, name: "Ust. Abidin", username: "ust_abidin", discount: 0.2, phone: "081234567894" }
];

// Users
let users = [
    { id: 1, name: "Admin Kantin", username: "admin", password: "admin123", role: "admin", phone: "081234567899", isMember: false },
    ...MEMBERS.map((m, idx) => ({
        id: idx + 100,
        name: m.name,
        username: m.username,
        password: "member123",
        role: "user",
        phone: m.phone,
        isMember: true,
        memberDiscount: 0.2
    }))
];

// Current Session
let currentUser = null;
let cart = [];
let transactions = [];
let deliveryMethod = "pickup"; // pickup, queue, delivery
let deliveryAddress = "";
let queueTime = "";

// ==================== HELPER FUNCTIONS ====================
function showToast(message, isError = false) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = "toast show " + (isError ? "toast-error" : "toast-success");
    setTimeout(() => {
        toast.className = "toast";
    }, 3000);
}

function saveToLocalStorage() {
    localStorage.setItem("contime_users", JSON.stringify(users));
    localStorage.setItem("contime_products", JSON.stringify(products));
    localStorage.setItem("contime_transactions", JSON.stringify(transactions));
    if (currentUser) {
        localStorage.setItem("contime_currentUser", JSON.stringify(currentUser));
        localStorage.setItem("contime_cart", JSON.stringify(cart));
    }
}

function loadFromLocalStorage() {
    const savedUsers = localStorage.getItem("contime_users");
    const savedProducts = localStorage.getItem("contime_products");
    const savedTransactions = localStorage.getItem("contime_transactions");
    const savedUser = localStorage.getItem("contime_currentUser");
    const savedCart = localStorage.getItem("contime_cart");
    
    if (savedUsers) users = JSON.parse(savedUsers);
    if (savedProducts) products = JSON.parse(savedProducts);
    if (savedTransactions) transactions = JSON.parse(savedTransactions);
    if (savedUser) currentUser = JSON.parse(savedUser);
    if (savedCart) cart = JSON.parse(savedCart);
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const cartFab = document.getElementById("cartFab");
    const cartCount = document.getElementById("cartCount");
    if (cartFab) {
        if (count > 0) {
            cartFab.style.display = "flex";
            cartCount.textContent = count;
        } else {
            cartFab.style.display = "none";
        }
    }
}

function calculateTotal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const isMemberUser = currentUser?.isMember === true;
    let discount = 0;
    if (isMemberUser) discount = subtotal * 0.2;
    
    let queueFee = 0;
    let deliveryFee = 0;
    
    if (deliveryMethod === "queue") queueFee = 2000;
    if (deliveryMethod === "delivery") deliveryFee = 3000;
    
    const total = subtotal - discount + queueFee + deliveryFee;
    return { subtotal, discount, queueFee, deliveryFee, total };
}

function isUserMember() {
    if (!currentUser) return false;
    if (currentUser.isMember === true) return true;
    return MEMBERS.some(m => m.username === currentUser.username);
}

// ==================== PAGE NAVIGATION ====================
function showPage(pageName) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });
    document.getElementById(`page-${pageName}`).classList.add("active");
    
    // Update navbar buttons visibility
    const navHome = document.getElementById("navHome");
    const navTrx = document.getElementById("navTrx");
    const navProfile = document.getElementById("navProfile");
    const navAdmin = document.getElementById("navAdmin");
    const btnNavLogin = document.getElementById("btnNavLogin");
    const btnNavLogout = document.getElementById("btnNavLogout");
    
    if (currentUser) {
        navHome.style.display = "inline-block";
        navTrx.style.display = "inline-block";
        navProfile.style.display = "inline-block";
        btnNavLogin.style.display = "none";
        btnNavLogout.style.display = "inline-block";
        if (currentUser.role === "admin") {
            navAdmin.style.display = "inline-block";
        } else {
            navAdmin.style.display = "none";
        }
    } else {
        navHome.style.display = "none";
        navTrx.style.display = "none";
        navProfile.style.display = "none";
        navAdmin.style.display = "none";
        btnNavLogin.style.display = "inline-block";
        btnNavLogout.style.display = "none";
    }
    
    // Refresh content based on page
    if (pageName === "home" && currentUser) {
        renderMenuGrid();
        updateWelcomeBanner();
        updateCartCount();
    } else if (pageName === "transaction" && currentUser) {
        renderCartList();
        updateSummary();
        updateDeliveryUI();
    } else if (pageName === "profile" && currentUser) {
        renderProfilePage();
    } else if (pageName === "admin" && currentUser?.role === "admin") {
        renderAdminDashboard();
    }
}

// ==================== AUTH FUNCTIONS ====================
function switchTab(tab) {
    const loginForm = document.getElementById("formLogin");
    const registerForm = document.getElementById("formRegister");
    const tabLogin = document.getElementById("tabLogin");
    const tabRegister = document.getElementById("tabRegister");
    
    if (tab === "login") {
        loginForm.classList.add("active");
        registerForm.classList.remove("active");
        tabLogin.classList.add("active");
        tabRegister.classList.remove("active");
    } else {
        loginForm.classList.remove("active");
        registerForm.classList.add("active");
        tabLogin.classList.remove("active");
        tabRegister.classList.add("active");
    }
}

function login() {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const errorDiv = document.getElementById("loginError");
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = { ...user };
        cart = [];
        saveToLocalStorage();
        showToast(`Selamat datang, ${user.name}!`);
        showPage("home");
        updateCartCount();
    } else {
        errorDiv.textContent = "Username atau password salah!";
        setTimeout(() => { errorDiv.textContent = ""; }, 3000);
    }
}

function register() {
    const name = document.getElementById("regName").value.trim();
    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    const phone = document.getElementById("regPhone").value.trim();
    const msgDiv = document.getElementById("registerMsg");
    
    if (!name || !username || !password) {
        msgDiv.textContent = "Semua field harus diisi!";
        msgDiv.style.color = "red";
        setTimeout(() => { msgDiv.textContent = ""; }, 3000);
        return;
    }
    
    if (users.find(u => u.username === username)) {
        msgDiv.textContent = "Username sudah terdaftar!";
        msgDiv.style.color = "red";
        setTimeout(() => { msgDiv.textContent = ""; }, 3000);
        return;
    }
    
    const newUser = {
        id: Date.now(),
        name: name,
        username: username,
        password: password,
        role: "user",
        phone: phone || "-",
        isMember: false,
        totalSpent: 0,
        totalDiscount: 0,
        transactionCount: 0
    };
    
    users.push(newUser);
    saveToLocalStorage();
    msgDiv.textContent = "Pendaftaran berhasil! Silakan login.";
    msgDiv.style.color = "green";
    setTimeout(() => {
        msgDiv.textContent = "";
        switchTab("login");
        document.getElementById("regName").value = "";
        document.getElementById("regUsername").value = "";
        document.getElementById("regPassword").value = "";
        document.getElementById("regPhone").value = "";
    }, 2000);
}

function logout() {
    currentUser = null;
    cart = [];
    deliveryMethod = "pickup";
    saveToLocalStorage();
    showToast("Anda telah logout!");
    showPage("landing");
}

// ==================== HOME PAGE ====================
function updateWelcomeBanner() {
    const welcomeName = document.getElementById("welcomeName");
    const memberStatus = document.getElementById("memberStatus");
    const welcomeBadge = document.getElementById("welcomeBadge");
    
    if (welcomeName) welcomeName.textContent = currentUser?.name || "User";
    
    if (isUserMember()) {
        memberStatus.innerHTML = "🎉 Member Aktif! Dapatkan diskon 20% setiap belanja!";
        welcomeBadge.innerHTML = '<span class="member-badge-gold">GOLD MEMBER</span>';
    } else {
        memberStatus.innerHTML = "Selamat berbelanja di KantinKu";
        welcomeBadge.innerHTML = '<span class="member-badge-silver">REGULAR</span>';
    }
}

let currentCategory = "all";
let currentSearch = "";

function renderMenuGrid() {
    const grid = document.getElementById("menuGrid");
    if (!grid) return;
    
    let filtered = products.filter(p => {
        const matchCat = currentCategory === "all" || p.category === currentCategory;
        const matchSearch = p.name.toLowerCase().includes(currentSearch.toLowerCase());
        return matchCat && matchSearch;
    });
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-menu">Menu tidak ditemukan 😢</div>';
        return;
    }
    
    grid.innerHTML = filtered.map(product => `
        <div class="menu-card">
            <div class="menu-card-emoji">${product.image}</div>
            <div class="menu-card-name">${product.name}</div>
            <div class="menu-card-price">Rp ${product.price.toLocaleString()}</div>
            <div class="menu-card-stock">Stok: ${product.stock}</div>
            <button class="btn-add-cart" onclick="addToCart(${product.id})">
                + Tambah ke Keranjang
            </button>
        </div>
    `).join("");
}

function filterCategory(category, btnElement) {
    currentCategory = category;
    document.querySelectorAll(".cat-tab").forEach(btn => btn.classList.remove("active"));
    if (btnElement) btnElement.classList.add("active");
    renderMenuGrid();
}

function filterMenu() {
    currentSearch = document.getElementById("searchMenu")?.value || "";
    renderMenuGrid();
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    if (product.stock <= 0) {
        showToast("Stok habis!", true);
        return;
    }
    
    const existing = cart.find(item => item.productId === productId);
    if (existing) {
        if (product.stock > existing.qty) {
            existing.qty++;
        } else {
            showToast("Stok tidak mencukupi!", true);
            return;
        }
    } else {
        cart.push({ productId, name: product.name, price: product.price, qty: 1 });
    }
    
    saveToLocalStorage();
    updateCartCount();
    showToast(`${product.name} ditambahkan ke keranjang!`);
}

// ==================== TRANSACTION PAGE ====================
function renderCartList() {
    const cartList = document.getElementById("cartList");
    if (!cartList) return;
    
    if (cart.length === 0) {
        cartList.innerHTML = '<div class="cart-empty">Keranjang masih kosong. Tambah menu dulu!</div>';
        return;
    }
    
    cartList.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">Rp ${item.price.toLocaleString()} x ${item.qty}</div>
            </div>
            <div class="cart-item-actions">
                <button class="cart-qty-btn" onclick="updateCartQty(${item.productId}, -1)">-</button>
                <span class="cart-qty">${item.qty}</span>
                <button class="cart-qty-btn" onclick="updateCartQty(${item.productId}, 1)">+</button>
                <button class="cart-remove-btn" onclick="removeFromCart(${item.productId})">🗑️</button>
            </div>
        </div>
    `).join("");
}

function updateCartQty(productId, delta) {
    const item = cart.find(i => i.productId === productId);
    if (item) {
        const product = products.find(p => p.id === productId);
        const newQty = item.qty + delta;
        if (newQty <= 0) {
            cart = cart.filter(i => i.productId !== productId);
        } else if (product && product.stock >= newQty) {
            item.qty = newQty;
        } else {
            showToast("Stok tidak mencukupi!", true);
            return;
        }
    }
    saveToLocalStorage();
    renderCartList();
    updateSummary();
    updateCartCount();
}

function removeFromCart(productId) {
    cart = cart.filter(i => i.productId !== productId);
    saveToLocalStorage();
    renderCartList();
    updateSummary();
    updateCartCount();
}

function selectDelivery(method) {
    deliveryMethod = method;
    
    document.querySelectorAll(".delivery-opt").forEach(opt => opt.classList.remove("active"));
    if (method === "pickup") document.getElementById("optPickup")?.classList.add("active");
    if (method === "queue") document.getElementById("optQueue")?.classList.add("active");
    if (method === "delivery") document.getElementById("optDelivery")?.classList.add("active");
    
    const deliveryAddressDiv = document.getElementById("deliveryAddress");
    const queueSection = document.getElementById("queueSection");
    
    if (method === "delivery") {
        deliveryAddressDiv.style.display = "block";
        queueSection.style.display = "none";
    } else if (method === "queue") {
        deliveryAddressDiv.style.display = "none";
        queueSection.style.display = "block";
        const queueTimeSelect = document.getElementById("queueTime");
        const queueFeeInfo = document.getElementById("queueFeeInfo");
        if (queueTimeSelect) {
            const isPeak = queueTimeSelect.value === "09:30" || queueTimeSelect.value === "12:00";
            queueFeeInfo.innerHTML = isPeak ? "⏰ Jam padat! Biaya antrian Rp 2.000" : "✅ Biaya antrian normal (gratis)";
        }
    } else {
        deliveryAddressDiv.style.display = "none";
        queueSection.style.display = "none";
    }
    
    updateSummary();
}

function updateDeliveryUI() {
    selectDelivery(deliveryMethod);
}

function updateQueueFee() {
    const queueTimeSelect = document.getElementById("queueTime");
    if (queueTimeSelect && deliveryMethod === "queue") {
        const isPeak = queueTimeSelect.value === "09:30" || queueTimeSelect.value === "12:00";
        const queueFeeInfo = document.getElementById("queueFeeInfo");
        if (queueFeeInfo) {
            queueFeeInfo.innerHTML = isPeak ? "⏰ Jam padat! Biaya antrian Rp 2.000" : "✅ Biaya antrian normal (gratis)";
        }
        updateSummary();
    }
}

function updateSummary() {
    const { subtotal, discount, queueFee, deliveryFee, total } = calculateTotal();
    
    document.getElementById("sumSubtotal").innerHTML = `Rp ${subtotal.toLocaleString()}`;
    
    const isMemberUser = isUserMember();
    const discountRow = document.getElementById("discountRow");
    if (isMemberUser && discount > 0) {
        discountRow.style.display = "flex";
        document.getElementById("sumDiscount").innerHTML = `-Rp ${discount.toLocaleString()}`;
    } else {
        discountRow.style.display = "none";
    }
    
    const queueRow = document.getElementById("queueFeeRow");
    if (deliveryMethod === "queue" && queueFee > 0) {
        queueRow.style.display = "flex";
        document.getElementById("sumQueueFee").innerHTML = `Rp ${queueFee.toLocaleString()}`;
    } else {
        queueRow.style.display = "none";
    }
    
    const deliveryRow = document.getElementById("deliveryFeeRow");
    if (deliveryMethod === "delivery" && deliveryFee > 0) {
        deliveryRow.style.display = "flex";
        document.getElementById("sumDelivery").innerHTML = `Rp ${deliveryFee.toLocaleString()}`;
    } else {
        deliveryRow.style.display = "none";
    }
    
    document.getElementById("sumTotal").innerHTML = `Rp ${total.toLocaleString()}`;
    
    const memberNotice = document.getElementById("memberNotice");
    if (memberNotice) {
        memberNotice.style.display = isMemberUser ? "block" : "none";
    }
}

function checkout() {
    if (cart.length === 0) {
        showToast("Keranjang kosong!", true);
        return;
    }
    
    const { subtotal, discount, queueFee, deliveryFee, total } = calculateTotal();
    const isMemberUser = isUserMember();
    
    let queueTimeValue = "";
    if (deliveryMethod === "queue") {
        const select = document.getElementById("queueTime");
        queueTimeValue = select?.value || "09:30";
        
        const isPeak = queueTimeValue === "09:30" || queueTimeValue === "12:00";
        if (!isPeak && queueFee > 0) {
            // Recalculate if needed
        }
    }
    
    let address = "";
    let note = "";
    if (deliveryMethod === "delivery") {
        address = document.getElementById("deliveryLoc")?.value || "Kelas tidak diisi";
        note = document.getElementById("deliveryNote")?.value || "";
    }
    
    const transaction = {
        id: Date.now(),
        userId: currentUser.id,
        userName: currentUser.name,
        items: [...cart],
        subtotal: subtotal,
        discount: discount,
        queueFee: queueFee,
        deliveryFee: deliveryFee,
        total: total,
        deliveryMethod: deliveryMethod,
        queueTime: queueTimeValue,
        deliveryAddress: address,
        deliveryNote: note,
        date: new Date().toLocaleString(),
        status: "completed"
    };
    
    transactions.unshift(transaction);
    
    // Update stock
    cart.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) product.stock -= item.qty;
    });
    
    // Update user stats
    if (currentUser) {
        currentUser.totalSpent = (currentUser.totalSpent || 0) + total;
        currentUser.totalDiscount = (currentUser.totalDiscount || 0) + discount;
        currentUser.transactionCount = (currentUser.transactionCount || 0) + 1;
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = { ...currentUser };
        }
    }
    
    cart = [];
    saveToLocalStorage();
    
    // Show modal
    document.getElementById("modalTitle").innerHTML = "🎉 Pesanan Berhasil! 🎉";
    let methodText = "";
    if (deliveryMethod === "pickup") methodText = "Ambil sendiri di kantin";
    else if (deliveryMethod === "queue") methodText = `Antrian online jam ${queueTimeValue}`;
    else methodText = `Pesan antar ke ${address}`;
    
    document.getElementById("modalDesc").innerHTML = `Total bayar: Rp ${total.toLocaleString()}<br><small>${methodText}</small>`;
    document.getElementById("modalDetail").innerHTML = "";
    document.getElementById("checkoutModal").style.display = "flex";
    
    updateCartCount();
    
    if (currentUser?.role === "admin") {
        renderAdminDashboard();
    }
}

function closeModal() {
    document.getElementById("checkoutModal").style.display = "none";
    showPage("home");
}

// ==================== PROFILE PAGE ====================
function renderProfilePage() {
    if (!currentUser) return;
    
    const isMember = isUserMember();
    const memberData = MEMBERS.find(m => m.username === currentUser.username);
    
    document.getElementById("profileName").textContent = currentUser.name;
    document.getElementById("profileUsername").textContent = `@${currentUser.username}`;
    document.getElementById("profileAvatar").textContent = currentUser.name.charAt(0);
    
    const badge = document.getElementById("profileMemberBadge");
    if (isMember) {
        badge.innerHTML = '<span class="member-badge-gold">✨ MEMBER GOLD (Diskon 20%) ✨</span>';
    } else {
        badge.innerHTML = '<span class="member-badge-silver">Member Reguler</span>';
    }
    
    document.getElementById("psTrxCount").textContent = currentUser.transactionCount || 0;
    document.getElementById("psTotalSpend").innerHTML = `Rp ${(currentUser.totalSpent || 0).toLocaleString()}`;
    document.getElementById("psDiscount").innerHTML = `Rp ${(currentUser.totalDiscount || 0).toLocaleString()}`;
    
    document.getElementById("piName").textContent = currentUser.name;
    document.getElementById("piUsername").textContent = currentUser.username;
    document.getElementById("piPhone").textContent = currentUser.phone || "-";
    document.getElementById("piStatus").textContent = currentUser.role === "admin" ? "Administrator" : "Siswa/Santri";
    document.getElementById("piMember").innerHTML = isMember ? "✅ Gold Member (diskon 20%)" : "Regular Member";
    
    // User's transaction history
    const userTrx = transactions.filter(t => t.userId === currentUser.id);
    const trxList = document.getElementById("profileTrxList");
    if (userTrx.length === 0) {
        trxList.innerHTML = '<div class="empty-hist">Belum ada transaksi</div>';
    } else {
        trxList.innerHTML = userTrx.map(trx => `
            <div class="history-item">
                <div class="hi-date">${trx.date}</div>
                <div class="hi-items">${trx.items.map(i => `${i.name} x${i.qty}`).join(", ")}</div>
                <div class="hi-total">Rp ${trx.total.toLocaleString()}</div>
            </div>
        `).join("");
    }
}

// ==================== ADMIN PAGE ====================
function switchAdminTab(tab, btnElement) {
    document.querySelectorAll(".admin-tab-content").forEach(content => {
        content.classList.remove("active");
    });
    document.getElementById(`adminTab-${tab}`).classList.add("active");
    
    document.querySelectorAll(".admin-tab").forEach(btn => btn.classList.remove("active"));
    if (btnElement) btnElement.classList.add("active");
    
    if (tab === "menu") renderAdminMenuList();
    if (tab === "orders") renderAdminOrders();
    if (tab === "members") renderAdminMembers();
}

function renderAdminDashboard() {
    const totalTrx = transactions.length;
    const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
    const totalUsers = users.filter(u => u.role === "user").length;
    const totalMembers = MEMBERS.length;
    
    document.getElementById("statTotalTrx").textContent = totalTrx;
    document.getElementById("statRevenue").innerHTML = `Rp ${totalRevenue.toLocaleString()}`;
    document.getElementById("statUsers").textContent = totalUsers;
    document.getElementById("statMembers").textContent = totalMembers;
    
    const recentTrx = transactions.slice(0, 10);
    const adminTrxList = document.getElementById("adminTrxList");
    if (recentTrx.length === 0) {
        adminTrxList.innerHTML = '<div class="empty-hist">Belum ada transaksi</div>';
    } else {
        adminTrxList.innerHTML = `
            <table class="admin-table">
                <thead><tr><th>Tanggal</th><th>Pembeli</th><th>Item</th><th>Total</th></tr></thead>
                <tbody>
                    ${recentTrx.map(trx => `
                        <tr>
                            <td>${trx.date}</td>
                            <td>${trx.userName}</td>
                            <td>${trx.items.length} item</td>
                            <td>Rp ${trx.total.toLocaleString()}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;
    }
}

function renderAdminMenuList() {
    const container = document.getElementById("adminMenuList");
    if (!container) return;
    
    container.innerHTML = `
        <table class="admin-table">
            <thead><tr><th>ID</th><th>Menu</th><th>Kategori</th><th>Harga</th><th>Stok</th><th>Aksi</th></tr></thead>
            <tbody>
                ${products.map(product => `
                    <tr>
                        <td>${product.id}</td>
                        <td>${product.image} ${product.name}</td>
                        <td>${product.category}</td>
                        <td>Rp ${product.price.toLocaleString()}</td>
                        <td>${product.stock}</td>
                        <td><button class="btn-small" onclick="deleteMenu(${product.id})">Hapus</button></td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;
}

function addMenu() {
    const name = document.getElementById("newMenuName")?.value.trim();
    const price = parseInt(document.getElementById("newMenuPrice")?.value);
    const category = document.getElementById("newMenuCat")?.value;
    const stock = parseInt(document.getElementById("newMenuStock")?.value);
    
    if (!name || !price || !stock) {
        showToast("Semua field harus diisi!", true);
        return;
    }
    
    const newId = Math.max(...products.map(p => p.id), 0) + 1;
    products.push({
        id: newId,
        name: name,
        price: price,
        category: category,
        stock: stock,
        image: "🍽️"
    });
    
    saveToLocalStorage();
    renderAdminMenuList();
    showToast("Menu berhasil ditambahkan!");
    
    document.getElementById("newMenuName").value = "";
    document.getElementById("newMenuPrice").value = "";
    document.getElementById("newMenuStock").value = "";
}

function deleteMenu(productId) {
    products = products.filter(p => p.id !== productId);
    saveToLocalStorage();
    renderAdminMenuList();
    showToast("Menu dihapus!");
}

function renderAdminOrders() {
    const container = document.getElementById("adminOrdersList");
    if (!container) return;
    
    if (transactions.length === 0) {
        container.innerHTML = '<div class="empty-hist">Belum ada pesanan</div>';
        return;
    }
    
    container.innerHTML = transactions.map(trx => `
        <div class="order-card">
            <div class="order-header">
                <span class="order-id">#${trx.id}</span>
                <span class="order-date">${trx.date}</span>
            </div>
            <div class="order-customer">👤 ${trx.userName}</div>
            <div class="order-items">${trx.items.map(i => `${i.name} x${i.qty}`).join(", ")}</div>
            <div class="order-method">
                ${trx.deliveryMethod === "pickup" ? "🏪 Ambil Sendiri" : 
                  trx.deliveryMethod === "queue" ? `⏰ Antrian ${trx.queueTime}` : 
                  `🛵 Antar ke ${trx.deliveryAddress}`}
            </div>
            <div class="order-total">Total: Rp ${trx.total.toLocaleString()}</div>
        </div>
    `).join("");
}

function renderAdminMembers() {
    const container = document.getElementById("adminMembersList");
    if (!container) return;
    
    container.innerHTML = MEMBERS.map(member => `
        <div class="member-admin-card">
            <div class="member-avatar-admin">${member.name.charAt(0)}</div>
            <div class="member-info-admin">
                <div class="member-name-admin">${member.name}</div>
                <div class="member-username-admin">@${member.username}</div>
                <div class="member-discount-admin">✨ Diskon 20% setiap transaksi</div>
            </div>
        </div>
    `).join("");
}

// ==================== SCROLL FEATURE ====================
function scrollFeatures() {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
}

// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", () => {
    loadFromLocalStorage();
    
    // Set queue time listener
    const queueSelect = document.getElementById("queueTime");
    if (queueSelect) {
        queueSelect.addEventListener("change", updateQueueFee);
    }
    
    if (currentUser) {
        showPage("home");
    } else {
        showPage("landing");
    }
    
    updateCartCount();
});