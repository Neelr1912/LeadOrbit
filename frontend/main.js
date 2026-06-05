
import { fetchWithAuth, clearTokens } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    // If we're on a public page, do nothing special
    if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
        return;
    }

    // Attempt to fetch profile info on authenticated pages
    try {
        const res = await fetchWithAuth('/auth/me/');
        if (!res.ok) throw new Error();

        const userData = await res.json();

        // Update UI placeholders generically
        const userDisplays = document.querySelectorAll('.user-display-name');
        userDisplays.forEach(el => el.textContent = userData.email);

        const orgDisplays = document.querySelectorAll('.org-display-name');
        orgDisplays.forEach(el => el.textContent = userData.organization.name);
        // Populate Gemini fields if we are on the settings page
        const geminiKeyInput = document.getElementById('gemini-api-key');
        const aiPersonalizationToggle = document.getElementById('enable-ai-personalization');
        const orgNameInput = document.getElementById('org-name');
        const orgIdInput = document.getElementById('org-id');

        if (userData.organization) {
            if (orgNameInput) orgNameInput.value = userData.organization.name || '';
            if (orgIdInput) orgIdInput.value = userData.organization.id || '';
            if (geminiKeyInput) geminiKeyInput.value = userData.organization.gemini_api_key || '';
            if (aiPersonalizationToggle) aiPersonalizationToggle.checked = userData.organization.enable_ai_personalization !== false;
        }

    } catch (e) {
        // Automatically redirects to login via fetchWithAuth on 401
        // Handle Settings Form Submission
    const orgNameInput = document.getElementById('org-name');
    if (orgNameInput) {
        // Find the closest parent card form or button to attach save logic
        const saveBtn = document.querySelector('button[type="submit"]') || orgNameInput.closest('.glass-card');
        
        if (saveBtn) {
            const handleSave = async (e) => {
                e.preventDefault();
                
                const geminiKeyInput = document.getElementById('gemini-api-key');
                const aiPersonalizationToggle = document.getElementById('enable-ai-personalization');
                
                const payload = {
                    organization_name: orgNameInput.value,
                    gemini_api_key: geminiKeyInput ? geminiKeyInput.value : null,
                    enable_ai_personalization: aiPersonalizationToggle ? aiPersonalizationToggle.checked : true
                };

                try {
                    const response = await fetchWithAuth('/auth/me/', {
                        method: 'PATCH',
                        body: JSON.stringify(payload)
                    });

                    if (response.ok) {
                        alert('Settings updated successfully!');
                        window.location.reload();
                    } else {
                        const errData = await response.json();
                        alert('Failed to update settings: ' + JSON.stringify(errData));
                    }
                } catch (err) {
                    console.error('Error saving settings:', err);
                    alert('An error occurred while saving.');
                }
            };

            // Bind to form submission if inside a form, otherwise bind to a button click
            const form = orgNameInput.closest('form');
            if (form) {
                form.addEventListener('submit', handleSave);
            } else {
                // If there isn't a strict <form> tag, look for a save button inside the card
                const innerBtn = saveBtn.querySelector('button') || saveBtn;
                if (innerBtn) innerBtn.addEventListener('click', handleSave);
            }
        }
    }
    }

    // Handle logout attachments
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            clearTokens();
            window.location.href = '/login.html';
        });
    }
});
