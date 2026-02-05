class AdminUploader {
    constructor() {
        this.uploadZone = document.getElementById('upload-zone');
        this.fileInput = document.getElementById('file-input');
        this.previewContainer = document.getElementById('preview-container');
        this.previewGrid = document.getElementById('preview-grid');
        this.imageCount = document.getElementById('image-count');
        this.uploadBtn = document.getElementById('upload-btn');
        this.feedback = document.getElementById('upload-feedback');

        this.selectedFiles = [];

        this.setupEventListeners();
    }

    setupEventListeners() {
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
            // For now, store in localStorage (can be replaced with Supabase storage)
            const uploadedImages = [];

            for (const file of this.selectedFiles) {
                const reader = new FileReader();
                const imageData = await new Promise((resolve) => {
                    reader.onload = (e) => resolve({
                        name: file.name,
                        data: e.target.result,
                        size: file.size,
                        type: file.type,
                        uploadedAt: new Date().toISOString()
                    });
                    reader.readAsDataURL(file);
                });

                uploadedImages.push(imageData);
            }

            // Save to localStorage
            const existingImages = JSON.parse(localStorage.getItem('diana-images') || '[]');
            const allImages = [...existingImages, ...uploadedImages];
            localStorage.setItem('diana-images', JSON.stringify(allImages));

            // Show success
            this.showFeedback('success', `Successfully uploaded ${this.selectedFiles.length} image(s)!`);

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
