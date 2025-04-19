document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');

    // Active Link Handling
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            link.classList.add('active');
        });
    });

    // Mobile Menu Toggle
    mobileMenuToggle.addEventListener('click', () => {
        navLinksContainer.classList.toggle('active');
        mobileMenuToggle.classList.toggle('open');
    });

    // Smooth Scrolling
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});


class QuantumCarousel {
    constructor(options) {
        this.container = document.getElementById(options.containerId);
        this.wrapper = document.getElementById('carouselWrapper');
        this.indicatorsContainer = document.getElementById('quantumIndicators');
        this.slides = options.slides;
        this.currentIndex = 0;
        this.autoplayInterval = options.autoplayInterval || 5000;

        this.init();
    }

    init() {
        this.renderCarousel();
        this.setupEventListeners();
        this.createParticleEffects();
        this.startAutoplay();
    }

    renderCarousel() {
        this.wrapper.innerHTML = '';
        this.indicatorsContainer.innerHTML = '';

        this.slides.forEach((slide, index) => {
            // Create Slide
            const slideElement = document.createElement('div');
            slideElement.classList.add('carousel-slide');
            slideElement.dataset.redirectUrl = slide.redirectUrl;

            // Background
            const backgroundElement = document.createElement('div');
            backgroundElement.classList.add('slide-background');
            backgroundElement.style.backgroundImage = `url(${slide.backgroundImage})`;

            // Particle Layer
            const particleLayer = document.createElement('div');
            particleLayer.classList.add('particle-layer');

            // Content
            const contentElement = document.createElement('div');
            contentElement.classList.add('slide-content');

            const titleElement = document.createElement('h2');
            titleElement.classList.add('slide-title');
            titleElement.textContent = slide.title;

            const descriptionElement = document.createElement('p');
            descriptionElement.classList.add('slide-description');
            descriptionElement.textContent = slide.description;

            const ctaElement = document.createElement('a');
            ctaElement.classList.add('quantum-cta');
            ctaElement.textContent = slide.ctaText || 'Explore';
            ctaElement.href = slide.redirectUrl;

            // Assemble
            contentElement.appendChild(titleElement);
            contentElement.appendChild(descriptionElement);
            contentElement.appendChild(ctaElement);

            slideElement.appendChild(backgroundElement);
            slideElement.appendChild(particleLayer);
            slideElement.appendChild(contentElement);

            this.wrapper.appendChild(slideElement);

            // Indicator
            const indicator = document.createElement('div');
            indicator.classList.add('indicator');
            indicator.addEventListener('click', () => this.goToSlide(index));

            this.indicatorsContainer.appendChild(indicator);
        });

        // Set initial active slide
        this.wrapper.children[0].classList.add('active');
        this.indicatorsContainer.children[0].classList.add('active');
    }

    setupEventListeners() {
        this.wrapper.addEventListener('click', (event) => {
            const slideElement = event.target.closest('.carousel-slide');
            if (slideElement) {
                const redirectUrl = slideElement.dataset.redirectUrl;
                if (redirectUrl) {
                    window.location.href = redirectUrl;
                }
            }
        });
    }

    createParticleEffects() {
        const particleLayers = document.querySelectorAll('.particle-layer');
        particleLayers.forEach(layer => {
            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle');
                particle.style.width = `${Math.random() * 10}px`;
                particle.style.height = particle.style.width;
                particle.style.left = `${Math.random() * 100}%`;
                particle.style.top = `${Math.random() * 100}%`;
                layer.appendChild(particle);
            }
        });
    }

    goToSlide(index) {
        // Remove active states
        this.wrapper.querySelector('.carousel-slide.active')?.classList.remove('active');
        this.indicatorsContainer.querySelector('.indicator.active')?.classList.remove('active');

        // Set new active states
        this.wrapper.children[index].classList.add('active');
        this.indicatorsContainer.children[index].classList.add('active');

        this.currentIndex = index;
    }

    startAutoplay() {
        this.autoplayTimer = setInterval(() => {
            const nextIndex = (this.currentIndex + 1) % this.slides.length;
            this.goToSlide(nextIndex);
        }, this.autoplayInterval);
    }
}

