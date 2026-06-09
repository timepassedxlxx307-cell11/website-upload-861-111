(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var button = document.querySelector(".mobile-menu-button");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        function show(index) {
            current = index;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        window.setInterval(function () {
            show((current + 1) % slides.length);
        }, 5200);
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll(".filter-scope"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector(".js-search-input");
            var typeSelect = scope.querySelector(".js-type-select");
            var yearSelect = scope.querySelector(".js-year-select");
            var items = Array.prototype.slice.call(scope.querySelectorAll(".js-filter-item"));
            var empty = scope.querySelector(".empty-state");
            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var typeValue = typeSelect ? typeSelect.value : "";
                var yearValue = yearSelect ? yearSelect.value : "";
                var visible = 0;
                items.forEach(function (item) {
                    var text = (item.getAttribute("data-text") || "").toLowerCase();
                    var type = item.getAttribute("data-type") || "";
                    var year = item.getAttribute("data-year") || "";
                    var matched = true;
                    if (keyword && text.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (typeValue && type.indexOf(typeValue) === -1) {
                        matched = false;
                    }
                    if (yearValue && year !== yearValue) {
                        matched = false;
                    }
                    item.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }
            [input, typeSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });

    window.initMoviePlayer = function (source) {
        var video = document.querySelector(".movie-video");
        var layer = document.querySelector(".play-layer");
        if (!video || !source) {
            return;
        }
        var attached = false;
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }
        function start() {
            attach();
            if (layer) {
                layer.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(function () {
                    if (layer) {
                        layer.classList.remove("is-hidden");
                    }
                });
            }
        }
        if (layer) {
            layer.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
    };
})();
