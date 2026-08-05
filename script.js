// ==========================================
// 1. إعدادات العملات والأسعار
// ==========================================
const currencyConfig = {
    USD: { symbol: '$', rate: 1, position: 'before' },
    EUR: { symbol: '€', rate: 0.92, position: 'after' },
    DZD: { symbol: 'د.ج', rate: 135, position: 'after' }
};

let currentCurrency = 'DZD';

function formatPrice(basePriceUSD) {
    const config = currencyConfig[currentCurrency] || currencyConfig['USD'];
    const converted = Math.round(basePriceUSD * config.rate);
    if (config.position === 'before') {
        return `${config.symbol} ${converted}`;
    } else {
        return `${converted} ${config.symbol}`;
    }
}

function changeCurrency(curr) {
    currentCurrency = curr;
    renderProducts();
    if (selectedProduct) {
        const priceElement = document.getElementById('product-price');
        if (priceElement) priceElement.innerText = formatPrice(selectedProduct.basePrice);
    }
}

// ==========================================
// نظام صلاحيات صاحب المتجر، المشرفين والقائمة السوداء
// ==========================================
let currentUser = {
    role: 'owner', // القيم الممكنة: 'owner', 'admin', 'customer', 'banned'
    username: 'Ahmed Bouakel'
};

let adminsList = []; 
let blacklistedCustomers = []; 
let storeOrders = []; 