// Slide Configuration
const slides = [
    {
        backgroundImage: '',
        title: 'Ultimate Exploration',
        description: 'Dive into immersive digital experiences',
        redirectUrl: 'game1.html',
        ctaText: 'Begin Journey'
    },
    {
        backgroundImage: '',
        title: 'Online Course',
        description: 'Designed for educational purposes which helps an individual to  learn and grow',
        redirectUrl: 'education1.html',
        ctaText: 'Explore Now'
    },
    {
        backgroundImage: '',
        title: 'Movie Hub',
        description: 'Experience a world of movie',
        redirectUrl: 'movie.html',
        ctaText: 'Watch Now'
    },
    {
        backgroundImage: '',
        title: 'Sales and Discounts',
        description: 'Purchase a products with best deals and offers',
        redirectUrl: 'e-commerce.html',
        ctaText: 'Begin Purchase'
    },
    {
        backgroundImage: '',
        title: 'AI',
        description: 'Bring your dreams to life just by generating anything',
        redirectUrl: 'ai1.html',
        ctaText: 'Generate Now'
    },
    {
        backgroundImage: '',
        title: 'News Feed',
        description: 'Get updated to news across the globe',
        redirectUrl: 'news.html',
        ctaText: 'Get Updated'
    },
    {
        backgroundImage: '',
        title: 'Chat',
        description: 'Meet friends both local and internationally',
        redirectUrl: 'chat.html',
        ctaText: 'Socialize'
    }
];

// Initialize Carousel
document.addEventListener('DOMContentLoaded', () => {
    new QuantumCarousel({
        containerId: 'quantumCarousel',
        slides: slides,
        autoplayInterval: 2000
    });
});


function validateNewsletter(event) {
event.preventDefault();
const name = document.getElementById('name').value.trim();
const email = document.getElementById('email').value.trim();
const errorMessage = document.getElementById('error-message');

if (!name || !email) {
    errorMessage.textContent = 'Please provide a valid name and email.';
    return false;
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errorMessage.textContent = 'Please enter a valid email address.';
    return false;
}

errorMessage.textContent = '';
alert('Thank you for subscribing!');
return true;
}
class QuantumReality {
    constructor() {
        this.canvas = document.getElementById('quantum-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.connections = [];
        this.setup();
    }

    setup() {
        this.resize();
        this.createParticleNetwork();
        this.animate();
        this.setupEventListeners();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticleNetwork() {
        const particleCount = 150;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 3,
                speedX: (Math.random() - 0.5) * 2,
                speedY: (Math.random() - 0.5) * 2,
                color: `rgba(0, 245, 212, ${Math.random() * 0.5})`
            });
        }
    }

    drawParticleNetwork() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(
                particle.x, 
                particle.y, 
                particle.radius, 
                0, 
                Math.PI * 2
            );
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
            
            // Update particle position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Wrap around screen
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
        });

        // Draw connections between nearby particles
        this.drawConnections();
    }

    drawConnections() {
        const connectionDistance = 100;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                
                const distance = Math.sqrt(
                    Math.pow(p1.x - p2.x, 2) + 
                    Math.pow(p1.y - p2.y, 2)
                );
                
                if (distance < connectionDistance) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(0, 245, 212, ${1 - distance / connectionDistance})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }
    }

    animate() {
        this.drawParticleNetwork();
        requestAnimationFrame(() => this.animate());
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
    }
}

class QuantumInteractions {
    constructor() {
        this.initModalInteractions();
        this.initButtonInteractions();
        this.initCardInteractions();
    }

    initModalInteractions() {
        const featureCards = document.querySelectorAll('.feature-card');
        const modals = document.querySelectorAll('.modal');
        const closeButtons = document.querySelectorAll('.close-modal');

        featureCards.forEach(card => {
            card.addEventListener('click', () => {
                const modalId = card.getAttribute('data-modal');
                const modal = document.getElementById(modalId);
                modal.style.display = 'flex';
            });
        });

        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                modal.style.display = 'none';
            });
        });

        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }

    initButtonInteractions() {
        const buttons = document.querySelectorAll('.quantum-button');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                e.target.style.transform = 'scale(1.05)';
            });

            button.addEventListener('mouseleave', (e) => {
                e.target.style.transform = 'scale(1)';
            });
        });
    }

    initCardInteractions() {
        const featureCards = document.querySelectorAll('.feature-card');

        featureCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const { clientX, clientY } = e;
                const { left, top } = card.getBoundingClientRect();
                
                const centerX = left + card.offsetWidth / 2;
                const centerY = top + card.offsetHeight / 2;

                const angleX = (clientY - centerY) / 20;
                const angleY = -(clientX - centerX) / 20;

                card.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg) translateZ(40px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'rotateX(0) rotateY(0) translateZ(0)';
            });
        });
    }
}

