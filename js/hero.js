import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

class HeroScene {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('hero-canvas'),
            alpha: true,
            antialias: true
        });

        this.scrollY = 0;
        this.particles = null;

        this.init();
        this.createParticles();
        this.setupLights();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.camera.position.z = 5;

        // Set scene background - transition to cream fog
        this.scene.fog = new THREE.Fog(0xF2E6D0, 1, 15);
    }

    createParticles() {
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 2000;

        const positions = new Float32Array(particlesCount * 3);
        const colors = new Float32Array(particlesCount * 3);

        const colorPalette = [
            new THREE.Color(0x03A688), // Teal
            new THREE.Color(0x04BF8A), // Bright Teal
            new THREE.Color(0xF29829), // Orange
            new THREE.Color(0xF25C05), // Vibrant Orange
            new THREE.Color(0xF2E6D0)  // Cream
        ];

        for (let i = 0; i < particlesCount * 3; i += 3) {
            // Position
            positions[i] = (Math.random() - 0.5) * 20;
            positions[i + 1] = (Math.random() - 0.5) * 20;
            positions[i + 2] = (Math.random() - 0.5) * 20;

            // Color
            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i] = color.r;
            colors[i + 1] = color.g;
            colors[i + 2] = color.b;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.NormalBlending // Changed from Additive for light theme
        });

        this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particles);

        // Add geometric shapes
        this.createGeometry();
    }

    createGeometry() {
        // Torus
        const torusGeometry = new THREE.TorusGeometry(1.5, 0.4, 16, 100);
        const torusMaterial = new THREE.MeshStandardMaterial({
            color: 0x03A688,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        this.torus = new THREE.Mesh(torusGeometry, torusMaterial);
        this.torus.position.set(-3, 2, -2);
        this.scene.add(this.torus);

        // Sphere
        const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
        const sphereMaterial = new THREE.MeshStandardMaterial({
            color: 0xF29829,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.sphere.position.set(3, -2, -2);
        this.scene.add(this.sphere);
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x04BF8A, 2);
        pointLight1.position.set(5, 5, 5);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xF25C05, 2);
        pointLight2.position.set(-5, -5, 5);
        this.scene.add(pointLight2);
    }

    setupEventListeners() {
        window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY;
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Mouse movement
        window.addEventListener('mousemove', (event) => {
            const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

            this.camera.position.x = mouseX * 0.5;
            this.camera.position.y = mouseY * 0.5;
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.0005;

        // Rotate particles based on scroll
        if (this.particles) {
            this.particles.rotation.y = this.scrollY * 0.001;
            this.particles.rotation.x = time * 0.1;
        }

        // Rotate geometric shapes
        if (this.torus) {
            this.torus.rotation.x = time * 0.5;
            this.torus.rotation.y = time * 0.3;
            this.torus.position.y = 2 + Math.sin(time) * 0.5;
        }

        if (this.sphere) {
            this.sphere.rotation.x = time * 0.3;
            this.sphere.rotation.y = time * 0.5;
            this.sphere.position.y = -2 + Math.cos(time) * 0.5;
        }

        // Camera movement based on scroll
        this.camera.position.z = 5 - this.scrollY * 0.002;

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new HeroScene();
    });
} else {
    new HeroScene();
}
