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
// 2. نظام صلاحيات صاحب المتجر وإدارة البيانات
// ==========================================
let currentUser = {
    role: 'owner', // صلاحية كاملة: 'owner' / developer
    username: 'Ahmed Bouakel',
    isDev: true
};

function getStoredData(key, fallback) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch(e) {
        return fallback;
    }
}

function setStoredData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch(e) {
        console.error("خطأ في حفظ البيانات:", e);
    }
}

let blacklistedCustomers = getStoredData('blacklistedCustomers', []); 
let storeComplaints = getStoredData('storeComplaints', getStoredData('complaints_data', []));

function loadComplaintsIntoDashboard() {
    storeComplaints = getStoredData('storeComplaints', getStoredData('complaints_data', storeComplaints));
    renderOwnerDashboardData();
}

function loadComplaints() { loadComplaintsIntoDashboard(); }
function renderComplaints() { loadComplaintsIntoDashboard(); }
function showComplaints() { loadComplaintsIntoDashboard(); }

// ==========================================
// 3. سجل نشاط وحضور وغياب المشرفين
// ==========================================
let adminActivityLog = getStoredData('adminActivityLog', [
    {
        id: 1,
        adminName: 'أحمد بوعقل',
        role: 'مالك المتجر',
        status: 'حاضر',
        action: 'تسجيل دخول وتحديث قواميس المنتجات',
        date: '2026-08-11',
        time: '09:00',
        fullDateTime: 'الثلاثاء 11 أغسطس 2026 - 09:00'
    },
    {
        id: 2,
        adminName: 'محمد أمين',
        role: 'مشرف مبيعات',
        status: 'حاضر',
        action: 'تأكيد طلبية شراء',
        date: '2026-08-11',
        time: '08:45',
        fullDateTime: 'الثلاثاء 11 أغسطس 2026 - 08:45'
    },
    {
        id: 3,
        adminName: 'سارة العلمي',
        role: 'مشرفة دعم',
        status: 'غائب',
        action: 'لم تسجل حضورها اليوم',
        date: '2026-08-11',
        time: '08:00',
        fullDateTime: 'الثلاثاء 11 أغسطس 2026 - 08:00'
    }
]);

let currentActivityFilter = 'all';

function getCurrentFullDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString('ar-DZ', options);
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${dateStr} - ${hours}:${minutes}`;
}

function logAdminActivity(adminName, status, action = '') {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const dateStr = now.toISOString().split('T')[0];
    
    const newLog = {
        id: Date.now(),
        adminName: adminName,
        status: status,
        action: action || (status === 'حاضر' ? 'تسجيل حضور' : 'تسجيل غياب'),
        date: dateStr,
        time: `${hours}:${minutes}`,
        fullDateTime: getCurrentFullDateTime()
    };
    
    adminActivityLog.unshift(newLog);
    setStoredData('adminActivityLog', adminActivityLog);
    renderAdminActivityLogData();
}

function openAdminActivityLogModal() {
    let modal = document.getElementById('admin-activity-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'admin-activity-modal';
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-6 w-full max-w-3xl shadow-xl max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4 border-b pb-3">
                    <div class="flex items-center gap-2">
                        <span class="text-xl">📊</span>
                        <h3 class="text-sm font-bold text-neutral-900">سجل نشاط وحضور وغياب المشرفين</h3>
                    </div>
                    <button onclick="closeAdminActivityLogModal()" class="text-neutral-400 hover:text-neutral-700 text-sm font-bold cursor-pointer">✕</button>
                </div>
                
                <div class="mb-5 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                    <h4 class="text-xs font-bold text-neutral-800 mb-2">تسجيل حالة جديدة للمشرف</h4>
                    <div class="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <input id="log-admin-name" type="text" placeholder="اسم المشرف..." class="bg-white border border-neutral-200 rounded-xl p-2 text-xs outline-none focus:border-amber-600">
                        <select id="log-admin-status" class="bg-white border border-neutral-200 rounded-xl p-2 text-xs outline-none cursor-pointer">
                            <option value="حاضر">حاضر ✅</option>
                            <option value="غائب">غائب ❌</option>
                        </select>
                        <input id="log-admin-action" type="text" placeholder="النشاط / الملاحظة..." class="bg-white border border-neutral-200 rounded-xl p-2 text-xs outline-none focus:border-amber-600">
                        <button onclick="addNewAdminLogFromInput()" class="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2 rounded-xl cursor-pointer transition">تسجيل الحالة</button>
                    </div>
                </div>

                <div class="flex items-center justify-between mb-3">
                    <div class="flex gap-2">
                        <button onclick="filterActivityLogs('all', this)" class="activity-filter-btn bg-neutral-900 text-white text-xs px-3 py-1.5 rounded-xl font-medium cursor-pointer">الكل</button>
                        <button onclick="filterActivityLogs('حاضر', this)" class="activity-filter-btn bg-white text-neutral-600 border border-neutral-200 text-xs px-3 py-1.5 rounded-xl font-medium cursor-pointer">الحاضرين فقط</button>
                        <button onclick="filterActivityLogs('غائب', this)" class="activity-filter-btn bg-white text-neutral-600 border border-neutral-200 text-xs px-3 py-1.5 rounded-xl font-medium cursor-pointer">الغائبين فقط</button>
                    </div>
                    <span id="activity-log-count" class="text-[11px] text-neutral-500 font-medium"></span>
                </div>

                <div id="admin-activity-list-container" class="space-y-2 text-xs text-neutral-700"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    renderAdminActivityLogData();
    modal.classList.remove('hidden');
}

function closeAdminActivityLogModal() {
    const modal = document.getElementById('admin-activity-modal');
    if (modal) modal.classList.add('hidden');
}

function openAdminActivityLog() { openAdminActivityLogModal(); }
function openAdminActivity() { openAdminActivityLogModal(); }
function openAdminLogModal() { openAdminActivityLogModal(); }
function openAdminLog() { openAdminActivityLogModal(); }
function showAdminLog() { openAdminActivityLogModal(); }

// ==========================================
// 3.1 دالة نافذة الشكاوى ومعالجة الإرسال والحفظ والتحديث الفوري
// ==========================================
let currentComplaintMediaFiles = [];

function openComplaintModal() {
    let modal = document.getElementById('complaint-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'complaint-modal';
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 class="text-sm font-bold text-neutral-900">إرسال شكوى أو ملاحظة</h3>
                    <button onclick="closeComplaintModal()" class="text-neutral-400 hover:text-neutral-700 text-sm font-bold cursor-pointer">✕</button>
                </div>
                <form id="complaint-modal-form" onsubmit="submitComplaintForm(event)" class="flex flex-col gap-3 text-xs">
                    <div>
                        <label class="block text-neutral-600 mb-1 font-medium">اسمك أو البريد الإلكتروني:</label>
                        <input id="complaint-name" name="complaint-name" type="text" placeholder="أدخل اسمك..." class="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2 outline-none focus:border-amber-600">
                    </div>
                    <div>
                        <label class="block text-neutral-600 mb-1 font-medium">تفاصيل المشكلة:</label>
                        <textarea id="complaint-text" name="complaint-text" rows="3" placeholder="اكتب شكواك أو تفاصيل مشكلتك هنا..." class="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2 outline-none focus:border-amber-600 resize-none"></textarea>
                    </div>
                    <div>
                        <label class="block text-neutral-600 mb-1 font-medium">إرفاق صور أو فيديوهات (اختياري):</label>
                        <input type="file" id="complaint-media-input" accept="image/*,video/*" multiple onchange="handleComplaintMediaSelection(this)" class="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2 text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-neutral-900 file:text-white cursor-pointer">
                        <div id="complaint-media-preview" class="flex items-center gap-2 overflow-x-auto py-2 mt-1"></div>
                    </div>
                    <button type="submit" class="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-xl transition cursor-pointer">إرسال الشكوى إلى لوحة التحكم</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    }
    currentComplaintMediaFiles = [];
    renderComplaintMediaPreview();
    modal.classList.remove('hidden');
}

function handleComplaintMediaSelection(input) {
    if (!input.files || input.files.length === 0) return;
    Array.from(input.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentComplaintMediaFiles.push({
                type: file.type.startsWith('video') ? 'video' : 'image',
                url: e.target.result,
                name: file.name
            });
            renderComplaintMediaPreview();
        };
        reader.readAsDataURL(file);
    });
    input.value = '';
}

function renderComplaintMediaPreview() {
    const container = document.getElementById('complaint-media-preview');
    if (!container) return;
    if (currentComplaintMediaFiles.length === 0) {
        container.innerHTML = `<span class="text-neutral-400 text-[10px]">لا توجد مرفقات حالياً</span>`;
        return;
    }
    container.innerHTML = currentComplaintMediaFiles.map((item, idx) => `
        <div class="relative w-12 h-12 bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200 flex-shrink-0">
            ${item.type === 'video' ? '<video src="' + item.url + '" class="w-full h-full object-cover"></video>' : '<img src="' + item.url + '" class="w-full h-full object-cover">'}
            <button onclick="removeComplaintMedia(${idx})" type="button" class="absolute top-0.5 right-0.5 bg-white hover:bg-red-600 text-red-600 hover:text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] cursor-pointer shadow">✕</button>
        </div>
    `).join('');
}

function removeComplaintMedia(index) {
    currentComplaintMediaFiles.splice(index, 1);
    renderComplaintMediaPreview();
}

function closeComplaintModal() {
    const modal = document.getElementById('complaint-modal');
    if (modal) modal.classList.add('hidden');
}

function submitComplaintForm(param) {
    let targetForm = null;

    if (param) {
        if (typeof param.preventDefault === 'function') {
            param.preventDefault();
            if (param.target) {
                targetForm = param.target.tagName === 'FORM' ? param.target : param.target.closest('form');
            }
        } else if (param.tagName === 'FORM') {
            targetForm = param;
        } else if (param.nodeType === 1) {
            targetForm = param.closest('form');
        }
    }

    let name = '';
    let text = '';

    if (targetForm) {
        const formName = targetForm.querySelector('#complaint-name, #complaint-customer-name, #complaint-user-name, [name="complaint-name"], input[type="text"]');
        const formText = targetForm.querySelector('#complaint-text, #complaint-details, #complaint-message, [name="complaint-text"], textarea');
        if (formName && formName.value) name = formName.value.trim();
        if (formText && formText.value) text = formText.value.trim();
    }

    if (!text) {
        const nameInput = document.getElementById('complaint-name') || document.getElementById('complaint-customer-name') || document.getElementById('complaint-user-name');
        const textInput = document.getElementById('complaint-text') || document.getElementById('complaint-details') || document.getElementById('complaint-message');
        if (nameInput && nameInput.value) name = nameInput.value.trim();
        if (textInput && textInput.value) text = textInput.value.trim();
    }

    if (!text) {
        alert("يرجى كتابة تفاصيل الشكوى أولاً!");
        return;
    }

    const newComplaint = {
        id: 'CMP-' + Date.now(),
        customerName: name || 'زائر مجهول',
        details: text,
        text: text,
        media: [...currentComplaintMediaFiles],
        messages: [{
            sender: 'customer',
            text: text,
            time: getCurrentFullDateTime()
        }],
        date: getCurrentFullDateTime(),
        status: 'قيد المراجعة'
    };

    storeComplaints = getStoredData('storeComplaints', getStoredData('complaints_data', []));
    storeComplaints.unshift(newComplaint);
    
    setStoredData('storeComplaints', storeComplaints);
    setStoredData('complaints_data', storeComplaints);

    alert("تم إرسال شكواك بنجاح إلى لوحة التحكم الخاصة بالمتجر وسيتم مراجعتها قريباً.");

    if (targetForm) {
        targetForm.reset();
    } else {
        const nameInputs = document.querySelectorAll('#complaint-name, #complaint-customer-name, #complaint-user-name');
        nameInputs.forEach(i => i.value = '');
        const textInputs = document.querySelectorAll('#complaint-text, #complaint-details, #complaint-message');
        textInputs.forEach(i => i.value = '');
    }

    currentComplaintMediaFiles = [];
    renderComplaintMediaPreview();
    
    loadComplaintsIntoDashboard();
    closeComplaintModal();
}

// ==========================================
// 3.2 نافذة المحادثة بين المالك والزبون
// ==========================================
let activeComplaintChatId = null;

function openComplaintChat(complaintId) {
    activeComplaintChatId = complaintId;
    const complaint = storeComplaints.find(c => c.id === complaintId);
    if (!complaint) return;

    if (!complaint.messages) {
        complaint.messages = [{
            sender: 'customer',
            text: complaint.details || complaint.text || '',
            time: complaint.date
        }];
    }

    let chatModal = document.getElementById('complaint-chat-modal');
    if (!chatModal) {
        chatModal = document.createElement('div');
        chatModal.id = 'complaint-chat-modal';
        chatModal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        chatModal.innerHTML = `
            <div class="bg-white rounded-2xl p-5 w-full max-w-lg shadow-xl flex flex-col h-[80vh]">
                <div class="flex justify-between items-center border-b pb-3 mb-3">
                    <div class="flex items-center gap-2">
                        <span class="text-lg">💬</span>
                        <div>
                            <h3 id="chat-customer-name" class="text-xs font-bold text-neutral-900">محادثة الشكوى</h3>
                            <span id="chat-complaint-id" class="text-[10px] text-neutral-400"></span>
                        </div>
                    </div>
                    <button onclick="closeComplaintChat()" class="text-neutral-400 hover:text-neutral-700 text-sm font-bold cursor-pointer">✕</button>
                </div>

                <div id="chat-messages-container" class="flex-1 overflow-y-auto space-y-2 p-2 bg-neutral-50 rounded-xl border border-neutral-200 text-xs"></div>

                <div class="flex gap-2 pt-3 border-t border-neutral-100 mt-2">
                    <input id="chat-reply-input" type="text" placeholder="اكتب ردك للزبون هنا..." class="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 text-xs outline-none focus:border-amber-600" onkeypress="if(event.key === 'Enter') sendComplaintReply()">
                    <button onclick="sendComplaintReply()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer">إرسال</button>
                </div>
            </div>
        `;
        document.body.appendChild(chatModal);
    }

    document.getElementById('chat-customer-name').innerText = `محادثة مع الزبون: ${complaint.customerName || 'زائر'}`;
    document.getElementById('chat-complaint-id').innerText = `معرّف الشكوى: #${complaint.id}`;
    
    renderComplaintChatMessages(complaint);
    chatModal.classList.remove('hidden');
}

