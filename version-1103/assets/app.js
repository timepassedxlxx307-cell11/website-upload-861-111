(function() {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function() {
            var expanded = menuButton.getAttribute("aria-expanded") === "true";
            menuButton.setAttribute("aria-expanded", String(!expanded));
            mobileNav.classList.toggle("open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length > 1) {
        var current = 0;
        var showSlide = function(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle("active", i === current);
            });
        };
        dots.forEach(function(dot, i) {
            dot.addEventListener("click", function() {
                showSlide(i);
            });
        });
        window.setInterval(function() {
            showSlide(current + 1);
        }, 5200);
        showSlide(0);
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var filterInput = document.querySelector(".filter-input");
    var filterGenre = document.querySelector(".filter-genre");
    var filterYear = document.querySelector(".filter-year");
    var filterReset = document.querySelector(".filter-reset");
    var emptyState = document.querySelector(".empty-state");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

    if (filterInput && query) {
        filterInput.value = query;
    }

    var applyFilter = function() {
        if (!cards.length) {
            return;
        }
        var text = filterInput ? filterInput.value.trim().toLowerCase() : "";
        var genre = filterGenre ? filterGenre.value : "";
        var year = filterYear ? filterYear.value : "";
        var visible = 0;
        cards.forEach(function(card) {
            var words = (card.getAttribute("data-keywords") || "").toLowerCase();
            var cardGenre = card.getAttribute("data-genre") || "";
            var cardYear = card.getAttribute("data-year") || "";
            var okText = !text || words.indexOf(text) >= 0;
            var okGenre = !genre || cardGenre.indexOf(genre) >= 0;
            var okYear = !year || cardYear === year;
            var ok = okText && okGenre && okYear;
            card.hidden = !ok;
            if (ok) {
                visible += 1;
            }
        });
        if (emptyState) {
            emptyState.hidden = visible !== 0;
        }
    };

    [filterInput, filterGenre, filterYear].forEach(function(item) {
        if (item) {
            item.addEventListener("input", applyFilter);
            item.addEventListener("change", applyFilter);
        }
    });

    if (filterReset) {
        filterReset.addEventListener("click", function() {
            if (filterInput) {
                filterInput.value = "";
            }
            if (filterGenre) {
                filterGenre.value = "";
            }
            if (filterYear) {
                filterYear.value = "";
            }
            applyFilter();
        });
    }

    applyFilter();
})();
