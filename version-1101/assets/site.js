(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
                document.body.classList.toggle("is-menu-open", panel.classList.contains("is-open"));
            });
        }

        var hero = document.querySelector("[data-hero]");

        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var index = 0;
            var timer = null;

            function show(next) {
                if (!slides.length) {
                    return;
                }

                index = (next + slides.length) % slides.length;

                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });

                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                }
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                    start();
                });
            });

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            start();
        }

        Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]")).forEach(function (bar) {
            var input = bar.querySelector("[data-filter-input]");
            var select = bar.querySelector("[data-type-filter]");
            var section = bar.closest("section") || document;
            var cards = Array.prototype.slice.call(section.querySelectorAll("[data-card]"));
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q");

            if (initial && input) {
                input.value = initial;
            }

            function filterCards() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var type = select ? select.value : "";

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-keyword") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-type") || ""
                    ].join(" ").toLowerCase();

                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesType = !type || card.getAttribute("data-type") === type;

                    card.classList.toggle("is-hidden", !(matchesQuery && matchesType));
                });
            }

            if (input) {
                input.addEventListener("input", filterCards);
            }

            if (select) {
                select.addEventListener("change", filterCards);
            }

            filterCards();
        });
    });
})();