function renderComplaintChatMessages(complaint) {
    const container = document.getElementById('chat-messages-container');
    if (!container) return;

    if (!complaint.messages || complaint.messages.length === 0) {
        container.innerHTML = `<div class="text-center text-neutral-400 py-6">لا توجد رسائل سابقة في هذه الشكوى</div>`;
        return;
    }

    container.innerHTML = complaint.messages.map(msg => {
        const isOwner = msg.sender === 'owner';
        return `
            <div class="flex flex-col ${isOwner ? 'items-end' : 'items-start'}">
                <div class="max-w-[80%] rounded-2xl p-2.5 ${isOwner ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-neutral-800 border border-neutral-200 rounded-bl-none'} shadow-sm">
                    <p class="whitespace-pre-wrap text-xs">${msg.text}</p>
                </div>
                <span class="text-[9px] text-neutral-400 mt-1 px-1">${isOwner ? 'صاحب المتجر' : (complaint.customerName || 'الزبون')} • ${msg.time || ''}</span>
            </div>
        `;
    }).join('');

    container.scrollTop = container.scrollHeight;
}

function sendComplaintReply() {
    const input = document.getElementById('chat-reply-input');
    if (!input || !input.value.trim() || !activeComplaintChatId) return;

    const text = input.value.trim();
    const complaint = storeComplaints.find(c => c.id === activeComplaintChatId);
    
    if (complaint) {
        if (!complaint.messages) complaint.messages = [];
        complaint.messages.push({
            sender: 'owner',
            text: text,
            time: getCurrentFullDateTime()
        });
        complaint.status = 'تم الرد';

        setStoredData('storeComplaints', storeComplaints);
        setStoredData('complaints_data', storeComplaints);

        input.value = '';
        renderComplaintChatMessages(complaint);
        renderOwnerDashboardData();
    }
}

function closeComplaintChat() {
    const modal = document.getElementById('complaint-chat-modal');
    if (modal) modal.classList.add('hidden');
    activeComplaintChatId = null;
}

function filterActivityLogs(status, btnElement) {
    currentActivityFilter = status;
    const buttons = document.querySelectorAll('.activity-filter-btn');
    buttons.forEach(btn => {
        btn.classList.remove('bg-neutral-900', 'text-white');
        btn.classList.add('bg-white', 'text-neutral-600', 'border', 'border-neutral-200');
    });
    if (btnElement) {
        btnElement.classList.remove('bg-white', 'text-neutral-600', 'border', 'border-neutral-200');
        btnElement.classList.add('bg-neutral-900', 'text-white');
    }
    renderAdminActivityLogData();
}

function addNewAdminLogFromInput() {
    const nameInput = document.getElementById('log-admin-name');
    const statusInput = document.getElementById('log-admin-status');
    const actionInput = document.getElementById('log-admin-action');

    const name = (nameInput && nameInput.value) ? nameInput.value.trim() : '';
    const status = statusInput ? statusInput.value : 'حاضر';
    const action = (actionInput && actionInput.value) ? actionInput.value.trim() : '';

    if (!name) {
        alert("يرجى إدخال اسم المشرف!");
        return;
    }

    logAdminActivity(name, status, action);
    if (nameInput) nameInput.value = '';
    if (actionInput) actionInput.value = '';
}

function deleteActivityLog(id) {
    adminActivityLog = adminActivityLog.filter(log => log.id !== id);
    setStoredData('adminActivityLog', adminActivityLog);
    renderAdminActivityLogData();
}

