class DashboardManager {
    constructor() {
        this.charts = {};
        this.dateRange = '30'; // Default: Last 30 days
        this.data = {
            properties: [],
            tenants: [],
            payments: [],
            maintenance: []
        };
        this.init();
    }
    
    async init() {
        console.log('📊 Dashboard Manager Initializing...');
        this.setupEventListeners();
        await this.loadData();
        this.initializeCharts();
        this.renderData();
        this.updateStats();
        this.loadAlerts();
        this.loadActivity();
        this.startAutoRefresh();
    }
    
    async loadData() {
        // Try to load from localStorage
        const savedData = localStorage.getItem('rentala_dashboard_data');
        if (savedData) {
            this.data = JSON.parse(savedData);
            console.log('📦 Loaded dashboard data from localStorage');
        } else {
            // Generate sample data
            this.generateSampleData();
            this.saveToLocalStorage();
            console.log('📦 Generated sample dashboard data');
        }
    }
    
    generateSampleData() {
        // Sample properties
        this.data.properties = [
            { id: '1', name: 'Sunset Villa', type: 'residential', units: 3, occupiedUnits: 2, value: 3500000, status: 'active' },
            { id: '2', name: 'Mountain View', type: 'residential', units: 12, occupiedUnits: 10, value: 12000000, status: 'active' },
            { id: '3', name: 'City Center', type: 'commercial', units: 20, occupiedUnits: 15, value: 25000000, status: 'active' },
            { id: '4', name: 'Garden House', type: 'mixed', units: 8, occupiedUnits: 6, value: 8500000, status: 'active' },
            { id: '5', name: 'Lake View', type: 'residential', units: 5, occupiedUnits: 3, value: 5200000, status: 'maintenance' },
            { id: '6', name: 'Tech Park', type: 'commercial', units: 15, occupiedUnits: 12, value: 18000000, status: 'active' },
            { id: '7', name: 'University Apt', type: 'residential', units: 10, occupiedUnits: 4, value: 6500000, status: 'vacant' },
            { id: '8', name: 'Heritage Bldg', type: 'mixed', units: 6, occupiedUnits: 5, value: 9500000, status: 'inactive' }
        ];
        
        // Sample tenants (48 total)
        this.data.tenants = Array.from({ length: 48 }, (_, i) => ({
            id: `t${i + 1}`,
            name: `Tenant ${i + 1}`,
            propertyId: this.data.properties[i % 8].id,
            status: Math.random() > 0.1 ? 'active' : 'pending',
            rent: [4500, 6200, 6800, 7200, 7800, 8500, 9500][i % 7]
        }));
        
        // Sample payments for last 30 days
        const today = new Date();
        this.data.payments = Array.from({ length: 30 }, (_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            
            const tenantIndex = i % 48;
            const propertyIndex = tenantIndex % 8;
            
            return {
                id: `p${i + 1}`,
                tenantId: `t${tenantIndex + 1}`,
                tenantName: `Tenant ${tenantIndex + 1}`,
                propertyId: this.data.properties[propertyIndex].id,
                propertyName: this.data.properties[propertyIndex].name,
                amount: this.data.tenants[tenantIndex].rent,
                date: date.toISOString().split('T')[0],
                status: Math.random() > 0.1 ? 'completed' : 'pending',
                method: ['bank_transfer', 'eft', 'cash'][i % 3]
            };
        });
        
        // Sample maintenance requests
        this.data.maintenance = [
            { id: 'm1', propertyId: '5', propertyName: 'Lake View', issue: 'Roof Repair', priority: 'high', dueDate: '2024-03-15', status: 'pending' },
            { id: 'm2', propertyId: '2', propertyName: 'Mountain View', issue: 'Plumbing', priority: 'medium', dueDate: '2024-03-20', status: 'in-progress' },
            { id: 'm3', propertyId: '1', propertyName: 'Sunset Villa', issue: 'Painting', priority: 'low', dueDate: '2024-03-25', status: 'pending' },
            { id: 'm4', propertyId: '6', propertyName: 'Tech Park', issue: 'Elevator', priority: 'high', dueDate: '2024-03-10', status: 'completed' },
            { id: 'm5', propertyId: '3', propertyName: 'City Center', issue: 'AC Service', priority: 'medium', dueDate: '2024-03-18', status: 'pending' }
        ];
    }
    
