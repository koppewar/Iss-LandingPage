document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById('sparkles-canvas');
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const numSparkles = 100;
    const sparkles = [];

    class Sparkle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 0.5;
            this.opacity = Math.random();
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fill();
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > width) this.speedX *= -1;
            if (this.y < 0 || this.y > height) this.speedY *= -1;
        }
    }

    function init() {
        for (let i = 0; i < numSparkles; i++) {
            sparkles.push(new Sparkle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        sparkles.forEach(sparkle => {
            sparkle.update();
            sparkle.draw();
        });
    }

    init();
    gsap.ticker.add(animate);

    // Animation for title and quote
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.to(".title", { opacity: 1, y: 0, duration: 1.2 })
      .to(".quote", { opacity: 1, y: 0, duration: 1.2 }, "-=0.8")
      .to(".navbar", { y: 0, duration: 1.2, ease: "bounce.out" }, "-=0.7");

    // Hamburger menu toggle
    const toggleButton = document.querySelector('.toggle-button');
    const navbarLinks = document.querySelector('.navbar-links');

    toggleButton.addEventListener('click', (e) => {
        e.preventDefault();
        navbarLinks.classList.toggle('active');
        toggleButton.classList.toggle('active');
    });

    // Register ScrollTrigger Plugin
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // --- SMOOTH SCROLL FOR NAV LINKS ---
    const navLinks = document.querySelectorAll('.navbar-links a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute("href");

            // If mobile menu is open, close it
            if (navbarLinks.classList.contains('active')) {
                navbarLinks.classList.remove('active');
                toggleButton.classList.remove('active');
            }

            // Scroll to the target section
            if (document.querySelector(targetId)) {
                gsap.to(window, {
                    duration: 1.5,
                    ease: 'power2.inOut',
                    scrollTo: {
                        y: targetId,
                        offsetY: 100 // Add some space from the top
                    }
                });
            }
        });
    });

    // --- SERVICES SECTION ANIMATIONS ---

    // 1. Title "Waking Up" Animation
    gsap.to(".services-title", {
        scrollTrigger: {
            trigger: ".services-section",
            start: "top 80%", // When the top of the trigger hits 80% down from the top of the viewport
            toggleActions: "play none none none"
        },
        duration: 1.5,
        rotateX: 0,
        opacity: 1,
        ease: "power3.out"
    });

    // 2. Staggered Card Animation
    gsap.to(".service-card", {
        scrollTrigger: {
            trigger: ".services-container",
            start: "top 80%",
            toggleActions: "play none none none"
        },
        duration: 1,
        translateY: 0,
        opacity: 1,
        stagger: 0.2,
        ease: "power2.out"
    });
});