function renderAdminActivityLogData() {
    const container = document.getElementById('admin-activity-list-container');
    const countEl = document.getElementById('activity-log-count');
    if (!container) return;

    let filteredLogs = adminActivityLog;
    if (currentActivityFilter !== 'all') {
        filteredLogs = adminActivityLog.filter(log => log.status === currentActivityFilter);
    }

    if (countEl) countEl.innerText = `إجمالي السجلات: ${filteredLogs.length}`;

    if (filteredLogs.length === 0) {
        container.innerHTML = `<div class="text-center text-neutral-400 py-6">لا توجد سجلات نشاط مطابقة حالياً</div>`;
        return;
    }

    container.innerHTML = filteredLogs.map(log => {
        const isPresent = log.status === 'حاضر';
        const badgeClass = isPresent ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200';
        const badgeIcon = isPresent ? '✅ حاضر' : '❌ غائب';

        return `
            <div class="bg-neutral-50 p-3 rounded-xl border border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:bg-neutral-100 transition">
                <div class="flex items-center gap-3">
                    <span class="px-2.5 py-1 text-[11px] font-bold rounded-lg border ${badgeClass} whitespace-nowrap">${badgeIcon}</span>
                    <div>
                        <div class="font-bold text-neutral-900 text-xs flex items-center gap-2">
                            <span>${log.adminName}</span>
                            ${log.role ? `<span class="text-[10px] text-neutral-400 font-normal">(${log.role})</span>` : ''}
                        </div>
                        <div class="text-[11px] text-neutral-600 mt-0.5">${log.action || 'تسجيل دخول'}</div>
                    </div>
                </div>
                <div class="flex items-center gap-3 self-end sm:self-center">
                    <div class="text-[11px] text-neutral-600 font-medium dir-ltr bg-white px-2 py-1 rounded-lg border border-neutral-200 shadow-sm">
                        🕒 ${log.fullDateTime || `${log.date} - ${log.time}`}
                    </div>
                    <button onclick="deleteActivityLog(${log.id})" class="text-red-500 hover:text-red-700 text-xs p-1 cursor-pointer" title="حذف السجل">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================
// 3.3 نظام إدارة الطلبات وفواتير الشراء
// ==========================================
// =====================================================
// نظام إدارة الطلبات - تخزين موحد ومتوافق مع الإصدارات السابقة
// =====================================================
function normalizeStoreOrders(value) {
    if (Array.isArray(value)) return value.filter(order => order && typeof order === 'object');
    return [];
}

function loadStoreOrdersFromStorage() {
    const storageKeys = [
        'storeOrdersList',
        'store_orders',
        'orders',
        'ordersList',
        'purchaseOrders',
        'customerOrders'
    ];

    for (const key of storageKeys) {
        const data = normalizeStoreOrders(getStoredData(key, null));
        if (data.length > 0) return data;
    }

    return [];
}

let storeOrdersList = loadStoreOrdersFromStorage();

function getStoreOrders() {
    // إعادة القراءة في كل مرة حتى تظهر الطلبات التي تم حفظها أثناء عملية الدفع فوراً.
    const storedOrders = loadStoreOrdersFromStorage();
    if (storedOrders.length > 0 || storeOrdersList.length === 0) {
        storeOrdersList = storedOrders;
    }
    return normalizeStoreOrders(storeOrdersList);
}

function saveStoreOrders() {
    storeOrdersList = normalizeStoreOrders(storeOrdersList);

    // حفظ نفس القائمة في المفاتيح الأساسية والقديمة لضمان التوافق.
    setStoredData('storeOrdersList', storeOrdersList);
    setStoredData('store_orders', storeOrdersList);
}

// =====================================================
// أدوات موحدة لاستخراج بيانات الطلب والفاتورة
// =====================================================
function bklCleanValue(value) {
    if (value === undefined || value === null) return '';
    const text = String(value).trim();
    if (!text || /^(undefined|null|nan)$/i.test(text)) return '';
    return text;
}

function bklToNumber(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    if (typeof value !== 'string') return 0;
    let text = value.trim().replace(/[^0-9,.-]/g, '');
    if (!text) return 0;
    // يدعم 1,250 و 1250.50 و 1.250,50
    if (text.includes(',') && text.includes('.')) {
        if (text.lastIndexOf(',') > text.lastIndexOf('.')) {
            text = text.replace(/\./g, '').replace(',', '.');
        } else {
            text = text.replace(/,/g, '');
        }
    } else if (text.includes(',')) {
        const parts = text.split(',');
        text = parts.length === 2 && parts[1].length <= 2 ? parts[0] + '.' + parts[1] : text.replace(/,/g, '');
    }
    const n = Number(text);
    return Number.isFinite(n) ? n : 0;
}

function bklFirstValue(values) {
    for (const value of values) {
        const cleaned = bklCleanValue(value);
        if (cleaned) return cleaned;
    }
    return '';
}

function bklReadElementValue(ids) {
    for (const id of ids) {
        const el = document.getElementById(id);
        if (el && bklCleanValue(el.value)) return bklCleanValue(el.value);
    }
    return '';
}

function bklReadSelectorValue(selectors) {
    for (const selector of selectors) {
        try {
            const el = document.querySelector(selector);
            if (el && bklCleanValue(el.value)) return bklCleanValue(el.value);
        } catch (e) {}
    }
    return '';
}

function bklResolveCustomer(order = {}) {
    const customer = order.customer && typeof order.customer === 'object' ? order.customer : {};
    const user = order.user && typeof order.user === 'object' ? order.user : {};
    const firstName = bklFirstValue([
        order.firstName, order.firstname, order.customerFirstName,
        customer.firstName, customer.firstname, user.firstName, user.firstname
    ]);
    const lastName = bklFirstValue([
        order.lastName, order.lastname, order.customerLastName,
        customer.lastName, customer.lastname, user.lastName, user.lastname
    ]);
    const fullName = bklFirstValue([
        order.customerName, order.customerFullName, order.fullName,
        order.name, order.buyerName, order.clientName,
        customer.name, customer.fullName, user.name, user.fullName,
        `${firstName} ${lastName}`.trim()
    ]);
    return fullName || 'زبون مجهول';
}

function bklResolvePhone(order = {}) {
    const customer = order.customer && typeof order.customer === 'object' ? order.customer : {};
    const user = order.user && typeof order.user === 'object' ? order.user : {};
    return bklFirstValue([
        order.phone, order.mobile, order.telephone, order.customerPhone,
        customer.phone, customer.mobile, customer.telephone,
        user.phone, user.mobile
    ]) || 'غير محدد';
}

function bklResolveProduct(order = {}) {
    const nested = order.product && typeof order.product === 'object' ? order.product : {};
    let product = null;

    if (typeof products !== 'undefined' && Array.isArray(products)) {
        const productId = bklFirstValue([order.productId, nested.id, order.productID, order.itemId]);
        const productName = bklFirstValue([order.productName, nested.name, order.itemName]);
        product = products.find(p => p && (
            (productId && String(p.id) === String(productId)) ||
            (productName && bklCleanValue(p.name) === productName)
        )) || null;
    }

    const name = bklFirstValue([
        order.productName, nested.name, order.itemName,
        product?.name
    ]) || 'منتج غير محدد';

    const unitPriceUSD = bklToNumber(bklFirstValue([
        order.unitPriceUSD, order.productPriceUSD, order.basePrice,
        order.unitPrice, nested.unitPriceUSD, nested.price, nested.basePrice,
        product?.basePrice
    ]));

    return { product, name, unitPriceUSD };
}

function bklResolveQuantity(order = {}) {
    return Math.max(1, Math.round(bklToNumber(bklFirstValue([
        order.quantity, order.qty, order.count, order.productQuantity
    ]))) || 1);
}

function bklFindDeliveryFeeDZD(state, municipality, order = {}) {
    const direct = [
        order.deliveryFeeDZD, order.deliveryPriceDZD, order.shippingFeeDZD,
        order.deliveryPrice, order.deliveryFee, order.shippingPrice,
        order.shippingFee, order.deliveryCost, order.shippingCost,
        order.deliveryAmount, order.shippingAmount
    ].map(bklToNumber).find(n => n > 0);
    if (direct) return direct;

    const normalize = value => bklCleanValue(value).toLowerCase().replace(/\s+/g, ' ');
    const stateKey = normalize(state);
    const municipalityKey = normalize(municipality);

    const findNumeric = value => {
        if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
        if (!value || typeof value !== 'object') return bklToNumber(value);
        for (const key of ['price','amount','cost','fee','value','deliveryPrice','deliveryFee','shippingPrice','shippingFee','deliveryCost','shippingCost']) {
            const n = bklToNumber(value[key]);
            if (n > 0) return n;
        }
        return 0;
    };

    const search = source => {
        if (!source) return 0;
        if (Array.isArray(source)) {
            const exact = source.find(item => {
                if (!item || typeof item !== 'object') return false;
                const s = normalize(item.state || item.wilaya || item.region || item.province);
                const m = normalize(item.municipality || item.commune || item.city);
                return s === stateKey && m === municipalityKey;
            });
            if (exact) {
                const n = findNumeric(exact);
                if (n > 0) return n;
            }
            const stateOnly = source.find(item => {
                if (!item || typeof item !== 'object') return false;
                const s = normalize(item.state || item.wilaya || item.region || item.province);
                return s === stateKey && !(item.municipality || item.commune || item.city);
            });
            return stateOnly ? findNumeric(stateOnly) : 0;
        }
        if (typeof source !== 'object') return 0;
        const stateEntry = Object.keys(source).find(k => normalize(k) === stateKey);
        if (stateEntry !== undefined) {
            const entry = source[stateEntry];
            if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
                const mk = Object.keys(entry).find(k => normalize(k) === municipalityKey);
                if (mk !== undefined) {
                    const n = findNumeric(entry[mk]);
                    if (n > 0) return n;
                }
                const n = findNumeric(entry);
                if (n > 0) return n;
            } else {
                const n = findNumeric(entry);
                if (n > 0) return n;
            }
        }
        for (const collection of [source.municipalities, source.communes, source.cities]) {
            const n = search(collection);
            if (n > 0) return n;
        }
        for (const key of [`${state}|${municipality}`, `${state} - ${municipality}`, `${state}/${municipality}`, `${state}:${municipality}`]) {
            const actual = Object.keys(source).find(k => normalize(k) === normalize(key));
            if (actual !== undefined) {
                const n = findNumeric(source[actual]);
                if (n > 0) return n;
            }
        }
        return 0;
    };

    const sources = [
        typeof window !== 'undefined' ? window.deliveryPrices : null,
        typeof window !== 'undefined' ? window.shippingPrices : null,
        typeof window !== 'undefined' ? window.deliveryFees : null,
        typeof window !== 'undefined' ? window.shippingFees : null,
        typeof window !== 'undefined' ? window.deliveryCosts : null,
        typeof window !== 'undefined' ? window.shippingCosts : null,
        typeof window !== 'undefined' ? window.deliveryRates : null,
        typeof window !== 'undefined' ? window.shippingRates : null
    ];
    for (const source of sources) {
        const n = search(source);
        if (n > 0) return n;
    }
    for (const key of ['deliveryPrices','shippingPrices','deliveryFees','shippingFees','deliveryCosts','shippingCosts','deliveryRates','shippingRates','delivery_prices','shipping_prices','delivery_fees','shipping_fees']) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            const n = search(JSON.parse(raw));
            if (n > 0) return n;
        } catch (e) {}
    }
    return 0;
}

function bklNormalizeOrder(order) {
    const safeOrder = (order && typeof order === 'object') ? order : {};
    const customerName = bklResolveCustomer(safeOrder);
    const phone = bklResolvePhone(safeOrder);
    const productInfo = bklResolveProduct(safeOrder);
    const quantity = bklResolveQuantity(safeOrder);
    const unitPriceUSD = productInfo.unitPriceUSD;
    const state = bklFirstValue([safeOrder.state, safeOrder.wilaya, safeOrder.region]) || 'غير محددة';
    const municipality = bklFirstValue([safeOrder.municipality, safeOrder.commune, safeOrder.city]) || 'غير محددة';
    const address = bklFirstValue([safeOrder.address, safeOrder.detailedAddress, safeOrder.fullAddress]) || 'غير محدد';
    const deliveryFeeDZD = bklFindDeliveryFeeDZD(state, municipality, safeOrder);
    const productSubtotalUSD = unitPriceUSD * quantity;
    const deliveryFeeUSD = currencyConfig.DZD.rate > 0 ? deliveryFeeDZD / currencyConfig.DZD.rate : 0;
    const grandTotalUSD = productSubtotalUSD + deliveryFeeUSD;

    return {
        ...safeOrder,
        customerName,
        phone,
        country: bklFirstValue([safeOrder.country]) || 'الجزائر',
        state,
        municipality,
        address,
        productId: bklFirstValue([safeOrder.productId, safeOrder.product?.id]),
        productName: productInfo.name,
        unitPriceUSD,
        quantity,
        size: bklFirstValue([safeOrder.size, safeOrder.product?.size]),
        color: bklFirstValue([safeOrder.color, safeOrder.product?.color]),
        paymentMethod: bklFirstValue([safeOrder.paymentMethod, safeOrder.payment, safeOrder.payMethod]) || 'الدفع عند الاستلام',
        deliveryFeeDZD,
        deliveryFeeUSD,
        productSubtotalUSD,
        grandTotalUSD,
        unitPriceDZD: Math.round(unitPriceUSD * currencyConfig.DZD.rate),
        productSubtotalDZD: Math.round(productSubtotalUSD * currencyConfig.DZD.rate),
        grandTotalDZD: Math.round(grandTotalUSD * currencyConfig.DZD.rate),
        totalPriceFormatted: formatPrice(grandTotalUSD)
    };
}

function renderOrdersList() {
    const container = document.getElementById('owner-orders-container');
    const countEl = document.getElementById('owner-orders-count');
    const orders = getStoreOrders();

    if (countEl) countEl.innerText = `(${orders.length})`;
    if (!container) return;
    if (orders.length === 0) {
        container.innerHTML = `<div class="text-neutral-400 text-[11px] p-3 text-center bg-white rounded-xl border border-neutral-100">لا توجد طلبات شراء مسجلة حالياً</div>`;
        return;
    }

    const escape = value => String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');

    container.innerHTML = orders.map(rawOrder => {
        const order = bklNormalizeOrder(rawOrder);
        let statusBadgeClass = 'bg-amber-100 text-amber-800 border-amber-200';
        if (order.status === 'مؤكد') statusBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
        if (order.status === 'ملغى') statusBadgeClass = 'bg-rose-100 text-rose-800 border-rose-200';

        return `
            <div class="bg-white p-3 rounded-xl border border-neutral-200 flex flex-col gap-2 shadow-sm mb-2">
                <div class="flex justify-between items-center border-b pb-2">
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-xs text-neutral-900">📦 طلب رقم #${escape(order.id)}</span>
                        <span class="text-[10px] px-2 py-0.5 rounded-md font-bold border ${statusBadgeClass}">${escape(order.status || 'قيد الانتظار')}</span>
                    </div>
                    <span class="text-[10px] text-neutral-400 font-normal dir-ltr">🕒 ${escape(order.date || '')}</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-700">
                    <div>
                        <p class="font-bold text-neutral-900">👤 العميل: ${escape(order.customerName)}</p>
                        <p class="text-[11px] text-neutral-500">📞 الهاتف: ${escape(order.phone)}</p>
                        <p class="text-[11px] text-neutral-500">📍 العنوان: ${escape(order.state)} - ${escape(order.municipality)} (${escape(order.address)})</p>
                    </div>
                    <div class="sm:text-left">
                        <p class="font-bold text-amber-600">🛍️ المنتج: ${escape(order.productName)}</p>
                        <p class="text-[11px] text-neutral-600">الكمية: ${order.quantity} | التفاصيل: ${escape(order.size ? 'مقاس: ' + order.size : '')} ${escape(order.color ? 'لون: ' + order.color : '')}</p>
                        <p class="font-bold text-neutral-900 mt-0.5">💰 الإجمالي: ${escape(order.totalPriceFormatted)}</p>
                    </div>
                </div>
                <div class="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                    <button onclick="updateOrderStatus('${escape(order.id)}', 'مؤكد')" class="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer">✅ تأكيد الطلب</button>
                    <button onclick="editOrderPrompt('${escape(order.id)}')" class="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer">✏️ تعديل</button>
                    <button onclick="printOrderInvoice('${escape(order.id)}')" class="bg-neutral-800 hover:bg-neutral-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1">🖨️ طباعة الفاتورة</button>
                    <button onclick="deleteOrder('${escape(order.id)}')" class="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer">🗑️ حذف</button>
                </div>
            </div>
        `;
    }).join('');
}

function updateOrderStatus(orderId, newStatus) {
    const orders = getStoreOrders();
    const order = orders.find(o => o.id == orderId);
    if (order) {
        order.status = newStatus;
        saveStoreOrders();
        renderOrdersList();
    }
}

function deleteOrder(orderId) {
    if (confirm("هل أنت متأكد من حذف هذا الطلب نهائياً؟")) {
        storeOrdersList = getStoreOrders().filter(o => o.id != orderId);
        saveStoreOrders();
        renderOrdersList();
    }
}

function editOrderPrompt(orderId) {
    const orders = getStoreOrders();
    const rawOrder = orders.find(o => o.id == orderId);
    if (!rawOrder) return;

    const order = bklNormalizeOrder(rawOrder);
    const newQty = prompt("تعديل الكمية المطلوبة:", order.quantity);
    if (newQty !== null && newQty !== "" && !isNaN(newQty)) {
        const qty = Math.max(1, parseInt(newQty, 10) || 1);
        rawOrder.quantity = qty;
        rawOrder.productSubtotalUSD = order.unitPriceUSD * qty;
        rawOrder.deliveryFeeDZD = order.deliveryFeeDZD;
        rawOrder.grandTotalDZD = Math.round((rawOrder.productSubtotalUSD + (order.deliveryFeeDZD / currencyConfig.DZD.rate)) * currencyConfig.DZD.rate);
        rawOrder.totalPriceFormatted = formatPrice(rawOrder.productSubtotalUSD + (order.deliveryFeeDZD / currencyConfig.DZD.rate));
        saveStoreOrders();
        renderOrdersList();
    }
}

function printOrderInvoice(orderId) {
    const orders = getStoreOrders();
    const rawOrder = orders.find(o => o.id == orderId);
    if (!rawOrder) return;

    const order = bklNormalizeOrder(rawOrder);
    const escapeHtml = value => String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const unitPriceFormatted = formatPrice(order.unitPriceUSD);
    const productSubtotalFormatted = formatPrice(order.productSubtotalUSD);
    const shippingFormatted = `${Math.round(order.deliveryFeeDZD)} د.ج`;
    const grandTotalFormatted = `${Math.round(order.grandTotalDZD)} د.ج`;
    const customerName = order.customerName;
    const customerPhone = order.phone;
    const country = order.country;
    const state = order.state;
    const municipality = order.municipality;
    const address = order.address;
    const orderDate = bklCleanValue(order.date) || getCurrentFullDateTime();
    const orderStatus = bklCleanValue(order.status) || 'قيد الانتظار';
    const orderIdText = bklCleanValue(order.id) || 'غير محدد';
    const specifications = [
        order.size ? `المقاس: ${order.size}` : '',
        order.color ? `اللون: ${order.color}` : ''
    ].filter(Boolean).join(' - ') || '—';

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
        alert('تعذر فتح نافذة الفاتورة. يرجى السماح بالنوافذ المنبثقة من المتجر.');
        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>فاتورة شراء - #${escapeHtml(orderIdText)}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; padding: 30px; color: #111; line-height: 1.6; background: #fff; }
                .invoice-box { max-width: 700px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 0 10px rgba(0,0,0,.05); }
                .header { display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #f59e0b; padding-bottom:15px; margin-bottom:20px; gap:15px; }
                .logo { font-size:22px; font-weight:bold; color:#d97706; }
                .title { font-size:18px; font-weight:bold; color:#333; }
                .info-section { display:flex; justify-content:space-between; gap:15px; margin-bottom:20px; font-size:13px; }
                .info-box { background:#f9fafb; padding:12px; border-radius:8px; width:48%; border:1px solid #e5e7eb; box-sizing:border-box; }
                table { width:100%; border-collapse:collapse; margin-top:20px; font-size:13px; }
                table th { background:#111; color:#fff; padding:10px; text-align:right; }
                table td { border-bottom:1px solid #eee; padding:10px; text-align:right; }
                .summary { margin-top:20px; border-top:1px solid #ddd; padding-top:10px; }
                .summary-row { display:flex; justify-content:space-between; padding:7px 0; }
                .summary-row.total { font-size:18px; font-weight:bold; color:#d97706; border-top:2px solid #f59e0b; margin-top:8px; padding-top:12px; }
                .footer { text-align:center; margin-top:35px; padding-top:15px; border-top:1px solid #eee; color:#777; font-size:12px; }
                @media print { body { padding:0; } .invoice-box { box-shadow:none; border:none; } }
            </style>
        </head>
        <body>
            <div class="invoice-box">
                <div class="header">
                    <div class="logo">Maison BKL - متجر السوق الذكي</div>
                    <div class="title">فاتورة شراء رقم #${escapeHtml(orderIdText)}</div>
                </div>

                <div class="info-section">
                    <div class="info-box">
                        <strong>معلومات الزبون:</strong><br>
                        الاسم: ${escapeHtml(customerName)}<br>
                        الهاتف: ${escapeHtml(customerPhone)}<br>
                        البلد: ${escapeHtml(country)}<br>
                        الولاية: ${escapeHtml(state)}<br>
                        البلدية: ${escapeHtml(municipality)}<br>
                        العنوان بالتفصيل: ${escapeHtml(address)}
                    </div>
                    <div class="info-box">
                        <strong>تفاصيل الفاتورة:</strong><br>
                        التاريخ: ${escapeHtml(orderDate)}<br>
                        حالة الطلب: ${escapeHtml(orderStatus)}<br>
                        طريقة الدفع: ${escapeHtml(order.paymentMethod)}
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>المنتج</th>
                            <th>سعر الوحدة</th>
                            <th>المواصفات</th>
                            <th>الكمية</th>
                            <th>المجموع</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${escapeHtml(order.productName)}</td>
                            <td>${escapeHtml(unitPriceFormatted)}</td>
                            <td>${escapeHtml(specifications)}</td>
                            <td>${order.quantity}</td>
                            <td>${escapeHtml(productSubtotalFormatted)}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="summary">
                    <div class="summary-row">
                        <span>مجموع المنتجات:</span>
                        <strong>${escapeHtml(productSubtotalFormatted)}</strong>
                    </div>
                    <div class="summary-row">
                        <span>سعر التوصيل (${escapeHtml(state)} - ${escapeHtml(municipality)}):</span>
                        <strong>${escapeHtml(shippingFormatted)}</strong>
                    </div>
                    <div class="summary-row total">
                        <span>المبلغ الإجمالي:</span>
                        <strong>${escapeHtml(grandTotalFormatted)}</strong>
                    </div>
                </div>

                <div class="footer">شكراً لتسوقكم معنا! لأي استفسار يرجى الاتصال بخدمة الزبائن.</div>
            </div>
            <script>window.onload = function(){ window.print(); }</script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// دالة التحديث الفوري المباشر والدوري كل 5 ثوانٍ
setInterval(function() {
    if (document.getElementById('owner-dashboard-modal') && !document.getElementById('owner-dashboard-modal').classList.contains('hidden')) {
        renderOrdersList();
    }
}, 5000);

// ==========================================
// 4. لوحة تحكم صاحب المتجر
// ==========================================
function hasDevAccess() { return true; }

function openOwnerDashboard() {
    if (!hasDevAccess()) {
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

                <div class="mb-6 flex justify-between items-center bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                    <div>
                        <h4 class="text-xs font-bold text-indigo-900">سجل نشاط وحضور المشرفين</h4>
                        <p class="text-[10px] text-indigo-700">متابعة الحضور والغياب مع الوقت والتاريخ الكامل</p>
                    </div>
                    <button onclick="openAdminActivityLogModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-xl font-bold transition cursor-pointer shadow-sm">📊 فتح السجل</button>
                </div>

                <!-- حاوية إدارة الطلبات وفواتير الشراء بعد سجل النشاط مباشرة -->
                <div class="mb-6 bg-neutral-50 p-3 rounded-xl border border-neutral-200 shadow-sm">
                    <h4 class="text-xs font-bold text-emerald-700 mb-2 flex items-center justify-between">
                        <span>📦 إدارة الطلبات وفواتير الشراء <span id="owner-orders-count" class="text-neutral-500 font-normal">(${getStoreOrders().length})</span></span>
                        <button onclick="renderOrdersList()" class="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md hover:bg-emerald-200 transition">🔄 تحديث</button>
                    </h4>
                    <div id="owner-orders-container" class="orders-list-container space-y-2 text-xs text-neutral-700 max-h-56 overflow-y-auto"></div>
                </div>

                <!-- قسم شكاوى وملاحظات الزبائن الواردة -->
                <div class="mb-6">
                    <h4 class="text-xs font-bold text-amber-600 mb-2">شكاوى وملاحظات الزبائن الواردة (<span id="owner-complaints-count" class="complaints-count">${storeComplaints.length}</span>)</h4>
                    <div id="owner-complaints-container" class="complaints-list-container space-y-2 text-xs text-neutral-700 max-h-56 overflow-y-auto"></div>
                </div>

                <div class="mb-6">
                    <h4 class="text-xs font-bold text-red-600 mb-2">القائمة السوداء وحظر الزبائن</h4>
                    <div class="flex gap-2 mb-2">
                        <input id="blacklist-customer-name" type="text" placeholder="اسم أو بريد الزبون للحظر..." class="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2 text-xs outline-none">
                        <button onclick="addToBlacklist()" class="bg-red-600 text-white text-xs px-4 py-2 rounded-xl whitespace-nowrap cursor-pointer">حظر الزبون</button>
                    </div>
                    <div id="blacklist-container" class="space-y-1 text-xs text-neutral-700"></div>
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

function deleteStoreComplaint(id) {
    storeComplaints = storeComplaints.filter(c => c.id !== id);
    setStoredData('store_complaints', storeComplaints);
    setStoredData('storeComplaints', storeComplaints);
    setStoredData('complaints_data', storeComplaints);
    renderOwnerDashboardData();
}

function addToBlacklist() {
    const input = document.getElementById('blacklist-customer-name');
    const name = (input && input.value) ? input.value.trim() : '';
    if (!name) return;
    blacklistedCustomers.push(name);
    setStoredData('blacklistedCustomers', blacklistedCustomers);
    if (input) input.value = '';
    renderOwnerDashboardData();
}

function removeFromBlacklist(index) {
    blacklistedCustomers.splice(index, 1);
    setStoredData('blacklistedCustomers', blacklistedCustomers);
    renderOwnerDashboardData();
}

// ==========================================
// تصحيح دالة عرض الشكاوى والوسائط في لوحة التحكم
// ==========================================
function renderOwnerDashboardData() {
    storeComplaints = getStoredData('store_complaints', getStoredData('storeComplaints', getStoredData('complaints_data', [])));

    const blacklistContainer = document.getElementById('blacklist-container');
    
    const complaintCountElements = document.querySelectorAll('#owner-complaints-count, #complaints-count, .complaints-count, [data-complaints-count]');
    complaintCountElements.forEach(el => {
        el.innerText = `(${storeComplaints.length})`;
    });

    const complaintContainers = document.querySelectorAll('#owner-complaints-container, #complaints-list-container, #complaints-container, .complaints-container, .complaints-list-container, #complaints-list');
    
    const complaintsHTML = storeComplaints.length === 0 
        ? '<div class="text-neutral-400 text-[11px] p-2 text-center">لا توجد شكاوى أو ملاحظات واردة حالياً</div>' 
        : storeComplaints.map(cmp => {
            // تصحيح واستخراج الوسائط المرفقة بدقة وتجنب التهميش
            let mediaItems = [];
            if (Array.isArray(cmp.media)) {
                mediaItems = cmp.media;
            } else if (cmp.media) {
                mediaItems = [cmp.media];
            }

            const mediaHTML = mediaItems.length > 0 ? `
                <div class="flex items-center gap-2 overflow-x-auto py-2 bg-neutral-100 p-2 rounded-xl border border-neutral-200 my-1">
                    ${mediaItems.map(m => {
                        const mediaUrl = typeof m === 'string' ? m : (m.url || m.src || '');
                        const isVideo = (typeof m === 'object' && m.type === 'video') || (mediaUrl && (mediaUrl.includes('data:video') || mediaUrl.match(/\.(mp4|webm|ogg)$/i)));
                        
                        if (!mediaUrl) return '';

                        if (isVideo) {
                            return `<video src="${mediaUrl}" controls class="w-20 h-20 rounded-lg object-cover border border-neutral-300 bg-black flex-shrink-0"></video>`;
                        } else {
                            return `<a href="${mediaUrl}" target="_blank" title="اضغط لفتح الصورة بحجم كامل"><img src="${mediaUrl}" class="w-20 h-20 rounded-lg object-cover border border-neutral-300 hover:opacity-90 transition flex-shrink-0"></a>`;
                        }
                    }).join('')}
                </div>
            ` : '';

            return `
                <div class="bg-neutral-50 p-3 rounded-xl border border-neutral-200 flex flex-col gap-2 shadow-sm mb-2">
                    <div class="flex justify-between items-center font-bold text-neutral-900">
                        <span class="text-xs">👤 المرسل: ${cmp.customerName || cmp.name || 'زائر مجهول'}</span>
                        <span class="text-[10px] text-neutral-400 font-normal dir-ltr">🕒 ${cmp.date || ''}</span>
                    </div>
                    <p class="text-neutral-700 text-xs bg-white p-2.5 rounded-lg border border-neutral-100 whitespace-pre-wrap">${cmp.details || cmp.text || ''}</p>
                    ${mediaHTML}
                    <div class="flex justify-between items-center pt-2 border-t border-neutral-200 flex-wrap gap-2">
                        <span class="text-[10px] px-2 py-0.5 rounded-md font-bold bg-amber-100 text-amber-700">${cmp.status || 'قيد المراجعة'}</span>
                        <div class="flex items-center gap-2">
                            <button onclick="openComplaintChat('${cmp.id}')" class="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 shadow-sm">
                                💬 المحادثة وفتح الشكوى
                            </button>
                            <button onclick="deleteStoreComplaint('${cmp.id}')" class="text-red-500 hover:text-red-700 text-[11px] cursor-pointer font-bold flex items-center gap-1">
                                🗑️ حذف
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    complaintContainers.forEach(container => {
        container.innerHTML = complaintsHTML;
    });

    if (blacklistContainer) {
        blacklistContainer.innerHTML = blacklistedCustomers.length === 0 ? '<span class="text-neutral-400 text-[11px]">القائمة السوداء فارغة</span>' :
            blacklistedCustomers.map((cust, idx) => `
                <div class="flex justify-between items-center bg-red-50 p-2 rounded-lg border border-red-100 text-red-900">
                    <span>${cust}</span>
                    <button onclick="removeFromBlacklist(${idx})" class="text-neutral-600 hover:text-neutral-900 text-[11px] cursor-pointer">إلغاء الحظر</button>
                </div>
            `).join('');
    }

    renderOrdersList();
}

// ==========================================
// 5. قواميس الترجمة الشاملة
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
        lblProdPrice: "السعر",
        lblCurrentImgs: "صور المنتج الحالية",
        lblAddNewImgs: "إضافة صورة جديدة مع اللون المناسب",
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
        lblProdPrice: "Price",
        lblCurrentImgs: "Current Images",
        lblAddNewImgs: "Add New Image with Color",
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
        lblProdPrice: "Prix",
        lblCurrentImgs: "Images actuelles",
        lblAddNewImgs: "Ajouter une nouvelle image avec couleur",
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
        lblProdPrice: "Precio",
        lblCurrentImgs: "Imágenes Actuales",
        lblAddNewImgs: "Añadir Nueva Imagen con Color",
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
        cardType: "Type de Tarjeta",
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
        lblProdPrice: "Preis",
        lblCurrentImgs: "Aktuelle Bilder",
        lblAddNewImgs: "Neues Bild mit Farbe hinzufügen",
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
        lblProdPrice: "价格",
        lblCurrentImgs: "当前图片",
        lblAddNewImgs: "添加带颜色的新图片",
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
// 6. المقاسات والألوان الديناميكية والكمية
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
    if (qtyInput) qtyInput.value = parseInt(qtyInput.value || 1) + 1;
}

function decrementQuantity() {
    const qtyInput = document.getElementById('product-quantity');
    if (qtyInput) {
        let currentVal = parseInt(qtyInput.value || 1);
        if (currentVal > 1) qtyInput.value = currentVal - 1;
    }
}

// ==========================================
// 7. بيانات الولايات ووظائف المتجر والتصنيفات
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
    "55 - توقرت", "56 - جانت", "57 - عين صالح", "58 - عين قزام",
    "59 - أفلو", "60 - بريكة", "61 - القنطرة", "62 - بئر العاتر", "63 - العريشة",
    "64 - قصر الشلالة", "65 - البيرين", "66 - مسعد", "67 - عين وسارة", "68 - بوسعادة",
    "69 - الأبيض سيدي الشيخ"
];