function openOwnerDashboard() {
    if (currentUser.role !== 'owner') {
        alert("عذراً، هذه اللوحة مخصصة لصاحب المتجر الأساسي فقط!");
        return;
    }
    
    let modal = document.getElementById('owner-dashboard-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'owner-dashboard-modal';
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 class="text-sm font-bold text-neutral-900">لوحة تحكم صاحب المتجر الإدارية</h3>
                    <button onclick="closeOwnerDashboard()" class="text-neutral-400 hover:text-neutral-700 text-sm font-bold cursor-pointer">✕</button>
                </div>
                
                <div class="mb-6">
                    <h4 class="text-xs font-bold text-amber-600 mb-2">إدارة المشرفين</h4>
                    <div class="flex gap-2 mb-2">
                        <input id="new-admin-name" type="text" placeholder="اسم المشرف الجديد..." class="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2 text-xs outline-none">
                        <button onclick="addAdmin()" class="bg-neutral-900 text-white text-xs px-4 py-2 rounded-xl whitespace-nowrap cursor-pointer">إضافة مشرف</button>
                    </div>
                    <div id="admins-list-container" class="space-y-1 text-xs text-neutral-700"></div>
                </div>

                <div class="mb-6">
                    <h4 class="text-xs font-bold text-red-600 mb-2">القائمة السوداء وحظر الزبائن</h4>
                    <div class="flex gap-2 mb-2">
                        <input id="blacklist-customer-name" type="text" placeholder="اسم أو بريد الزبون للحظر..." class="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2 text-xs outline-none">
                        <button onclick="addToBlacklist()" class="bg-red-600 text-white text-xs px-4 py-2 rounded-xl whitespace-nowrap cursor-pointer">حظر الزبون</button>
                    </div>
                    <div id="blacklist-container" class="space-y-1 text-xs text-neutral-700"></div>
                </div>

                <div>
                    <h4 class="text-xs font-bold text-indigo-600 mb-2">إدارة الطلبات وفواتير الشراء</h4>
                    <div id="orders-dashboard-container" class="space-y-2 text-xs text-neutral-700"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    renderOwnerDashboardData();
    modal.classList.remove('hidden');
}

function closeOwnerDashboard() {
    const modal = document.getElementById('owner-dashboard-modal');
    if (modal) modal.classList.add('hidden');
}

function addAdmin() {
    const input = document.getElementById('new-admin-name');
    const name = input.value.trim();
    if (!name) return;
    adminsList.push(name);
    input.value = '';
    renderOwnerDashboardData();
}

function removeAdmin(index) {
    adminsList.splice(index, 1);
    renderOwnerDashboardData();
}

function addToBlacklist() {
    const input = document.getElementById('blacklist-customer-name');
    const name = input.value.trim();
    if (!name) return;
    blacklistedCustomers.push(name);
    input.value = '';
    renderOwnerDashboardData();
}

function removeFromBlacklist(index) {
    blacklistedCustomers.splice(index, 1);
    renderOwnerDashboardData();
}

function confirmOrder(orderId) {
    let order = storeOrders.find(o => o.id === orderId);
    if (order) {
        order.status = 'مؤكد';
        renderOwnerDashboardData();
        alert(`تم تأكيد الطلب رقم ${orderId} بنجاح!`);
    }
}

function deleteOrder(orderId) {
    if (confirm("هل أنت متأكد من حذف هذا الطلب؟")) {
        storeOrders = storeOrders.filter(o => o.id !== orderId);
        renderOwnerDashboardData();
    }
}

function editOrder(orderId) {
    let order = storeOrders.find(o => o.id === orderId);
    if (!order) return;
    let newPhone = prompt("أدخل رقم الهاتف الجديد للزبون:", order.phone);
    if (newPhone !== null) {
        order.phone = newPhone.trim();
        renderOwnerDashboardData();
        alert("تم تحديث بيانات الطلب بنجاح!");
    }
}

function printOrderInvoice(orderId) {
    let order = storeOrders.find(o => o.id === orderId);
    if (!order) return;

    let invoiceWindow = window.open('', '_blank');
    invoiceWindow.document.write(`
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>فاتورة شراء - طلب #${order.serialNumber}</title>
            <style>
                body { font-family: Tahoma, sans-serif; padding: 30px; color: #333; line-height: 1.6; }
                .invoice-box { max-width: 700px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0,0,0,0.15); border-radius: 10px; }
                h2 { text-align: center; color: #d97706; margin-bottom: 20px; }
                .details-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                .details-table th, .details-table td { border: 1px solid #ddd; padding: 10px; text-align: right; font-size: 13px; }
                .details-table th { background-color: #f9f9f9; }
                .total-section { margin-top: 20px; font-weight: bold; text-align: left; font-size: 15px; }
                .thank-you { text-align: center; margin-top: 30px; font-size: 14px; color: #059669; font-weight: bold; border-top: 1px dashed #ccc; padding-top: 15px; }
            </style>
        </head>
        <body>
            <div class="invoice-box">
                <h2>فاتورة شراء رسمية - Maison BKL</h2>
                <p><strong>الرقم التسلسلي للزبون/الطلب:</strong> #${order.serialNumber}</p>
                <p><strong>اسم الزبون:</strong> ${order.customerName}</p>
                <p><strong>رقم الهاتف:</strong> ${order.phone}</p>
                <p><strong>العنوان الكامل:</strong> ${order.address}</p>
                
                <table class="details-table">
                    <tr>
                        <th>نوع المنتج والخيارات</th>
                        <th>الكمية</th>
                        <th>مبلغ المنتج</th>
                        <th>مبلغ التوصيل</th>
                    </tr>
                    <tr>
                        <td>${order.productName}</td>
                        <td>${order.quantity}</td>
                        <td>${order.productPrice}</td>
                        <td>${order.deliveryFee}</td>
                    </tr>
                </table>
                
                <div class="total-section">
                    المبلغ الإجمالي: ${order.totalAmount}
                </div>
                
                <div class="thank-you">
                    شكراً لك على التعامل مع متجرنا، نتمنى زيارتك مرة أخرى!
                </div>
            </div>
            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `);
    invoiceWindow.document.close();
}

function renderOwnerDashboardData() {
    const adminsContainer = document.getElementById('admins-list-container');
    const blacklistContainer = document.getElementById('blacklist-container');
    const ordersContainer = document.getElementById('orders-dashboard-container');

    if (adminsContainer) {
        adminsContainer.innerHTML = adminsList.length === 0 ? '<span class="text-neutral-400 text-[11px]">لا يوجد مشرفين مضافين حالياً</span>' :
            adminsList.map((admin, idx) => `
                <div class="flex justify-between items-center bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                    <span>${admin}</span>
                    <button onclick="removeAdmin(${idx})" class="text-red-500 hover:text-red-700 text-[11px] cursor-pointer">حذف</button>
                </div>
            `).join('');
    }

    if (blacklistContainer) {
        blacklistContainer.innerHTML = blacklistedCustomers.length === 0 ? '<span class="text-neutral-400 text-[11px]">القائمة السوداء فارغة</span>' :
            blacklistedCustomers.map((cust, idx) => `
                <div class="flex justify-between items-center bg-red-50 p-2 rounded-lg border border-red-100 text-red-900">
                    <span>${cust}</span>
                    <button onclick="removeFromBlacklist(${idx})" class="text-neutral-600 hover:text-neutral-900 text-[11px] cursor-pointer">إلغاء الحظر</button>
                </div>
            `).join('');
    }

    if (ordersContainer) {
        ordersContainer.innerHTML = storeOrders.length === 0 ? '<span class="text-neutral-400 text-[11px]">لا توجد طلبات جديدة حالياً</span>' :
            storeOrders.map((ord) => `
                <div class="bg-neutral-50 p-3 rounded-xl border border-neutral-200 flex flex-col gap-2">
                    <div class="flex justify-between items-center font-bold text-neutral-800">
                        <span>الزبون: ${ord.customerName} (#${ord.serialNumber})</span>
                        <span class="text-[10px] px-2 py-0.5 rounded ${ord.status === 'مؤكد' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}">${ord.status || 'قيد الانتظار'}</span>
                    </div>
                    <div class="text-neutral-600 text-[11px]">
                        المنتج: ${ord.productName} | الإجمالي: ${ord.totalAmount}
                    </div>
                    <div class="flex gap-2 pt-1 border-t border-neutral-200">
                        <button onclick="confirmOrder('${ord.id}')" class="bg-green-600 text-white px-2.5 py-1 rounded-lg text-[10px] cursor-pointer">تأكيد الطلب</button>
                        <button onclick="editOrder('${ord.id}')" class="bg-amber-500 text-white px-2.5 py-1 rounded-lg text-[10px] cursor-pointer">تعديل الطلب</button>
                        <button onclick="deleteOrder('${ord.id}')" class="bg-red-600 text-white px-2.5 py-1 rounded-lg text-[10px] cursor-pointer">حذف الطلب</button>
                        <button onclick="printOrderInvoice('${ord.id}')" class="bg-neutral-900 text-white px-2.5 py-1 rounded-lg text-[10px] cursor-pointer mr-auto">طباعة الفاتورة</button>
                    </div>
                </div>
            `).join('');
    }
}

// ==========================================
// 2. قواميس الترجمة الشاملة
// ==========================================
const translations = {
    ar: {
        subtitle: "تشكيلة جديدة",
        mainTitle: "أحدث المنتجات العصرية",
        shopNow: "تسوق الآن",
        addProduct: "+ إضافة منتج جديد",
        addCategory: "+ تصنيف جديد",
        bestSellers: "الأكثر مبيعاً",
        latestProducts: "أفضل المنتجات",
        storeSubtitle: "تسوق أفضل المنتجات مع خدمة التوصيل السريع والدفع الآمن",
        store: "المتجر",
        cart: "السلة",
        account: "حسابي",
        productListTitle: "قائمة المنتجات (اضغط على أي صورة لعرض المعرض)",
        modalTitleAdd: "إضافة منتج جديد",
        modalTitleEdit: "تعديل المنتج",
        modalTitleCategory: "إضافة تصنيف جديد",
        lblProdName: "اسم المنتج",
        lblProdPrice: "السعر (بالدولار الأساسي USD)",
        lblCurrentImgs: "صور المنتج الحالية",
        lblAddNewImgs: "إضافة صورة جديدة مع اللون والمقاس",
        lblProdDesc: "الوصف",
        btnCancel: "إلغاء",
        btnSave: "حفظ",
        back: "← رجوع",
        detailsTitle: "تفاصيل المنتج",
        quantityLabel: "الكمية المطلوبة:",
        buy: "شراء",
        cartTitle: "سلة المشتريات",
        total: "المجموع:",
        proceed: "الانتقال إلى الدفع",
        paymentTitle: "بيانات التوصيل والدفع",
        secDelivery: "معلومات التوصيل",
        secPayment: "معلومات الدفع",
        lblFirstname: "الاسم",
        lblLastname: "اللقب",
        lblDetailedAddress: "العنوان بالتفصيل",
        lblCountry: "البلد",
        lblState: "الولاية / المقاطعة",
        lblMunicipality: "البلدية",
        lblPhone: "رقم الهاتف",
        phFirstname: "الاسم...",
        phLastname: "اللقب...",
        phDetailedAddress: "العنوان بالتفصيل...",
        phMunicipality: "البلدية...",
        phPhone: "رقم الهاتف...",
        cardType: "نوع البطاقة",
        cardNum: "رقم البطاقة",
        month: "الشهر (MM)",
        year: "السنة (YY)",
        cvv: "رمز الأمان (CVV)",
        payNow: "ادفع الآن",
        successTitle: "تم تأكيد الطلب!",
        successDesc: "شكراً لك، تم استلام طلبك بنجاح وجاري تجهيزه للشحن.",
        backHome: "العودة للرئيسية",
        defaultDesc: "منتج فاخر عالي الجودة.",
        noImages: "لا توجد صور حالية",
        deleteConfirm: "هل أنت متأكد من حذف هذا المنتج؟",
        priceAlert: "يرجى إدخال اسم المنتج وسعر صحيح بالدولار!"
    },
    en: {
        subtitle: "New Collection",
        mainTitle: "Latest Trendy Products",
        shopNow: "Shop Now",
        addProduct: "+ Add New Product",
        addCategory: "+ New Category",
        bestSellers: "Best Sellers",
        latestProducts: "Latest Products",
        storeSubtitle: "Shop the best products with fast delivery and secure payment",
        store: "Store",
        cart: "Cart",
        account: "Account",
        productListTitle: "Product List (Click any image to view gallery)",
        modalTitleAdd: "Add New Product",
        modalTitleEdit: "Edit Product",
        modalTitleCategory: "Add New Category",
        lblProdName: "Product Name",
        lblProdPrice: "Price (Base USD)",
        lblCurrentImgs: "Current Images",
        lblAddNewImgs: "Add New Image with Color and Size",
        lblProdDesc: "Description",
        btnCancel: "Cancel",
        btnSave: "Save",
        back: "← Back",
        detailsTitle: "Product Details",
        quantityLabel: "Quantity:",
        buy: "Buy",
        cartTitle: "Shopping Cart",
        total: "Total:",
        proceed: "Proceed to Checkout",
        paymentTitle: "Checkout Details",
        secDelivery: "Delivery Information",
        secPayment: "Payment Details",
        lblFirstname: "First Name",
        lblLastname: "Last Name",
        lblDetailedAddress: "Detailed Address",
        lblCountry: "Country",
        lblState: "State / Province",
        lblMunicipality: "Municipality",
        lblPhone: "Phone Number",
        phFirstname: "First Name...",
        phLastname: "Last Name...",
        phDetailedAddress: "Detailed Address...",
        phMunicipality: "Municipality...",
        phPhone: "Phone Number...",
        cardType: "Card Type",
        cardNum: "Card Number",
        month: "Month (MM)",
        year: "Year (YY)",
        cvv: "CVV",
        payNow: "Pay Now",
        successTitle: "Order Confirmed!",
        successDesc: "Thank you, your order has been successfully placed.",
        backHome: "Back to Home",
        defaultDesc: "High quality luxury product.",
        noImages: "No current images",
        deleteConfirm: "Are you sure you want to delete this product?",
        priceAlert: "Please enter a product name and a valid USD price!"
    },
    fr: {
        subtitle: "Nouvelle Collection",
        mainTitle: "Derniers Produits Tendance",
        shopNow: "Acheter",
        addProduct: "+ Ajouter un produit",
        addCategory: "+ Nouvelle Catégorie",
        bestSellers: "Meilleures Ventes",
        latestProducts: "Derniers Produits",
        storeSubtitle: "Achetez les meilleurs produits avec livraison rapide et paiement sécurisé",
        store: "Boutique",
        cart: "Panier",
        account: "Compte",
        productListTitle: "Liste des produits",
        modalTitleAdd: "Ajouter un produit",
        modalTitleEdit: "Modifier le produit",
        modalTitleCategory: "Ajouter une catégorie",
        lblProdName: "Nom du produit",
        lblProdPrice: "Prix (USD de base)",
        lblCurrentImgs: "Images actuelles",
        lblAddNewImgs: "Ajouter une nouvelle image avec couleur et taille",
        lblProdDesc: "Description",
        btnCancel: "Annuler",
        btnSave: "Enregistrer",
        back: "← Retour",
        detailsTitle: "Détails du produit",
        quantityLabel: "Quantité:",
        buy: "Acheter",
        cartTitle: "Panier",
        total: "Total :",
        proceed: "Procéder au paiement",
        paymentTitle: "Détails de livraison et paiement",
        secDelivery: "Informations de livraison",
        secPayment: "Informations de paiement",
        lblFirstname: "Prénom",
        lblLastname: "Nom",
        lblDetailedAddress: "Adresse détaillée",
        lblCountry: "Pays",
        lblState: "État / Province",
        lblMunicipality: "Municipalité",
        lblPhone: "Numéro de téléphone",
        phFirstname: "Prénom...",
        phLastname: "Nom...",
        phDetailedAddress: "Adresse détaillée...",
        phMunicipality: "Municipalité...",
        phPhone: "Numéro de téléphone...",
        cardType: "Type de carte",
        cardNum: "Numéro de carte",
        month: "Mois (MM)",
        year: "Année (YY)",
        cvv: "CVV",
        payNow: "Payer maintenant",
        successTitle: "Commande confirmée !",
        successDesc: "Merci, votre commande a été reçue avec succès.",
        backHome: "Retour à l'accueil",
        defaultDesc: "Produit de luxe de haute qualité.",
        noImages: "Aucune image actuelle",
        deleteConfirm: "Êtes-vous sûr de vouloir supprimer ce produit ?",
        priceAlert: "Veuillez entrer un nom de produit et un prix valide en USD !"
    },
    es: {
        subtitle: "Nueva Colección",
        mainTitle: "Últimos Productos",
        shopNow: "Comprar",
        addProduct: "+ Añadir Producto",
        addCategory: "+ Nueva Categoría",
        bestSellers: "Más Vendidos",
        latestProducts: "Últimos Productos",
        storeSubtitle: "Compra los mejores productos con entrega rápida y pago seguro",
        store: "Tienda",
        cart: "Carrito",
        account: "Cuenta",
        productListTitle: "Lista de productos",
        modalTitleAdd: "Añadir Nuevo Producto",
        modalTitleEdit: "Editar Producto",
        modalTitleCategory: "Añadir Nueva Categoría",
        lblProdName: "Nombre del Producto",
        lblProdPrice: "Precio (USD Base)",
        lblCurrentImgs: "Imágenes Actuales",
        lblAddNewImgs: "Añadir Nueva Imagen con Color y Talla",
        lblProdDesc: "Descripción",
        btnCancel: "Cancelar",
        btnSave: "Guardar",
        back: "← Volver",
        detailsTitle: "Detalles del Producto",
        quantityLabel: "Cantidad:",
        buy: "Comprar",
        cartTitle: "Carrito de Compras",
        total: "Total:",
        proceed: "Proceder al Pago",
        paymentTitle: "Detalles de Envío y Pago",
        secDelivery: "Información de Entrega",
        secPayment: "Detalles del Pago",
        lblFirstname: "Nombre",
        lblLastname: "Apellidos",
        lblDetailedAddress: "Dirección detallada",
        lblCountry: "País",
        lblState: "Estado / Provincia",
        lblMunicipality: "Municipio",
        lblPhone: "Número de Teléfono",
        phFirstname: "Nombre...",
        phLastname: "Apellidos...",
        phDetailedAddress: "Dirección detallada...",
        phMunicipality: "Municipio...",
        phPhone: "Número de Teléfono...",
        cardType: "Tipo de Tarjeta",
        cardNum: "Número de Tarjeta",
        month: "Mes (MM)",
        year: "Año (YY)",
        cvv: "CVV",
        payNow: "Pagar Ahora",
        successTitle: "¡Pedido Confirmado!",
        successDesc: "Gracias, su pedido ha sido recibido con éxito.",
        backHome: "Volver al Inicio",
        defaultDesc: "Producto de lujo de alta calidad.",
        noImages: "No hay imágenes actuales",
        deleteConfirm: "¿Estás seguro de que deseas eliminar este producto?",
        priceAlert: "¡Por favor ingresa un nombre de producto y un precio válido en USD!"
    },
    de: {
        subtitle: "Neue Kollektion",
        mainTitle: "Neueste Produkte",
        shopNow: "Jetzt Kaufen",
        addProduct: "+ Produkt Hinzufügen",
        addCategory: "+ Neue Kategorie",
        bestSellers: "Bestseller",
        latestProducts: "Neueste Produkte",
        storeSubtitle: "Kaufen Sie die besten Produkte mit schnellem Versand",
        store: "Geschäft",
        cart: "Warenkorb",
        account: "Konto",
        productListTitle: "Produktliste",
        modalTitleAdd: "Neues Produkt Hinzufügen",
        modalTitleEdit: "Produkt Bearbeiten",
        modalTitleCategory: "Neue Kategorie Hinzufügen",
        lblProdName: "Produktname",
        lblProdPrice: "Preis (Basis USD)",
        lblCurrentImgs: "Aktuelle Bilder",
        lblAddNewImgs: "Neues Bild mit Farbe und Größe hinzufügen",
        lblProdDesc: "Beschreibung",
        btnCancel: "Abbrechen",
        btnSave: "Speichern",
        back: "← Zurück",
        detailsTitle: "Produktdetails",
        quantityLabel: "Menge:",
        buy: "Kaufen",
        cartTitle: "Warenkorb",
        total: "Gesamt:",
        proceed: "Zur Kasse",
        paymentTitle: "Liefer- und Zahlungsdetails",
        secDelivery: "Lieferinformationen",
        secPayment: "Zahlungsdetails",
        lblFirstname: "Vorname",
        lblLastname: "Nachname",
        lblDetailedAddress: "Detaillierte Adresse",
        lblCountry: "Land",
        lblState: "Bundesland / Provinz",
        lblMunicipality: "Gemeinde",
        lblPhone: "Telefonnummer",
        phFirstname: "Vorname...",
        phLastname: "Nachname...",
        phDetailedAddress: "Detaillierte Adresse...",
        phMunicipality: "Gemeinde...",
        phPhone: "Telefonnummer...",
        cardType: "Kartentyp",
        cardNum: "Kartennummer",
        month: "Monat (MM)",
        year: "Jahr (YY)",
        cvv: "CVV",
        payNow: "Jetzt Bezahlen",
        successTitle: "Bestellung Bestätigt!",
        successDesc: "Vielen Dank, Ihre Bestellung wurde erfolgreich aufgegeben.",
        backHome: "Zur Startseite",
        defaultDesc: "Hochwertiges Luxusprodukt.",
        noImages: "Keine aktuellen Bilder",
        deleteConfirm: "Sind Sie sicher, dass Sie dieses Produkt löschen möchten?",
        priceAlert: "Bitte geben Sie einen Produktnamen und einen gültigen USD-Preis ein!"
    },
    zh: {
        subtitle: "全新系列",
        mainTitle: "最新流行商品",
        shopNow: "立即购买",
        addProduct: "+ 添加新商品",
        addCategory: "+ 新分类",
        bestSellers: "热销商品",
        latestProducts: "最新商品",
        storeSubtitle: "以快速配送和安全支付购买最佳商品",
        store: "商店",
        cart: "购物车",
        account: "账户",
        productListTitle: "商品列表",
        modalTitleAdd: "添加新商品",
        modalTitleEdit: "编辑商品",
        modalTitleCategory: "添加新分类",
        lblProdName: "商品名称",
        lblProdPrice: "价格 (基础美元)",
        lblCurrentImgs: "当前图片",
        lblAddNewImgs: "添加带颜色和尺寸的新图片",
        lblProdDesc: "描述",
        btnCancel: "取消",
        btnSave: "保存",
        back: "← 返回",
        detailsTitle: "商品详情",
        quantityLabel: "购买数量：",
        buy: "购买",
        cartTitle: "购物车",
        total: "总计：",
        proceed: "前往结账",
        paymentTitle: "配送与支付详情",
        secDelivery: "配送信息",
        secPayment: "支付信息",
        lblFirstname: "名",
        lblLastname: "姓",
        lblDetailedAddress: "详细地址",
        lblCountry: "国家",
        lblState: "省份 / 地区",
        lblMunicipality: "市镇",
        lblPhone: "电话号码",
        phFirstname: "名...",
        phLastname: "姓...",
        phDetailedAddress: "详细地址...",
        phMunicipality: "市镇...",
        phPhone: "电话号码...",
        cardType: "卡片类型",
        cardNum: "卡号",
        month: "月份 (MM)",
        year: "年份 (YY)",
        cvv: "安全码 (CVV)",
        payNow: "立即支付",
        successTitle: "订单已确认！",
        successDesc: "谢谢您，您的订单已成功提交并正在准备中。",
        backHome: "返回首页",
        defaultDesc: "高质量奢侈品。",
        noImages: "当前无图片",
        deleteConfirm: "您确定要删除此商品吗？",
        priceAlert: "请输入商品名称和有效的美元价格！"
    }
};

let currentLang = 'ar';

function changeLanguage(lang) {
    currentLang = lang;
    const htmlRoot = document.documentElement;
    
    if (lang === 'ar') {
        htmlRoot.setAttribute('dir', 'rtl');
        htmlRoot.setAttribute('lang', 'ar');
        currentCurrency = 'DZD';
    } else if (lang === 'fr' || lang === 'es' || lang === 'de') {
        htmlRoot.setAttribute('dir', 'ltr');
        htmlRoot.setAttribute('lang', lang);
        currentCurrency = 'EUR';
    } else {
        htmlRoot.setAttribute('dir', 'ltr');
        htmlRoot.setAttribute('lang', lang);
        currentCurrency = 'USD';
    }

    const currencySelector = document.getElementById('currency-selector');
    if (currencySelector) currencySelector.value = currentCurrency;

    const t = translations[lang];
    if (!t) return;

    const updateTextById = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    };

    const updatePlaceholderById = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.placeholder = text;
    };

    updateTextById('txt-subtitle', t.subtitle);
    updateTextById('txt-main-title', t.mainTitle);
    updateTextById('btn-shop-now', t.shopNow);
    updateTextById('btn-add-product', t.addProduct);
    updateTextById('btn-add-category', t.addCategory);
    updateTextById('txt-best-sellers', t.bestSellers);
    updateTextById('txt-latest-products', t.latestProducts);
    updateTextById('txt-store-subtitle', t.storeSubtitle);

    updateTextById('nav-store', t.store);
    updateTextById('nav-cart', t.cart);
    updateTextById('nav-account', t.account);

    updateTextById('txt-product-list-title', t.productListTitle);

    updateTextById('lbl-prod-name', t.lblProdName);
    updateTextById('lbl-prod-price', t.lblProdPrice);
    updateTextById('lbl-current-imgs', t.lblCurrentImgs);
    updateTextById('lbl-add-new-imgs', t.lblAddNewImgs);
    updateTextById('lbl-prod-desc', t.lblProdDesc);
    updateTextById('btn-cancel', t.btnCancel);
    updateTextById('btn-save', t.btnSave);

    updateTextById('btn-back-1', t.back);
    updateTextById('txt-details-title', t.detailsTitle);
    updateTextById('lbl-quantity', t.quantityLabel);
    updateTextById('btn-buy', t.buy);

    updateTextById('btn-back-2', t.back);
    updateTextById('txt-cart-title', t.cartTitle);
    updateTextById('txt-total-label', t.total);
    updateTextById('btn-proceed', t.proceed);

    updateTextById('btn-back-3', t.back);
    updateTextById('txt-payment-title', t.paymentTitle);
    updateTextById('sec-delivery-info', t.secDelivery);
    updateTextById('sec-payment-info', t.secPayment);
    updateTextById('lbl-firstname', t.lblFirstname);
    updateTextById('lbl-lastname', t.lblLastname);
    updateTextById('lbl-detailed-address', t.lblDetailedAddress);
    updateTextById('lbl-country', t.lblCountry);
    updateTextById('lbl-municipality', t.lblMunicipality);
    updateTextById('lbl-phone', t.lblPhone);

    updatePlaceholderById('pay-firstname', t.phFirstname);
    updatePlaceholderById('pay-lastname', t.phLastname);
    updatePlaceholderById('pay-detailed-address', t.phDetailedAddress);
    updatePlaceholderById('pay-municipality', t.phMunicipality);
    updatePlaceholderById('pay-phone', t.phPhone);

    updateTextById('lbl-card-type', t.cardType);
    updateTextById('lbl-card-num', t.cardNum);
    updateTextById('lbl-month', t.month);
    updateTextById('lbl-year', t.year);
    updateTextById('lbl-cvv', t.cvv);
    updateTextById('btn-pay-now', t.payNow);

    updateTextById('txt-success-title', t.successTitle);
    updateTextById('txt-success-desc', t.successDesc);
    updateTextById('btn-back-home', t.backHome);

    const editIdInput = document.getElementById('edit-product-id');
    const modalTitle = document.getElementById('modal-title');
    if (editIdInput && modalTitle) {
        modalTitle.innerText = editIdInput.value !== "" ? t.modalTitleEdit : t.modalTitleAdd;
    }

    renderCategoriesTabs();
    renderProducts();
    if (selectedProduct) {
        const priceEl = document.getElementById('product-price');
        if (priceEl) priceEl.innerText = formatPrice(selectedProduct.basePrice);
    }
}

