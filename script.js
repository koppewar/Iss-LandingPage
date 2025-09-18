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

    // --- PROCESS SECTION ANIMATIONS ---
    const processTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".process-section",
            start: "top 70%",
            toggleActions: "play none none none",
        }
    });

    // 1. Process Title "Waking Up"
    processTl.to(".process-title", {
        duration: 1.5,
        rotateX: 0,
        opacity: 1,
        ease: "power3.out"
    });

    // 2. Underline Drawing
    processTl.to(".underline", {
        duration: 1,
        scaleX: 1,
        ease: "power2.out"
    }, "-=1");


    // Using matchMedia for responsive animations
    ScrollTrigger.matchMedia({
        // Mobile animations (no changes from previous version)
        "(max-width: 768px)": function() {
            const mobileContainer = document.querySelector(".process-timeline-container.mobile-only");
            const mobileCards = gsap.utils.toArray(".process-card-mobile");
            if(mobileCards.length === 0) return;

            const underlineElement = document.querySelector(".underline");
            const underlineRect = underlineElement.getBoundingClientRect();
            // We want to start thread from below the underline, relative to mobileContainer's top
            const processSection = document.querySelector(".process-section");
            const processSectionRect = processSection.getBoundingClientRect();
            
            // Calculate starting Y for the thread relative to mobileContainer
            const threadStartMobileY = underlineRect.bottom - processSectionRect.top + 30; // +30px to account for initial margin

            const cardHeight = mobileCards[0].offsetHeight;
            const cardGap = 40; // gap between cards
            let currentY = threadStartMobileY;

            // Set container height to fit all cards
            mobileContainer.style.height = `${(cardHeight + cardGap) * mobileCards.length + currentY}px`;
            
            const mobileTl = gsap.timeline({
                scrollTrigger: {
                    trigger: mobileContainer, // Trigger on the mobile container
                    start: "top top", // Pin the section and scrub as we scroll
                    end: "bottom bottom",
                    scrub: 1, // Smoothly scrub through the animation on scroll
                }
            });

            const threadPath = document.getElementById("thread-path");
            
            // Make sure the desktop thread is hidden for mobile
            gsap.set(document.querySelector(".thread-svg.desktop-only"), {display: "none"});


            mobileCards.forEach((card, index) => {
                // Set card position
                card.style.left = "50%"; // Center it
                card.style.transform = "translateX(-50%) scale(0)"; // Initial state for animation
                card.style.top = `${currentY}px`; // Position vertically
                
                // Animate thread to this card's position (using a subtle curve for visual flow)
                // Note: The thread-svg for mobile is not the one with id="thread-path"
                // It seems the mobile version doesn't use the SVG thread, but rather
                // relies on the visual spacing of cards.
                // If a thread is desired for mobile, dedicated SVG would be needed.
                // As per instructions, not disturbing mobile version.
                
                // Animate card "birthing"
                mobileTl.to(card, {
                    opacity: 1,
                    scale: 1,
                    transformOrigin: "center top", // Origin for scaling from top
                    ease: "back.out(1.7)" // Bouncy effect
                }, `card${index}`);

                currentY += cardHeight + cardGap; // Move to the next card position
            });
            // Ensure the mobile container has enough height for ScrollTrigger to work
            gsap.set(mobileContainer, {minHeight: "200vh"}); // Or calculate based on card positions
        },

        // Desktop animations (Enhanced for precision and symmetrical sway)
        "(min-width: 769px)": function() {
            const processSection = document.querySelector(".process-section");
            const underline = document.querySelector(".underline");
            const threadSVG = document.querySelector(".thread-svg.desktop-only");
            const hoverBoard = document.querySelector(".hover-board.desktop-only");
            const threadPath = document.getElementById("thread-path"); // Path inside the threadSVG
            const desktopCards = gsap.utils.toArray(".process-card-desktop");

            const processSectionRect = processSection.getBoundingClientRect();
            const underlineRect = underline.getBoundingClientRect();

            // Calculate the top position for the thread-svg to start exactly at the bottom center of the underline
            // (underline.bottom - processSection.top) gives the underline's bottom edge relative to process-section's top.
            // A small adjustment (+2px) for visual overlap, making it look connected.
            const threadSvgActualTop = (underlineRect.bottom - processSectionRect.top) + 2;
            const threadSvgHeight = parseInt(threadSVG.getAttribute('height')); // Get height from SVG tag

            // Calculate the top position for the hover-board to hang just below the thread-svg
            // A small adjustment (-5px) for visual overlap, making it look connected to the thread's end.
            const hoverBoardActualTop = threadSvgActualTop + threadSvgHeight - 5; 

            // Set initial absolute positions
            gsap.set(threadSVG, { top: threadSvgActualTop });
            gsap.set(hoverBoard, { top: hoverBoardActualTop });

            const desktopTl = gsap.timeline({
                scrollTrigger: {
                    trigger: ".process-section", // Trigger on the entire process section
                    start: "top 70%", // When the top of the section hits 70% from the viewport top
                    toggleActions: "play none none reverse", // Play once, then reverse when scrolling back up
                }
            });

            // Initial path for thread drawing (straight down within its SVG viewBox)
            const initialStraightPath = `M 10,0 L 10,${threadSvgHeight}`;
            gsap.set(threadPath, { attr: { d: initialStraightPath } });

            // 1. Thread Draw Animation
            const pathLength = threadPath.getTotalLength();
            desktopTl.from(threadPath, {
                strokeDasharray: pathLength,
                strokeDashoffset: pathLength,
                duration: 1.2,
                ease: "power2.inOut"
            });

            // 2. Board "Bubble" Birth (scaling up and fading in)
            desktopTl.fromTo(hoverBoard,
                { opacity: 0, scale: 0, y: -50, rotation: 0 }, // Start state: slightly above, small, hidden
                { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "back.out(1.7)" } // End state: at natural position, full size
            , "-=0.5"); // Start slightly before thread finishes

            // 3. Card Loading (staggered fade in and slide up)
            desktopTl.to(desktopCards, {
                opacity: 1,
                y: 0,
                stagger: 0.1,
                duration: 0.6,
                ease: "power2.out"
            }, "-=0.2"); // Start slightly before board animation finishes

            // 4. Swaying Animation (continuous loop)
            const swayProxy = { x: 0, rotation: 0 };
            desktopTl.to(swayProxy, {
                x: 8, // Max horizontal sway in pixels (from center)
                rotation: 3, // Max rotation in degrees
                duration: 4, // Duration of one full sway (left to right)
                ease: "sine.inOut",
                repeat: -1, // Infinite loop
                yoyo: true, // Go back and forth for symmetrical motion
                onUpdate: function() {
                    const currentSwayX = this.targets()[0].x;
                    const currentRotation = this.targets()[0].rotation;

                    // Apply sway (translateX) to both the SVG element and the hover board
                    // This makes the entire assembly swing symmetrically from the underline pivot point.
                    gsap.set(threadSVG, { x: currentSwayX });
                    gsap.set(hoverBoard, { x: currentSwayX, rotation: currentRotation });

                    // Dynamically calculate the curved path for the thread within its own SVG viewBox
                    const startX_path = 10; // Center of SVG's 20px width
                    const startY_path = 0; // Top of SVG's viewBox
                    const endX_path = 10; // Center of SVG's 20px width
                    const endY_path = threadSvgHeight; // Bottom of SVG's viewBox

                    // Control point for the Bezier curve to create the sag
                    // It sways proportionally to currentSwayX, and sags more at extremes
                    const controlX_path = startX_path + (currentSwayX * 0.7); // Control point sways slightly more than half of the x sway
                    const controlY_path = startY_path + (endY_path - startY_path) * 0.4 + (Math.abs(currentSwayX) * 0.5); // Deeper sag when swaying more

                    const curvedPath = `M ${startX_path},${startY_path} Q ${controlX_path},${controlY_path} ${endX_path},${endY_path}`;
                    gsap.set(threadPath, { attr: { d: curvedPath } });
                }
            });
        }
    });
});