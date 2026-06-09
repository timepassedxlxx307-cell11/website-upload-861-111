(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mainNav = document.querySelector('[data-main-nav]');

    if (menuButton && mainNav) {
        menuButton.addEventListener('click', function () {
            mainNav.classList.toggle('open');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('image-missing');
        });
    });

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                play();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                play();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', play);
        show(0);
        play();
    });

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        var input = panel.querySelector('[data-search-input]');
        var scope = panel.closest('section') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var noResults = scope.querySelector('[data-no-results]');
        var typeValue = 'all';

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function apply() {
            var query = normalize(input ? input.value : '');
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var cardType = normalize(card.getAttribute('data-type'));
                var queryOk = !query || haystack.indexOf(query) !== -1;
                var typeOk = typeValue === 'all' || cardType.indexOf(normalize(typeValue)) !== -1;
                var show = queryOk && typeOk;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });
            if (noResults) {
                noResults.classList.toggle('show', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }

        panel.querySelectorAll('[data-filter-group="type"] [data-filter-value]').forEach(function (button) {
            button.addEventListener('click', function () {
                panel.querySelectorAll('[data-filter-group="type"] [data-filter-value]').forEach(function (item) {
                    item.classList.remove('active');
                });
                button.classList.add('active');
                typeValue = button.getAttribute('data-filter-value') || 'all';
                apply();
            });
        });

        document.querySelectorAll('[data-quick-search]').forEach(function (button) {
            button.addEventListener('click', function () {
                if (input) {
                    input.value = button.getAttribute('data-quick-search') || '';
                    input.focus();
                    apply();
                }
            });
        });

        apply();
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var hlsInstance = null;

        function bindStream() {
            if (!video || video.dataset.ready === 'true') {
                return Promise.resolve();
            }
            var stream = video.getAttribute('data-stream');
            video.dataset.ready = 'true';

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                return new Promise(function (resolve) {
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    window.setTimeout(resolve, 1200);
                });
            }

            video.src = stream;
            return Promise.resolve();
        }

        function start() {
            if (!video) {
                return;
            }
            bindStream().then(function () {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.then === 'function') {
                    playPromise.catch(function () {});
                }
            });
            if (button) {
                button.classList.add('hidden');
            }
        }

        if (button) {
            button.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (button && !video.ended) {
                    button.classList.remove('hidden');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
