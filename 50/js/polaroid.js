import { supabase, STORAGE_BUCKET } from '../lib/supabase.js';

class PolaroidGallery {
    constructor() {
        this.container = document.getElementById('polaroid-container');
        if (!this.container) return;

        this.images = [];
        this.init();
    }

    async init() {
        await this.fetchImages();
        if (this.images.length > 0) {
            this.renderPolaroids();
        }
    }

    async fetchImages() {
        try {
            // List all files in the bucket
            const { data, error } = await supabase.storage
                .from(STORAGE_BUCKET)
                .list('', {
                    limit: 20,
                    offset: 0,
                    sortBy: { column: 'name', order: 'desc' }
                });

            if (error) {
                console.error('Error fetching images:', error);
                return;
            }

            // Filter for image files
            const imageFiles = data.filter(file =>
                file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
            );

            // Get public URLs for each image
            for (const file of imageFiles) {
                const { data: urlData } = supabase.storage
                    .from(STORAGE_BUCKET)
                    .getPublicUrl(file.name);

                if (urlData) {
                    this.images.push({
                        url: urlData.publicUrl,
                        name: file.name
                    });
                }
            }
        } catch (err) {
            console.error('Failed to fetch images from Supabase:', err);
        }
    }

    renderPolaroids() {
        // Limit to 8 images for the hero section to keep it clean
        const displayImages = this.images.slice(0, 8);

        displayImages.forEach((imgData, index) => {
            const polaroid = this.createPolaroid(imgData, index);
            this.container.appendChild(polaroid);

            // Staggered animation
            setTimeout(() => {
                polaroid.classList.add('show');
            }, index * 200 + 500);
        });
    }

    createPolaroid(imgData, index) {
        const div = document.createElement('div');
        div.className = 'polaroid';

        // Random positioning within quartiles to avoid overlap
        // We divide the screen into 4 areas and pick a spot in each
        const area = index % 4; // 0: top-left, 1: top-right, 2: bottom-left, 3: bottom-right
        let x, y;

        const padding = 100; // Keep away from edges
        const width = window.innerWidth;
        const height = window.innerHeight;

        switch (area) {
            case 0: // Top Left
                x = Math.random() * (width / 2 - padding) + 20;
                y = Math.random() * (height / 2 - padding) + 20;
                break;
            case 1: // Top Right
                x = Math.random() * (width / 2 - padding) + width / 2;
                y = Math.random() * (height / 2 - padding) + 20;
                break;
            case 2: // Bottom Left
                x = Math.random() * (width / 2 - padding) + 20;
                y = Math.random() * (height / 2 - padding) + height / 2 - 50;
                break;
            case 3: // Bottom Right
                x = Math.random() * (width / 2 - padding) + width / 2;
                y = Math.random() * (height / 2 - padding) + height / 2 - 50;
                break;
        }

        const rotation = (Math.random() - 0.5) * 30; // Random rotation between -15 and 15 degrees

        div.style.left = `${x}px`;
        div.style.top = `${y}px`;
        div.style.zIndex = Math.floor(Math.random() * 5) + 5;
        div.style.setProperty('--rotation', `${rotation}deg`);

        const img = document.createElement('img');
        img.src = imgData.url;
        img.alt = "Diana's Memory";

        const caption = document.createElement('div');
        caption.className = 'polaroid-caption';
        caption.textContent = "Birthday Memory";

        div.appendChild(img);
        div.appendChild(caption);

        return div;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new PolaroidGallery();
    });
} else {
    new PolaroidGallery();
}
