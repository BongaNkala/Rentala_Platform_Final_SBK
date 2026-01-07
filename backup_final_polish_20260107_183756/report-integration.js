/* ============================================
   REPORT SYSTEM INTEGRATION WITH TENANTS
   Connects tenant data to reports dashboard
   ============================================ */

class TenantReportIntegration {
    constructor() {
        this.tenantData = null;
        this.propertyData = null;
        this.initialized = false;
    }
    
    /**
     * Initialize report integration
     */
    async initialize() {
        if (this.initialized) return;
        
        try {
            // Load tenant data
            await this.loadTenantData();
            
            // Load property data
            await this.loadPropertyData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Update reports if on reports page
            if (window.location.pathname.includes('report') || 
                document.querySelector('.report-section')) {
                this.updateReports();
            }
            
            this.initialized = true;
            console.log('Tenant Report Integration initialized');
            
        } catch (error) {
            console.error('Failed to initialize report integration:', error);
        }
    }
    
    /**
     * Load tenant data from API
     */
    async loadTenantData() {
        try {
            const response = await fetch('/api/tenants');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            this.tenantData = await response.json();
            
            // Store in localStorage for other pages
            localStorage.setItem('report_tenant_data', JSON.stringify({
                data: this.tenantData,
                lastUpdated: new Date().toISOString(),
                stats: this.calculateTenantStats()
            }));
            
            return this.tenantData;
            
        } catch (error) {
            console.error('Error loading tenant data:', error);
            
            // Try to get from localStorage
            const cached = localStorage.getItem('report_tenant_data');
            if (cached) {
                const parsed = JSON.parse(cached);
                this.tenantData = parsed.data;
                return this.tenantData;
            }
            
            throw error;
        }
    }
    
    /**
     * Load property data from API
     */
    async loadPropertyData() {
        try {
            const response = await fetch('/api/properties');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            this.propertyData = await response.json();
            return this.propertyData;
            
        } catch (error) {
            console.error('Error loading property data:', error);
            throw error;
        }
    }
    
    /**
     * Calculate tenant statistics
     */
    calculateTenantStats() {
        if (!this.tenantData) return {};
        
        const tenants = this.tenantData;
        
        const stats = {
            total: tenants.length,
            active: tenants.filter(t => t.status === 'active').length,
            inactive: tenants.filter(t => t.status === 'inactive').length,
            pending: tenants.filter(t => t.status === 'pending').length,
            totalMonthlyRent: tenants.reduce((sum, t) => sum + (t.rent_amount || 0), 0),
            averageRent: 0,
            occupancyRate: 0,
            leaseExpirations: {
                within30Days: 0,
                within90Days: 0,
                beyond90Days: 0
            }
        };
        
        // Calculate average rent
        if (stats.active > 0) {
            const activeTenants = tenants.filter(t => t.status === 'active');
            const totalActiveRent = activeTenants.reduce((sum, t) => sum + (t.rent_amount || 0), 0);
            stats.averageRent = totalActiveRent / stats.active;
        }
        
        // Calculate occupancy rate if property data is available
        if (this.propertyData) {
            const totalProperties = this.propertyData.length;
            const occupiedProperties = this.propertyData.filter(p => p.status === 'occupied').length;
            stats.occupancyRate = totalProperties > 0 ? (occupiedProperties / totalProperties) * 100 : 0;
        }
        
        // Calculate lease expirations
        tenants.forEach(tenant => {
            if (tenant.status === 'active' && tenant.lease_end) {
                const endDate = new Date(tenant.lease_end);
                const today = new Date();
                const diffTime = endDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays <= 30) {
                    stats.leaseExpirations.within30Days++;
                } else if (diffDays <= 90) {
                    stats.leaseExpirations.within90Days++;
                } else {
                    stats.leaseExpirations.beyond90Days++;
                }
            }
        });
        
