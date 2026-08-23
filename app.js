/**
 * NotebookLM Presentation Engine
 * Features:
 * - 3D Card Stack transition engine with GPU-accelerated motion blur
 * - iOS 120Hz Fluid spring physics & 3D Interactive Card Tilt
 * - Glassmorphic Pill Navigation with dynamic pill positioning
 * - Auto-play slideshow controls & Keyboard shortcuts
 */

class PresentationApp {
    constructor() {
        this.currentIndex = 0;
        this.slides = Array.from(document.querySelectorAll('.slide-card'));
        this.totalSlides = this.slides.length;
        this.navItems = Array.from(document.querySelectorAll('.nav-item'));
        this.navIndicator = document.getElementById('nav-indicator');
        this.counterEl = document.getElementById('slide-counter');
        
        this.autoPlayTimer = null;
        this.isPlaying = false;
        this.motionBlurTimeout = null;
        
        // Directional animation state
        this.prevIndex = 0;
        this.transitionDirection = 'next';
        this.animationTimeout = null;
        
        // Touch / Drag gesture states
        this.isDragging = false;
        this.startX = 0;
        this.dragDist = 0;
        
        this.init();
    }

    init() {
        this.updateCardStack();
        this.updateNavIndicator();
        this.bindEvents();
        this.init3DTilt();
    }

