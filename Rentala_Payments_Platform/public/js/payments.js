class PaymentsManager {
    constructor() {
        this.payments = [];
        this.tenants = [];
        this.properties = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.init();
    }
    
    async init() {
        console.log('í²³ Payments Manager Initializing...');
        this.setupEventListeners();
        await this.loadData();
        this.renderPayments();
        this.updateStats();
    }
    
    async loadData() {
        // Sample data
        this.tenants = [
            { id: '1', name: 'John Smith' },
            { id: '2', name: 'Sarah Johnson' },
            { id: '3', name: 'Mike Wilson' },
            { id: '4', name: 'Emma Davis' },
            { id: '5', name: 'David Brown' }
        ];
        
        this.properties = [
            { id: '1', name: 'Sunset Villa' },
            { id: '2', name: 'Mountain View' },
            { id: '3', name: 'City Center Apt' },
            { id: '4', name: 'Garden House' },
            { id: '5', name: 'Lake View' }
        ];
        
        // Try to load from localStorage
        const saved = localStorage.getItem('rentala_payments');
        if (saved) {
            this.payments = JSON.parse(saved);
        } else {
            // Sample payments
            this.payments = [
                {
                    id: '1',
                    tenantId: '1',
                    tenantName: 'John Smith',
                    propertyId: '1',
                    propertyName: 'Sunset Villa',
                    amount: 8500,
                    date: '2024-01-15',
                    method: 'bank_transfer',
                    status: 'completed',
                    reference: 'TXN001234',
                    notes: 'Monthly rent payment'
                },
                {
                    id: '2',
                    tenantId: '2',
                    tenantName: 'Sarah Johnson',
                    propertyId: '2',
                    propertyName: 'Mountain View',
                    amount: 7200,
                    date: '2024-01-10',
                    method: 'eft',
                    status: 'pending',
                    reference: 'TXN001235',
                    notes: 'Partial payment'
                },
                {
                    id: '3',
                    tenantId: '3',
                    tenantName: 'Mike Wilson',
                    propertyId: '3',
                    propertyName: 'City Center Apt',
                    amount: 9500,
                    date: '2023-12-25',
                    method: 'cash',
                    status: 'overdue',
                    reference: 'TXN001236',
                    notes: 'Overdue payment'
                }
            ];
            this.saveToLocalStorage();
        }
        
        this.populateSelects();
    }
    
    populateSelects() {
        const tenantSelect = document.getElementById('paymentTenant');
        const propertySelect = document.getElementById('paymentProperty');
        
        if (tenantSelect) {
            this.tenants.forEach(tenant => {
                const option = document.createElement('option');
                option.value = tenant.id;
                option.textContent = tenant.name;
                tenantSelect.appendChild(option);
            });
        }
        
        if (propertySelect) {
            this.properties.forEach(property => {
                const option = document.createElement('option');
                option.value = property.id;
                option.textContent = property.name;
                propertySelect.appendChild(option);
            });
        }
    }
    
    setupEventListeners() {
        // Mobile menu
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }
        
        // Search
        const searchInputs = ['paymentSearch', 'advancedSearch'];
        searchInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', (e) => {
                    this.searchTerm = e.target.value.toLowerCase();
                    this.renderPayments();
                });
            }
        });
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.getAttribute('data-filter');
                this.renderPayments();
            });
        });
        
        // Record payment
        const recordBtn = document.getElementById('recordPaymentBtn');
        if (recordBtn) {
            recordBtn.addEventListener('click', () => this.openRecordPaymentModal());
        }
        
        // Modal controls
        this.setupModalControls();
    }
    
    setupModalControls() {
        const closeModalBtn = document.getElementById('closeModalBtn');
        const closeFormBtn = document.getElementById('closeFormModalBtn');
        const cancelFormBtn = document.getElementById('cancelFormBtn');
        const submitFormBtn = document.getElementById('submitFormBtn');
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                document.getElementById('paymentDetailModal').style.display = 'none';
            });
        }
        
        if (closeFormBtn) {
            closeFormBtn.addEventListener('click', () => {
                document.getElementById('paymentFormModal').style.display = 'none';
            });
        }
        
        if (cancelFormBtn) {
            cancelFormBtn.addEventListener('click', () => {
                document.getElementById('paymentFormModal').style.display = 'none';
            });
        }
        
        if (submitFormBtn) {
            submitFormBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.submitPaymentForm();
            });
        }
        
        // Close modals on outside click
        window.addEventListener('click', (e) => {
            const modals = ['paymentDetailModal', 'paymentFormModal'];
            modals.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }
    
    renderPayments() {
        const container = document.getElementById('paymentsContainer');
        if (!container) return;
        
        let filtered = this.payments;
        
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(p => p.status === this.currentFilter);
        }
        
        if (this.searchTerm) {
            filtered = filtered.filter(p => 
                p.tenantName.toLowerCase().includes(this.searchTerm) ||
                p.propertyName.toLowerCase().includes(this.searchTerm) ||
                (p.reference && p.reference.toLowerCase().includes(this.searchTerm))
            );
        }
        
        if (filtered.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }
        
        const html = `
            <table class="payments-table">
                <thead>
                    <tr>
                        <th>Tenant</th>
                        <th>Property</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Method</th>
                        <th>Status</th>
                        <th>Reference</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.map(payment => this.renderPaymentRow(payment)).join('')}
                </tbody>
            </table>
        `;
        
        container.innerHTML = html;
        
        // Add event listeners to action buttons
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const paymentId = e.currentTarget.getAttribute('data-id');
                this.viewPayment(paymentId);
            });
        });
        
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const paymentId = e.currentTarget.getAttribute('data-id');
                this.editPayment(paymentId);
            });
        });
    }
    
    renderPaymentRow(payment) {
        const date = new Date(payment.date).toLocaleDateString('en-ZA');
        const methodMap = {
            'bank_transfer': 'Bank Transfer',
            'cash': 'Cash',
            'card': 'Card',
            'eft': 'EFT'
        };
        
        return `
            <tr>
                <td>${payment.tenantName}</td>
                <td>${payment.propertyName}</td>
                <td>R${payment.amount.toFixed(2)}</td>
                <td>${date}</td>
                <td>${methodMap[payment.method] || payment.method}</td>
                <td>
                    <span class="payment-status status-${payment.status}">
                        ${payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                </td>
                <td>${payment.reference || 'N/A'}</td>
                <td>
                    <div class="payment-actions">
                        <button class="action-btn btn-view" data-id="${payment.id}">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="action-btn btn-edit" data-id="${payment.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
    
    viewPayment(paymentId) {
        const payment = this.payments.find(p => p.id === paymentId);
        if (!payment) return;
        
        const modal = document.getElementById('paymentDetailModal');
        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');
        
        const date = new Date(payment.date).toLocaleDateString('en-ZA');
        const methodMap = {
            'bank_transfer': 'Bank Transfer',
            'cash': 'Cash',
            'card': 'Card',
            'eft': 'EFT'
        };
        
        modalTitle.textContent = `Payment #${payment.reference || paymentId}`;
        
        modalBody.innerHTML = `
            <div style="margin-bottom: 25px;">
                <h3 style="color: white; margin-bottom: 15px;">Payment Information</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 10px;">
                        <div style="font-size: 12px; opacity: 0.7; margin-bottom: 5px;">Amount</div>
                        <div style="font-size: 18px; font-weight: 600;">R${payment.amount.toFixed(2)}</div>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 10px;">
                        <div style="font-size: 12px; opacity: 0.7; margin-bottom: 5px;">Status</div>
                        <div><span class="payment-status status-${payment.status}">${payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</span></div>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 10px;">
                        <div style="font-size: 12px; opacity: 0.7; margin-bottom: 5px;">Date</div>
                        <div>${date}</div>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 10px;">
                        <div style="font-size: 12px; opacity: 0.7; margin-bottom: 5px;">Method</div>
                        <div>${methodMap[payment.method] || payment.method}</div>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h3 style="color: white; margin-bottom: 15px;">Tenant Information</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 10px;">
                        <div style="font-size: 12px; opacity: 0.7; margin-bottom: 5px;">Tenant</div>
                        <div>${payment.tenantName}</div>
                    </div>
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 10px;">
                        <div style="font-size: 12px; opacity: 0.7; margin-bottom: 5px;">Property</div>
                        <div>${payment.propertyName}</div>
                    </div>
                </div>
            </div>
            
            ${payment.notes ? `
            <div style="margin-bottom: 25px;">
                <h3 style="color: white; margin-bottom: 15px;">Notes</h3>
                <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 10px;">
                    ${payment.notes}
                </div>
            </div>
            ` : ''}
        `;
        
        modal.style.display = 'flex';
    }
    
    editPayment(paymentId) {
        const payment = this.payments.find(p => p.id === paymentId);
        if (!payment) return;
        
        const modal = document.getElementById('paymentFormModal');
        const formTitle = document.getElementById('formModalTitle');
        const form = document.getElementById('paymentForm');
        
        formTitle.textContent = `Edit Payment #${payment.reference || paymentId}`;
        
        document.getElementById('paymentTenant').value = payment.tenantId;
        document.getElementById('paymentProperty').value = payment.propertyId;
        document.getElementById('paymentAmount').value = payment.amount;
        document.getElementById('paymentDate').value = payment.date;
        document.getElementById('paymentMethod').value = payment.method;
        document.getElementById('paymentReference').value = payment.reference || '';
        document.getElementById('paymentNotes').value = payment.notes || '';
        document.getElementById('paymentStatus').value = payment.status;
        
        form.setAttribute('data-payment-id', paymentId);
        modal.style.display = 'flex';
    }
    
    openRecordPaymentModal() {
        const modal = document.getElementById('paymentFormModal');
        const formTitle = document.getElementById('formModalTitle');
        const form = document.getElementById('paymentForm');
        
        formTitle.textContent = 'Record New Payment';
        form.reset();
        form.removeAttribute('data-payment-id');
        
        document.getElementById('paymentDate').value = new Date().toISOString().split('T')[0];
        modal.style.display = 'flex';
    }
    
    submitPaymentForm() {
        const form = document.getElementById('paymentForm');
        const paymentId = form.getAttribute('data-payment-id');
        
        const tenantId = document.getElementById('paymentTenant').value;
        const tenantName = this.tenants.find(t => t.id === tenantId)?.name || 'Unknown';
        const propertyId = document.getElementById('paymentProperty').value;
        const propertyName = this.properties.find(p => p.id === propertyId)?.name || 'Unknown';
        
        const paymentData = {
            id: paymentId || Date.now().toString(),
            tenantId,
            tenantName,
            propertyId,
            propertyName,
            amount: parseFloat(document.getElementById('paymentAmount').value),
            date: document.getElementById('paymentDate').value,
            method: document.getElementById('paymentMethod').value,
            reference: document.getElementById('paymentReference').value || `TXN${Date.now().toString().slice(-6)}`,
            notes: document.getElementById('paymentNotes').value,
            status: document.getElementById('paymentStatus').value
        };
        
        if (paymentId) {
            // Update existing payment
            const index = this.payments.findIndex(p => p.id === paymentId);
            if (index !== -1) {
                this.payments[index] = paymentData;
            }
            this.showNotification('Payment updated successfully!', 'success');
        } else {
            // Add new payment
            this.payments.push(paymentData);
            this.showNotification('Payment recorded successfully!', 'success');
        }
        
        this.saveToLocalStorage();
        this.renderPayments();
        this.updateStats();
        
        document.getElementById('paymentFormModal').style.display = 'none';
    }
    
    updateStats() {
        const totalCollected = this.payments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + p.amount, 0);
        
        const pendingPayments = this.payments
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + p.amount, 0);
        
        const overduePayments = this.payments
            .filter(p => p.status === 'overdue')
            .reduce((sum, p) => sum + p.amount, 0);
        
        const totalExpected = this.payments.reduce((sum, p) => sum + p.amount, 0);
        const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;
        
        document.getElementById('totalCollectedCount').textContent = `R${totalCollected.toFixed(2)}`;
        document.getElementById('pendingPaymentsCount').textContent = `R${pendingPayments.toFixed(2)}`;
        document.getElementById('overduePaymentsCount').textContent = `R${overduePayments.toFixed(2)}`;
        document.getElementById('collectionRateCount').textContent = `${collectionRate}%`;
    }
    
    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-inbox"></i>
                </div>
                <h3 class="empty-state-title">No Payments Found</h3>
                <p class="empty-state-text">
                    ${this.searchTerm ? 'No payments match your search criteria.' : 'Start by recording your first payment.'}
                </p>
                ${!this.searchTerm ? `
                <button class="payment-btn payment-btn-primary" onclick="paymentsManager.openRecordPaymentModal()" style="margin-top: 20px;">
                    <i class="fas fa-plus"></i> Record First Payment
                </button>
                ` : ''}
            </div>
        `;
    }
    
    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationsContainer');
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: inherit; font-size: 1.2rem; cursor: pointer; margin-left: 15px;">&times;</button>
            </div>
        `;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    saveToLocalStorage() {
        localStorage.setItem('rentala_payments', JSON.stringify(this.payments));
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    window.paymentsManager = new PaymentsManager();
    console.log('âœ… Payments Platform Ready!');
});