// Initialize on load
window.addEventListener('load', () => {
    new QuantumReality();
    new QuantumInteractions();
});

const reviews = [
    {
        name: "Emma Thompson",
        role: "Chief Marketing Officer",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        stars: 5,
        comment: "An extraordinary platform that revolutionizes how we approach digital experiences. Truly remarkable!"
    },
    {
        name: "David Rodriguez",
        role: "Tech Educator",
        image: "https://randomuser.me/api/portraits/men/85.jpg",
        stars: 5,
        comment: "Cutting-edge design meets unparalleled functionality. This website sets a new benchmark in digital excellence."
    },
    {
        name: "Sophia Lee",
        role: "Product Strategy Director",
        image: "https://randomuser.me/api/portraits/women/67.jpg",
        stars: 5,
        comment: "A interactive-changing solution that seamlessly blends user experience with innovative technology."
    },
    {
        name: "Mark Peterson",
        role: "Executive Officer",
        image: "https://randomuser.me/api/portraits/men/44.jpg",
        stars: 5,
        comment: "Everyone need this explore on this website",
    },
    {
        name: "Mark Peterson",
        role: "Software Engineer",
        image: "https://randomuser.me/api/portraits/men/43.jpg",
        stars: 5,
        comment: "I recommend anyone to try this website and know more about it",
    },
    {
        name: "Mr.Smile",
        role: "Web and App Developer",
        image: "",
        stars: 5,
        comment: "I recommend everyone to explore through my website ",
    },
    {
        name: "Philip Wales",
        role: "Tech trainer",
        image: "https://randomuser.me/api/portraits/men/23.jpg",
        stars: 5,
        comment: "Try it, and thank me later",
    },
    {
        name: "Helena Boison",
        role: "Sales Producer",
        image: "https://randomuser.me/api/portraits/women/33.jpg",
        stars: 5,
        comment: "Good luck on exploring through this page",
    }
];

class ReviewSlider {
    constructor(reviews) {
        this.reviews = reviews;
        this.currentIndex = 0;
        this.reviewCard = document.getElementById('reviewCard');
        this.progressBar = document.getElementById('progressBar');
        this.reviewerImage = document.getElementById('reviewerImage');
        this.reviewerName = document.getElementById('reviewerName');
        this.reviewerRole = document.getElementById('reviewerRole');
        this.starsContainer = document.getElementById('starsContainer');
        this.reviewText = document.getElementById('reviewText');

        this.autoAdvanceInterval = null;
        this.initializeSlider();
    }

    initializeSlider() {
        this.displayReview(this.currentIndex);
        this.startAutoAdvance();
    }

    displayReview(index) {
        const review = this.reviews[index];

        // Fade out effect
        this.reviewCard.classList.add('fade-out');

        setTimeout(() => {
            // Update content
            this.reviewerImage.src = review.image;
            this.reviewerName.textContent = review.name;
            this.reviewerRole.textContent = review.role;
            this.reviewText.textContent = review.comment;

            // Render stars
            this.renderStars(review.stars);

            // Fade in effect
            this.reviewCard.classList.remove('fade-out');
            this.reviewCard.classList.add('fade-in');

            // Reset progress bar
            this.startProgressBar();
        }, 2000);
    }

    renderStars(count) {
        this.starsContainer.innerHTML = '';
        
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.classList.add('star');
            star.textContent = '★';
            star.style.color = i < count ? '#ffd700' : '#e0e0e0';
            this.starsContainer.appendChild(star);
        }
    }

    startProgressBar() {
        this.progressBar.style.width = '0%';
        
        // Use requestAnimationFrame for smoother animation
        const startTime = performance.now();
        const duration = 10000; // 10 seconds

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            this.progressBar.style.width = `${progress * 250}%`;

            if (progress < 5) {
                requestAnimationFrame(animate);
            } else {
                this.advanceReview();
            }
        };

        requestAnimationFrame(animate);
    }

    advanceReview() {
        this.currentIndex = (this.currentIndex + 1) % this.reviews.length;
        this.displayReview(this.currentIndex);
    }

    startAutoAdvance() {
        // Automatically advance every 10 seconds
        this.autoAdvanceInterval = setInterval(() => {
            this.advanceReview();
        }, 10000);
    }

    stopAutoAdvance() {
        if (this.autoAdvanceInterval) {
            clearInterval(this.autoAdvanceInterval);
        }
    }
}

