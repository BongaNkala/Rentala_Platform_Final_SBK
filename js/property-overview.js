/**
 * Property Management Overview - Real-time Data Integration
 * Fetches and displays live metrics from the API
 */

class PropertyOverviewManager {
    constructor() {
        this.apiBaseUrl = '/api';
        this.refreshInterval = 30000; // 30 seconds
        this.refreshTimer = null;
        this.isLoading = false;
        
        // Initialize on DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Initialize the manager
     */
    init() {
        console.log('Property Overview Manager initialized');
        
        // Check if the overview card exists
        const overviewCard = document.querySelector('.property-management-overview-card');
        if (!overviewCard) {
            console.warn('Property Management Overview card not found');
            return;
        }

        // Bind event listeners
        this.bindEventListeners();
        
        // Initial data fetch
        this.fetchMetrics();
        
        // Start auto-refresh
        this.startAutoRefresh();
    }

    /**
     * Bind event listeners to interactive elements
     */
    bindEventListeners() {
        // Refresh button
        const refreshBtn = document.querySelector('.property-management-overview-card .action-btn[title="Refresh Data"]');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.fetchMetrics(true);
            });
        }

        // Export button
        const exportBtn = document.querySelector('.property-management-overview-card .action-btn[title="Export Report"]');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportReport();
            });
        }

        // Quick action buttons
        const quickActionBtns = document.querySelectorAll('.property-management-overview-card .quick-action-btn');
        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const actionText = btn.querySelector('span').textContent;
                this.handleQuickAction(actionText);
            });
        });
    }

    /**
     * Fetch metrics data from the API
     */
    async fetchMetrics(showLoader = false) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        
        if (showLoader) {
            this.showLoadingState();
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/metrics/overview`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Metrics data received:', data);
            
            // Update the UI with fetched data
            this.updateMetrics(data);
            
            // Show success feedback
            if (showLoader) {
                this.showSuccessNotification('Data refreshed successfully');
            }
            
        } catch (error) {
            console.error('Error fetching metrics:', error);
            this.showErrorNotification('Failed to fetch metrics data');
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    /**
     * Update all metrics in the UI
     */
    updateMetrics(data) {
        // Update Portfolio Value
        this.updateMetric('portfolio', {
            value: this.formatCurrency(data.portfolioValue),
            change: data.portfolioChange,
            detail: `Across ${data.totalProperties} properties`
        });

        // Update Occupancy Rate
        this.updateMetric('occupancy', {
            value: `${data.occupancyRate}%`,
            change: data.occupancyChange,
            progressWidth: data.occupancyRate
        });

        // Update Monthly Revenue
        this.updateMetric('revenue', {
            value: this.formatCurrency(data.monthlyRevenue),
            change: data.revenueChange,
            detail: 'vs. last month'
        });

        // Update Active Maintenance
        this.updateMetric('maintenance', {
            value: data.activeMaintenance.toString(),
            badge: data.urgentMaintenance > 0 ? 'Urgent' : 'Normal',
            detail: `${data.totalMaintenance} pending total`
        });

        // Update Lease Expirations
        this.updateMetric('lease', {
            value: data.expiringLeases.toString(),
            badge: data.expiringLeases > 5 ? 'Action Needed' : 'Normal',
            detail: 'Leases ending soon'
        });

        // Update Collection Rate
        this.updateMetric('collection', {
            value: `${data.collectionRate}%`,
            change: data.collectionChange,
            progressWidth: data.collectionRate
        });

        // Animate the updates
        this.animateMetricCards();
    }

    /**
     * Update a single metric card
     */
    updateMetric(metricType, data) {
        const metricCard = this.getMetricCard(metricType);
        if (!metricCard) return;

        // Update value
        const valueElement = metricCard.querySelector('.metric-value');
        if (valueElement && data.value) {
            this.animateValue(valueElement, data.value);
        }

        // Update change indicator
        if (data.change !== undefined) {
            const changeElement = metricCard.querySelector('.metric-change');
            if (changeElement) {
                const isPositive = data.change >= 0;
                changeElement.className = `metric-change ${isPositive ? 'positive' : 'negative'}`;
                changeElement.innerHTML = `
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M12 ${isPositive ? '19V5M5 12l7-7 7 7' : '5V19M5 12l7 7 7-7'}" 
                              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    ${Math.abs(data.change)}%
                `;
            }
        }

        // Update badge
        if (data.badge !== undefined) {
            const badgeElement = metricCard.querySelector('.metric-badge');
            if (badgeElement) {
                badgeElement.textContent = data.badge;
                badgeElement.className = `metric-badge ${data.badge.toLowerCase().includes('urgent') ? 'urgent' : 'warning'}`;
            }
        }

        // Update detail text
        if (data.detail !== undefined) {
            const detailElement = metricCard.querySelector('.metric-detail');
            if (detailElement) {
                detailElement.textContent = data.detail;
            }
        }

        // Update progress bar
        if (data.progressWidth !== undefined) {
            const progressFill = metricCard.querySelector('.progress-fill');
            if (progressFill) {
                setTimeout(() => {
                    progressFill.style.width = `${data.progressWidth}%`;
                }, 100);
            }
        }
    }

    /**
     * Get metric card element by type
     */
    getMetricCard(metricType) {
        const iconSelectors = {
            'portfolio': '.portfolio-icon',
            'occupancy': '.occupancy-icon',
            'revenue': '.revenue-icon',
            'maintenance': '.maintenance-icon',
            'lease': '.lease-icon',
            'collection': '.collection-icon'
        };

        const iconSelector = iconSelectors[metricType];
        if (!iconSelector) return null;

        const icon = document.querySelector(iconSelector);
        return icon ? icon.closest('.metric-card') : null;
    }

    /**
     * Animate value change
     */
    animateValue(element, newValue) {
        const currentValue = element.textContent;
        if (currentValue === newValue) return;

        // Add animation class
        element.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        element.style.transform = 'scale(1.1)';
        element.style.opacity = '0.5';

        setTimeout(() => {
            element.textContent = newValue;
            element.style.transform = 'scale(1)';
            element.style.opacity = '1';
        }, 150);
    }

    /**
     * Animate all metric cards
     */
    animateMetricCards() {
        const metricCards = document.querySelectorAll('.property-management-overview-card .metric-card');
        metricCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.animation = 'none';
                setTimeout(() => {
                    card.style.animation = 'pulse 0.5s ease';
                }, 10);
            }, index * 50);
        });
    }

    /**
     * Format currency values
     */
    formatCurrency(value) {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `$${(value / 1000).toFixed(0)}K`;
        } else {
            return `$${value.toFixed(0)}`;
        }
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        const refreshBtn = document.querySelector('.property-management-overview-card .action-btn[title="Refresh Data"]');
        if (refreshBtn) {
            refreshBtn.style.animation = 'spin 1s linear infinite';
            refreshBtn.style.opacity = '0.5';
        }
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        const refreshBtn = document.querySelector('.property-management-overview-card .action-btn[title="Refresh Data"]');
        if (refreshBtn) {
            refreshBtn.style.animation = 'none';
            refreshBtn.style.opacity = '1';
        }
    }

    /**
     * Show success notification
     */
    showSuccessNotification(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Show error notification
     */
    showErrorNotification(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `overview-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)'};
            color: white;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    /**
     * Export report
     */
    exportReport() {
        console.log('Exporting report...');
        this.showNotification('Report export feature coming soon', 'info');
    }

    /**
     * Handle quick action button clicks
     */
    handleQuickAction(actionText) {
        console.log(`Quick action: ${actionText}`);
        
        const actions = {
            'Add Property': () => this.showNotification('Add Property form coming soon', 'info'),
            'Add Tenant': () => this.showNotification('Add Tenant form coming soon', 'info'),
            'Generate Report': () => this.exportReport(),
            'Schedule Inspection': () => this.showNotification('Schedule Inspection form coming soon', 'info')
        };

        const action = actions[actionText];
        if (action) {
            action();
        }
    }

    /**
     * Start auto-refresh timer
     */
    startAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }

        this.refreshTimer = setInterval(() => {
            console.log('Auto-refreshing metrics...');
            this.fetchMetrics(false);
        }, this.refreshInterval);

        console.log(`Auto-refresh started (every ${this.refreshInterval / 1000}s)`);
    }

    /**
     * Stop auto-refresh timer
     */
    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
            console.log('Auto-refresh stopped');
        }
    }

    /**
     * Destroy the manager
     */
    destroy() {
        this.stopAutoRefresh();
        console.log('Property Overview Manager destroyed');
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }

    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the manager
const propertyOverviewManager = new PropertyOverviewManager();

// Expose to window for debugging
window.propertyOverviewManager = propertyOverviewManager;
