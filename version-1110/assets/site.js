(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            const isOpen = mobileNav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', String(isOpen));
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let active = 0;
        let timer = null;

        const show = function (index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === active);
            });
        };

        const start = function () {
            clearInterval(timer);
            timer = setInterval(function () {
                show(active + 1);
            }, 5200);
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.dataset.heroDot || 0));
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                start();
            });
        }

        start();
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        const input = scope.querySelector('[data-card-filter]');
        const buttons = Array.from(scope.querySelectorAll('[data-filter-key]'));
        const container = scope.parentElement;
        const cards = Array.from(container.querySelectorAll('.movie-card'));
        let chip = '';

        const apply = function () {
            const query = ((input && input.value) || '').trim().toLowerCase();
            const key = chip.toLowerCase();

            cards.forEach(function (card) {
                const haystack = [card.dataset.title, card.dataset.genre, card.dataset.year, card.dataset.region, card.textContent].join(' ').toLowerCase();
                const matchedQuery = !query || haystack.includes(query);
                const matchedChip = !key || haystack.includes(key);
                card.classList.toggle('is-hidden', !(matchedQuery && matchedChip));
            });
        };

        if (input) {
            input.addEventListener('input', apply);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                const isActive = button.classList.contains('active');
                buttons.forEach(function (item) {
                    item.classList.remove('active');
                });
                chip = isActive ? '' : button.dataset.filterKey || '';
                if (!isActive) {
                    button.classList.add('active');
                }
                apply();
            });
        });
    });
}());