function onCountryChange() {
    const countryEl = document.getElementById('pay-country');
    if (!countryEl) return;
    const country = countryEl.value;
    const stateContainer = document.getElementById('state-container');
    const t = translations[currentLang] || translations.ar;
    
    if (!stateContainer) return;

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
    const searchTerm = (query || '').toLowerCase().trim();
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    const filtered = products.filter(product => {
        const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
        const matchesSearch = (product.name || '').toLowerCase().includes(searchTerm) || 
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
        let imageHTML = mainImg ? `<img src="${mainImg}" class="w-full h-full object-cover rounded-xl" alt="">` : `<span class="text-neutral-400 text-[10px]">Photo</span>`;

        grid.innerHTML += `
            <div onclick="selectProduct(${product.id})" class="bg-neutral-50 border border-neutral-200 rounded-2xl p-3 flex flex-col items-center cursor-pointer hover:border-amber-600 transition shadow-sm">
                <div class="w-full h-24 bg-neutral-100 rounded-xl mb-2 flex items-center justify-center overflow-hidden">${imageHTML}</div>
                <span class="text-xs font-medium text-neutral-900 text-center truncate w-full">${product.name}</span>
                <span class="text-xs text-amber-600 font-bold mt-1">${formatPrice(product.basePrice)}</span>
            </div>
        `;
    });
}