// ==========================================
// 4. المقاسات والألوان الديناميكية والكمية
// ==========================================
let selectedColor = '#000000';
let selectedSize = 'M';
let sizesEnabled = true;

function selectColor(colorCode, element) {
    selectedColor = colorCode;
    const buttons = document.querySelectorAll('#product-colors-container button');
    buttons.forEach(btn => {
        btn.classList.remove('ring-2', 'ring-offset-2', 'ring-amber-600', 'scale-110');
    });
    element.classList.add('ring-2', 'ring-offset-2', 'ring-amber-600', 'scale-110');

    if (selectedProduct && selectedProduct.imageMappings) {
        let mapping = selectedProduct.imageMappings.find(m => m.color.toLowerCase() === colorCode.toLowerCase());
        if (mapping && mapping.image) {
            let imgIdx = selectedProduct.images.indexOf(mapping.image);
            if (imgIdx !== -1) {
                updateProductGallery(imgIdx);
                return;
            }
        }
    }
}

function selectSize(sizeName, element) {
    selectedSize = sizeName;
    const buttons = document.querySelectorAll('.size-btn');
    buttons.forEach(btn => {
        btn.classList.remove('bg-amber-600', 'text-white', 'border-amber-600', 'bg-amber-50');
        btn.classList.add('border-neutral-200', 'text-neutral-700');
    });
    element.classList.remove('border-neutral-200', 'text-neutral-700');
    element.classList.add('bg-amber-600', 'text-white', 'border-amber-600');
}

