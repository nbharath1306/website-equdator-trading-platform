/* EQUDATOR Website - Shared Tailwind Configuration */
/* This file contains the shared Tailwind configuration to be used across all pages */

// Shared Tailwind Configuration Object
const EQUDATOR_TAILWIND_CONFIG = {
    theme: {
        extend: {
            colors: {
                'primary-teal': '#40c8b3',      // Primary Color - vibrant teal
                'deep-turquoise': '#0d7377',    // Secondary Color - deep turquoise  
                'charcoal-purple': '#484557',   // Secondary Color - muted charcoal-purple
                'navy-black': '#12122a',        // Accent Color - rich navy-black
                'golden-yellow': '#ffc00b',     // Accent Color - bold golden yellow
                'pure-white': '#FFFFFF',        // Accent Color - classic white
                // Additional color variations for better distribution
                'teal-light': '#66d4c4',
                'teal-dark': '#2ca89a',
                'turquoise-light': '#1a9ba0',
                'purple-light': '#5a5768',
                'navy-light': '#1e1e3f',
                'yellow-light': '#ffcd3d'
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.6s ease-out',
                'bounce-slow': 'bounce 3s infinite',
                'pulse-slow': 'pulse 4s infinite',
                'float': 'float 6s ease-in-out infinite',
                'typing': 'typing 3.5s steps(40, end)',
                'blink-caret': 'blink-caret 1s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                typing: {
                    'from': { width: '0' },
                    'to': { width: '100%' }
                },
                'blink-caret': {
                    'from, to': { borderColor: 'transparent' },
                    '50%': { borderColor: '#40c8b3' }
                }
            },
            fontFamily: {
                'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },
            borderRadius: {
                '4xl': '2rem',
            },
            backdropBlur: {
                'xs': '2px',
            }
        }
    },
    plugins: [
        // Future plugins can be added here
    ]
};

// Function to apply Tailwind configuration
function applyTailwindConfig() {
    if (typeof tailwind !== 'undefined') {
        tailwind.config = EQUDATOR_TAILWIND_CONFIG;
    } else {
        // Fallback: Apply configuration when Tailwind loads
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof tailwind !== 'undefined') {
                tailwind.config = EQUDATOR_TAILWIND_CONFIG;
            }
        });
    }
}

// Shared utility functions for all pages
const EQUDATOR_UTILS = {
    // Mobile menu toggle
    toggleMobileMenu: function() {
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        
        if (mobileMenu) {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('active');
            
            // Update button aria-expanded
            if (mobileMenuBtn) {
                const isExpanded = !mobileMenu.classList.contains('hidden');
                mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
            }
        }
    },

    // Smooth scroll to section
    smoothScrollTo: function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    },

    // Initialize page animations
    initPageAnimations: function() {
        // Add fade-in animation to elements with slide-up class
        const slideUpElements = document.querySelectorAll('.slide-up');
        slideUpElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.1}s`;
        });

        // Initialize intersection observer for animations
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '50px'
            });

            // Observe elements with animate-on-scroll class
            document.querySelectorAll('.animate-on-scroll').forEach(el => {
                observer.observe(el);
            });
        }
    },

    // Form validation helper
    validateForm: function(formId) {
        const form = document.getElementById(formId);
        if (!form) return false;

        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('border-red-500');
                isValid = false;
            } else {
                input.classList.remove('border-red-500');
            }
        });

        return isValid;
    },

    // Initialize page
    init: function() {
        // Apply Tailwind configuration
        applyTailwindConfig();
        
        // Initialize animations
        this.initPageAnimations();
        
        // Setup mobile menu
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', this.toggleMobileMenu);
        }

        // Setup dropdown toggles
        document.querySelectorAll('[data-dropdown-toggle]').forEach(button => {
            button.addEventListener('click', function() {
                const dropdownId = this.getAttribute('data-dropdown-toggle');
                const dropdown = document.getElementById(dropdownId);
                if (dropdown) {
                    dropdown.classList.toggle('active');
                }
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('[data-dropdown-toggle]')) {
                document.querySelectorAll('.nav-dropdown.active').forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        });

        // Keyboard navigation support
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                // Close mobile menu and dropdowns
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    EQUDATOR_UTILS.toggleMobileMenu();
                }
                
                document.querySelectorAll('.nav-dropdown.active').forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        });

        console.log('✅ EQUDATOR shared utilities initialized');
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EQUDATOR_UTILS.init());
} else {
    EQUDATOR_UTILS.init();
}