function openAddCategoryModal() {
    const idEl = document.getElementById('new-cat-id');
    const nameEl = document.getElementById('new-cat-name');
    if (idEl) idEl.value = "";
    if (nameEl) nameEl.value = "";
    const modal = document.getElementById('category-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeAddCategoryModal() {
    const modal = document.getElementById('category-modal');
    if (modal) modal.classList.add('hidden');
}

function saveNewCategory() {
    const catIdInput = document.getElementById('new-cat-id');
    const catNameInput = document.getElementById('new-cat-name');
    if (!catIdInput || !catNameInput) return;

    const catId = (catIdInput.value || '').trim().toLowerCase().replace(/\s+/g, '-');
    const catName = (catNameInput.value || '').trim();

    if (!catId || !catName) {
        alert("يرجى إدخال معرف واسم صحيح للتصنيف!");
        return;
    }

    if (categories.some(c => c.id === catId)) {
        alert("هذا التصنيف موجود مسبقاً!");
        return;
    }

    categories.push({ id: catId, name: { ar: catName, en: catName, fr: catName, es: catName, de: catName, zh: catName } });
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
        let activeClasses = isActive ? 'bg-neutral-900 text-white shadow-sm' : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-400 transition';

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
    if (typeof checkAdminFashionVisibility === 'function') checkAdminFashionVisibility();
}

let selectedProduct = null;
let currentEditingImages = []; 
let currentEditingSizes = [];
let currentImageMappings = [];

function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    grid.innerHTML = "";

    const filteredProducts = currentCategory === 'all' ? products : products.filter(p => p.category === currentCategory);

    if (filteredProducts.length === 0) {
        grid.innerHTML = `<div class="col-span-2 text-center text-xs text-neutral-400 py-6">لا توجد منتجات في هذا القسم</div>`;
        return;
    }

    filteredProducts.forEach(product => {
        let mainImg = (product.images && product.images.length > 0) ? product.images[0] : "";
        let imageHTML = mainImg ? `<img src="${mainImg}" class="w-full h-full object-cover rounded-xl" alt="">` : `<span class="text-neutral-400 text-[10px]">Photo</span>`;

        grid.innerHTML += `
            <div onclick="selectProduct(${product.id})" class="bg-neutral-50 border border-neutral-200 rounded-2xl p-3 flex flex-col items-center cursor-pointer hover:border-amber-600 transition shadow-sm">
                <div class="w-full h-24 bg-neutral-100 rounded-xl mb-2 flex items-center justify-center overflow-hidden">${imageHTML}</div>
                <span class="text-xs font-medium text-neutral-900 text-center truncate w-full">${product.name}</span>
                <span class="text-xs text-amber-600 font-bold mt-1">${formatPrice(product.basePrice)}</span>
            </div>
        `;
    });
}

