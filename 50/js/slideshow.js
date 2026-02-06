import { supabase, STORAGE_BUCKET } from './lib/supabase.js';

class PhotoSlideshow {
    constructor() {
        this.wrapper = document.getElementById('slides-wrapper');
        this.indicators = document.getElementById('ss-indicators');
        this.prevBtn = document.getElementById('ss-prev');
        this.nextBtn = document.getElementById('ss-next');

        if (!this.wrapper) return;

        this.images = [];
        this.currentIndex = 0;
        this.autoplayInterval = null;

        this.init();
    }

    async init() {
        await this.fetchImages();
        if (this.images.length > 0) {
            this.renderSlides();
            this.setupEventListeners();
            this.startAutoplay();
            this.updateSlides();
        } else {
            this.wrapper.innerHTML = '<p class="empty-state">No memories to display yet. Upload some photos in the admin section!</p>';
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

            this.images = data.filter(file =>
                file.name !== '.emptyFolderPlaceholder' &&
                /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
            ).map(file => {
                const { data: { publicUrl } } = supabase
                    .storage
                    .from(STORAGE_BUCKET)
                    .getPublicUrl(file.name);
                return publicUrl;
            });
        } catch (error) {
            console.error('Error fetching slideshow images:', error);
        }
    }

    renderSlides() {
        this.wrapper.innerHTML = '';
        this.indicators.innerHTML = '';

        this.images.forEach((url, index) => {
            // Create slide
            const slide = document.createElement('div');
            slide.className = 'slide';
            if (index === 0) slide.classList.add('active');

            const img = document.createElement('img');
            img.src = url;
            img.alt = `Memory ${index + 1}`;
            img.loading = 'lazy';

            slide.appendChild(img);
            this.wrapper.appendChild(slide);

            // Create indicator
            const dot = document.createElement('div');
            dot.className = 'dot';
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(index));
            this.indicators.appendChild(dot);
        });
    }

    setupEventListeners() {
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());

        // Pause on hover
        const container = document.getElementById('slideshow-container');
        container.addEventListener('mouseenter', () => this.stopAutoplay());
        container.addEventListener('mouseleave', () => this.startAutoplay());
    }

    updateSlides() {
        const slides = this.wrapper.querySelectorAll('.slide');
        const dots = this.indicators.querySelectorAll('.dot');

        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentIndex);
        });

        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }

    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateSlides();
    }

    prevSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateSlides();
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.updateSlides();
    }

    startAutoplay() {
        this.stopAutoplay();
        this.autoplayInterval = setInterval(() => this.nextSlide(), 5000);
    }

    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
        }
    }
}

// Initialize when library is ready
document.addEventListener('DOMContentLoaded', () => {
    new PhotoSlideshow();
});
