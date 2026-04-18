import { supabase, STORAGE_BUCKET } from '../lib/supabase.js';

class PublicUploader {
    constructor() {
        this.selectedFiles = [];
        this.uploaderName = '';

        this.zone       = document.getElementById('public-upload-zone');
        this.preview    = document.getElementById('puz-preview');
        this.previewGrid = document.getElementById('puz-preview-grid');
        this.fileCount  = document.getElementById('puz-file-count');
        this.uploadBtn  = document.getElementById('puz-upload-btn');
        this.uploadLabel = document.getElementById('puz-upload-label');
        this.progressWrap = document.getElementById('puz-progress-wrap');
        this.progressFill = document.getElementById('puz-progress-fill');
        this.progressText = document.getElementById('puz-progress-text');
        this.successEl  = document.getElementById('puz-success');
        this.errorEl    = document.getElementById('puz-error');
        this.nameInput  = document.getElementById('uploader-name');
        this.clearBtn   = document.getElementById('puz-clear-btn');
        this.uploadMore = document.getElementById('puz-upload-more');

        this.cameraInput = document.getElementById('input-camera');
        this.filesInput  = document.getElementById('input-files');

        this.init();
    }

    init() {
        // File inputs
        this.cameraInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
        this.filesInput.addEventListener('change',  (e) => this.handleFiles(e.target.files));

        // Drag & drop on zone
        this.zone.addEventListener('dragover',  (e) => { e.preventDefault(); this.zone.classList.add('drag-over'); });
        this.zone.addEventListener('dragleave', ()  => this.zone.classList.remove('drag-over'));
        this.zone.addEventListener('drop',      (e) => {
            e.preventDefault();
            this.zone.classList.remove('drag-over');
            this.handleFiles(e.dataTransfer.files);
        });

        // Tap anywhere on zone (except buttons) opens file picker
        this.zone.addEventListener('click', (e) => {
            if (!e.target.closest('.puz-btn')) {
                this.filesInput.click();
            }
        });

        // Buttons
        this.uploadBtn.addEventListener('click', () => this.upload());
        this.clearBtn.addEventListener('click',  () => this.clearAll());
        this.uploadMore.addEventListener('click', () => this.reset());
    }

    handleFiles(fileList) {
        const valid = Array.from(fileList).filter(f =>
            f.type.startsWith('image/') || f.type.startsWith('video/')
        );
        if (valid.length === 0) return;

        this.selectedFiles = [...this.selectedFiles, ...valid];
        this.renderPreviews();
        this.zone.style.display = 'none';
        this.preview.style.display = 'block';
        this.uploadBtn.style.display = 'block';
        this.errorEl.style.display = 'none';
    }

    renderPreviews() {
        this.previewGrid.innerHTML = '';
        this.fileCount.textContent = `${this.selectedFiles.length} file${this.selectedFiles.length !== 1 ? 's' : ''} selected`;

        this.selectedFiles.forEach((file, i) => {
            const item = document.createElement('div');
            item.className = 'puz-preview-item';

            if (file.type.startsWith('video/')) {
                const video = document.createElement('video');
                video.src = URL.createObjectURL(file);
                video.muted = true;
                video.playsInline = true;
                video.preload = 'metadata';
                item.appendChild(video);
                const badge = document.createElement('span');
                badge.className = 'puz-media-badge';
                badge.textContent = '🎥';
                item.appendChild(badge);
            } else {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.alt = file.name;
                item.appendChild(img);
            }

            const removeBtn = document.createElement('button');
            removeBtn.className = 'puz-remove-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.onclick = (e) => { e.stopPropagation(); this.removeFile(i); };
            item.appendChild(removeBtn);

            const sizeBadge = document.createElement('span');
            sizeBadge.className = 'puz-size-badge';
            sizeBadge.textContent = this.formatSize(file.size);
            item.appendChild(sizeBadge);

            this.previewGrid.appendChild(item);
        });
    }

    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        if (this.selectedFiles.length === 0) {
            this.clearAll();
        } else {
            this.renderPreviews();
        }
    }

    clearAll() {
        this.selectedFiles = [];
        this.previewGrid.innerHTML = '';
        this.preview.style.display = 'none';
        this.uploadBtn.style.display = 'none';
        this.zone.style.display = 'flex';
        this.cameraInput.value = '';
        this.filesInput.value = '';
        this.errorEl.style.display = 'none';
    }

    async upload() {
        if (this.selectedFiles.length === 0) return;

        this.uploaderName = (this.nameInput ? this.nameInput.value.trim() : '') || 'Guest';

        // Switch to progress UI
        this.uploadBtn.style.display = 'none';
        this.preview.style.display = 'none';
        this.progressWrap.style.display = 'block';
        this.errorEl.style.display = 'none';

        const total = this.selectedFiles.length;
        let done = 0;
        let failed = 0;

        for (const file of this.selectedFiles) {
            try {
                const ext = file.name.split('.').pop().toLowerCase();
                const ts = Date.now();
                const rand = Math.random().toString(36).substring(2, 7);
                const safeName = this.uploaderName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
                const fileName = `${ts}-${safeName}-${rand}.${ext}`;

                const { error } = await supabase.storage
                    .from(STORAGE_BUCKET)
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: false,
                        contentType: file.type
                    });

                if (error) {
                    console.error('Upload error:', error);
                    failed++;
                } else {
                    done++;
                }
            } catch (err) {
                console.error('Upload exception:', err);
                failed++;
            }

            // Update progress
            const pct = Math.round(((done + failed) / total) * 100);
            this.progressFill.style.width = pct + '%';
            this.progressText.textContent = `Uploading ${done + failed} of ${total}…`;
        }

        this.progressWrap.style.display = 'none';

        if (done > 0) {
            this.successEl.style.display = 'block';
        } else {
            this.showError(`Upload failed. Please make sure you're connected and try again.<br><small>If this keeps happening, contact Andres.</small>`);
            this.uploadBtn.style.display = 'block';
            this.preview.style.display = 'block';
        }
    }

    reset() {
        this.selectedFiles = [];
        this.successEl.style.display = 'none';
        this.previewGrid.innerHTML = '';
        this.preview.style.display = 'none';
        this.uploadBtn.style.display = 'none';
        this.zone.style.display = 'flex';
        this.cameraInput.value = '';
        this.filesInput.value = '';
    }

    showError(msg) {
        this.errorEl.innerHTML = msg;
        this.errorEl.style.display = 'block';
    }

    formatSize(bytes) {
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PublicUploader();
});