        return stats;
    }
    
    /**
     * Update reports with tenant data
     */
    updateReports() {
        if (!this.tenantData) return;
        
        const stats = this.calculateTenantStats();
        
        // Update report elements
        this.updateReportElements(stats);
        
        // Update charts if they exist
        this.updateCharts(stats);
        
        // Generate tenant report table
        this.generateTenantReportTable();
        
        // Generate occupancy report
        this.generateOccupancyReport();
    }
    
    /**
     * Update report HTML elements with tenant stats
     */
    updateReportElements(stats) {
        const elements = {
            'reportTotalTenants': stats.total,
            'reportActiveTenants': stats.active,
            'reportTenantRevenue': `R${stats.totalMonthlyRent.toLocaleString()}`,
            'reportAverageRent': `R${stats.averageRent.toFixed(2)}`,
            'reportOccupancyRate': `${stats.occupancyRate.toFixed(1)}%`,
            'reportPendingTenants': stats.pending,
            'reportLeaseExpiring30': stats.leaseExpirations.within30Days,
            'reportLeaseExpiring90': stats.leaseExpirations.within90Days
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }
    
    /**
     * Update charts with tenant data
     */
    updateCharts(stats) {
        // Update tenant status chart
        if (window.tenantStatusChart) {
            window.tenantStatusChart.data.datasets[0].data = [
                stats.active,
                stats.inactive,
                stats.pending
            ];
            window.tenantStatusChart.update();
        }
        
        // Update revenue chart
        if (window.revenueChart && this.tenantData) {
            const monthlyRevenue = this.calculateMonthlyRevenue();
            window.revenueChart.data.datasets[0].data = monthlyRevenue;
            window.revenueChart.update();
        }
        
        // Update occupancy chart
        if (window.occupancyChart && this.propertyData) {
            const occupied = this.propertyData.filter(p => p.status === 'occupied').length;
            const available = this.propertyData.filter(p => p.status === 'available').length;
            
            window.occupancyChart.data.datasets[0].data = [occupied, available];
            window.occupancyChart.update();
        }
    }
    
    /**
     * Calculate monthly revenue by tenant
     */
    calculateMonthlyRevenue() {
        if (!this.tenantData) return [];
        
        // Group by month (simplified - would need actual payment data)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // For demo, create some sample monthly data
        return months.map((month, index) => {
            const baseRevenue = this.tenantData.reduce((sum, tenant) => {
                if (tenant.status === 'active') {
                    return sum + (tenant.rent_amount || 0);
                }
                return sum;
            }, 0);
            
            // Add some variation for demo
            const variation = (Math.sin(index) * 0.1 + 1) * baseRevenue;
            return Math.round(variation / this.tenantData.length) * this.tenantData.length;
        });
    }
    
    /**
     * Generate tenant report table
     */
    generateTenantReportTable() {
        const container = document.getElementById('tenantReportTable');
        if (!container || !this.tenantData) return;
        
        let html = `
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Property</th>
                        <th>Monthly Rent</th>
                        <th>Lease End</th>
                        <th>Status</th>
                        <th>Days Remaining</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        this.tenantData.forEach(tenant => {
            const leaseEnd = tenant.lease_end ? new Date(tenant.lease_end) : null;
            const today = new Date();
            const daysRemaining = leaseEnd ? Math.ceil((leaseEnd - today) / (1000 * 60 * 60 * 24)) : 'N/A';
            
            let statusClass = '';
            if (tenant.status === 'active') {
                statusClass = daysRemaining <= 30 ? 'status-warning' : 'status-ok';
            } else if (tenant.status === 'pending') {
                statusClass = 'status-pending';
            } else {
                statusClass = 'status-inactive';
            }
            
            html += `
                <tr>
                    <td>${this.escapeHtml(tenant.full_name)}</td>
                    <td>${this.escapeHtml(tenant.email)}</td>
                    <td>${this.escapeHtml(tenant.property_address || 'Not assigned')}</td>
                    <td>R${(tenant.rent_amount || 0).toLocaleString()}</td>
                    <td>${leaseEnd ? leaseEnd.toLocaleDateString() : 'N/A'}</td>
                    <td><span class="status-badge ${statusClass}">${tenant.status}</span></td>
                    <td>${daysRemaining}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        container.innerHTML = html;
    }
    
    /**
     * Generate occupancy report
     */
    generateOccupancyReport() {
        if (!this.propertyData || !this.tenantData) return;
        
        const container = document.getElementById('occupancyReport');
        if (!container) return;
        
        const propertyTypes = {};
        const tenantDistribution = {};
        
        // Analyze property types and occupancy
        this.propertyData.forEach(property => {
            const type = property.type || 'Unknown';
            if (!propertyTypes[type]) {
                propertyTypes[type] = { total: 0, occupied: 0, available: 0 };
            }
            propertyTypes[type].total++;
            
            if (property.status === 'occupied') {
                propertyTypes[type].occupied++;
            } else if (property.status === 'available') {
                propertyTypes[type].available++;
            }
        });
        
        // Analyze tenant distribution
        this.tenantData.forEach(tenant => {
            if (tenant.property_id) {
                const property = this.propertyData.find(p => p.id == tenant.property_id);
                if (property) {
                    const type = property.type || 'Unknown';
                    if (!tenantDistribution[type]) {
                        tenantDistribution[type] = 0;
                    }
                    tenantDistribution[type]++;
                }
            }
        });
        
        // Generate report HTML
        let html = `
            <div class="occupancy-grid">
                <div class="occupancy-card">
                    <h4>Property Type Analysis</h4>
                    <table class="analysis-table">
                        <thead>
                            <tr>
                                <th>Property Type</th>
                                <th>Total</th>
                                <th>Occupied</th>
                                <th>Available</th>
                                <th>Occupancy Rate</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        Object.entries(propertyTypes).forEach(([type, data]) => {
            const occupancyRate = data.total > 0 ? (data.occupied / data.total) * 100 : 0;
            html += `
                <tr>
                    <td>${type}</td>
                    <td>${data.total}</td>
                    <td>${data.occupied}</td>
                    <td>${data.available}</td>
                    <td>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${occupancyRate}%"></div>
                            <span>${occupancyRate.toFixed(1)}%</span>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
                
                <div class="occupancy-card">
                    <h4>Tenant Distribution</h4>
                    <div class="distribution-chart">
        `;
        
        // Create simple bar chart for tenant distribution
        Object.entries(tenantDistribution).forEach(([type, count]) => {
            const percentage = (count / this.tenantData.length) * 100;
            html += `
                <div class="distribution-item">
                    <div class="distribution-label">${type}</div>
                    <div class="distribution-bar-container">
                        <div class="distribution-bar" style="width: ${percentage}%"></div>
                        <span class="distribution-count">${count} tenants</span>
                    </div>
                    <div class="distribution-percentage">${percentage.toFixed(1)}%</div>
                </div>
            `;
        });
        
        html += `
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    /**
     * Export tenant report to CSV
     */
    exportTenantReport() {
        if (!this.tenantData) {
            alert('No tenant data available to export');
            return;
        }
        
        const headers = [
            'ID', 'Full Name', 'Email', 'Phone', 'Property Address',
            'Monthly Rent', 'Lease Start', 'Lease End', 'Status',
            'Property ID', 'Created At'
        ];
        
        const csvRows = [
            headers.join(','),
            ...this.tenantData.map(tenant => [
                tenant.id,
                `"${this.escapeCsv(tenant.full_name)}"`,
                `"${this.escapeCsv(tenant.email)}"`,
                `"${this.escapeCsv(tenant.phone || '')}"`,
                `"${this.escapeCsv(tenant.property_address || '')}"`,
                tenant.rent_amount || 0,
                `"${tenant.lease_start || ''}"`,
                `"${tenant.lease_end || ''}"`,
                `"${tenant.status}"`,
                tenant.property_id || '',
                `"${tenant.created_at || ''}"`
            ].join(','))
        ];
        
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tenant-report-${new Date().toISOString().split('T')[0]}.csv`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    
    /**
     * Export occupancy report to PDF
     */
    exportOccupancyReport() {
        // This would generate a PDF report
        // For now, we'll create a printable HTML report
        const printContent = document.getElementById('occupancyReport').innerHTML;
        const originalContent = document.body.innerHTML;
        
        document.body.innerHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Occupancy Report - ${new Date().toLocaleDateString()}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; }
                    .report-header { margin-bottom: 30px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background-color: #f5f5f5; }
                    .progress-bar { background: #e0e0e0; height: 20px; border-radius: 10px; position: relative; }
                    .progress-fill { background: #4CAF50; height: 100%; border-radius: 10px; }
                    .progress-bar span { position: absolute; width: 100%; text-align: center; line-height: 20px; }
                </style>
            </head>
            <body>
                <div class="report-header">
                    <h1>Occupancy Report</h1>
                    <p>Generated: ${new Date().toLocaleString()}</p>
                    <p>Total Properties: ${this.propertyData?.length || 0}</p>
                    <p>Total Tenants: ${this.tenantData?.length || 0}</p>
                </div>
                ${printContent}
            </body>
            </html>
        `;
        
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
    }
    
    /**
     * Setup event listeners for report integration
     */
    setupEventListeners() {
        // Export buttons
        const exportTenantBtn = document.getElementById('exportTenantReportBtn');
        const exportOccupancyBtn = document.getElementById('exportOccupancyReportBtn');
        
        if (exportTenantBtn) {
            exportTenantBtn.addEventListener('click', () => this.exportTenantReport());
        }
        
        if (exportOccupancyBtn) {
            exportOccupancyBtn.addEventListener('click', () => this.exportOccupancyReport());
        }
        
        // Refresh button
        const refreshBtn = document.getElementById('refreshReportBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshReportData());
        }
        
        // Listen for tenant updates
        window.addEventListener('storage', (event) => {
            if (event.key === 'rentala_tenant_update') {
                this.refreshReportData();
            }
        });
        
        // Listen for messages from tenant pages
        window.addEventListener('message', (event) => {
            if (event.data.type === 'TENANT_DATA_UPDATED') {
                this.refreshReportData();
            }
        });
    }
    
    /**
     * Refresh report data
     */
    async refreshReportData() {
        await this.loadTenantData();
        await this.loadPropertyData();
        this.updateReports();
        
        // Show notification
        this.showNotification('Report data refreshed', 'success');
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${this.escapeHtml(message)}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }
    
    /**
     * Utility: Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Utility: Escape CSV
     */
    escapeCsv(field) {
        if (!field) return '';
        const stringField = String(field);
        if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
            return stringField.replace(/"/g, '""');
        }
        return stringField;
    }
}

// Initialize report integration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tenantReportIntegration = new TenantReportIntegration();
    window.tenantReportIntegration.initialize();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TenantReportIntegration;
}