function incrementQuantity() {
    const qtyInput = document.getElementById('product-quantity');
    if (qtyInput) {
        qtyInput.value = parseInt(qtyInput.value || 1) + 1;
    }
}

function decrementQuantity() {
    const qtyInput = document.getElementById('product-quantity');
    if (qtyInput) {
        let currentVal = parseInt(qtyInput.value || 1);
        if (currentVal > 1) {
            qtyInput.value = currentVal - 1;
        }
    }
}

// ==========================================
// 5. بيانات الولايات ووظائف المتجر والتصنيفات
// ==========================================
const algeriaWilayas = [
    "01 - أدرار", "02 - الشلف", "03 - الأغواط", "04 - أم البواقي", "05 - باتنة",
    "06 - بجاية", "07 - بسكرة", "08 - بشار", "09 - البليدة", "10 - البويرة",
    "11 - تمنراست", "12 - تبسة", "13 - تلمسان", "14 - تيارت", "15 - تيزي وزو",
    "16 - الجزائر", "17 - الجلفة", "18 - جيجل", "19 - سطيف", "20 - سعيدة",
    "21 - سكيكدة", "22 - سيدي بلعباس", "23 - عنابة", "24 - قالمة", "25 - قسنطينة",
    "26 - المدية", "27 - مستغانم", "28 - المسيلة", "29 - معسكر", "30 - ورقلة",
    "31 - وهران", "32 - البيض", "33 - إليزي", "34 - برج بوعريريج", "35 - بومرداس",
    "36 - الطارف", "37 - تندوف", "38 - تيسمسيلت", "39 - الوادي", "40 - خنشلة",
    "41 - سوق أهراس", "42 - تيبازة", "43 - ميلة", "44 - عين الدفلى", "45 - النعامة",
    "46 - عين تموشنت", "47 - غرداية", "48 - غليزان", "49 - المغير", "50 - المنيعة",
    "51 - أولاد جلال", "52 - برج باجي مختار", "53 - بني عباس", "54 - تيميمون",
    "55 - توقرت", "56 - جانت", "57 - عين صالح", "58 - عين قزام"
];