function openAddModal() {
    const t = translations[currentLang];
    const editIdInput = document.getElementById('edit-product-id');
    if (editIdInput) editIdInput.value = "";
    
    const modalTitle = document.getElementById('modal-title');
    if (modalTitle) modalTitle.innerText = t.modalTitleAdd;

    const newName = document.getElementById('new-name');
    if (newName) newName.value = "";
    const newPrice = document.getElementById('new-price');
    if (newPrice) newPrice.value = "";
    const newDesc = document.getElementById('new-desc');
    if (newDesc) newDesc.value = "";
    
    currentEditingImages = [];
    sizesEnabled = false;
    currentEditingSizes = [];
    currentImageMappings = [];

    renderEditImagesPreview();
    renderEditingOptions();
    checkAdminFashionVisibility();
    
    const addModal = document.getElementById('add-modal');
    if (addModal) addModal.classList.remove('hidden');
}

function openEditModal() {
    if (!selectedProduct) return;
    const t = translations[currentLang];
    
    const editIdInput = document.getElementById('edit-product-id');
    if (editIdInput) editIdInput.value = selectedProduct.id;
    const modalTitle = document.getElementById('modal-title');
    if (modalTitle) modalTitle.innerText = t.modalTitleEdit;
    
    const newName = document.getElementById('new-name');
    if (newName) newName.value = selectedProduct.name;
    const newPrice = document.getElementById('new-price');
    if (newPrice) newPrice.value = selectedProduct.basePrice;
    const newDesc = document.getElementById('new-desc');
    if (newDesc) newDesc.value = selectedProduct.description;
    
    currentEditingImages = [...(selectedProduct.images || [])];
    sizesEnabled = selectedProduct.sizesEnabled !== undefined ? selectedProduct.sizesEnabled : true;
    currentEditingSizes = [...(selectedProduct.sizes || ["M"])];
    currentImageMappings = JSON.parse(JSON.stringify(selectedProduct.imageMappings || []));

    renderEditImagesPreview();
    renderEditingOptions();
    checkAdminFashionVisibility();
    
    const addModal = document.getElementById('add-modal');
    if (addModal) addModal.classList.remove('hidden');
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
                <button onclick="removeEditingImage(${index})" type="button" class="absolute top-0.5 right-0.5 bg-white hover:bg-red-600 text-red-600 hover:text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition cursor-pointer shadow">🗑️</button>
            </div>
        `;
    });

    if (typeof renderImageMappingRows === 'function') renderImageMappingRows();
}

function removeEditingImage(index) {
    let imgSrc = currentEditingImages[index];
    currentEditingImages.splice(index, 1);
    currentImageMappings = currentImageMappings.filter(m => m.image !== imgSrc);
    renderEditImagesPreview();
}

function injectAdminColorSizeInputsIfNeeded() {
    // تم تنظيف نافذة إضافة/تعديل المنتج:
    // لا توجد حقول لإضافة صور جديدة أو ألوان أو مقاسات من هذه النافذة.
    // الصور الحالية تبقى قابلة للعرض، وتبقى بيانات المنتج الحالية محفوظة دون حذف.
    return;
}

function toggleSizesActivation(isEnabled) {
    sizesEnabled = isEnabled;
    const wrapper = document.getElementById('sizes-management-wrapper');
    if (wrapper) {
        if (isEnabled) wrapper.classList.remove('hidden');
        else wrapper.classList.add('hidden');
    }
}

function addImageWithColor() {
    const fileInput = document.getElementById('new-image-file-single');
    const colorPicker = document.getElementById('new-image-color-picker');
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        alert("يرجى اختيار صورة أولاً!");
        return;
    }
    const file = fileInput.files[0];
    const chosenColor = colorPicker ? colorPicker.value : '#000000';

    const reader = new FileReader();
    reader.onload = function(e) {
        const imgSrc = e.target.result;
        currentEditingImages.push(imgSrc);
        currentImageMappings.push({ image: imgSrc, color: chosenColor, size: currentEditingSizes[0] || 'M' });
        fileInput.value = '';
        renderEditImagesPreview();
    };
    reader.readAsDataURL(file);
}

function renderEditingOptions() {
    // تم تنظيف خيارات الإضافة من الصور والألوان والمقاسات.
    // نكتفي بعرض الصور الحالية الموجودة في المنتج.
    renderEditImagesPreview();
}

function renderImageMappingRows() {
    const container = document.getElementById('image-mapping-rows-container');
    if (!container) return;

    if (currentEditingImages.length === 0) {
        container.innerHTML = `<span class="text-neutral-400 text-[10px]">الرجاء إضافة صور أولاً للربط</span>`;
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
                            <span class="text-[10px] text-neutral-700 font-bold truncate">${mapping.size || 'المقاس'}</span>
                            <span class="text-[10px] text-neutral-400">▼</span>
                        </button>
                        <div id="${sizeDropdownId}" class="hidden absolute bottom-full mb-1 right-0 w-40 bg-white border border-neutral-200 rounded-xl shadow-lg p-2 z-30 max-h-36 overflow-y-auto flex flex-col gap-1">
                            ${allSizes.map(sz => `<div onclick="selectImageSizeMapping(${imgIndex}, '${sz}')" class="px-2 py-1 hover:bg-amber-50 text-[11px] font-medium text-neutral-800 rounded-lg cursor-pointer">${sz}</div>`).join('')}
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
    if (mapping) mapping.color = newColor;
    else currentImageMappings.push({ image: imgSrc, color: newColor, size: currentEditingSizes[0] || 'M' });
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
    if (mapping) mapping.size = sizeVal;
    else currentImageMappings.push({ image: imgSrc, color: '#000000', size: sizeVal });
    
    const el = document.getElementById(`dropdown-size-${imgIndex}`);
    if (el) el.classList.add('hidden');
    renderImageMappingRows();
}

function checkAdminFashionVisibility() {
    const section = document.getElementById('image-mapping-section');
    if (!section) return;
    if (currentCategory === 'fashion') section.classList.remove('hidden');
    else section.classList.add('hidden');
}

function addEditingSize(val) {
    if (val && !currentEditingSizes.includes(val)) {
        currentEditingSizes.push(val);
        renderEditingOptions();
    }
}

function addSizeOption() {
    const input = document.getElementById('new-size-input');
    const val = input && input.value ? input.value.trim().toUpperCase() : '';
    if (val) {
        addEditingSize(val);
        input.value = '';
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
    const editIdEl = document.getElementById('edit-product-id');
    const nameEl = document.getElementById('new-name');
    const priceEl = document.getElementById('new-price');
    const descEl = document.getElementById('new-desc');

    const editId = editIdEl ? editIdEl.value : "";
    const name = nameEl && nameEl.value ? nameEl.value.trim() : "";
    const priceVal = priceEl ? parseFloat(priceEl.value) : NaN;
    const desc = descEl && descEl.value ? descEl.value.trim() : "";
    const t = translations[currentLang] || translations.ar;

    if (name === "" || isNaN(priceVal)) {
        alert(t.priceAlert);
        return;
    }

    const derivedColors = Array.from(new Set(currentImageMappings.map(m => m.color)));
    processSave(editId, name, priceVal, currentEditingImages, desc, derivedColors.length > 0 ? derivedColors : ["#000000"], currentEditingSizes, currentImageMappings);
}

function processSave(editId, name, basePrice, imagesArray, desc, colorsArray, sizesArray, mappingsArray) {
    const t = translations[currentLang] || translations.ar;
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
    if (editId !== "" && selectedProduct) selectProduct(selectedProduct.id);
    else goToPage('page-1');
}

function deleteCurrentProduct() {
    const t = translations[currentLang] || translations.ar;
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
        window.__bklSelectedProductSnapshot = { id: selectedProduct.id, name: selectedProduct.name, basePrice: selectedProduct.basePrice };
        window.currentCheckoutProductId = selectedProduct.id;
        window.currentCheckoutProductName = selectedProduct.name;
        window.currentCheckoutUnitPriceUSD = Number(selectedProduct.basePrice) || 0;
        const nameEl = document.getElementById('product-name');
        const priceEl = document.getElementById('product-price');
        const descEl = document.getElementById('product-desc');

        if (nameEl) nameEl.innerText = selectedProduct.name;
        if (priceEl) priceEl.innerText = formatPrice(selectedProduct.basePrice);
        if (descEl) descEl.innerText = selectedProduct.description;
        
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
    if (!thumbnailsContainer) return;
    thumbnailsContainer.innerHTML = "";

    if (selectedProduct && selectedProduct.images && selectedProduct.images.length > 0) {
        if (detailImg) {
            detailImg.src = selectedProduct.images[imageIndex];
            detailImg.classList.remove('hidden');
        }
        if (detailPlaceholder) detailPlaceholder.classList.add('hidden');

        let clickedImgSrc = selectedProduct.images[imageIndex];
        if (selectedProduct.imageMappings && selectedProduct.imageMappings.length > 0) {
            let mapping = selectedProduct.imageMappings.find(m => m.image === clickedImgSrc);
            if (mapping) {
                if (mapping.color) {
                    selectedColor = mapping.color;
                    const colorBtns = document.querySelectorAll('#product-colors-container button');
                    colorBtns.forEach(btn => {
                        if (btn.style.backgroundColor && rgbToHex(btn.style.backgroundColor).toLowerCase() === mapping.color.toLowerCase()) {
                            btn.click();
                        }
                    });
                }
                if (mapping.size && selectedProduct.sizesEnabled !== false) {
                    selectedSize = mapping.size;
                    const sizeBtns = document.querySelectorAll('.size-btn');
                    sizeBtns.forEach(btn => {
                        if ((btn.innerText || '').trim() === mapping.size) btn.click();
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
        if (detailImg) detailImg.classList.add('hidden');
        if (detailPlaceholder) detailPlaceholder.classList.remove('hidden');
    }
}

function rgbToHex(rgb) {
    if (!rgb || !rgb.startsWith('rgb')) return rgb || '';
    let match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return rgb;
    function hex(x) { return ("0" + parseInt(x).toString(16)).slice(-2); }
    return "#" + hex(match[1]) + hex(match[2]) + hex(match[3]);
}

function goToPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.add('hidden'));
    const target = document.getElementById(pageId);
    if (target) target.classList.remove('hidden');
    if (pageId === 'page-1') renderProducts();
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
    window.currentCheckoutProductId = selectedProduct.id;
    window.currentCheckoutProductName = selectedProduct.name;
    window.currentCheckoutUnitPriceUSD = Number(selectedProduct.basePrice) || 0;
    window.__bklSelectedProductSnapshot = { id: selectedProduct.id, name: selectedProduct.name, basePrice: Number(selectedProduct.basePrice) || 0 };
    goToPage('page-3');
}

// ==========================================
// 8. دالة إتمام الطلب الانتقالية وتسجيل الطلبيات
// ==========================================
function confirmOrder() {
    if (window.__bklOrderBeingCreated) return;
    window.__bklOrderBeingCreated = true;

    try {
        const readValue = (ids, selectors = []) => bklFirstValue([
            bklReadElementValue(ids),
            bklReadSelectorValue(selectors)
        ]);

        const firstName = readValue(
            ['pay-firstname','pay-first-name','firstname','first-name','customer-firstname','customer-first-name'],
            ['input[name="firstname"]','input[name="firstName"]','input[name="first-name"]']
        );
        const lastName = readValue(
            ['pay-lastname','pay-last-name','lastname','last-name','customer-lastname','customer-last-name'],
            ['input[name="lastname"]','input[name="lastName"]','input[name="last-name"]']
        );
        const fullNameField = readValue(
            ['pay-name','pay-fullname','pay-customer-name','customer-name','full-name'],
            ['input[name="name"]','input[name="fullName"]','input[name="customerName"]']
        );
        const phone = readValue(
            ['pay-phone','phone','customer-phone','customerPhone'],
            ['input[type="tel"]','input[name="phone"]','input[name="mobile"]']
        ) || 'غير محدد';
        const address = readValue(
            ['pay-detailed-address','pay-address','detailed-address','customer-address'],
            ['textarea[name="address"]','input[name="address"]']
        );
        const country = readValue(['pay-country','country','customer-country']) || 'الجزائر';
        const state = readValue(
            ['pay-state-select','pay-state-input','pay-state','state','wilaya'],
            ['select[name="state"]','select[name="wilaya"]','input[name="state"]','input[name="wilaya"]']
        );
        const municipality = readValue(
            ['pay-municipality','municipality','commune','city'],
            ['select[name="municipality"]','select[name="commune"]','input[name="municipality"]','input[name="commune"]']
        );
        const paymentMethodRaw = readValue(
            ['pay-payment-method','payment-method','card-type'],
            ['select[name="paymentMethod"]','select[name="payment"]']
        ) || 'cod';
        const paymentMethodLabels = {
            edahabia: 'البطاقة الذهبية (Edahabia)',
            cib: 'بطاقة CIB',
            cod: 'الدفع عند الاستلام',
            cash: 'الدفع نقداً'
        };
        const paymentMethod = paymentMethodLabels[paymentMethodRaw] || paymentMethodRaw;
        const deliveryFeeDZD = Math.max(0, bklToNumber(readValue(
            ['pay-delivery-price','delivery-price','shipping-price','deliveryFee','deliveryPrice'],
            ['input[name="deliveryPrice"]','input[name="shippingPrice"]','input[name="deliveryFee"]']
        )));

        const customerName = bklFirstValue([
            fullNameField,
            `${firstName} ${lastName}`.trim()
        ]) || 'زبون مجهول';

        // حفظ نسخة كاملة من المنتج قبل الانتقال من صفحة الدفع حتى لا تعتمد الفاتورة على حالة الواجهة لاحقاً.
        const product = (typeof selectedProduct !== 'undefined' && selectedProduct) ? selectedProduct :
            (window.__bklSelectedProductSnapshot || null);
        const quantity = Math.max(1, parseInt(window.currentCheckoutQuantity, 10) || parseInt(bklReadElementValue(['product-quantity']), 10) || 1);
        const unitPriceUSD = product ? bklToNumber(product.basePrice) : bklToNumber(window.currentCheckoutUnitPriceUSD);
        const productName = product ? bklCleanValue(product.name) : bklCleanValue(window.currentCheckoutProductName);
        const productId = product ? product.id : (window.currentCheckoutProductId || null);
        const size = bklFirstValue([window.currentCheckoutSize, window.__bklSelectedProductSnapshot?.size]);
        const color = bklFirstValue([window.currentCheckoutColor, window.__bklSelectedProductSnapshot?.color]);
        const productSubtotalUSD = unitPriceUSD * quantity;
        const deliveryFeeUSD = currencyConfig.DZD.rate > 0 ? deliveryFeeDZD / currencyConfig.DZD.rate : 0;
        const grandTotalUSD = productSubtotalUSD + deliveryFeeUSD;

        const newOrder = {
            id: Date.now(),
            customerName,
            firstName,
            lastName,
            fullName: customerName,
            phone,
            country,
            state,
            municipality,
            address,
            productId,
            productName: productName || 'منتج غير محدد',
            unitPriceUSD,
            quantity,
            size,
            color,
            paymentMethod,
            productSubtotalUSD,
            deliveryFeeDZD,
            deliveryFeeUSD,
            grandTotalUSD,
            unitPriceDZD: Math.round(unitPriceUSD * currencyConfig.DZD.rate),
            productSubtotalDZD: Math.round(productSubtotalUSD * currencyConfig.DZD.rate),
            grandTotalDZD: Math.round(grandTotalUSD * currencyConfig.DZD.rate),
            totalPriceFormatted: formatPrice(grandTotalUSD),
            date: getCurrentFullDateTime(),
            status: 'قيد الانتظار'
        };

        // الاحتفاظ بلقطة المنتج داخل الطلب نفسه.
        if (product) {
            newOrder.product = {
                id: product.id,
                name: product.name,
                basePrice: unitPriceUSD,
                size,
                color
            };
        }

        storeOrdersList = getStoreOrders();
        if (!Array.isArray(storeOrdersList)) storeOrdersList = [];
        storeOrdersList.unshift(newOrder);
        saveStoreOrders();

        if (typeof renderOrdersList === 'function') renderOrdersList();
        if (typeof renderOwnerDashboardData === 'function') renderOwnerDashboardData();
        completeCheckoutOrder();
    } finally {
        setTimeout(() => { window.__bklOrderBeingCreated = false; }, 300);
    }
}

function completeCheckoutOrder() {
    goToPage('page-5');
}