    setupEventListeners() {
        // Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }
        
        // Date range selector
        const dateRangeElement = document.querySelector('.date-range');
        const dateRangeModal = document.getElementById('dateRangeModal');
        const closeDateModalBtn = document.getElementById('closeDateModalBtn');
        const cancelDateBtn = document.getElementById('cancelDateBtn');
        const applyDateBtn = document.getElementById('applyDateBtn');
        
        if (dateRangeElement && dateRangeModal) {
            dateRangeElement.addEventListener('click', () => {
                dateRangeModal.style.display = 'flex';
            });
            
            closeDateModalBtn?.addEventListener('click', () => {
                dateRangeModal.style.display = 'none';
            });
            
            cancelDateBtn?.addEventListener('click', () => {
                dateRangeModal.style.display = 'none';
            });
            
            applyDateBtn?.addEventListener('click', () => {
                const selectedOption = document.querySelector('.date-option.active');
                if (selectedOption) {
                    this.dateRange = selectedOption.getAttribute('data-range');
                    document.getElementById('currentDateRange').textContent = 
                        selectedOption.textContent;
                    
                    if (this.dateRange === 'custom') {
                        const startDate = document.getElementById('startDate').value;
                        const endDate = document.getElementById('endDate').value;
                        if (startDate && endDate) {
                            document.getElementById('currentDateRange').textContent = 
                                `${startDate} to ${endDate}`;
                        }
                    }
                    
                    this.updateCharts();
                    dateRangeModal.style.display = 'none';
                }
            });
            
            // Date option selection
            document.querySelectorAll('.date-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    document.querySelectorAll('.date-option').forEach(o => o.classList.remove('active'));
                    e.target.classList.add('active');
                    
                    if (e.target.getAttribute('data-range') === 'custom') {
                        document.getElementById('customRange').style.display = 'block';
                    } else {
                        document.getElementById('customRange').style.display = 'none';
                    }
                });
            });
        }
        
        // Chart period selectors
        const revenuePeriod = document.getElementById('revenuePeriod');
        const propertyTypeFilter = document.getElementById('propertyTypeFilter');
        const occupancyPeriod = document.getElementById('occupancyPeriod');
        const refreshPayments = document.getElementById('refreshPayments');
        const refreshActivity = document.getElementById('refreshActivity');
        
        revenuePeriod?.addEventListener('change', () => this.updateRevenueChart());
        propertyTypeFilter?.addEventListener('change', () => this.updatePropertyTypeChart());
        occupancyPeriod?.addEventListener('change', () => this.updateOccupancyChart());
        refreshPayments?.addEventListener('click', () => this.updatePaymentsChart());
        refreshActivity?.addEventListener('click', () => this.loadActivity());
        
        // Quick action buttons
        const quickActionButtons = [
            'addPropertyBtn', 'recordPaymentBtn', 'addTenantBtn',
            'createReportBtn', 'scheduleMaintenanceBtn', 'sendNotificationsBtn'
        ];
        
        quickActionButtons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener('click', () => this.handleQuickAction(btnId));
            }
        });
        
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
        
        // Close modals on outside click
        window.addEventListener('click', (e) => {
            const modals = ['dateRangeModal', 'quickAddModal'];
            modals.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }
    
    initializeCharts() {
        // Revenue Chart
        const revenueCtx = document.getElementById('revenueChart');
        if (revenueCtx) {
            this.charts.revenue = new Chart(revenueCtx.getContext('2d'), {
                type: 'line',
                data: this.getRevenueChartData(),
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderWidth: 1
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)',
                                callback: function(value) {
                                    return 'R' + value.toLocaleString('en-ZA');
                                }
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        }
                    },
                    elements: {
                        line: {
                            tension: 0.4
                        },
                        point: {
                            radius: 4,
                            hoverRadius: 6
                        }
                    }
                }
            });
        }
        
        // Property Type Chart
        const propertyTypeCtx = document.getElementById('propertyTypeChart');
        if (propertyTypeCtx) {
            this.charts.propertyType = new Chart(propertyTypeCtx.getContext('2d'), {
                type: 'doughnut',
                data: this.getPropertyTypeChartData(),
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                color: 'rgba(255, 255, 255, 0.7)',
                                padding: 20,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderWidth: 1
                        }
                    },
                    cutout: '70%'
                }
            });
        }
        
        // Occupancy Chart
        const occupancyCtx = document.getElementById('occupancyChart');
        if (occupancyCtx) {
            this.charts.occupancy = new Chart(occupancyCtx.getContext('2d'), {
                type: 'bar',
                data: this.getOccupancyChartData(),
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderWidth: 1
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)',
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        }
                    }
                }
            });
        }
        
        // Payments Chart
        const paymentsCtx = document.getElementById('paymentsChart');
        if (paymentsCtx) {
            this.charts.payments = new Chart(paymentsCtx.getContext('2d'), {
                type: 'pie',
                data: this.getPaymentsChartData(),
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                color: 'rgba(255, 255, 255, 0.7)',
                                padding: 20,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderWidth: 1,
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
    }
    
    getRevenueChartData() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const period = document.getElementById('revenuePeriod')?.value || 'monthly';
        
        let labels, data;
        
        if (period === 'monthly') {
            labels = months.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
            data = labels.map(() => Math.floor(Math.random() * 300000) + 200000);
        } else if (period === 'quarterly') {
            labels = ['Q1', 'Q2', 'Q3', 'Q4'];
            data = labels.map(() => Math.floor(Math.random() * 800000) + 500000);
        } else {
            labels = ['2021', '2022', '2023', '2024'];
            data = labels.map(() => Math.floor(Math.random() * 2500000) + 1500000);
        }
        
        return {
            labels: labels,
            datasets: [{
                label: 'Revenue',
                data: data,
                borderColor: '#4cc9f0',
                backgroundColor: 'rgba(76, 201, 240, 0.1)',
                fill: true,
                borderWidth: 3
            }]
        };
    }
    
    getPropertyTypeChartData() {
        const filter = document.getElementById('propertyTypeFilter')?.value || 'all';
        let properties = this.data.properties;
        
        if (filter === 'active') {
            properties = properties.filter(p => p.status === 'active');
        }
        
        const types = ['residential', 'commercial', 'mixed'];
        const counts = types.map(type => 
            properties.filter(p => p.type === type).length
        );
        
        return {
            labels: ['Residential', 'Commercial', 'Mixed Use'],
            datasets: [{
                data: counts,
                backgroundColor: [
                    'rgba(67, 97, 238, 0.8)',
                    'rgba(76, 201, 240, 0.8)',
                    'rgba(114, 9, 183, 0.8)'
                ],
                borderColor: [
                    'rgba(67, 97, 238, 1)',
                    'rgba(76, 201, 240, 1)',
                    'rgba(114, 9, 183, 1)'
                ],
                borderWidth: 2,
                hoverOffset: 15
            }]
        };
    }
    
    getOccupancyChartData() {
        const period = document.getElementById('occupancyPeriod')?.value || '6months';
        let labels, data;
        
        if (period === '6months') {
            const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
            labels = months;
            data = [85, 87, 89, 90, 92, 94];
        } else if (period === '1year') {
            const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
            labels = months;
            data = [82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 94];
        } else {
            labels = ['2022', '2023', '2024'];
            data = [88, 91, 94];
        }
        
        return {
            labels: labels,
            datasets: [{
                label: 'Occupancy Rate',
                data: data,
                backgroundColor: 'rgba(74, 222, 128, 0.6)',
                borderColor: 'rgba(74, 222, 128, 1)',
                borderWidth: 2
            }]
        };
    }
    
    getPaymentsChartData() {
        const completed = this.data.payments.filter(p => p.status === 'completed').length;
        const pending = this.data.payments.filter(p => p.status === 'pending').length;
        const overdue = this.data.payments.filter(p => p.status === 'overdue').length;
        
        return {
            labels: ['Completed', 'Pending', 'Overdue'],
            datasets: [{
                data: [completed, pending, overdue],
                backgroundColor: [
                    'rgba(74, 222, 128, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: [
                    'rgba(74, 222, 128, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(239, 68, 68, 1)'
                ],
                borderWidth: 2,
                hoverOffset: 15
            }]
        };
    }
    
    updateCharts() {
        if (this.charts.revenue) {
            this.charts.revenue.data = this.getRevenueChartData();
            this.charts.revenue.update();
        }
        
        if (this.charts.propertyType) {
            this.charts.propertyType.data = this.getPropertyTypeChartData();
            this.charts.propertyType.update();
        }
        
        if (this.charts.occupancy) {
            this.charts.occupancy.data = this.getOccupancyChartData();
            this.charts.occupancy.update();
        }
        
        if (this.charts.payments) {
            this.charts.payments.data = this.getPaymentsChartData();
            this.charts.payments.update();
        }
    }
    
    updateRevenueChart() {
        if (this.charts.revenue) {
            this.charts.revenue.data = this.getRevenueChartData();
            this.charts.revenue.update();
        }
    }
    
    updatePropertyTypeChart() {
        if (this.charts.propertyType) {
            this.charts.propertyType.data = this.getPropertyTypeChartData();
            this.charts.propertyType.update();
        }
    }
    
    updateOccupancyChart() {
        if (this.charts.occupancy) {
            this.charts.occupancy.data = this.getOccupancyChartData();
            this.charts.occupancy.update();
        }
    }
    
    updatePaymentsChart() {
        if (this.charts.payments) {
            this.charts.payments.data = this.getPaymentsChartData();
            this.charts.payments.update();
            this.showNotification('Payments chart refreshed', 'success');
        }
    }
    
    renderData() {
        this.renderRecentPayments();
        this.renderMaintenance();
    }
    
    renderRecentPayments() {
        const tableBody = document.querySelector('#recentPaymentsTable tbody');
        if (!tableBody) return;
        
        const recentPayments = this.data.payments
            .slice(0, 5)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        tableBody.innerHTML = recentPayments.map(payment => `
            <tr>
                <td>${payment.tenantName}</td>
                <td>${payment.propertyName}</td>
                <td>R${payment.amount.toLocaleString('en-ZA')}</td>
                <td>${new Date(payment.date).toLocaleDateString('en-ZA')}</td>
                <td><span class="status-badge status-${payment.status}">${payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</span></td>
            </tr>
        `).join('');
    }
    
    renderMaintenance() {
        const tableBody = document.querySelector('#maintenanceTable tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = this.data.maintenance.map(item => `
            <tr>
                <td>${item.propertyName}</td>
                <td>${item.issue}</td>
                <td class="priority-${item.priority}">${item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}</td>
                <td>${new Date(item.dueDate).toLocaleDateString('en-ZA')}</td>
                <td><span class="status-badge status-${item.status}">${item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span></td>
            </tr>
        `).join('');
    }
    
    updateStats() {
        // Calculate totals
        const totalProperties = this.data.properties.length;
        const totalTenants = this.data.tenants.length;
        const activeTenants = this.data.tenants.filter(t => t.status === 'active').length;
        const monthlyRevenue = this.data.payments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + p.amount, 0);
        
        const pendingIssues = this.data.maintenance.filter(m => m.status === 'pending').length;
        
        // Update quick stats
        document.getElementById('monthlyRevenue').textContent = `R${monthlyRevenue.toLocaleString('en-ZA')}`;
        document.getElementById('totalProperties').textContent = totalProperties;
        document.getElementById('totalTenants').textContent = totalTenants;
        document.getElementById('pendingIssues').textContent = pendingIssues;
        
        // Update sidebar stats
        document.getElementById('sidebarPropertiesCount').textContent = totalProperties;
        document.getElementById('sidebarTenantsCount').textContent = totalTenants;
        
        // Update performance metrics
        const occupancyRate = totalProperties > 0 ? 
            Math.round((activeTenants / totalTenants) * 100) : 0;
        
        document.getElementById('collectionRate').textContent = '98.2%';
        document.getElementById('tenantRetention').textContent = '94.5%';
        document.getElementById('avgRent').textContent = 'R7,850';
        document.getElementById('maintenanceCost').textContent = 'R12,400';
    }
    
    loadAlerts() {
        const alertsList = document.getElementById('alertsList');
        const alertsCount = document.getElementById('alertsCount');
        if (!alertsList) return;
        
        const alerts = [
            {
                type: 'danger',
                icon: 'fas fa-exclamation-triangle',
                title: 'Payment Overdue',
                message: '3 tenants have overdue payments totaling R24,500',
                time: '2 hours ago'
            },
            {
                type: 'warning',
                icon: 'fas fa-tools',
                title: 'Maintenance Required',
                message: 'High priority maintenance at Lake View Estate',
                time: '5 hours ago'
            },
            {
                type: 'info',
                icon: 'fas fa-info-circle',
                title: 'Lease Expiring',
                message: '5 tenant leases expire in the next 30 days',
                time: '1 day ago'
            },
            {
                type: 'warning',
                icon: 'fas fa-building',
                title: 'Low Occupancy',
                message: 'University Apartments has 40% vacancy rate',
                time: '2 days ago'
            },
            {
                type: 'info',
                icon: 'fas fa-chart-line',
                title: 'Revenue Target',
                message: 'Monthly revenue target achieved (105%)',
                time: '3 days ago'
            }
        ];
        
        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.type}">
                <div class="alert-icon">
                    <i class="${alert.icon}"></i>
                </div>
                <div class="alert-content">
                    <h4>${alert.title}</h4>
                    <p>${alert.message}</p>
                    <div class="alert-time">${alert.time}</div>
                </div>
            </div>
        `).join('');
        
        if (alertsCount) {
            alertsCount.textContent = alerts.length;
        }
    }
    
    loadActivity() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;
        
        const activities = [
            {
                icon: 'fas fa-user-plus',
                message: '<strong>Sarah Johnson</strong> added as new tenant to Mountain View',
                time: '10 minutes ago'
            },
            {
                icon: 'fas fa-money-bill-wave',
                message: 'Payment of <strong>R8,500</strong> received from John Smith',
                time: '2 hours ago'
            },
            {
                icon: 'fas fa-tools',
                message: 'Maintenance request completed at Tech Park Offices',
                time: '5 hours ago'
            },
            {
                icon: 'fas fa-file-contract',
                message: 'Lease renewal sent to <strong>Emma Davis</strong>',
                time: '1 day ago'
            },
            {
                icon: 'fas fa-chart-line',
                message: 'Monthly performance report generated',
                time: '2 days ago'
            },
            {
                icon: 'fas fa-building',
                message: 'New property <strong>City Center Tower</strong> added to portfolio',
                time: '3 days ago'
            }
        ];
        
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.message}</p>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }
    
    handleQuickAction(actionId) {
        const actions = {
            addPropertyBtn: {
                title: 'Add New Property',
                content: `
                    <div class="quick-form">
                        <div class="form-group">
                            <input type="text" placeholder="Property Name" class="quick-input">
                        </div>
                        <div class="form-group">
                            <input type="text" placeholder="Address" class="quick-input">
                        </div>
                        <div class="form-group">
                            <select class="quick-input">
                                <option value="">Property Type</option>
                                <option value="residential">Residential</option>
                                <option value="commercial">Commercial</option>
                                <option value="mixed">Mixed Use</option>
                            </select>
                        </div>
                        <button class="btn btn-primary" style="width: 100%; margin-top: 20px;">
                            <i class="fas fa-plus"></i> Add Property
                        </button>
                    </div>
                `
            },
            recordPaymentBtn: {
                title: 'Record Payment',
                content: `
                    <div class="quick-form">
                        <div class="form-group">
                            <select class="quick-input">
                                <option value="">Select Tenant</option>
                                ${this.data.tenants.slice(0, 5).map(t => `
                                    <option value="${t.id}">${t.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <input type="number" placeholder="Amount" class="quick-input">
                        </div>
                        <div class="form-group">
                            <input type="date" class="quick-input">
                        </div>
                        <button class="btn btn-primary" style="width: 100%; margin-top: 20px;">
                            <i class="fas fa-save"></i> Record Payment
                        </button>
                    </div>
                `
            },
            addTenantBtn: {
                title: 'Add New Tenant',
                content: `
                    <div class="quick-form">
                        <div class="form-group">
                            <input type="text" placeholder="Full Name" class="quick-input">
                        </div>
                        <div class="form-group">
                            <input type="email" placeholder="Email" class="quick-input">
                        </div>
                        <div class="form-group">
                            <select class="quick-input">
                                <option value="">Select Property</option>
                                ${this.data.properties.map(p => `
                                    <option value="${p.id}">${p.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        <button class="btn btn-primary" style="width: 100%; margin-top: 20px;">
                            <i class="fas fa-user-plus"></i> Add Tenant
                        </button>
                    </div>
                `
            },
            createReportBtn: {
                title: 'Generate Report',
                content: `
                    <div class="quick-form">
                        <div class="form-group">
                            <select class="quick-input">
                                <option value="">Report Type</option>
                                <option value="financial">Financial Report</option>
                                <option value="occupancy">Occupancy Report</option>
                                <option value="maintenance">Maintenance Report</option>
                                <option value="performance">Performance Report</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <select class="quick-input">
                                <option value="">Time Period</option>
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                        <button class="btn btn-primary" style="width: 100%; margin-top: 20px;">
                            <i class="fas fa-download"></i> Generate Report
                        </button>
                    </div>
                `
            },
            scheduleMaintenanceBtn: {
                title: 'Schedule Maintenance',
                content: `
                    <div class="quick-form">
                        <div class="form-group">
                            <select class="quick-input">
                                <option value="">Select Property</option>
                                ${this.data.properties.map(p => `
                                    <option value="${p.id}">${p.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <input type="text" placeholder="Issue Description" class="quick-input">
                        </div>
                        <div class="form-group">
                            <input type="date" class="quick-input">
                        </div>
                        <button class="btn btn-primary" style="width: 100%; margin-top: 20px;">
                            <i class="fas fa-calendar-plus"></i> Schedule
                        </button>
                    </div>
                `
            },
            sendNotificationsBtn: {
                title: 'Send Notifications',
                content: `
                    <div class="quick-form">
                        <div class="form-group">
                            <select class="quick-input">
                                <option value="">Recipient Group</option>
                                <option value="all">All Tenants</option>
                                <option value="active">Active Tenants</option>
                                <option value="overdue">Tenants with Overdue Payments</option>
                                <option value="expiring">Tenants with Expiring Leases</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <input type="text" placeholder="Subject" class="quick-input">
                        </div>
                        <div class="form-group">
                            <textarea placeholder="Message" class="quick-input" rows="3"></textarea>
                        </div>
                        <button class="btn btn-primary" style="width: 100%; margin-top: 20px;">
                            <i class="fas fa-paper-plane"></i> Send Notifications
                        </button>
                    </div>
                `
            }
        };
        
        const action = actions[actionId];
        if (action) {
            const modal = document.getElementById('quickAddModal');
            const title = document.getElementById('quickAddTitle');
            const body = document.getElementById('quickAddBody');
            
            if (modal && title && body) {
                title.textContent = action.title;
                body.innerHTML = action.content;
                modal.style.display = 'flex';
                
                // Add event listener to close button
                const closeBtn = document.getElementById('closeQuickAddBtn');
                if (closeBtn) {
                    closeBtn.onclick = () => modal.style.display = 'none';
                }
                
                // Add event listener to form submission
                const formBtn = body.querySelector('.btn-primary');
                if (formBtn) {
                    formBtn.onclick = () => {
                        this.showNotification(`${action.title} submitted successfully`, 'success');
                        modal.style.display = 'none';
                    };
                }
            }
        }
    }
    
    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationsContainer');
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: inherit; font-size: 1.2rem; cursor: pointer; margin-left: 15px;">
                    &times;
                </button>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    startAutoRefresh() {
        // Refresh data every 5 minutes
        setInterval(() => {
            this.updateCharts();
            this.loadActivity();
            console.log('🔄 Dashboard data refreshed');
        }, 5 * 60 * 1000);
        
        // Simulate real-time updates every 30 seconds
        setInterval(() => {
            this.simulateRealTimeUpdate();
        }, 30 * 1000);
    }
    
    simulateRealTimeUpdate() {
        // Randomly update stats
        const stats = ['monthlyRevenue', 'totalTenants', 'pendingIssues'];
        const randomStat = stats[Math.floor(Math.random() * stats.length)];
        
        const currentValues = {
            monthlyRevenue: 245600,
            totalTenants: 48,
            pendingIssues: 3
        };
        
        // Small random change
        const change = Math.random() > 0.5 ? 1 : -1;
        const amount = Math.floor(Math.random() * 5) + 1;
        
        // Update the stat
        const element = document.getElementById(randomStat);
        if (element) {
            const currentText = element.textContent;
            let currentValue;
            
            if (randomStat === 'monthlyRevenue') {
                currentValue = parseInt(currentText.replace(/[^0-9]/g, ''));
                const newValue = Math.max(200000, currentValue + (change * amount * 1000));
                element.textContent = `R${newValue.toLocaleString('en-ZA')}`;
            } else {
                currentValue = parseInt(currentText);
                const newValue = Math.max(1, currentValue + (change * amount));
                element.textContent = newValue;
            }
            
            // Show notification for significant changes
            if (Math.abs(change * amount) >= 3) {
                this.showNotification(`${randomStat.replace(/([A-Z])/g, ' $1')} updated`, 'info');
            }
        }
    }
    
    saveToLocalStorage() {
        localStorage.setItem('rentala_dashboard_data', JSON.stringify(this.data));
    }
    
    logout() {
        localStorage.removeItem('rentala_dashboard_data');
        this.showNotification('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    window.dashboard = new DashboardManager();
    console.log('✅ Dashboard Platform Ready!');
    
    // Set current date in header
    const currentDate = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = currentDate.toLocaleDateString('en-US', options);
    document.querySelector('.page-title p').innerHTML = 
        `Welcome back, John! Here's what's happening with your properties on ${dateString}.`;
});
