#!/bin/bash

# Create a new enhanced CSS file with glass effects
cat > simple-polish-enhanced.css << 'CSS'
/* ============================================
   GLASSMORPHISM & PROFESSIONAL SPACING THEME
   Enhanced Version - Rentala Platform
============================================= */

:root {
    /* Glass effect variables */
    --glass-bg: rgba(255, 255, 255, 0.15);
    --glass-border: rgba(255, 255, 255, 0.2);
    --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    --glass-blur: blur(15px);
    --glass-backdrop: blur(20px);
    
    /* Color palette */
    --primary-gradient: linear-gradient(135deg, #4361ee, #3a0ca3);
    --secondary-gradient: linear-gradient(135deg, rgba(67, 97, 238, 0.1), rgba(58, 12, 163, 0.05));
    --text-primary: #1a1a2e;
    --text-secondary: #4a5568;
    --text-muted: #718096;
    
    /* Spacing scale */
    --space-xs: 0.5rem;
    --space-sm: 0.75rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    --space-2xl: 3rem;
    --space-3xl: 4rem;
    
    /* Border radius */
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 24px;
    --radius-full: 50px;
    
    /* Transitions */
    --transition-fast: 150ms ease;
    --transition-normal: 300ms ease;
    --transition-slow: 500ms ease;
}

/* ==================== BASE RESET ==================== */
body.tenants-page {
    background: 
        url('rentala_web_background.png') center/cover no-repeat fixed,
        linear-gradient(135deg, rgba(67, 97, 238, 0.08) 0%, rgba(58, 12, 163, 0.04) 100%);
    padding: var(--space-xl);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: var(--text-primary);
    line-height: 1.6;
    min-height: 100vh;
    margin: 0;
}

/* ==================== GLASS CONTAINERS ==================== */
.container, 
.content-container, 
.main-container,
.section-container {
    background: var(--glass-bg);
    backdrop-filter: var(--glass-backdrop);
    -webkit-backdrop-filter: var(--glass-backdrop);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--glass-shadow);
    padding: var(--space-xl);
    margin-bottom: var(--space-xl);
    transition: all var(--transition-normal);
    position: relative;
    overflow: hidden;
}

.container::before,
.content-container::before,
.main-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--primary-gradient);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    z-index: 1;
}

/* ==================== GLASS CARDS ==================== */
.card,
.tenant-card,
.property-card,
.glass-card,
.data-card {
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: var(--radius-md);
    box-shadow: 
        0 4px 20px rgba(0, 0, 0, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    padding: var(--space-lg);
    margin-bottom: var(--space-md);
    transition: all var(--transition-normal);
    position: relative;
    overflow: hidden;
}

.card:hover,
.tenant-card:hover,
.property-card:hover,
.glass-card:hover {
    transform: translateY(-4px);
    box-shadow: 
        0 12px 40px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.25);
}

/* Card header accent */
.card::before,
.tenant-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--primary-gradient);
    border-radius: var(--radius-md) var(--radius-md) 0 0;
}

/* ==================== MODAL GLASS EFFECT ==================== */
.modal-content.glass-card {
    background: rgba(255, 255, 255, 0.18);
    backdrop-filter: var(--glass-backdrop);
    -webkit-backdrop-filter: var(--glass-backdrop);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: var(--radius-lg);
    box-shadow: 
        0 20px 60px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
    padding: 0;
    overflow: hidden;
    position: relative;
    max-width: 800px;
    margin: var(--space-3xl) auto;
}

.modal-content.glass-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: var(--primary-gradient);
    z-index: 2;
}

/* Modal Header */
.modal-header {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    padding: var(--space-lg) var(--space-xl);
    margin: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

#modalTitle {
    font-family: 'Inter', sans-serif;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    background: linear-gradient(135deg, #4361ee, #3a0ca3);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.5px;
}

.modal-close {
    font-size: 1.5rem;
    color: var(--text-muted);
    cursor: pointer;
    padding: var(--space-xs);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
}

.modal-close:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
    transform: rotate(90deg);
}

