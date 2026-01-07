
        // Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 992) {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });

        // Period buttons
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Navigation items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function(e) {
                if (!this.classList.contains('active')) {
                    e.preventDefault();
                    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Update page title based on navigation
                    const pageTitle = document.querySelector('.page-title h1');
                    const pageDescription = document.querySelector('.page-title p');
                    const navText = this.querySelector('span').textContent;
                    
                    pageTitle.textContent = navText + ' Overview';
                    pageDescription.textContent = `Manage your ${navText.toLowerCase()} from this dashboard.`;
                }
            });
        });

        // Property card buttons
        document.querySelectorAll('.property-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const propertyTitle = this.closest('.property-card').querySelector('.property-title').textContent;
                const action = this.classList.contains('primary') ? 'edit' : 'view';
                
                alert(`${action === 'edit' ? 'Editing' : 'Viewing'}: ${propertyTitle}`);
            });
        });

        // Search functionality
        const searchInput = document.querySelector('.search-input');
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                alert(`Searching for: "${this.value}"`);
                this.value = '';
            }
        });

        // Notification button
        document.querySelector('.notification-btn').addEventListener('click', function() {
            alert('You have 3 new notifications');
            this.querySelector('.notification-badge').style.display = 'none';
        });

        // Logout functionality
        document.querySelector('.nav-item:last-child').addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                alert('Logging out... Redirecting to login page.');
                setTimeout(() => {
                    window.location.href = 'http://localhost:3002/login_transparent_form.html';
                }, 1000);
            }
        });

        // Initialize dashboard
        console.log('Rentala Elegant dashboard loaded! Matching your transparent login design.');
        console.log('✨ Features: Transparent glass design, clear background, cohesive aesthetics');
        
        // Auto-hide menu on desktop
        if (window.innerWidth > 992) {
            setTimeout(() => {
                sidebar.classList.remove('active');
            }, 3000);
        }