// Initialize the slider when the page loads
window.addEventListener('load', () => {
    new ReviewSlider(reviews);
});


function toggleQuantumChat() {
    const chatWidget = document.getElementById('quantum-chat-widget');
    const quantumTrigger = document.getElementById('quantum-assistant-trigger');
    
    if (chatWidget.style.display === 'block') {
        chatWidget.style.display = 'none';
        quantumTrigger.innerHTML = '<span class="quantum-icon">?</span>';
    } else {
        chatWidget.style.display = 'block';
        quantumTrigger.innerHTML = '<span class="quantum-icon">✕</span>';
    }
}

function handleLoginSignup() {
    window.location.href = 'login.html';
}

function Unlockpremiumoffer() {
    window.location.href = 'cancel.html';
}

function initQuantumAssistant() {
    if (!localStorage.getItem('quantumSupportVisited')) {
        setTimeout(toggleQuantumChat, 4000);
        localStorage.setItem('quantumSupportVisited', 'true');
    }
}

document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'q') {
        toggleQuantumChat();
    }
});

window.onload = initQuantumAssistant;

 // JavaScript Dynamic Text Animation
 class DynamicTextAnimator {
    constructor(element, texts, options = {}) {
        this.element = element;
        this.texts = texts;
        this.options = {
            duration: options.duration || 3000,
            typingSpeed: options.typingSpeed || 300,
            deletingSpeed: options.deletingSpeed || 100
        };
        this.currentIndex = 0;
        this.isDeleting = false;
        this.displayText = '';
    }

    animate() {
        const currentText = this.texts[this.currentIndex];
        
        // Typing and deleting logic
        if (!this.isDeleting && this.displayText.length < currentText.length) {
            this.displayText += currentText.charAt(this.displayText.length);
        } else if (this.isDeleting && this.displayText.length > 0) {
            this.displayText = this.displayText.slice(0, -1);
        } else {
            this.isDeleting = !this.isDeleting;
            
            if (!this.isDeleting) {
                this.currentIndex = 
                    (this.currentIndex + 1) % this.texts.length;
            }
        }

        // Update element text
        this.element.textContent = this.displayText;

        // Set typing/deleting speed
        const speed = this.isDeleting ? 
            this.options.deletingSpeed : 
            this.options.typingSpeed;

        // Schedule next animation frame
        setTimeout(() => this.animate(), speed);
    }

    start() {
        this.animate();
    }
}

// Initialize the dynamic text animator
document.addEventListener('DOMContentLoaded', () => {
    const dynamicTextElement = document.getElementById('dynamic-text');
    const textOptions = [
        'Entertain', 
        'Enjoy', 
        'Have fun', 
        'Explore',
        'And,',  
        'Remember to', 
        'Support us',
        'We are avaiable',
        '24/7', 
        'If you',
        'Have a problem',
        'Kindly', 
        'Contact us',
        'For more info',
        'Read our ',
        'About us', 
        'Thank you', 
        'Have a ',
        'Good day',   
            
         
    ];

    const animator = new DynamicTextAnimator(
        dynamicTextElement, 
        textOptions
    );
    animator.start();
});

// Initialize the map and set the default view (in case geolocation fails)
const map = L.map('map').setView([51.505, -0.09], 13); // default position is London

// Add tile layer (open street maps)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright"></a>'
}).addTo(map);

// Try to get the user's location
if (navigator.geolocation) {
navigator.geolocation.getCurrentPosition(function(position) {
const lat = position.coords.latitude;
const lon = position.coords.longitude;

// Center the map to the user's location
map.setView([lat, lon], 13);

// Add a marker at the user's location
L.marker([lat, lon]).addTo(map)
.bindPopup("You are here!")
.openPopup();
}, function() {
alert("Geolocation failed. Showing default location.");
});
} else {
alert("Geolocation is not supported by this browser.");
}


