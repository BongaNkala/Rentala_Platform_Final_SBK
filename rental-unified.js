// ============================================
// RENTALA UNIFIED BEHAVIOR
// Professional interactions & animations
// ============================================

class RentalaUnified {
    constructor() {
        this.init();
    }

    init() {
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.setupNavigation();
        this.setupModals();
        this.setupForms();
        this.setupTables();
        this.setupNotifications();
        this.setupAnimations();
        this.setupKeyboardShortcuts();
    }

    // ==================== NAVIGATION ====================
    setupNavigation() {
        // Highlight active navigation item
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath || 
                link.getAttribute('href').includes(currentPath)) {
                link.classList.add('active');
            }
            
            // Add hover effects
            link.addEventListener('mouseenter', (e) => {
                if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.transform = 'translateX(6px)';
                }
            });
            
            link.addEventListener('mouseleave', (e) => {
                if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.transform = 'translateX(0)';
                }
            });
        });

        // Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                document.querySelector('.app-sidebar').classList.toggle('mobile-open');
                menuToggle.querySelector('i').classList.toggle('fa-bars');
                menuToggle.querySelector('i').classList.toggle('fa-times');
            });
        }
    }

    // ==================== MODALS ====================
    setupModals() {
        const modal = document.querySelector('.modal-overlay');
        const modalTriggers = document.querySelectorAll('[data-modal]');
        const modalClose = document.querySelectorAll('.modal-close, [data-modal-close]');

        // Open modal
        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = trigger.getAttribute('data-modal');
                this.openModal(modalId);
            });
        });

        // Close modal
        modalClose.forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                this.closeModal();
            });
        });

        // Close on overlay click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Animate in
            setTimeout(() => {
                modal.style.opacity = '1';
                modal.style.visibility = 'visible';
            }, 10);
        }
    }

    closeModal() {
        const modal = document.querySelector('.modal-overlay.active');
        if (modal) {
            modal.style.opacity = '0';
            modal.style.visibility = 'hidden';
            
            setTimeout(() => {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }, 300);
        }
    }

    // ==================== FORMS ====================
    setupForms() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Add focus effects
            const inputs = form.querySelectorAll('.form-control');
            inputs.forEach(input => {
                input.addEventListener('focus', () => {
                    input.parentElement.classList.add('focused');
                });
                
                input.addEventListener('blur', () => {
                    if (!input.value) {
                        input.parentElement.classList.remove('focused');
                    }
                });
                
                // Real-time validation
                input.addEventListener('input', () => {
                    this.validateInput(input);
                });
            });

            // Form submission
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                if (this.validateForm(form)) {
                    const submitBtn = form.querySelector('button[type="submit"]');
                    const originalText = submitBtn.innerHTML;
                    
                    // Show loading state
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                    submitBtn.disabled = true;
                    
                    try {
                        // Simulate API call
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        
                        // Show success notification
                        this.showNotification('Success', 'Form submitted successfully!', 'success');
                        
                        // Reset form
                        form.reset();
                        
                        // Close modal if form is in modal
                        const modal = form.closest('.modal-content');
                        if (modal) {
                            this.closeModal();
                        }
                    } catch (error) {
                        this.showNotification('Error', 'Something went wrong. Please try again.', 'error');
                    } finally {
                        // Reset button
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    }
                }
            });
        });
    }

    validateInput(input) {
        const parent = input.parentElement;
        const errorElement = parent.querySelector('.error-message');
        
        // Clear previous errors
        parent.classList.remove('error');
        if (errorElement) errorElement.remove();
        
        // Required validation
        if (input.hasAttribute('required') && !input.value.trim()) {
            this.showInputError(input, 'This field is required');
            return false;
        }
        
        // Email validation
        if (input.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                this.showInputError(input, 'Please enter a valid email address');
                return false;
            }
        }
        
        // Phone validation
        if (input.type === 'tel' && input.value) {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(input.value)) {
                this.showInputError(input, 'Please enter a valid phone number');
                return false;
            }
        }
        
        // Length validation
        if (input.hasAttribute('minlength') || input.hasAttribute('maxlength')) {
            const min = parseInt(input.getAttribute('minlength')) || 0;
            const max = parseInt(input.getAttribute('maxlength')) || Infinity;
            const length = input.value.length;
            
            if (length < min) {
                this.showInputError(input, `Minimum ${min} characters required`);
                return false;
            }
            
            if (length > max) {
                this.showInputError(input, `Maximum ${max} characters allowed`);
                return false;
            }
        }
        
        // Valid input
        parent.classList.add('valid');
        return true;
    }

    showInputError(input, message) {
        const parent = input.parentElement;
        parent.classList.remove('valid');
        parent.classList.add('error');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.style.cssText = `
            color: var(--danger);
            font-size: 0.75rem;
            margin-top: 0.25rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
        `;
        errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        
        parent.appendChild(errorElement);
    }

    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('.form-control');
        
        inputs.forEach(input => {
            if (!this.validateInput(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    // ==================== TABLES ====================
    setupTables() {
        const tables = document.querySelectorAll('.data-table');
        
        tables.forEach(table => {
            // Add hover effects to rows
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => {
                row.addEventListener('mouseenter', () => {
                    row.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                });
                
                row.addEventListener('mouseleave', () => {
                    row.style.backgroundColor = '';
                });
            });

            // Sortable columns
            const headers = table.querySelectorAll('th[data-sort]');
            headers.forEach(header => {
                header.style.cursor = 'pointer';
                header.addEventListener('click', () => {
                    this.sortTable(table, header);
                });
            });

            // Pagination
            const pagination = table.closest('.table-container')?.querySelector('.pagination');
            if (pagination) {
                this.setupPagination(table, pagination);
            }
        });
    }

    sortTable(table, header) {
        const column = header.getAttribute('data-sort');
        const direction = header.getAttribute('data-sort-direction') || 'asc';
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        // Toggle direction
        const newDirection = direction === 'asc' ? 'desc' : 'asc';
        header.setAttribute('data-sort-direction', newDirection);
        
        // Update sort indicator
        table.querySelectorAll('th').forEach(th => {
            th.querySelector('.sort-indicator')?.remove();
        });
        
        const indicator = document.createElement('span');
        indicator.className = 'sort-indicator';
        indicator.innerHTML = newDirection === 'asc' ? ' ↑' : ' ↓';
        header.appendChild(indicator);
        
        // Sort rows
        rows.sort((a, b) => {
            const aValue = a.querySelector(`td:nth-child(${header.cellIndex + 1})`).textContent;
            const bValue = b.querySelector(`td:nth-child(${header.cellIndex + 1})`).textContent;
            
            if (newDirection === 'asc') {
                return aValue.localeCompare(bValue);
            } else {
                return bValue.localeCompare(aValue);
            }
        });
        
        // Reorder rows
        rows.forEach(row => tbody.appendChild(row));
    }

    // ==================== NOTIFICATIONS ====================
    setupNotifications() {
        // Auto-dismiss notifications
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => {
            if (!notification.classList.contains('persistent')) {
                setTimeout(() => {
                    this.hideNotification(notification);
                }, 5000);
            }
        });
    }

    showNotification(title, message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.hideNotification(notification);
        });
        
        // Auto-dismiss
        if (type !== 'error') {
            setTimeout(() => {
                this.hideNotification(notification);
            }, 5000);
        }
    }

    hideNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }

    // ==================== ANIMATIONS ====================
    setupAnimations() {
        // Animate elements on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fadeIn');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe elements with animation class
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
        
        // Stagger animations for lists
        const lists = document.querySelectorAll('.stats-grid, .nav-list');
        lists.forEach((list, listIndex) => {
            const items = list.children;
            Array.from(items).forEach((item, index) => {
                item.style.animationDelay = `${(index * 0.1) + (listIndex * 0.2)}s`;
                item.classList.add('animate-fadeIn');
            });
        });
    }

    // ==================== KEYBOARD SHORTCUTS ====================
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + / to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                const searchInput = document.querySelector('.search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }
            
            // Ctrl/Cmd + N to add new item
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                const addButton = document.getElementById('addTenantBtn') || 
                                document.querySelector('[data-modal="tenantModal"]');
                if (addButton) {
                    addButton.click();
                }
            }
            
            // Escape to close modals/notifications
            if (e.key === 'Escape') {
                this.closeModal();
                
                // Close notifications
                document.querySelectorAll('.notification.show').forEach(notification => {
                    this.hideNotification(notification);
                });
            }
        });
    }

    // ==================== UTILITIES ====================
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize
window.Rentala = new RentalaUnified();
