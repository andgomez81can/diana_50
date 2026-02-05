import { supabase, STORAGE_BUCKET } from '../lib/supabase.js';

// Admin password (change this to your desired password)
const ADMIN_PASSWORD = '80157714Gomez';

class AdminUploader {
    constructor() {
        // Password elements
        this.passwordModal = document.getElementById('password-modal');
        this.passwordInput = document.getElementById('password-input');
        this.loginBtn = document.getElementById('login-btn');
        this.logoutBtn = document.getElementById('logout-btn');
        this.errorMessage = document.getElementById('error-message');

        // Upload elements
        this.uploadContainer = document.getElementById('upload-container');
        this.uploadZone = document.getElementById('upload-zone');
        this.fileInput = document.getElementById('file-input');
        this.previewContainer = document.getElementById('preview-container');
        this.previewGrid = document.getElementById('preview-grid');
        this.imageCount = document.getElementById('image-count');
        this.uploadBtn = document.getElementById('upload-btn');
        this.feedback = document.getElementById('upload-feedback');

        this.selectedFiles = [];
        this.isAuthenticated = false;

        this.checkAuth();
        this.setupEventListeners();
    }

    checkAuth() {
        // Check if user is already authenticated (session storage)
        const isAuth = sessionStorage.getItem('admin-auth') === 'true';
        if (isAuth) {
            this.showUploadInterface();
        }
    }

    setupEventListeners() {
        // Password authentication
        this.loginBtn.addEventListener('click', () => this.handleLogin());
        this.passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });

        // Logout
        this.logoutBtn.addEventListener('click', () => this.handleLogout());

        // File input change
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and drop
        this.uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadZone.classList.add('drag-over');
        });

        this.uploadZone.addEventListener('dragleave', () => {
            this.uploadZone.classList.remove('drag-over');
        });

        this.uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadZone.classList.remove('drag-over');
            this.handleFileSelect(e);
        });

        // Upload button
        this.uploadBtn.addEventListener('click', () => this.uploadImages());
    }

    handleLogin() {
        const password = this.passwordInput.value;

        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('admin-auth', 'true');
            this.showUploadInterface();
        } else {
            this.errorMessage.classList.add('show');
            this.passwordInput.value = '';
            this.passwordInput.focus();

            // Hide error after 3 seconds
            setTimeout(() => {
                this.errorMessage.classList.remove('show');
            }, 3000);
        }
    }

    handleLogout() {
        sessionStorage.removeItem('admin-auth');
        this.passwordModal.classList.remove('hidden');
        this.uploadContainer.style.display = 'none';
        this.logoutBtn.classList.add('hidden');
        this.passwordInput.value = '';
        this.selectedFiles = [];
        this.updatePreview();
    }

    showUploadInterface() {
        this.isAuthenticated = true;
        this.passwordModal.classList.add('hidden');
        this.uploadContainer.style.display = 'block';
        this.logoutBtn.classList.remove('hidden');
    }

    handleFileSelect(e) {
        const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;

        if (!files || files.length === 0) return;

        // Filter for images only
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

        if (imageFiles.length === 0) {
            this.showFeedback('error', 'Please select valid image files.');
            return;
        }

        // Add to selected files
        this.selectedFiles = [...this.selectedFiles, ...imageFiles];
        this.updatePreview();
    }

    updatePreview() {
        if (this.selectedFiles.length === 0) {
            this.previewContainer.style.display = 'none';
            return;
        }

        this.previewContainer.style.display = 'block';
        this.imageCount.textContent = this.selectedFiles.length;
        this.previewGrid.innerHTML = '';

        this.selectedFiles.forEach((file, index) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';

                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = file.name;

                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-btn';
                removeBtn.textContent = '×';
                removeBtn.onclick = () => this.removeFile(index);

                previewItem.appendChild(img);
                previewItem.appendChild(removeBtn);
                this.previewGrid.appendChild(previewItem);
            };

            reader.readAsDataURL(file);
        });
    }

    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        this.updatePreview();
    }

    async uploadImages() {
        if (this.selectedFiles.length === 0) {
            this.showFeedback('error', 'Please select images to upload.');
            return;
        }

        // Show loading state
        this.uploadBtn.textContent = `Uploading ${this.selectedFiles.length} image(s)...`;
        this.uploadBtn.disabled = true;

        try {
            const uploadedImages = [];
            let successCount = 0;
            let errorCount = 0;

            for (const file of this.selectedFiles) {
                try {
                    // Generate unique filename
                    const timestamp = Date.now();
                    const randomStr = Math.random().toString(36).substring(7);
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${timestamp}-${randomStr}.${fileExt}`;

                    // Upload to Supabase Storage
                    const { data, error } = await supabase.storage
                        .from(STORAGE_BUCKET)
                        .upload(fileName, file, {
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (error) {
                        console.error('Upload error:', error);
                        errorCount++;
                        continue;
                    }

                    // Get public URL
                    const { data: urlData } = supabase.storage
                        .from(STORAGE_BUCKET)
                        .getPublicUrl(fileName);

                    uploadedImages.push({
                        name: file.name,
                        storagePath: fileName,
                        publicUrl: urlData.publicUrl,
                        uploadedAt: new Date().toISOString()
                    });

                    successCount++;
                } catch (err) {
                    console.error('Error uploading file:', err);
                    errorCount++;
                }
            }

            // Store metadata in localStorage (optional - could use Supabase table instead)
            const existingImages = JSON.parse(localStorage.getItem('diana-images-metadata') || '[]');
            const allImages = [...existingImages, ...uploadedImages];
            localStorage.setItem('diana-images-metadata', JSON.stringify(allImages));

            // Show success/error message
            if (successCount > 0 && errorCount === 0) {
                this.showFeedback('success', `Successfully uploaded ${successCount} image(s) to Supabase!`);
            } else if (successCount > 0 && errorCount > 0) {
                this.showFeedback('success', `Uploaded ${successCount} image(s). ${errorCount} failed.`);
            } else {
                this.showFeedback('error', 'Failed to upload images. Please try again.');
            }

            // Reset
            this.selectedFiles = [];
            this.fileInput.value = '';
            this.updatePreview();

        } catch (error) {
            console.error('Upload error:', error);
            this.showFeedback('error', 'There was an error uploading your images. Please try again.');
        } finally {
            this.uploadBtn.textContent = 'Upload All Images';
            this.uploadBtn.disabled = false;
        }
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
        new AdminUploader();
    });
} else {
    new AdminUploader();
}