function onCountryChange() {
    const countryElement = document.getElementById('pay-country');
    const stateContainer = document.getElementById('state-container');
    const t = translations[currentLang];
    
    if (!stateContainer || !countryElement) return;
    const country = countryElement.value;

    if (country === 'الجزائر' || country === 'Algeria' || country === 'Algérie') {
        stateContainer.innerHTML = `
            <label id="lbl-state" class="block text-[11px] text-neutral-600 mb-1">${t.lblState}</label>
            <select id="pay-state-select" class="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2 text-xs text-neutral-900 outline-none focus:border-amber-600 transition cursor-pointer">
                ${algeriaWilayas.map(w => `<option value="${w}">${w}</option>`).join('')}
            </select>
        `;
    } else {
        stateContainer.innerHTML = `
            <label id="lbl-state" class="block text-[11px] text-neutral-600 mb-1">${t.lblState}</label>
            <input id="pay-state-input" type="text" placeholder="" class="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2 text-xs text-neutral-900 outline-none focus:border-amber-600 transition">
        `;
    }
}

let categories = [
    { id: 'all', name: { ar: 'الكل', en: 'All', fr: 'Tous', es: 'Todos', de: 'Alle', zh: '全部' } },
    { id: 'electronics', name: { ar: 'إلكترونيات', en: 'Electronics', fr: 'Électronique', es: 'Electrónica', de: 'Elektronik', zh: '电子产品' } },
    { id: 'fashion', name: { ar: 'أزياء وموضة', en: 'Fashion', fr: 'Mode', es: 'Moda', de: 'Mode', zh: '时尚' } },
    { id: 'smart-home', name: { ar: 'المنزل الذكي', en: 'Smart Home', fr: 'Maison Intelligente', es: 'Hogar Inteligente', de: 'Smart Home', zh: '智能家居' } }
];

