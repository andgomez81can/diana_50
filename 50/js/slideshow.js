import { supabase, STORAGE_BUCKET } from '../lib/supabase.js';

class PhotoSlideshow {
    constructor() {
        this.wrapper = document.getElementById('slides-wrapper');
        this.indicators = document.getElementById('ss-indicators');
        this.prevBtn = document.getElementById('ss-prev');
        this.nextBtn = document.getElementById('ss-next');
        this.container = document.getElementById('slideshow-container');

        if (!this.wrapper) return;

        this.images = [];
        this.currentIndex = 0;
        this.autoplayInterval = null;
        this.isTransitioning = false;

        this.init();
    }

    async init() {
        this.wrapper.innerHTML = '<div class="slide-loading"><div class="slide-spinner"></div><p>Loading memories…</p></div>';

        await this.fetchImages();

        if (this.images.length > 0) {
            this.renderSlides();
            this.setupEventListeners();
            this.startAutoplay();
            this.updateSlides();
        } else {
            this.wrapper.innerHTML = '<p class="empty-state">No memories to display yet. Upload some photos in the admin section!</p>';
            if (this.prevBtn) this.prevBtn.style.display = 'none';
            if (this.nextBtn) this.nextBtn.style.display = 'none';
        }
    }

    async fetchImages() {
        try {
            const { data, error } = await supabase
                .storage
                .from(STORAGE_BUCKET)
                .list('', {
                    limit: 100,
                    offset: 0,
                    sortBy: { column: 'created_at', order: 'desc' }
                });

            if (error) throw error;

            const imageFiles = data.filter(file =>
                file.name !== '.emptyFolderPlaceholder' &&
                /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
            );

            for (const file of imageFiles) {
                const { data: urlData } = supabase
                    .storage
                    .from(STORAGE_BUCKET)
                    .getPublicUrl(file.name);

                if (urlData) {
                    this.images.push({
                        url: urlData.publicUrl,
                        name: file.name
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching slideshow images:', error);
        }
    }

    renderSlides() {
        this.wrapper.innerHTML = '';
        this.indicators.innerHTML = '';

        this.images.forEach((imgData, index) => {
            // Slide
            const slide = document.createElement('div');
            slide.className = 'slide' + (index === 0 ? ' active' : '');

            const img = document.createElement('img');
            img.src = imgData.url;
            img.alt = `Memory ${index + 1}`;
            img.loading = index === 0 ? 'eager' : 'lazy';
            img.onerror = () => { slide.style.display = 'none'; };

            slide.appendChild(img);
            this.wrapper.appendChild(slide);

            // Indicator dot
            const dot = document.createElement('div');
            dot.className = 'dot' + (index === 0 ? ' active' : '');
            dot.addEventListener('click', () => this.goToSlide(index));
            this.indicators.appendChild(dot);
        });
    }

    setupEventListeners() {
        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prevSlide());
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextSlide());

        // Pause on hover
        if (this.container) {
            this.container.addEventListener('mouseenter', () => this.stopAutoplay());
            this.container.addEventListener('mouseleave', () => this.startAutoplay());
        }

        // Swipe support
        let touchStartX = 0;
        if (this.container) {
            this.container.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            this.container.addEventListener('touchend', (e) => {
                const diff = touchStartX - e.changedTouches[0].screenX;
                if (Math.abs(diff) > 50) {
                    diff > 0 ? this.nextSlide() : this.prevSlide();
                }
            }, { passive: true });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
        });

        // Click slide to open lightbox
        this.wrapper.addEventListener('click', () => {
            if (this.images[this.currentIndex]) {
                this.showLightbox(this.images[this.currentIndex]);
            }
        });

        this.lightbox = this.createLightbox();
    }

    updateSlides() {
        const slides = this.wrapper.querySelectorAll('.slide');
        const dots = this.indicators.querySelectorAll('.dot');

        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === this.currentIndex);
            slide.classList.toggle('prev', i === (this.currentIndex - 1 + this.images.length) % this.images.length);
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === this.currentIndex);
        });

        // Update counter
        const counter = document.getElementById('ss-counter');
        if (counter) counter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
    }

    nextSlide() {
        if (this.isTransitioning) return;
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateSlides();
    }

    prevSlide() {
        if (this.isTransitioning) return;
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateSlides();
    }

    goToSlide(index) {
        if (this.isTransitioning || index === this.currentIndex) return;
        this.currentIndex = index;
        this.updateSlides();
    }

    startAutoplay() {
        this.stopAutoplay();
        this.autoplayInterval = setInterval(() => this.nextSlide(), 4000);
    }

    stopAutoplay() {
        if (this.autoplayInterval) clearInterval(this.autoplayInterval);
    }

    createLightbox() {
        const existing = document.getElementById('ss-lightbox');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'ss-lightbox';
        overlay.className = 'ss-lightbox';
        overlay.innerHTML = `
            <div class="ss-lightbox-inner">
                <span class="ss-lightbox-close">&times;</span>
                <img id="ss-lightbox-img" src="" alt="Memory">
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector('.ss-lightbox-close').addEventListener('click', () => this.closeLightbox());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) this.closeLightbox(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeLightbox(); });

        return overlay;
    }

    showLightbox(imgData) {
        document.getElementById('ss-lightbox-img').src = imgData.url;
        this.lightbox.classList.add('show');
        document.body.style.overflow = 'hidden';
        this.stopAutoplay();
    }

    closeLightbox() {
        this.lightbox.classList.remove('show');
        document.body.style.overflow = '';
        this.startAutoplay();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PhotoSlideshow();
});
