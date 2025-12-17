/**
 * Tarjeta Digital para Alonso de Sol
 * JavaScript para interactividad
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const musicBtn = document.getElementById('musicBtn');
    const musicWaves = document.getElementById('musicWaves');
    const backgroundMusic = document.getElementById('backgroundMusic');
    const lightbox = document.getElementById('lightbox');
    const lightboxContent = document.getElementById('lightboxContent');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const gallery = document.getElementById('gallery');

    let isPlaying = false;
    let currentMediaIndex = 0;
    let mediaItems = [];

    // ========================================
    // CONFIGURACIÓN DE MEDIOS
    // Agrega aquí tus archivos multimedia
    // ========================================
    const mediaConfig = {
        images: [
            // Agrega las rutas de tus imágenes aquí
            // Ejemplo: 'assets/images/foto1.jpg',
            // 'assets/images/foto2.jpg',
        ],
        videos: [
            // Agrega las rutas de tus videos aquí
            // Ejemplo: 'assets/videos/video1.mp4',
        ]
    };

    // ========================================
    // INICIALIZACIÓN DE GALERÍA
    // ========================================
    function initGallery() {
        // Combinar imágenes y videos
        mediaItems = [
            ...mediaConfig.images.map(src => ({ type: 'image', src })),
            ...mediaConfig.videos.map(src => ({ type: 'video', src }))
        ];

        // Si hay archivos configurados, actualizar la galería
        if (mediaItems.length > 0) {
            gallery.innerHTML = '';
            mediaItems.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = 'gallery-item';
                div.dataset.type = item.type;
                div.dataset.index = index;

                if (item.type === 'image') {
                    const img = document.createElement('img');
                    img.src = item.src;
                    img.alt = `Foto ${index + 1}`;
                    img.loading = 'lazy';
                    div.appendChild(img);
                } else {
                    const video = document.createElement('video');
                    video.src = item.src;
                    video.muted = true;
                    video.preload = 'metadata';
                    div.appendChild(video);
                }

                div.addEventListener('click', () => openLightbox(index));
                gallery.appendChild(div);
            });
        } else {
            // Mantener placeholders y hacerlos interactivos
            const placeholders = gallery.querySelectorAll('.gallery-item');
            placeholders.forEach((item, index) => {
                item.dataset.index = index;
                item.addEventListener('click', () => {
                    showNotification('📸 Agrega tus fotos en assets/images/');
                });
            });
        }
    }

    // ========================================
    // REPRODUCTOR DE MÚSICA
    // ========================================
    function toggleMusic() {
        if (isPlaying) {
            backgroundMusic.pause();
            musicWaves.classList.remove('playing');
            musicBtn.querySelector('.play').style.display = 'inline';
            musicBtn.querySelector('.pause').style.display = 'none';
        } else {
            backgroundMusic.play().catch(() => {
                showNotification('🎵 Agrega tu música en assets/audio/musica.mp3');
            });
            musicWaves.classList.add('playing');
            musicBtn.querySelector('.play').style.display = 'none';
            musicBtn.querySelector('.pause').style.display = 'inline';
        }
        isPlaying = !isPlaying;
    }

    musicBtn.addEventListener('click', toggleMusic);

    // Cuando la música termina (aunque está en loop)
    backgroundMusic.addEventListener('ended', function() {
        musicWaves.classList.remove('playing');
        musicBtn.querySelector('.play').style.display = 'inline';
        musicBtn.querySelector('.pause').style.display = 'none';
        isPlaying = false;
    });

    // ========================================
    // LIGHTBOX
    // ========================================
    function openLightbox(index) {
        if (mediaItems.length === 0) return;

        currentMediaIndex = index;
        updateLightboxContent();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';

        // Pausar video si está reproduciendo
        const video = lightboxContent.querySelector('video');
        if (video) video.pause();
    }

    function updateLightboxContent() {
        const item = mediaItems[currentMediaIndex];
        lightboxContent.innerHTML = '';

        if (item.type === 'image') {
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = `Foto ${currentMediaIndex + 1}`;
            lightboxContent.appendChild(img);
        } else {
            const video = document.createElement('video');
            video.src = item.src;
            video.controls = true;
            video.autoplay = true;
            lightboxContent.appendChild(video);
        }
    }

    function navigateLightbox(direction) {
        if (mediaItems.length === 0) return;

        // Pausar video actual si existe
        const video = lightboxContent.querySelector('video');
        if (video) video.pause();

        currentMediaIndex += direction;

        if (currentMediaIndex < 0) {
            currentMediaIndex = mediaItems.length - 1;
        } else if (currentMediaIndex >= mediaItems.length) {
            currentMediaIndex = 0;
        }

        updateLightboxContent();
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
    lightboxNext.addEventListener('click', () => navigateLightbox(1));

    // Cerrar con Escape o click fuera
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // ========================================
    // NOTIFICACIONES
    // ========================================
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 255, 255, 0.95);
            padding: 15px 25px;
            border-radius: 50px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            z-index: 3000;
            font-family: 'Poppins', sans-serif;
            font-size: 0.9rem;
            color: #2D3436;
            animation: slideDown 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Agregar animaciones de notificación
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes slideUp {
            from { opacity: 1; transform: translateX(-50%) translateY(0); }
            to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
    `;
    document.head.appendChild(style);

    // ========================================
    // EFECTOS ADICIONALES
    // ========================================

    // Efecto parallax suave en las burbujas al hacer scroll
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const bubbles = document.querySelectorAll('.bubble');
                bubbles.forEach((bubble, index) => {
                    const speed = 0.5 + (index * 0.1);
                    bubble.style.transform = `translateY(${scrolled * speed * -0.1}px)`;
                });
                ticking = false;
            });
            ticking = true;
        }
    });

    // Efecto de hover en tarjetas de mensaje
    const messageBubbles = document.querySelectorAll('.message-bubble');
    messageBubbles.forEach(bubble => {
        bubble.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(0) scale(1.02)';
        });
    });

    // ========================================
    // EASTER EGG - Konami Code
    // ========================================
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activateEasterEgg();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });

    function activateEasterEgg() {
        document.body.style.animation = 'rainbow 2s linear infinite';
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        showNotification('🎉 ¡Easter Egg activado! El dúo nerd lo encontró ✨');

        setTimeout(() => {
            document.body.style.animation = '';
        }, 10000);
    }

    // ========================================
    // INICIALIZACIÓN
    // ========================================
    initGallery();

    console.log('%c🌟 Tarjeta para Alonso de Sol 🌟',
        'font-size: 20px; color: #9B5DE5; font-weight: bold;');
    console.log('%cHecha con mucho cariño ✨',
        'font-size: 14px; color: #FF6B9D;');
});