let products = [
    {
        id: 1,
        name: "Luxury Leather Bag",
        category: "fashion",
        basePrice: 450,
        images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400"],
        description: "حقيبة فاخرة مصممة بأعلى معايير الجودة لتناسب إطللتك المميزة.",
        sizesEnabled: true,
        sizes: ["S", "M", "L"],
        imageMappings: [{ image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400", color: "#000000", size: "S" }]
    },
    {
        id: 2,
        name: "Classic Gold Watch",
        category: "electronics",
        basePrice: 890,
        images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400"],
        description: "ساعة يد كلاسيكية مطلية بالذهب الخالص.",
        sizesEnabled: false,
        sizes: [],
        imageMappings: [{ image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400", color: "#FFD700", size: "One Size" }]
    },
    {
        id: 3,
        name: "Silk Evening Scarf",
        category: "fashion",
        basePrice: 120,
        images: ["https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400"],
        description: "وشاح من الحرير الطبيعي الناعم.",
        sizesEnabled: true,
        sizes: ["Free Size"],
        imageMappings: [{ image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400", color: "#DC2626", size: "Free Size" }]
    }
];

let currentCategory = 'all';

function searchProducts(query) {
    const searchTerm = query.toLowerCase().trim();
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    const filtered = products.filter(product => {
        const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                              (product.description && product.description.toLowerCase().includes(searchTerm));
        return matchesCategory && matchesSearch;
    });

    grid.innerHTML = "";

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-2 text-center text-xs text-neutral-400 py-6">لا توجد منتجات مطابقة للبحث</div>`;
        return;
    }

    filtered.forEach(product => {
        let mainImg = (product.images && product.images.length > 0) ? product.images[0] : "";
        let imageHTML = mainImg ? 
            `<img src="${mainImg}" class="w-full h-full object-cover rounded-xl" alt="">` : 
            `<span class="text-neutral-400 text-[10px]">Photo</span>`;

        grid.innerHTML += `
            <div onclick="selectProduct(${product.id})" class="bg-neutral-50 border border-neutral-200 rounded-2xl p-3 flex flex-col items-center cursor-pointer hover:border-amber-600 transition shadow-sm">
                <div class="w-full h-24 bg-neutral-100 rounded-xl mb-2 flex items-center justify-center overflow-hidden">
                    ${imageHTML}
                </div>
                <span class="text-xs font-medium text-neutral-900 text-center truncate w-full">${product.name}</span>
                <span class="text-xs text-amber-600 font-bold mt-1">${formatPrice(product.basePrice)}</span>
            </div>
        `;
    });
}

function openAddCategoryModal() {
    document.getElementById('new-cat-id').value = "";
    document.getElementById('new-cat-name').value = "";
    document.getElementById('category-modal').classList.remove('hidden');
}

function closeAddCategoryModal() {
    document.getElementById('category-modal').classList.add('hidden');
}

function saveNewCategory() {
    const catId = document.getElementById('new-cat-id').value.trim().toLowerCase().replace(/\s+/g, '-');
    const catName = document.getElementById('new-cat-name').value.trim();

    if (!catId || !catName) {
        alert("يرجى إدخال معرف واسم صحيح للتصنيف!");
        return;
    }

    if (categories.some(c => c.id === catId)) {
        alert("هذا التصنيف موجود مسبقاً!");
        return;
    }

    categories.push({
        id: catId,
        name: { ar: catName, en: catName, fr: catName, es: catName, de: catName, zh: catName }
    });

    renderCategoriesTabs();
    closeAddCategoryModal();
}

function renderCategoriesTabs() {
    const container = document.querySelector('.flex.gap-2.overflow-x-auto.hide-scrollbar');
    if (!container) return;
    
    container.innerHTML = "";

    categories.forEach(cat => {
        let displayName = cat.name[currentLang] || cat.name['ar'];
        let isActive = currentCategory === cat.id;

        let activeClasses = isActive 
            ? 'bg-neutral-900 text-white shadow-sm' 
            : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-400 transition';

        container.innerHTML += `
            <button onclick="filterCategory('${cat.id}', this)" class="category-tab ${activeClasses} text-xs font-medium px-4 py-2 rounded-xl whitespace-nowrap cursor-pointer">
                ${displayName}
            </button>
        `;
    });
}

function filterCategory(category, btnElement) {
    currentCategory = category;
    
    const buttons = document.querySelectorAll('.category-tab');
    buttons.forEach(btn => {
        btn.classList.remove('bg-neutral-900', 'text-white', 'shadow-sm');
        btn.classList.add('bg-white', 'text-neutral-600', 'border', 'border-neutral-200');
    });
    
    if (btnElement) {
        btnElement.classList.remove('bg-white', 'text-neutral-600', 'border', 'border-neutral-200');
        btnElement.classList.add('bg-neutral-900', 'text-white', 'shadow-sm');
    }

    renderProducts();
    if (typeof checkAdminFashionVisibility === 'function') {
        checkAdminFashionVisibility();
    }
}

let selectedProduct = null;
let currentEditingImages = []; 
let currentEditingSizes = [];
let currentImageMappings = [];

function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    grid.innerHTML = "";

    const filteredProducts = currentCategory === 'all' 
        ? products 
        : products.filter(p => p.category === currentCategory);

    if (filteredProducts.length === 0) {
        grid.innerHTML = `<div class="col-span-2 text-center text-xs text-neutral-400 py-6">لا توجد منتجات في هذا القسم</div>`;
        return;
    }

    filteredProducts.forEach(product => {
        let mainImg = (product.images && product.images.length > 0) ? product.images[0] : "";
        let imageHTML = mainImg ? 
            `<img src="${mainImg}" class="w-full h-full object-cover rounded-xl" alt="">` : 
            `<span class="text-neutral-400 text-[10px]">Photo</span>`;

        grid.innerHTML += `
            <div onclick="selectProduct(${product.id})" class="bg-neutral-50 border border-neutral-200 rounded-2xl p-3 flex flex-col items-center cursor-pointer hover:border-amber-600 transition shadow-sm">
                <div class="w-full h-24 bg-neutral-100 rounded-xl mb-2 flex items-center justify-center overflow-hidden">
                    ${imageHTML}
                </div>
                <span class="text-xs font-medium text-neutral-900 text-center truncate w-full">${product.name}</span>
                <span class="text-xs text-amber-600 font-bold mt-1">${formatPrice(product.basePrice)}</span>
            </div>
        `;
    });
}

function openAddModal() {
    const t = translations[currentLang];
    document.getElementById('edit-product-id').value = "";
    document.getElementById('modal-title').innerText = t.modalTitleAdd;
    document.getElementById('new-name').value = "";
    document.getElementById('new-price').value = "";
    document.getElementById('new-images-file').value = "";
    document.getElementById('new-desc').value = "";
    
    currentEditingImages = [];
    sizesEnabled = true;
    currentEditingSizes = ["S", "M", "L"];
    currentImageMappings = [];

    renderEditImagesPreview();
    renderEditingOptions();
    checkAdminFashionVisibility();
    
    document.getElementById('add-modal').classList.remove('hidden');
}

function openEditModal() {
    if (currentUser.role !== 'owner') {
        alert("عذراً، تعديل أسعار وتفاصيل المنتجات متاح لصاحب المتجر فقط!");
        return;
    }
    if (!selectedProduct) return;
    const t = translations[currentLang];
    document.getElementById('edit-product-id').value = selectedProduct.id;
    document.getElementById('modal-title').innerText = t.modalTitleEdit;
    document.getElementById('new-name').value = selectedProduct.name;
    document.getElementById('new-price').value = selectedProduct.basePrice;
    document.getElementById('new-images-file').value = "";
    document.getElementById('new-desc').value = selectedProduct.description;
    
    currentEditingImages = [...(selectedProduct.images || [])];
    sizesEnabled = selectedProduct.sizesEnabled !== undefined ? selectedProduct.sizesEnabled : true;
    currentEditingSizes = [...(selectedProduct.sizes || ["M"])];
    currentImageMappings = JSON.parse(JSON.stringify(selectedProduct.imageMappings || []));

    renderEditImagesPreview();
    renderEditingOptions();
    checkAdminFashionVisibility();
    
    document.getElementById('add-modal').classList.remove('hidden');
}

function renderEditImagesPreview() {
    const previewContainer = document.getElementById('edit-images-preview');
    const t = translations[currentLang];
    if (!previewContainer) return;
    previewContainer.innerHTML = "";

    if (currentEditingImages.length === 0) {
        previewContainer.innerHTML = `<span class="text-neutral-400 text-[11px] px-2">${t.noImages}</span>`;
        if (typeof renderImageMappingRows === 'function') renderImageMappingRows();
        return;
    }

    currentEditingImages.forEach((imgSrc, index) => {
        previewContainer.innerHTML += `
            <div class="relative w-12 h-12 bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200 flex-shrink-0 group">
                <img src="${imgSrc}" class="w-full h-full object-cover" alt="">
                <button onclick="removeEditingImage(${index})" type="button" class="absolute top-0.5 right-0.5 bg-white hover:bg-red-600 text-red-600 hover:text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition cursor-pointer shadow">
                    🗑️
                </button>
            </div>
        `;
    });

    if (typeof renderImageMappingRows === 'function') {
        renderImageMappingRows();
    }
}

function removeEditingImage(index) {
    let imgSrc = currentEditingImages[index];
    currentEditingImages.splice(index, 1);
    currentImageMappings = currentImageMappings.filter(m => m.image !== imgSrc);
    renderEditImagesPreview();
}

function injectAdminColorSizeInputsIfNeeded() {
    let container = document.getElementById('admin-dynamic-options-container');
    if (!container) {
        const modalContent = document.querySelector('#add-modal .bg-white');
        if (!modalContent) return;
        
        container = document.createElement('div');
        container.id = 'admin-dynamic-options-container';
        container.className = 'flex flex-col gap-3 pt-2 border-t border-neutral-100';
        
        const buttonsDiv = modalContent.querySelector('.flex.gap-2.pt-2');
        modalContent.insertBefore(container, buttonsDiv);
    }
    
    container.innerHTML = `
        <div class="flex flex-col gap-1.5">
            <label id="lbl-add-new-imgs" class="text-[11px] text-neutral-600 font-medium">${translations[currentLang].lblAddNewImgs || "إضافة صورة جديدة مع اللون والمقاس"}</label>
            <div class="flex items-center gap-2">
                <input type="file" id="new-image-file-single" accept="image/*" class="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2 text-xs text-neutral-700 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-neutral-900 file:text-white cursor-pointer">
                <div class="flex items-center gap-1.5 flex-shrink-0">
                    <input type="color" id="new-image-color-picker" value="#2563eb" class="w-8 h-8 rounded-lg border border-neutral-200 cursor-pointer p-0 bg-transparent" title="اختر لون الصورة">
                    <button type="button" onclick="addImageWithColorAndSize()" class="bg-amber-600 hover:bg-amber-700 text-white w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center transition cursor-pointer shadow-sm">+</button>
                </div>
            </div>
            <div id="edit-images-preview" class="flex items-center gap-2 overflow-x-auto py-1"></div>
        </div>

        <div class="flex items-center justify-between bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
            <span class="text-xs font-bold text-neutral-800">تفعيل المقاسات للمنتج</span>
            <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="toggle-sizes-checkbox" ${sizesEnabled ? 'checked' : ''} onchange="toggleSizesActivation(this.checked)" class="sr-only peer">
                <div class="w-9 h-5 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
        </div>

        <div id="sizes-management-wrapper" class="flex flex-col gap-1 ${sizesEnabled ? '' : 'hidden'}">
            <label class="text-[11px] text-neutral-600 font-medium">قائمة المقاسات العامة المتاحة للمنتج</label>
            <div class="flex items-center gap-2">
                <div id="admin-sizes-preview" class="flex items-center gap-2 overflow-x-auto py-1"></div>
                <div class="flex items-center gap-1">
                    <input type="text" id="new-size-input" placeholder="مقاس (مثل XL)" class="w-20 bg-neutral-50 border border-neutral-200 rounded-lg p-1 text-xs text-neutral-900 outline-none">
                    <button type="button" onclick="addSizeOption()" class="w-7 h-7 bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center justify-center hover:bg-amber-700 transition cursor-pointer">+</button>
                </div>
            </div>
        </div>

        <div id="image-mapping-section" class="flex flex-col gap-2 pt-2 border-t border-neutral-100">
            <label class="text-[11px] text-neutral-600 font-medium">ربط كل صورة بلونها ومقاسها الخاص بشكل مستقل</label>
            <div id="image-mapping-rows-container" class="flex flex-col gap-2 max-h-40 overflow-y-auto"></div>
        </div>
    `;
}

function toggleSizesActivation(isEnabled) {
    sizesEnabled = isEnabled;
    const wrapper = document.getElementById('sizes-management-wrapper');
    if (wrapper) {
        if (isEnabled) {
            wrapper.classList.remove('hidden');
        } else {
            wrapper.classList.add('hidden');
        }
    }
}

function addImageWithColorAndSize() {
    const fileInput = document.getElementById('new-image-file-single');
    const colorPicker = document.getElementById('new-image-color-picker');
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        alert("يرجى اختيار صورة أولاً!");
        return;
    }
    const file = fileInput.files[0];
    const chosenColor = colorPicker ? colorPicker.value : '#000000';
    const defaultSize = currentEditingSizes[0] || 'M';

    const reader = new FileReader();
    reader.onload = function(e) {
        const imgSrc = e.target.result;
        currentEditingImages.push(imgSrc);
        currentImageMappings.push({
            image: imgSrc,
            color: chosenColor,
            size: defaultSize
        });
        fileInput.value = '';
        renderEditImagesPreview();
    };
    reader.readAsDataURL(file);
}

function renderEditingOptions() {
    injectAdminColorSizeInputsIfNeeded();

    const sizesPrev = document.getElementById('admin-sizes-preview');
    if (sizesPrev) {
        sizesPrev.innerHTML = currentEditingSizes.map((sz, idx) => `
            <div class="relative px-2 py-0.5 bg-neutral-100 border border-neutral-200 rounded-lg text-[10px] font-bold text-neutral-800 flex items-center gap-1">
                <span>${sz}</span>
                <button type="button" onclick="removeEditingSize(${idx})" class="text-red-500 hover:text-red-700 font-bold cursor-pointer">×</button>
            </div>
        `).join('');
    }

    renderImageMappingRows();
}

function renderImageMappingRows() {
    const container = document.getElementById('image-mapping-rows-container');
    if (!container) return;

    if (currentEditingImages.length === 0) {
        container.innerHTML = `<span class="text-neutral-400 text-[10px]">الرجاء إضافة صور أولاً لتخصيص لونها ومقاسها</span>`;
        return;
    }

    const standardClothingSizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "36", "38", "40", "42", "44", "46", "48", "متاح للجميع", "Free Size"];
    const allSizes = Array.from(new Set([...currentEditingSizes, ...standardClothingSizes]));

    container.innerHTML = currentEditingImages.map((imgSrc, imgIndex) => {
        let mapping = currentImageMappings.find(m => m.image === imgSrc) || { color: '#000000', size: currentEditingSizes[0] || 'M' };
        let sizeDropdownId = `dropdown-size-${imgIndex}`;

        return `
            <div class="flex items-center gap-2 bg-neutral-50 p-2 rounded-xl border border-neutral-200">
                <div class="w-10 h-10 rounded-lg overflow-hidden border border-neutral-200 flex-shrink-0 bg-white">
                    <img src="${imgSrc}" class="w-full h-full object-cover" alt="">
                </div>
                
                <div class="flex items-center gap-2 flex-1">
                    <div class="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg p-1">
                        <input type="color" value="${mapping.color}" onchange="updateImageColorMapping(${imgIndex}, this.value)" class="w-6 h-6 rounded border border-neutral-300 cursor-pointer p-0 bg-transparent">
                        <span class="text-[10px] text-neutral-700">${mapping.color}</span>
                    </div>

                    <div class="relative flex-1 fashion-size-mapping-field">
                        <button type="button" onclick="toggleSizeDropdown(${imgIndex})" class="w-full bg-white border border-neutral-200 rounded-lg p-1.5 text-xs flex items-center justify-between gap-1 cursor-pointer">
                            <span class="text-[10px] text-neutral-700 font-bold truncate">${mapping.size || 'المقاس الخاص بالصورة'}</span>
                            <span class="text-[10px] text-neutral-400">▼</span>
                        </button>
                        <div id="${sizeDropdownId}" class="hidden absolute bottom-full mb-1 right-0 w-40 bg-white border border-neutral-200 rounded-xl shadow-lg p-2 z-30 max-h-36 overflow-y-auto flex flex-col gap-1">
                            ${allSizes.map(sz => `
                                <div onclick="selectImageSizeMapping(${imgIndex}, '${sz}')" class="px-2 py-1 hover:bg-amber-50 text-[11px] font-medium text-neutral-800 rounded-lg cursor-pointer">${sz}</div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateImageColorMapping(imgIndex, newColor) {
    let imgSrc = currentEditingImages[imgIndex];
    let mapping = currentImageMappings.find(m => m.image === imgSrc);
    if (mapping) {
        mapping.color = newColor;
    } else {
        currentImageMappings.push({ image: imgSrc, color: newColor, size: currentEditingSizes[0] || 'M' });
    }
}

function toggleSizeDropdown(index) {
    const el = document.getElementById(`dropdown-size-${index}`);
    if (el) {
        document.querySelectorAll('[id^="dropdown-size-"]').forEach(d => { if(d !== el) d.classList.add('hidden'); });
        el.classList.toggle('hidden');
    }
}

function selectImageSizeMapping(imgIndex, sizeVal) {
    let imgSrc = currentEditingImages[imgIndex];
    let mapping = currentImageMappings.find(m => m.image === imgSrc);
    if (mapping) {
        mapping.size = sizeVal;
    } else {
        currentImageMappings.push({ image: imgSrc, color: '#000000', size: sizeVal });
    }
    const el = document.getElementById(`dropdown-size-${imgIndex}`);
    if (el) el.classList.add('hidden');
    renderImageMappingRows();
}

function checkAdminFashionVisibility() {
    const section = document.getElementById('image-mapping-section');
    if (!section) return;
    if (currentCategory === 'fashion') {
        section.classList.remove('hidden');
    } else {
        section.classList.add('hidden');
    }
}

function addSizeOption() {
    const input = document.getElementById('new-size-input');
    const val = input ? input.value.trim().toUpperCase() : '';
    if (val && !currentEditingSizes.includes(val)) {
        currentEditingSizes.push(val);
        input.value = '';
        renderEditingOptions();
    }
}

function removeEditingSize(index) {
    currentEditingSizes.splice(index, 1);
    renderEditingOptions();
}

function closeAddModal() {
    const modal = document.getElementById('add-modal');
    if (modal) modal.classList.add('hidden');
}

function saveProductData() {
    if (currentUser.role !== 'owner') {
        alert("عذراً، حفظ أو تعديل المنتجات متاح لصاحب المتجر فقط!");
        return;
    }
    const editId = document.getElementById('edit-product-id').value;
    const name = document.getElementById('new-name').value.trim();
    const priceVal = parseFloat(document.getElementById('new-price').value);
    const desc = document.getElementById('new-desc').value.trim();
    const t = translations[currentLang];

    if (name === "" || isNaN(priceVal)) {
        alert(t.priceAlert);
        return;
    }

    const derivedColors = Array.from(new Set(currentImageMappings.map(m => m.color)));

    processSave(editId, name, priceVal, currentEditingImages, desc, derivedColors.length > 0 ? derivedColors : ["#000000"], currentEditingSizes, currentImageMappings);
}

function processSave(editId, name, basePrice, imagesArray, desc, colorsArray, sizesArray, mappingsArray) {
    const t = translations[currentLang];
    const finalDesc = desc || t.defaultDesc;

    if (editId !== "") {
        let prod = products.find(p => p.id == editId);
        if (prod) {
            prod.name = name;
            prod.basePrice = basePrice;
            prod.images = imagesArray;
            prod.description = finalDesc;
            prod.colors = colorsArray;
            prod.sizesEnabled = sizesEnabled;
            prod.sizes = sizesEnabled ? (sizesArray.length > 0 ? sizesArray : ["M"]) : [];
            prod.imageMappings = mappingsArray;
            selectedProduct = prod; 
        }
    } else {
        const newProduct = {
            id: Date.now(),
            name: name,
            category: currentCategory === 'all' ? 'fashion' : currentCategory,
            basePrice: basePrice,
            images: imagesArray,
            description: finalDesc,
            colors: colorsArray,
            sizesEnabled: sizesEnabled,
            sizes: sizesEnabled ? (sizesArray.length > 0 ? sizesArray : ["M"]) : [],
            imageMappings: mappingsArray
        };
        products.unshift(newProduct);
    }

    renderProducts();
    closeAddModal();

    if (editId !== "") {
        selectProduct(selectedProduct.id); 
    } else {
        goToPage('page-1');
    }
}

function deleteCurrentProduct() {
    if (currentUser.role !== 'owner') {
        alert("عذراً، حذف المنتجات متاح لصاحب المتجر فقط!");
        return;
    }
    const t = translations[currentLang];
    if (!selectedProduct) return;
    if (confirm(t.deleteConfirm)) {
        products = products.filter(p => p.id !== selectedProduct.id);
        renderProducts();
        goToPage('page-1');
    }
}

function selectProduct(id) {
    selectedProduct = products.find(p => p.id === id);
    if (selectedProduct) {
        document.getElementById('product-name').innerText = selectedProduct.name;
        document.getElementById('product-price').innerText = formatPrice(selectedProduct.basePrice);
        document.getElementById('product-desc').innerText = selectedProduct.description;
        
        const qtyInput = document.getElementById('product-quantity');
        if (qtyInput) qtyInput.value = 1;

        renderCustomerProductOptions();
        updateProductGallery(0);
        goToPage('page-2');
    }
}

function renderCustomerProductOptions() {
    const colorsContainer = document.getElementById('product-colors-container');
    const sizesContainer = document.getElementById('product-sizes-container');
    const sizesSection = sizesContainer ? sizesContainer.closest('.flex') : null;

    let customerColors = [];
    if (selectedProduct.imageMappings && selectedProduct.imageMappings.length > 0) {
        customerColors = Array.from(new Set(selectedProduct.imageMappings.map(m => m.color)));
    } else {
        customerColors = selectedProduct.colors || ["#000000"];
    }

    if (colorsContainer) {
        selectedColor = customerColors[0];
        colorsContainer.innerHTML = customerColors.map((col, idx) => `
            <button type="button" onclick="selectColor('${col}', this)" class="w-7 h-7 rounded-full border-2 ${idx === 0 ? 'border-amber-600 scale-110 ring-2 ring-offset-2 ring-amber-600' : 'border-neutral-300'} shadow-sm cursor-pointer" style="background-color: ${col};" title="${col}"></button>
        `).join('');
    }

    if (sizesContainer) {
        const sizes = selectedProduct.sizes || [];
        if (selectedProduct.sizesEnabled === false || sizes.length === 0) {
            if (sizesSection) sizesSection.style.display = 'none';
        } else {
            if (sizesSection) sizesSection.style.display = 'flex';
            selectedSize = sizes[0];
            sizesContainer.innerHTML = sizes.map((sz, idx) => `
                <button type="button" onclick="selectSize('${sz}', this)" class="size-btn px-3 py-1.5 rounded-xl border ${idx === 0 ? 'bg-amber-600 text-white border-amber-600' : 'border-neutral-200 text-neutral-700'} text-xs font-bold transition cursor-pointer">${sz}</button>
            `).join('');
        }
    }
}

function updateProductGallery(imageIndex) {
    const detailImg = document.getElementById('product-detail-img');
    const detailPlaceholder = document.getElementById('product-detail-placeholder');
    const thumbnailsContainer = document.getElementById('product-thumbnails');
    if (!thumbnailsContainer || !detailImg || !detailPlaceholder) return;
    thumbnailsContainer.innerHTML = "";

    if (selectedProduct.images && selectedProduct.images.length > 0) {
        detailImg.src = selectedProduct.images[imageIndex];
        detailImg.classList.remove('hidden');
        detailPlaceholder.classList.add('hidden');

        let clickedImgSrc = selectedProduct.images[imageIndex];
        if (selectedProduct.imageMappings && selectedProduct.imageMappings.length > 0) {
            let mapping = selectedProduct.imageMappings.find(m => m.image === clickedImgSrc);
            if (mapping) {
                if (mapping.color) {
                    selectedColor = mapping.color;
                    const colorBtns = document.querySelectorAll('#product-colors-container button');
                    colorBtns.forEach(btn => {
                        if (btn.style.backgroundColor && rgbToHex(btn.style.backgroundColor).toLowerCase() === hexToRgbStr(mapping.color).toLowerCase()) {
                            btn.classList.add('ring-2', 'ring-offset-2', 'ring-amber-600', 'scale-110', 'border-amber-600');
                        } else {
                            btn.classList.remove('ring-2', 'ring-offset-2', 'ring-amber-600', 'scale-110', 'border-amber-600');
                        }
                    });
                }
                if (mapping.size && selectedProduct.sizesEnabled !== false) {
                    selectedSize = mapping.size;
                    const sizeBtns = document.querySelectorAll('.size-btn');
                    sizeBtns.forEach(btn => {
                        if (btn.innerText.trim() === mapping.size) {
                            btn.classList.remove('border-neutral-200', 'text-neutral-700', 'bg-amber-50');
                            btn.classList.add('bg-amber-600', 'text-white', 'border-amber-600');
                        } else {
                            btn.classList.remove('bg-amber-600', 'text-white', 'border-amber-600');
                            btn.classList.add('border-neutral-200', 'text-neutral-700');
                        }
                    });
                }
            }
        }

        selectedProduct.images.forEach((imgSrc, idx) => {
            let activeBorder = idx === imageIndex ? 'border-amber-600' : 'border-neutral-200 opacity-60';
            thumbnailsContainer.innerHTML += `
                <div onclick="updateProductGallery(${idx})" class="w-12 h-12 bg-neutral-100 border-2 ${activeBorder} rounded-xl overflow-hidden cursor-pointer flex-shrink-0 transition">
                    <img src="${imgSrc}" class="w-full h-full object-cover" alt="">
                </div>
            `;
        });
    } else {
        detailImg.classList.add('hidden');
        detailPlaceholder.classList.remove('hidden');
    }
}

function rgbToHex(rgb) {
    if (!rgb || !rgb.startsWith('rgb')) return rgb || '';
    let match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return rgb;
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(match[1]) + hex(match[2]) + hex(match[3]);
}

function hexToRgbStr(hex) {
    if (!hex) return '';
    let c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c = hex.substring(1).split('');
        if(c.length == 3){
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return 'rgb(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(', ') + ')';
    }
    return hex;
}

function goToPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.add('hidden'));
    const target = document.getElementById(pageId);
    if (target) target.classList.remove('hidden');
    
    if (pageId === 'page-1') {
        renderProducts();
    }
}

function buyProduct() {
    if (!selectedProduct) return;
    
    const qtyInput = document.getElementById('product-quantity');
    let quantity = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
    if (quantity < 1) quantity = 1;

    const cartItemName = document.getElementById('cart-item-name');
    if (cartItemName) {
        if (selectedProduct.sizesEnabled === false) {
            cartItemName.innerText = `${selectedProduct.name} (اللون: ${selectedColor}) × ${quantity}`;
        } else {
            cartItemName.innerText = `${selectedProduct.name} (المقاس: ${selectedSize} - اللون: ${selectedColor}) × ${quantity}`;
        }
    }
    
    const totalPriceBase = selectedProduct.basePrice * quantity;
    const formatted = formatPrice(totalPriceBase);
    
    const cartItemPrice = document.getElementById('cart-item-price');
    if (cartItemPrice) cartItemPrice.innerText = formatted;
    const cartTotal = document.getElementById('cart-total');
    if (cartTotal) cartTotal.innerText = formatted;
    
    window.currentCheckoutQuantity = quantity;
    window.currentCheckoutColor = selectedColor;
    window.currentCheckoutSize = selectedProduct.sizesEnabled === false ? '' : selectedSize;
    
    goToPage('page-3');
}

function completeCheckoutOrder() {
    const firstName = document.getElementById('pay-firstname')?.value || 'محمد';
    const lastName = document.getElementById('pay-lastname')?.value || 'علي';
    const address = document.getElementById('pay-detailed-address')?.value || 'شارع العقيد لطفي';
    const phone = document.getElementById('pay-phone')?.value || '0600000000';
    const quantity = window.currentCheckoutQuantity || 1;
    const chosenColor = window.currentCheckoutColor || '#000';
    const chosenSize = window.currentCheckoutSize || '';
    
    const productBaseTotal = selectedProduct ? selectedProduct.basePrice * quantity : 0;

    let productDetailsText = selectedProduct ? `${selectedProduct.name} (لون: <span style="display:inline-block;width:10px;height:10px;background:${chosenColor};border-radius:50%;vertical-align:middle;"></span>)` : 'منتج عام';
    if (selectedProduct && selectedProduct.sizesEnabled !== false && chosenSize) {
        productDetailsText = `${selectedProduct.name} (مقاس: ${chosenSize}, لون: <span style="display:inline-block;width:10px;height:10px;background:${chosenColor};border-radius:50%;vertical-align:middle;"></span>)`;
    }

    const newOrder = {
        id: 'ORD-' + Date.now(),
        serialNumber: Math.floor(1000 + Math.random() * 9000),
        customerName: `${firstName} ${lastName}`,
        phone: phone,
        address: address,
        productName: productDetailsText,
        quantity: quantity,
        productPrice: selectedProduct ? formatPrice(productBaseTotal) : '0',
        deliveryFee: formatPrice(5),
        totalAmount: selectedProduct ? formatPrice(productBaseTotal + 5) : '0',
        status: 'قيد الانتظار'
    };

    storeOrders.unshift(newOrder);
    goToPage('page-5'); 
}

document.addEventListener('DOMContentLoaded', () => {
    renderCategoriesTabs();
    renderProducts();
    
    const payButton = document.getElementById('btn-pay-now');
    if (payButton) {
        payButton.onclick = (e) => {
            e.preventDefault();
            completeCheckoutOrder();
        };
    }

    const langSelect = document.getElementById('language-selector');
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            changeLanguage(e.target.value);
        });
    }

    const countrySelect = document.getElementById('pay-country');
    if (countrySelect) {
        countrySelect.addEventListener('change', () => {
            onCountryChange();
        });
    }
});