// EQUDATOR Auth0 Configuration
const auth0Config = {
    domain: "dev-s7h8y4hgcvo8rfvo.us.auth0.com",
    clientId: "0Xluowf86SL92U7KfIIazQpdQUuNHVDM",
    redirectUri: window.location.origin + "/dashboard.html",
    responseType: "token id_token",
    scope: "openid profile email"
};

let auth0Client = null;
let currentUser = null;

async function initializeAuth0() {
    try {
        if (typeof auth0 === 'undefined') {
            console.error('Auth0 SDK not loaded - make sure the CDN is accessible');
            showNotification('Auth0 SDK failed to load', 'error');
            return false;
        }

        auth0Client = new auth0.WebAuth({
            domain: auth0Config.domain,
            clientID: auth0Config.clientId,
            redirectUri: auth0Config.redirectUri,
            responseType: auth0Config.responseType,
            scope: auth0Config.scope
        });

        console.log('Auth0 initialized successfully with domain:', auth0Config.domain);
        await handleAuthCallback();
        await checkAuthState();
        return true;
    } catch (error) {
        console.error('Auth0 initialization failed:', error);
        showNotification('Auth0 initialization failed: ' + error.message, 'error');
        return false;
    }
}

async function handleAuthCallback() {
    if (window.location.hash && window.location.hash.includes('access_token')) {
        return new Promise((resolve, reject) => {
            auth0Client.parseHash((err, authResult) => {
                if (authResult && authResult.accessToken && authResult.idToken) {
                    localStorage.setItem('auth0_access_token', authResult.accessToken);
                    localStorage.setItem('auth0_id_token', authResult.idToken);

                    auth0Client.client.userInfo(authResult.accessToken, (err, user) => {
                        if (err) {
                            console.error('Failed to get user info:', err);
                            reject(err);
                            return;
                        }

                        currentUser = user;
                        localStorage.setItem('equdator_user', JSON.stringify(user));
                        window.location.hash = '';
                        
                        console.log('User authenticated successfully:', user);
                        showNotification('Welcome, ' + (user.name || user.email) + '!', 'success');
                        window.dispatchEvent(new CustomEvent('authStateChanged', { detail: user }));
                        resolve(user);
                    });
                } else if (err) {
                    console.error('Authentication error:', err);
                    showNotification('Authentication failed: ' + (err.error_description || err.error), 'error');
                    reject(err);
                } else {
                    resolve(null);
                }
            });
        });        
    }
}

async function checkAuthState() {
    const accessToken = localStorage.getItem('auth0_access_token');
    const userData = localStorage.getItem('equdator_user');

    if (accessToken && userData) {
        try {
            currentUser = JSON.parse(userData);
            console.log('User session restored:', currentUser.email || currentUser.name);
            window.dispatchEvent(new CustomEvent('authStateChanged', { detail: currentUser }));
            return currentUser;
        } catch (error) {
            console.error('Failed to restore user session:', error);
            localStorage.removeItem('auth0_access_token');
            localStorage.removeItem('auth0_id_token');
            localStorage.removeItem('equdator_user');
        }
    }
    return null;
}

const EQUDATOR_AUTH = {
    init: async function() {
        return await initializeAuth0();
    },

    signInWithGoogle: function() {
        if (!auth0Client) {
            console.error('Auth0 client not initialized');
            showNotification('Authentication not initialized. Please refresh the page.', 'error');
            return { success: false, error: 'Not initialized' };
        }

        try {
            console.log('Initiating Google sign-in...');
            showNotification('Redirecting to Google...', 'info');

            auth0Client.authorize({
                connection: 'google-oauth2',
                prompt: 'select_account'
            });

            return { success: true };
        } catch (error) {
            console.error('Google sign-in failed:', error);
            showNotification('Google sign-in failed: ' + error.message, 'error');
            return { success: false, error: error.message };
        }
    },

    signInWithMicrosoft: function() {
        if (!auth0Client) {
            console.error('Auth0 client not initialized');
            showNotification('Authentication not initialized. Please refresh the page.', 'error');
            return { success: false, error: 'Not initialized' };
        }

        try {
            console.log('Initiating Microsoft sign-in...');
            showNotification('Redirecting to Microsoft...', 'info');

            auth0Client.authorize({
                connection: 'windowslive'
            });

            return { success: true };
        } catch (error) {
            console.error('Microsoft sign-in failed:', error);
            showNotification('Microsoft sign-in failed: ' + error.message, 'error');
            return { success: false, error: error.message };
        }
    },

    signInWithApple: function() {
        if (!auth0Client) {
            console.error('Auth0 client not initialized');
            showNotification('Authentication not initialized. Please refresh the page.', 'error');
            return { success: false, error: 'Not initialized' };
        }

        try {
            console.log('Initiating Apple sign-in...');
            showNotification('Redirecting to Apple...', 'info');

            auth0Client.authorize({
                connection: 'apple'
            });

            return { success: true };
        } catch (error) {
            console.error('Apple sign-in failed:', error);
            showNotification('Apple sign-in failed: ' + error.message, 'error');
            return { success: false, error: error.message };
        }
    },

    signOut: function() {
        try {
            console.log('Signing out...');
            localStorage.removeItem('auth0_access_token');
            localStorage.removeItem('auth0_id_token');
            localStorage.removeItem('equdator_user');
            currentUser = null;
            window.dispatchEvent(new CustomEvent('authStateChanged', { detail: null }));
            
            if (auth0Client) {
                auth0Client.logout({
                    returnTo: window.location.origin + '/index.html'
                });
            } else {
                window.location.href = '/index.html';
            }
            
            console.log('User signed out successfully');
            showNotification('Signed out successfully', 'success');
            return { success: true };
        } catch (error) {
            console.error('Sign out failed:', error);
            showNotification('Sign out failed', 'error');
            return { success: false, error: error.message };
        }
    },

    getCurrentUser: function() {
        return currentUser;
    },

    isAuthenticated: function() {
        const accessToken = localStorage.getItem('auth0_access_token');
        return accessToken !== null && currentUser !== null;
    },

    requireAuth: function() {
        if (!this.isAuthenticated()) {
            console.log('Authentication required, redirecting to login...');
            window.location.href = '/login.html';
            return false;
        }
        return true;
    },

    onAuthStateChanged: function(callback) {
        window.addEventListener('authStateChanged', (event) => {
            callback(event.detail);
        });
    }
};

function showNotification(message, type) {
    type = type || 'info';
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'notification notification-' + type;
    
    notification.innerHTML = '<div class="notification-content"><span>' + message + '</span><button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button></div>';

    document.body.appendChild(notification);

    setTimeout(function() {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        EQUDATOR_AUTH.init();
    });
} else {
    EQUDATOR_AUTH.init();
}

console.log('EQUDATOR Auth0 service loaded');
console.log('Domain:', auth0Config.domain);
console.log('Client ID:', auth0Config.clientId.substring(0, 8) + '...');
