// Navbar scroll effect
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');
const scrollProgress = document.getElementById('scrollProgress');

function handleScroll() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollY / docHeight) * 100;

    if (navbar) navbar.classList.toggle('scrolled', scrollY > 80);
    if (backToTop) backToTop.classList.toggle('show', scrollY > 400);
    if (scrollProgress) scrollProgress.style.width = progress + '%';
}

window.addEventListener('scroll', handleScroll, { passive: true });

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        const icon = navToggle.querySelector('i');
        icon.className = navLinks.classList.contains('open')
            ? 'fa-solid fa-xmark'
            : 'fa-solid fa-bars';
    });
}

function closeNav() {
    if (navLinks && navToggle) {
        navLinks.classList.remove('open');
        const icon = navToggle.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-bars';
    }
}

// Back to top
if (backToTop) {
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Scroll reveal animations
const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// Smooth reveal stagger for tour cards
document.querySelectorAll('.tour-card').forEach((card, i) => {
    card.style.setProperty('--reveal-delay', `${i * 0.1}s`);
});

// Mobile dropdown toggle
const navDropdown = document.getElementById('navDropdown');
if (navDropdown) {
    const dropdownToggle = navDropdown.querySelector('.nav-dropdown-toggle');
    if (dropdownToggle) {
        dropdownToggle.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                navDropdown.classList.toggle('open');
            }
        });
    }
}

// Close dropdown on resize to desktop
window.addEventListener('resize', function() {
    if (navDropdown && window.innerWidth > 768) {
        navDropdown.classList.remove('open');
    }
});

