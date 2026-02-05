class MessagesDisplay {
    constructor() {
        this.container = document.getElementById('messages-container');
        this.loadMessages();

        // Listen for storage changes (when new messages are submitted)
        window.addEventListener('storage', () => this.loadMessages());
    }

    loadMessages() {
        // Get RSVP data from localStorage
        const rsvps = JSON.parse(localStorage.getItem('diana-rsvps') || '[]');

        // Filter to only show entries with messages
        const messagesWithText = rsvps.filter(rsvp => rsvp.message && rsvp.message.trim().length > 0);

        // Sort by timestamp (newest first)
        messagesWithText.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        this.displayMessages(messagesWithText);
    }

    displayMessages(messages) {
        // Clear container
        this.container.innerHTML = '';

        if (messages.length === 0) {
            this.showEmptyState();
            return;
        }

        // Create message cards
        messages.forEach((message, index) => {
            const card = this.createMessageCard(message, index);
            this.container.appendChild(card);
        });
    }

    createMessageCard(message, index) {
        const card = document.createElement('div');
        card.className = 'message-card';
        card.style.animationDelay = `${index * 0.1}s`;

        const messageText = document.createElement('p');
        messageText.className = 'message-text';
        messageText.textContent = message.message;

        const author = document.createElement('div');
        author.className = 'message-author';
        author.textContent = `— ${message.name}`;

        const date = document.createElement('div');
        date.className = 'message-date';
        date.textContent = this.formatDate(message.timestamp);

        card.appendChild(messageText);
        card.appendChild(author);
        card.appendChild(date);

        return card;
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }
    }

    showEmptyState() {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <p>No birthday wishes yet.</p>
            <p style="margin-top: var(--spacing-sm);">Be the first to <a href="form.html" style="color: var(--primary-color); text-decoration: underline;">share yours</a>!</p>
        `;
        this.container.appendChild(emptyState);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new MessagesDisplay();
    });
} else {
    new MessagesDisplay();
}