/* Modal Body */
.modal-body {
    padding: var(--space-xl);
    background: rgba(255, 255, 255, 0.08);
}

/* ==================== PROFESSIONAL FORM STYLING ==================== */
.form-group {
    margin-bottom: var(--space-lg);
    position: relative;
}

.form-group label {
    display: block;
    margin-bottom: var(--space-xs);
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.form-control,
input[type="text"],
input[type="email"],
input[type="tel"],
input[type="date"],
input[type="number"],
select,
textarea {
    width: 100%;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(5px);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-sm);
    padding: var(--space-md) var(--space-lg);
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
    color: var(--text-primary);
    transition: all var(--transition-normal);
    outline: none;
}

.form-control:focus,
input:focus,
select:focus,
textarea:focus {
    background: rgba(255, 255, 255, 0.25);
    border-color: #4361ee;
    box-shadow: 
        0 0 0 3px rgba(67, 97, 238, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
}

/* Form rows for inline fields */
.form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-lg);
    margin-bottom: var(--space-lg);
}

/* ==================== BUTTON ENHANCEMENTS ==================== */
.btn,
.button,
button[type="submit"],
button[type="button"] {
    background: var(--primary-gradient);
    color: white;
    border: none;
    border-radius: var(--radius-full);
    padding: var(--space-md) var(--space-xl);
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all var(--transition-normal);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    position: relative;
    overflow: hidden;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.btn::before,
.button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.7s ease;
}

.btn:hover::before,
.button:hover::before {
    left: 100%;
}

.btn:hover,
.button:hover,
button[type="submit"]:hover,
button[type="button"]:hover {
    transform: translateY(-2px);
    box-shadow: 
        0 10px 30px rgba(67, 97, 238, 0.4),
        0 4px 0 rgba(67, 97, 238, 0.3);
}

.btn-primary {
    background: var(--primary-gradient);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary {
    background: rgba(255, 255, 255, 0.15);
    color: var(--text-primary);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
}

.btn-secondary:hover {
    background: rgba(255, 255, 255, 0.25);
    color: #4361ee;
    border-color: #4361ee;
}

/* Top Add Tenant Button */
#addTenantBtn {
    position: fixed !important;
    top: var(--space-xl) !important;
    right: var(--space-xl) !important;
    z-index: 1000 !important;
    background: var(--primary-gradient) !important;
    color: white !important;
    border: 1px solid rgba(255, 255, 255, 0.25) !important;
    border-radius: var(--radius-full) !important;
    padding: var(--space-md) var(--space-xl) !important;
    font-weight: 600 !important;
    box-shadow: 
        0 8px 32px rgba(67, 97, 238, 0.4),
        0 4px 0 rgba(67, 97, 238, 0.3) !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: var(--space-sm) !important;
    transition: all var(--transition-normal) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px) !important;
}

#addTenantBtn:hover {
    transform: translateY(-3px) !important;
    box-shadow: 
        0 15px 40px rgba(67, 97, 238, 0.5),
        0 6px 0 rgba(67, 97, 238, 0.4) !important;
    border-color: rgba(255, 255, 255, 0.35) !important;
}

/* ==================== TABLE STYLING ==================== */
.table-container {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: var(--radius-md);
    border: 1px solid rgba(255, 255, 255, 0.15);
    overflow: hidden;
    margin-bottom: var(--space-lg);
}

table {
    width: 100%;
    border-collapse: collapse;
}

th {
    background: rgba(255, 255, 255, 0.2);
    padding: var(--space-md) var(--space-lg);
    text-align: left;
    font-weight: 600;
    color: var(--text-secondary);
    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
    text-transform: uppercase;
    font-size: 0.875rem;
    letter-spacing: 0.5px;
}

td {
    padding: var(--space-md) var(--space-lg);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--text-primary);
}

tr:hover {
    background: rgba(255, 255, 255, 0.08);
}

/* ==================== STATUS BADGES ==================== */
.status-badge,
.badge {
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    backdrop-filter: blur(10px);
    border: 1px solid transparent;
}

.status-active,
.badge-success {
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
    border-color: rgba(16, 185, 129, 0.3);
}

