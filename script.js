document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. CANVASES AND AMBIENT BACKGROUNDS
    // ==========================================
    const spaceCanvas = document.getElementById('universe-bg');
    const spaceCtx = spaceCanvas.getContext('2d');
    
    let stars = [];
    const starCount = window.innerWidth < 768 ? 40 : 90;

    function resizeSpaceCanvas() {
        spaceCanvas.width = window.innerWidth;
        spaceCanvas.height = window.innerHeight;
    }
    
    function generateStars() {
        stars = [];
        for(let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * spaceCanvas.width,
                y: Math.random() * spaceCanvas.height,
                radius: Math.random() * 1.5,
                alpha: Math.random(),
                velocity: Math.random() * 0.02 + 0.005
            });
        }
    }

    function animateSpace() {
        spaceCtx.clearRect(0, 0, spaceCanvas.width, spaceCanvas.height);
        spaceCtx.fillStyle = '#0B1220';
        spaceCtx.fillRect(0, 0, spaceCanvas.width, spaceCanvas.height);

        stars.forEach(star => {
            star.alpha += star.velocity;
            if (star.alpha <= 0 || star.alpha >= 1) {
                star.velocity = -star.velocity;
            }
            spaceCtx.beginPath();
            spaceCtx.arc(star.x, star.y, star.radius, 0, Math.allOuter || Math.PI * 2);
            spaceCtx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, star.alpha)})`;
            spaceCtx.fill();
        });
        requestAnimationFrame(animateSpace);
    }

    window.addEventListener('resize', () => {
        resizeSpaceCanvas();
        generateStars();
    });

    resizeSpaceCanvas();
    generateStars();
    animateSpace();

    // ==========================================
    // 2. SMOOTH SCROLL ACTION
    // ==========================================
    const exploreBtn = document.getElementById('explore-btn');
    const mapSection = document.getElementById('universe-map');

    exploreBtn.addEventListener('click', () => {
        mapSection.scrollIntoView({ behavior: 'smooth' });
    });

    // ==========================================
    // 3. MODAL SYSTEM CONTROLS
    // ==========================================
    const modalWrapper = document.getElementById('modal-wrapper');
    const backdropClose = document.querySelector('.modal-backdrop-close');
    const nodeButtons = document.querySelectorAll('.node-item');
    const allModals = document.querySelectorAll('.custom-modal');
    const closeButtons = document.querySelectorAll('.modal-close');

    function openModal(modalId) {
        const targetModal = document.getElementById(modalId);
        if (!targetModal) return;

        document.body.style.overflow = 'hidden'; // Stop background scrolling
        modalWrapper.classList.add('active');
        targetModal.style.display = 'block';
        setTimeout(() => {
            targetModal.classList.add('active');
        }, 10);
    }

    function closeActiveModals() {
        document.body.style.overflow = '';
        allModals.forEach(modal => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        });
        setTimeout(() => {
            modalWrapper.classList.remove('active');
        }, 300);
    }

    nodeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalTarget = btn.getAttribute('data-modal');
            openModal(modalTarget);
        });
    });

    closeButtons.forEach(btn => btn.addEventListener('click', closeActiveModals));
    backdropClose.addEventListener('click', closeActiveModals);

    // Escape Key Bindings for Accessibility
    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape') {
            closeActiveModals();
            closeBossMode();
        }
    });

    // ==========================================
    // 4. MOBILE FLIP CARDS INTERACTION TRIGGER
    // ==========================================
    const flipCards = document.querySelectorAll('.flip-card');
    flipCards.forEach(card => {
        card.addEventListener('click', () => {
            // Toggles state dynamically on mobile device viewports
            card.classList.toggle('active');
        });
    });

    // ==========================================
    // 5. ANIMATED STAT PROGRESS FILL RUNNER
    // ==========================================
    const statsSection = document.getElementById('dad-stats');
    const progressFills = document.querySelectorAll('.progress-fill');

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                progressFills.forEach(fill => {
                    const targetWidth = fill.style.getPropertyValue('--target-width');
                    fill.style.width = targetWidth;
                });
                statsObserver.unobserve(statsSection);
            }
        });
    }, { threshold: 0.2 });

    statsObserver.observe(statsSection);

    // ==========================================
    // 6. EASTER EGG (BOSS MODE + CONFETTI)
    // ==========================================
    const easterEggBtn = document.getElementById('easter-egg-btn');
    const bossOverlay = document.getElementById('boss-mode-overlay');
    const bossCloseBtn = document.getElementById('boss-close-btn');
    const confettiCanvas = document.getElementById('confetti-canvas');
    const confettiCtx = confettiCanvas.getContext('2d');

    let confettiParticles = [];
    let confettiAnimationId = null;
    let isBossModeActive = false;

    function resizeConfettiCanvas() {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }

    class ConfettiParticle {
        constructor() {
            this.x = Math.random() * confettiCanvas.width;
            this.y = Math.random() * -confettiCanvas.height - 20;
            this.size = Math.random() * 8 + 6;
            this.color = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#EC4899'][Math.floor(Math.random() * 5)];
            this.speedX = Math.random() * 4 - 2;
            this.speedY = Math.random() * 5 + 4;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 4 - 2;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;
            if (this.y > confettiCanvas.height) {
                this.y = -20;
                this.x = Math.random() * confettiCanvas.width;
            }
        }
        draw() {
            confettiCtx.save();
            confettiCtx.translate(this.x, this.y);
            confettiCtx.rotate(this.rotation * Math.PI / 180);
            confettiCtx.fillStyle = this.color;
            confettiCtx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
            confettiCtx.restore();
        }
    }

    function startConfetti() {
        resizeConfettiCanvas();
        confettiParticles = [];
        for (let i = 0; i < 120; i++) {
            confettiParticles.push(new ConfettiParticle());
        }
        
        function loop() {
            confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            confettiParticles.forEach(p => {
                p.update();
                p.draw();
            });
            confettiAnimationId = requestAnimationFrame(loop);
        }
        loop();
    }

    function openBossMode() {
        isBossModeActive = true;
        bossOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        startConfetti();
    }

    function closeBossMode() {
        if(!isBossModeActive) return;
        isBossModeActive = false;
        bossOverlay.style.display = 'none';
        document.body.style.overflow = '';
        cancelAnimationFrame(confettiAnimationId);
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }

    easterEggBtn.addEventListener('click', openBossMode);
    bossCloseBtn.addEventListener('click', closeBossMode);
    window.addEventListener('resize', () => {
        if (isBossModeActive) resizeConfettiCanvas();
    });
});