// ===== REVIEWS SYSTEM =====
(function() {
    const REVIEW_STORAGE_KEY = 'roatours_reviews';

    const toursList = [
        'Tour: Cayos Cochinos',
        'Tour: Pigeon Cay',
        'Little French Key',
        'Maya Key',
        'Caribbean Blue Tour',
        'Harbour Tour',
        'Mangrove Tour',
        'Classic Roatan Tour',
        'Roatan Ultimate Experience',
        'Tour Cultural',
        'Horseback Riding',
        'Buggy',
        'ATV',
        'Dolphin Encounter',
        'Dolphin Action Swim',
        'Glass Bottom Boat',
        'Parasailing',
        'Jetski',
        'Jetcar',
        'Flyboard',
        'Banana Boat',
        'Catamaran',
        'Snorkeling Combo',
        'Night Snorkeling',
        'Fishing Charters',
        'Canopy',
        'Canopy + Animal Park',
        'Monoloco',
        'Living Garden',
        'Monkey and Sloth Hangout',
        'Hacienda del Cielo',
        'Private Charters in Yacht',
        'Cruise Ship Adventure Package',
        'Ultimate Cruise Escape',
        'Caribbean Tour',
        'Build Your Own Island Adventure'
    ];

    const reviewForm = document.getElementById('reviewForm');
    if (!reviewForm) return;

    const reviewTour = document.getElementById('reviewTour');
    const reviewRating = document.getElementById('reviewRating');
    const starRating = document.getElementById('starRating');
    const reviewsGrid = document.getElementById('reviewsGrid');
    const reviewFilters = document.getElementById('reviewFilters');
    const reviewsEmpty = document.getElementById('reviewsEmpty');

    toursList.forEach(function(tour) {
        const option = document.createElement('option');
        option.value = tour;
        option.textContent = tour;
        reviewTour.appendChild(option);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const presetTour = urlParams.get('tour');
    if (presetTour) {
        reviewTour.value = decodeURIComponent(presetTour);
    }

    // Star rating interaction
    const stars = starRating.querySelectorAll('i');
    let selectedRating = 0;

    stars.forEach(function(star) {
        star.addEventListener('mouseenter', function() {
            const val = parseInt(this.getAttribute('data-value'));
            stars.forEach(function(s) {
                if (parseInt(s.getAttribute('data-value')) <= val) {
                    s.classList.add('hover-preview');
                } else {
                    s.classList.remove('hover-preview');
                }
            });
        });

        star.addEventListener('mouseleave', function() {
            stars.forEach(function(s) {
                s.classList.remove('hover-preview');
            });
        });

        star.addEventListener('click', function() {
            selectedRating = parseInt(this.getAttribute('data-value'));
            reviewRating.value = selectedRating;
            updateStarDisplay(selectedRating);
        });
    });

    function updateStarDisplay(rating) {
        stars.forEach(function(s) {
            if (parseInt(s.getAttribute('data-value')) <= rating) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
    }

    // Load reviews
    function getReviews() {
        try {
            return JSON.parse(localStorage.getItem(REVIEW_STORAGE_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function saveReviews(reviews) {
        localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(reviews));
    }

    function getInitials(name) {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    function getStarsHTML(rating) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            html += '<i class="fa-solid fa-star"></i>';
        }
        return html;
    }

    function getActiveStarsHTML(rating) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                html += '<i class="fa-solid fa-star" style="color: var(--gold);"></i>';
            } else {
                html += '<i class="fa-regular fa-star" style="color: var(--gold); opacity: 0.3;"></i>';
            }
        }
        return html;
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return parseInt(parts[2]) + ' ' + months[parseInt(parts[1]) - 1] + ' ' + parts[0];
    }

    function formatPublishDate(isoStr) {
        const d = new Date(isoStr);
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    }

    // Populate filters
    function buildFilters() {
        const reviews = getReviews();
        const usedTours = [...new Set(reviews.map(function(r) { return r.tour; }))];

        const existingBtns = reviewFilters.querySelectorAll('.filter-btn:not([data-filter="all"])');
        existingBtns.forEach(function(btn) { btn.remove(); });

        const allBtn = reviewFilters.querySelector('[data-filter="all"]');

        usedTours.sort().forEach(function(tour) {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.setAttribute('data-filter', tour);
            btn.textContent = tour;
            reviewFilters.appendChild(btn);
        });

        reviewFilters.querySelectorAll('.filter-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                reviewFilters.querySelectorAll('.filter-btn').forEach(function(b) {
                    b.classList.remove('active');
                });
                this.classList.add('active');
                renderReviews(this.getAttribute('data-filter'));
            });
        });
    }

    // Render reviews
    function renderReviews(filter) {
        const reviews = getReviews();
        let filtered = reviews;

        if (filter && filter !== 'all') {
            filtered = reviews.filter(function(r) {
                return r.tour === filter;
            });
        }

        filtered.sort(function(a, b) {
            return new Date(b.publishedAt) - new Date(a.publishedAt);
        });

        reviewsGrid.innerHTML = '';

        if (filtered.length === 0) {
            reviewsGrid.innerHTML =
                '<div class="reviews-empty">' +
                    '<i class="fa-regular fa-comment-dots"></i>' +
                    '<p>No reviews yet' + (filter && filter !== 'all' ? ' for this experience' : '') + '. Be the first to share your experience.</p>' +
                '</div>';
            updateStats(reviews);
            return;
        }

        filtered.forEach(function(review) {
            const card = document.createElement('div');
            card.className = 'review-card reveal';
            card.innerHTML =
                '<div class="review-card-header">' +
                    '<div class="review-card-avatar">' + getInitials(review.name) + '</div>' +
                    '<div class="review-card-meta">' +
                        '<div class="review-card-name">' + escapeHtml(review.name) + '</div>' +
                        '<div class="review-card-tour"><i class="fa-solid fa-location-dot"></i> ' + escapeHtml(review.tour) + '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="review-card-stars">' + getActiveStarsHTML(review.rating) + '</div>' +
                '<div class="review-card-text">"' + escapeHtml(review.comment) + '"</div>' +
                '<div class="review-card-date">' +
                    '<i class="fa-regular fa-calendar"></i> ' +
                    (review.experienceDate ? formatDate(review.experienceDate) : 'Published ' + formatPublishDate(review.publishedAt)) +
                '</div>';
            reviewsGrid.appendChild(card);
        });

        updateStats(reviews);
        observeNewReveals();
    }

    function updateStats(reviews) {
        const totalEl = document.getElementById('totalReviews');
        const avgEl = document.getElementById('avgRating');
        const avgStarsEl = document.getElementById('avgStars');

        if (!totalEl) return;

        totalEl.textContent = reviews.length;

        if (reviews.length === 0) {
            avgEl.textContent = '0.0';
            avgStarsEl.innerHTML = getActiveStarsHTML(0);
            return;
        }

        const sum = reviews.reduce(function(acc, r) { return acc + r.rating; }, 0);
        const avg = (sum / reviews.length).toFixed(1);
        avgEl.textContent = avg;
        avgStarsEl.innerHTML = getActiveStarsHTML(Math.round(parseFloat(avg)));
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function observeNewReveals() {
        const newReveals = reviewsGrid.querySelectorAll('.reveal:not(.visible)');
        newReveals.forEach(function(el) {
            revealObserver.observe(el);
        });
    }

    // Form submission
    reviewForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (selectedRating === 0) {
            alert('Please select a star rating.');
            return;
        }

        const name = document.getElementById('reviewName').value.trim();
        const tour = reviewTour.value;
        const comment = document.getElementById('reviewComment').value.trim();
        const date = document.getElementById('reviewDate').value;

        if (!name || !tour || !comment) {
            alert('Please fill in all required fields.');
            return;
        }

        const review = {
            id: Date.now(),
            name: name,
            tour: tour,
            rating: selectedRating,
            comment: comment,
            experienceDate: date || '',
            publishedAt: new Date().toISOString()
        };

        const reviews = getReviews();
        reviews.push(review);
        saveReviews(reviews);

        reviewForm.reset();
        selectedRating = 0;
        reviewRating.value = 0;
        updateStarDisplay(0);

        buildFilters();
        renderReviews('all');

        const successMsg = document.createElement('div');
        successMsg.className = 'review-success';
        successMsg.innerHTML =
            '<i class="fa-solid fa-circle-check"></i>' +
            '<h4>Thank you for your review!</h4>' +
            '<p>Your opinion has been published and will help other travelers.</p>';
        reviewForm.parentNode.insertBefore(successMsg, reviewForm.nextSibling);

        setTimeout(function() {
            if (successMsg.parentNode) {
                successMsg.remove();
            }
        }, 5000);

        reviewsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Initialize
    buildFilters();
    renderReviews('all');
})();
