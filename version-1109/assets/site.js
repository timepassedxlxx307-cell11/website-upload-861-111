(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    const carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
        const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
        const prev = carousel.querySelector('[data-hero-prev]');
        const next = carousel.querySelector('[data-hero-next]');
        let current = 0;
        let timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });

        show(0);
        restart();
    }

    const queryInput = document.querySelector('[data-read-query]');

    if (queryInput) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');
        if (query) {
            queryInput.value = query;
        }
    }

    const filterInputs = Array.from(document.querySelectorAll('[data-filter-input]'));

    filterInputs.forEach(function (input) {
        const list = document.querySelector('[data-search-list]');
        if (!list) {
            return;
        }
        const cards = Array.from(list.querySelectorAll('.movie-card'));

        function applyFilter() {
            const value = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                const haystack = (card.dataset.title + ' ' + card.dataset.tags).toLowerCase();
                card.classList.toggle('is-hidden', value && !haystack.includes(value));
            });
        }

        input.addEventListener('input', applyFilter);
        applyFilter();
    });

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        const existing = document.querySelector('script[data-hls-loader]');
        if (existing) {
            existing.addEventListener('load', callback, { once: true });
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
        script.async = true;
        script.setAttribute('data-hls-loader', 'true');
        script.addEventListener('load', callback, { once: true });
        document.head.appendChild(script);
    }

    function playVideo(frame) {
        if (!frame || frame.dataset.ready === 'true') {
            const readyVideo = frame ? frame.querySelector('video') : null;
            if (readyVideo) {
                readyVideo.play().catch(function () {});
            }
            return;
        }

        const video = frame.querySelector('video');
        const url = frame.getAttribute('data-video-url');

        if (!video || !url) {
            return;
        }

        frame.dataset.ready = 'true';
        frame.classList.add('is-playing');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.play().catch(function () {});
            return;
        }

        loadHls(function () {
            if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({ enableWorker: true });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.src = url;
                video.play().catch(function () {});
            }
        });
    }

    Array.from(document.querySelectorAll('.player-frame')).forEach(function (frame) {
        const layer = frame.querySelector('.play-layer');
        const video = frame.querySelector('video');

        if (layer) {
            layer.addEventListener('click', function () {
                playVideo(frame);
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (frame.dataset.ready !== 'true') {
                    playVideo(frame);
                }
            });
        }
    });
})();
