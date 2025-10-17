#!/usr/bin/env python3
"""
EQUADATOR Auth0 Setup Checker
This script checks if your Auth0 configuration is properly set up
"""

import os
import re
import sys
from pathlib import Path

def check_auth0_config():
    """Check if Auth0 configuration has been updated"""
    
    print("🔍 Checking EQUADATOR Auth0 Configuration...\n")
    
    # Check if auth0-auth.js exists
    auth0_auth_path = Path(__file__).parent / "auth0-auth.js"
    
    if not auth0_auth_path.exists():
        print("❌ auth0-auth.js file not found!")
        return False
    
    # Read the file
    with open(auth0_auth_path, 'r') as f:
        content = f.read()
    
    # Check for placeholder values
    placeholders = [
        "YOUR_AUTH0_DOMAIN.auth0.com",
        "YOUR_AUTH0_CLIENT_ID"
    ]
    
    has_placeholders = any(placeholder in content for placeholder in placeholders)
    
    if has_placeholders:
        print("⚠️  Auth0 configuration NOT UPDATED yet!")
        print("\n📋 TO FIX THIS:")
        print("1. Go to: https://auth0.com/")
        print("2. Create account and new application")
        print("3. Choose 'Single Page Application' type")
        print("4. Enable Google, Microsoft social connections")
        print("5. Copy domain and client ID")
        print("6. Paste config in auth0-auth.js")
        print("7. Add localhost:8000 to callback URLs")
        print("\n📖 Full guide: AUTH0_COMPLETE_SETUP_GUIDE.md")
        return False
    else:
        print("✅ Auth0 configuration looks updated!")
        
        # Extract some info
        domain_match = re.search(r'domain:\s*["\']([^"\']+)["\']', content)
        client_id_match = re.search(r'clientId:\s*["\']([^"\']+)["\']', content)
        
        if domain_match and client_id_match:
            domain = domain_match.group(1)
            client_id = client_id_match.group(1)
            
            print(f"� Domain: {domain}")
            print(f"� Client ID: {client_id[:10]}...{client_id[-5:]}")
        
        return True

def check_server_status():
    """Check if development server is running"""
    
    import socket
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('127.0.0.1', 8000))
        sock.close()
        
        if result == 0:
            print("✅ Development server is running on port 8000")
            print("🌐 Login page: http://localhost:8000/login.html")
            return True
        else:
            print("❌ Development server is NOT running")
            print("\n📋 TO START SERVER:")
            print("cd /Users/nbharath/profile/EQUDATOR/Website")
            print("python3 server.py")
            return False
    except Exception as e:
        print(f"❌ Could not check server status: {e}")
        return False

def check_html_files():
    """Check if HTML files have been updated to use Auth0"""
    
    print("🔍 Checking HTML files for Auth0 integration...\n")
    
    files_to_check = ['login.html', 'signup.html', 'dashboard.html', 'index.html']
    updated_files = 0
    
    for filename in files_to_check:
        file_path = Path(__file__).parent / filename
        if file_path.exists():
            with open(file_path, 'r') as f:
                content = f.read()
            
            if 'auth0.min.js' in content and 'auth0-auth.js' in content:
                print(f"✅ {filename} - Updated for Auth0")
                updated_files += 1
            elif 'firebase' in content.lower():
                print(f"⚠️  {filename} - Still has Firebase references")
            else:
                print(f"❌ {filename} - Needs Auth0 integration")
        else:
            print(f"❌ {filename} - File not found")
    
    if updated_files == len(files_to_check):
        print(f"\n✅ All {updated_files} HTML files updated for Auth0!")
        return True
    else:
        print(f"\n⚠️  {updated_files}/{len(files_to_check)} files updated for Auth0")
        return False

def main():
    """Main setup checker"""
    
    print("=" * 60)
    print("� EQUADATOR AUTH0 SETUP CHECKER")
    print("=" * 60)
    
    config_ok = check_auth0_config()
    print()
    files_ok = check_html_files()
    print()
    server_ok = check_server_status()
    print()
    
    if config_ok and files_ok and server_ok:
        print("🎉 EVERYTHING LOOKS GOOD!")
        print("\n🚀 READY TO TEST:")
        print("1. Open: http://localhost:8000/login.html")
        print("2. Click 'Continue with Google'")
        print("3. Sign in with your Google account")
        print("4. Should redirect to dashboard")
        print("\n✨ Your Auth0 authentication is ready to use!")
        
    elif config_ok and files_ok and not server_ok:
        print("⚠️  CONFIG & FILES OK, BUT SERVER NOT RUNNING")
        print("\n🚀 START SERVER:")
        print("python3 server.py")
        
    elif config_ok and not files_ok and server_ok:
        print("⚠️  CONFIG & SERVER OK, BUT FILES NEED UPDATE")
        print("\n📖 Update HTML files to use Auth0:")
        print("Replace Firebase scripts with Auth0 scripts")
        
    elif not config_ok and files_ok and server_ok:
        print("⚠️  FILES & SERVER OK, BUT CONFIG NOT UPDATED")
        print("\n📖 Follow the Auth0 setup guide:")
        print("AUTH0_COMPLETE_SETUP_GUIDE.md")
        
    else:
        print("❌ MULTIPLE ISSUES NEED ATTENTION")
        print("\n📖 Follow the complete setup guide:")
        print("AUTH0_COMPLETE_SETUP_GUIDE.md")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()