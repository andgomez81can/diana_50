import { supabase } from '../lib/supabase.js';

class FormHandler {
    constructor() {
        this.form = document.getElementById('rsvp-form');
        this.feedback = document.getElementById('form-feedback');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            guests: parseInt(document.getElementById('guests').value),
            dietary: document.getElementById('dietary').value,
            message: document.getElementById('message').value,
            timestamp: new Date().toISOString()
        };

        // Validate
        if (!this.validateForm(formData)) {
            return;
        }

        // Show loading state
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        try {
            // Save to Supabase
            const { error } = await supabase
                .from('rsvps')
                .insert([formData]);

            if (error) throw error;

            // Also store in localStorage as backup
            this.saveToLocalStorage(formData);

            // Show success message
            this.showFeedback('success', 'Thank you for your RSVP! We look forward to celebrating with you.');
            this.form.reset();

        } catch (error) {
            console.error('Form submission error:', error);
            this.showFeedback('error', 'There was an error submitting your RSVP. Please try again.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    validateForm(data) {
        if (!data.name || data.name.trim().length < 2) {
            this.showFeedback('error', 'Please enter a valid name.');
            return false;
        }

        if (!data.email || !this.isValidEmail(data.email)) {
            this.showFeedback('error', 'Please enter a valid email address.');
            return false;
        }

        if (!data.guests || data.guests < 1) {
            this.showFeedback('error', 'Please enter the number of guests.');
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    saveToLocalStorage(data) {
        const rsvps = JSON.parse(localStorage.getItem('diana-rsvps') || '[]');
        rsvps.push(data);
        localStorage.setItem('diana-rsvps', JSON.stringify(rsvps));
    }

    showFeedback(type, message) {
        this.feedback.style.display = 'block';
        this.feedback.style.padding = 'var(--spacing-sm)';
        this.feedback.style.borderRadius = '10px';
        this.feedback.style.textAlign = 'center';

        if (type === 'success') {
            this.feedback.style.background = 'rgba(76, 175, 80, 0.2)';
            this.feedback.style.border = '1px solid rgba(76, 175, 80, 0.5)';
            this.feedback.style.color = '#4caf50';
        } else {
            this.feedback.style.background = 'rgba(244, 67, 54, 0.2)';
            this.feedback.style.border = '1px solid rgba(244, 67, 54, 0.5)';
            this.feedback.style.color = '#f44336';
        }

        this.feedback.textContent = message;

        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.feedback.style.display = 'none';
        }, 5000);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new FormHandler();
    });
} else {
    new FormHandler();
}