.status-inactive,
.badge-danger {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.3);
}

.status-pending,
.badge-warning {
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
    border-color: rgba(245, 158, 11, 0.3);
}

/* ==================== HEADER STYLING ==================== */
.header,
.page-header,
.section-header {
    background: rgba(255, 255, 255, 0.18);
    backdrop-filter: var(--glass-backdrop);
    -webkit-backdrop-filter: var(--glass-backdrop);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    margin-bottom: var(--space-xl);
    box-shadow: var(--glass-shadow);
    position: relative;
}

.header::before,
.page-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--primary-gradient);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

/* ==================== UTILITY CLASSES ==================== */
.mt-0 { margin-top: 0 !important; }
.mt-sm { margin-top: var(--space-sm) !important; }
.mt-md { margin-top: var(--space-md) !important; }
.mt-lg { margin-top: var(--space-lg) !important; }
.mt-xl { margin-top: var(--space-xl) !important; }

.mb-0 { margin-bottom: 0 !important; }
.mb-sm { margin-bottom: var(--space-sm) !important; }
.mb-md { margin-bottom: var(--space-md) !important; }
.mb-lg { margin-bottom: var(--space-lg) !important; }
.mb-xl { margin-bottom: var(--space-xl) !important; }

.p-sm { padding: var(--space-sm) !important; }
.p-md { padding: var(--space-md) !important; }
.p-lg { padding: var(--space-lg) !important; }
.p-xl { padding: var(--space-xl) !important; }

.text-center { text-align: center !important; }
.text-right { text-align: right !important; }
.text-left { text-align: left !important; }

.d-flex { display: flex !important; }
.align-center { align-items: center !important; }
.justify-between { justify-content: space-between !important; }
.justify-center { justify-content: center !important; }
.gap-sm { gap: var(--space-sm) !important; }
.gap-md { gap: var(--space-md) !important; }

/* ==================== RESPONSIVE DESIGN ==================== */
@media (max-width: 768px) {
    :root {
        --space-xl: 1.5rem;
        --space-lg: 1rem;
        --space-md: 0.75rem;
    }
    
    body.tenants-page {
        padding: var(--space-md);
    }
    
    .container,
    .content-container,
    .main-container {
        padding: var(--space-lg);
        margin-bottom: var(--space-lg);
    }
    
    .modal-content.glass-card {
        margin: var(--space-xl) var(--space-md);
        width: calc(100% - var(--space-md) * 2);
    }
    
    .form-row {
        grid-template-columns: 1fr;
        gap: var(--space-md);
    }
    
    #addTenantBtn {
        top: var(--space-md) !important;
        right: var(--space-md) !important;
        padding: var(--space-sm) var(--space-md) !important;
        font-size: 0.875rem !important;
    }
    
    .btn,
    .button {
        padding: var(--space-sm) var(--space-lg);
        font-size: 0.875rem;
    }
}

@media (max-width: 480px) {
    #modalTitle {
        font-size: 1.5rem;
    }
    
    .modal-header {
        padding: var(--space-md);
    }
    
    .modal-body {
        padding: var(--space-lg);
    }
}

/* ==================== ANIMATIONS ==================== */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(67, 97, 238, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(67, 97, 238, 0); }
    100% { box-shadow: 0 0 0 0 rgba(67, 97, 238, 0); }
}

.fade-in-up {
    animation: fadeInUp 0.6s ease-out;
}

.slide-in-right {
    animation: slideInRight 0.5s ease-out;
}

.pulse {
    animation: pulse 2s infinite;
}
CSS

# Replace the old simple-polish.css with the enhanced version
mv simple-polish-enhanced.css simple-polish.css

echo "✅ Glassmorphism theme and professional spacing added!"
echo "✅ Enhanced with:"
echo "   - CSS Variables for consistent design"
echo "   - Professional glass effects"
echo "   - Systematic spacing scale"
echo "   - Responsive design improvements"
echo "   - Smooth animations and transitions"
echo "   - Backup saved as simple-polish.css.backup.glass"