    bindEvents() {
        // Nav items click
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const targetIndex = parseInt(e.currentTarget.getAttribute('data-index'), 10);
                this.goToSlide(targetIndex);
            });
        });

        // Prev / Next buttons
        document.getElementById('btn-prev').addEventListener('click', () => this.prevSlide());
        document.getElementById('btn-next').addEventListener('click', () => this.nextSlide());

        // Next Up preview chip clicks
        document.querySelectorAll('.next-slide-preview').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const targetIndex = parseInt(btn.getAttribute('data-next-target'), 10);
                this.goToSlide(targetIndex);
            });
        });

        // Side peek card click navigation
        this.slides.forEach((card, index) => {
            card.addEventListener('click', () => {
                if (index !== this.currentIndex) {
                    this.goToSlide(index);
                }
            });
        });

        // Keyboard Navigation
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
                e.preventDefault();
                this.nextSlide();
            } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                e.preventDefault();
                this.prevSlide();
            } else if (e.key === 'Home') {
                e.preventDefault();
                this.goToSlide(0);
            } else if (e.key === 'End') {
                e.preventDefault();
                this.goToSlide(this.totalSlides - 1);
            } else if (e.key === 'f' || e.key === 'F') {
                this.toggleFullscreen();
            }
        });

        // Fullscreen button
        document.getElementById('btn-fullscreen').addEventListener('click', () => this.toggleFullscreen());

        // Autoplay button
        document.getElementById('btn-autoplay').addEventListener('click', () => this.toggleAutoplay());

        // Touch & Drag events
        const viewport = document.getElementById('card-viewport');

        viewport.addEventListener('mousedown', (e) => {
            if (e.target.closest('.control-btn') || e.target.closest('.nav-item')) return;
            this.onDragStart(e.clientX);
        });
        window.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.onDragMove(e.clientX);
            }
        });
        window.addEventListener('mouseup', () => this.onDragEnd());

        viewport.addEventListener('touchstart', (e) => this.onDragStart(e.touches[0].clientX), { passive: true });
        window.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                this.onDragMove(e.touches[0].clientX);
            }
        }, { passive: true });
        window.addEventListener('touchend', () => this.onDragEnd());

        // Window resize repositioning
        window.addEventListener('resize', () => {
            this.updateNavIndicator();
        });
    }

    init3DTilt() {
        const viewport = document.getElementById('card-viewport');
        viewport.addEventListener('mousemove', (e) => {
            const activeCard = this.slides[this.currentIndex];
            if (!activeCard) return;

            const rect = activeCard.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            const rotateX = (-y / rect.height) * 5; // Max 5deg tilt
            const rotateY = (x / rect.width) * 5;

            activeCard.style.setProperty('--tilt-x', `${rotateX}deg`);
            activeCard.style.setProperty('--tilt-y', `${rotateY}deg`);
        });

        viewport.addEventListener('mouseleave', () => {
            const activeCard = this.slides[this.currentIndex];
            if (activeCard) {
                activeCard.style.setProperty('--tilt-x', '0deg');
                activeCard.style.setProperty('--tilt-y', '0deg');
            }
        });
    }

    onDragStart(clientX) {
        this.isDragging = true;
        this.startX = clientX;
        this.dragDist = 0;
        const activeCard = this.slides[this.currentIndex];
        if (activeCard) {
            activeCard.style.transition = 'none';
        }
    }

    onDragMove(clientX) {
        if (!this.isDragging) return;
        this.dragDist = clientX - this.startX;

        const activeCard = this.slides[this.currentIndex];
        if (activeCard) {
            const rotY = (this.dragDist / window.innerWidth) * 25;
            activeCard.style.transform = `translate3d(calc(-50% + ${this.dragDist}px), -50%, 0) rotateY(${rotY}deg)`;
        }
    }

    onDragEnd() {
        if (!this.isDragging) return;
        this.isDragging = false;

        const activeCard = this.slides[this.currentIndex];
        if (activeCard) {
            activeCard.style.transition = '';
        }

        const threshold = 60; // minimum drag threshold
        if (this.dragDist < -threshold) {
            this.nextSlide(); // Drag Left -> Open Next Slide
        } else if (this.dragDist > threshold) {
            this.prevSlide(); // Drag Right -> Open Previous Slide
        } else {
            this.updateCardStack(); // Revert back to center
        }
        this.dragDist = 0;
    }

    goToSlide(index) {
        if (index < 0 || index >= this.totalSlides || index === this.currentIndex) return;

        const executeTransition = () => {
            this.transitionDirection = index > this.currentIndex ? 'next' : 'prev';
            this.prevIndex = this.currentIndex;
            this.currentIndex = index;
            
            this.updateCardStack();
            this.updateNavIndicator();
            this.updateCounter();

            // Dispatch slide change event for background nebula theme synchronization
            window.dispatchEvent(new CustomEvent('slidechange', { detail: { index } }));
        };

        // Hardware-accelerated Shared Element View Transition Match & Move
        if (document.startViewTransition) {
            const currentSlide = this.slides[this.currentIndex];
            const targetSlide = this.slides[index];

            if (currentSlide && targetSlide) {
                const currentPreview = currentSlide.querySelector('.next-slide-preview');
                const targetBadge = targetSlide.querySelector('.frosted-glass-badge');

                if (currentPreview) currentPreview.style.viewTransitionName = 'shared-match-tab';
                if (targetBadge) targetBadge.style.viewTransitionName = 'shared-match-tab';

                document.startViewTransition(() => {
                    executeTransition();
                }).finished.finally(() => {
                    if (currentPreview) currentPreview.style.viewTransitionName = '';
                    if (targetBadge) targetBadge.style.viewTransitionName = '';
                });
                return;
            }
        }

        executeTransition();
    }

    nextSlide() {
        if (this.currentIndex < this.totalSlides - 1) {
            this.goToSlide(this.currentIndex + 1);
        } else {
            this.goToSlide(0); // Loop to start
        }
    }

    prevSlide() {
        if (this.currentIndex > 0) {
            this.goToSlide(this.currentIndex - 1);
        } else {
            this.goToSlide(this.totalSlides - 1); // Loop to end
        }
    }

    updateCardStack() {
        if (this.animationTimeout) {
            clearTimeout(this.animationTimeout);
        }

        this.slides.forEach((slide, index) => {
            // Reset tilt variables
            slide.style.setProperty('--tilt-x', '0deg');
            slide.style.setProperty('--tilt-y', '0deg');
            slide.style.transform = '';

            // Clear existing positional & animation classes
            slide.classList.remove(
                'active', 'prev', 'next', 'far-prev', 'far-next', 
                'hidden', 'hidden-left', 'hidden-right',
                'slide-in-next', 'slide-in-prev', 'slide-out-next', 'slide-out-prev', 'content-animating'
            );

            const diff = index - this.currentIndex;

            if (diff === 0) {
                slide.classList.add('active');
                if (this.transitionDirection === 'next') {
                    slide.classList.add('slide-in-next');
                } else {
                    slide.classList.add('slide-in-prev');
                }

                // Force reflow to reliably restart content animations on re-visiting slides
                void slide.offsetWidth;
                slide.classList.add('content-animating');
            } else if (diff === -1) {
                slide.classList.add('prev');
                if (index === this.prevIndex && this.transitionDirection === 'next') {
                    slide.classList.add('slide-out-next');
                }
            } else if (diff === 1) {
                slide.classList.add('next');
                if (index === this.prevIndex && this.transitionDirection === 'prev') {
                    slide.classList.add('slide-out-prev');
                }
            } else if (diff === -2) {
                slide.classList.add('far-prev');
            } else if (diff === 2) {
                slide.classList.add('far-next');
            } else if (diff < -2) {
                slide.classList.add('hidden-left');
            } else {
                slide.classList.add('hidden-right');
            }
        });

        // Remove temporary animation classes after spring transition finishes
        this.animationTimeout = setTimeout(() => {
            this.slides.forEach(slide => {
                slide.classList.remove('slide-in-next', 'slide-in-prev', 'slide-out-next', 'slide-out-prev');
            });
        }, 850);
    }

    updateNavIndicator() {
        const activeNav = this.navItems[this.currentIndex];
        if (!activeNav || !this.navIndicator) return;

        this.navItems.forEach(item => item.classList.remove('active'));
        activeNav.classList.add('active');

        // Scroll pill into view smoothly if navigation overflows on smaller screens
        activeNav.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

        const navRect = document.getElementById('glass-nav').getBoundingClientRect();
        const activeRect = activeNav.getBoundingClientRect();

        const offsetLeft = activeRect.left - navRect.left + document.getElementById('glass-nav').scrollLeft;
        const width = activeRect.width;

        // Apply dynamic Match & Move elastic stretch animations
        this.navIndicator.classList.remove('matching-move-right', 'matching-move-left');
        void this.navIndicator.offsetWidth; // force reflow

        if (this.currentIndex > this.prevIndex) {
            this.navIndicator.classList.add('matching-move-right');
        } else if (this.currentIndex < this.prevIndex) {
            this.navIndicator.classList.add('matching-move-left');
        }

        this.navIndicator.style.transform = `translateX(${offsetLeft}px)`;
        this.navIndicator.style.width = `${width}px`;

        setTimeout(() => {
            this.navIndicator.classList.remove('matching-move-right', 'matching-move-left');
        }, 650);
    }

    updateCounter() {
        const currentStr = String(this.currentIndex + 1).padStart(2, '0');
        const totalStr = String(this.totalSlides).padStart(2, '0');
        if (this.counterEl) {
            this.counterEl.textContent = `${currentStr} / ${totalStr}`;
        }
    }

    toggleAutoplay() {
        const btn = document.getElementById('btn-autoplay');
        if (this.isPlaying) {
            clearInterval(this.autoPlayTimer);
            this.isPlaying = false;
            btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> Play`;
        } else {
            this.isPlaying = true;
            this.nextSlide();
            this.autoPlayTimer = setInterval(() => this.nextSlide(), 4500);
            btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause`;
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.presentationApp = new PresentationApp();
});
