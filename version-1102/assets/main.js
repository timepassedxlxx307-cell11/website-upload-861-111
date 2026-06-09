(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";

        if (!query) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });
  }

  function matchesCard(card, query, category) {
    var keywords = (card.getAttribute("data-keywords") || "").toLowerCase();
    var cardCategory = card.getAttribute("data-category") || "";
    var textOk = !query || keywords.indexOf(query) !== -1;
    var categoryOk = !category || category === "全部" || cardCategory === category;
    return textOk && categoryOk;
  }

  function filterScope(scope, query, category) {
    var normalized = (query || "").trim().toLowerCase();
    scope.querySelectorAll("[data-movie-card]").forEach(function (card) {
      if (matchesCard(card, normalized, category)) {
        card.classList.remove("is-hidden");
      } else {
        card.classList.add("is-hidden");
      }
    });
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var activeCategory = "全部";

      if (input) {
        input.addEventListener("input", function () {
          filterScope(scope, input.value, activeCategory);
        });
      }

      scope.querySelectorAll("[data-search-category]").forEach(function (button) {
        button.addEventListener("click", function () {
          activeCategory = button.getAttribute("data-search-category") || "全部";
          scope.querySelectorAll("[data-search-category]").forEach(function (item) {
            item.classList.remove("active");
          });
          button.classList.add("active");
          filterScope(scope, input ? input.value : "", activeCategory);
        });
      });
    });
  }

  function initSearchPage() {
    var page = document.querySelector("[data-search-page]");

    if (!page) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var input = page.querySelector("[data-search-input]");

    if (input && query) {
      input.value = query;
      filterScope(page, query, "全部");
    }
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var next = slider.querySelector("[data-hero-next]");
    var prev = slider.querySelector("[data-hero-prev]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
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

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function initPlayer() {
    var box = document.querySelector("[data-player]");

    if (!box) {
      return;
    }

    var video = box.querySelector("video");
    var button = box.querySelector("[data-player-button]");
    var url = button ? button.getAttribute("data-url") : "";
    var loaded = false;

    function begin() {
      if (!video || !url || loaded) {
        if (video) {
          video.play().catch(function () {});
        }
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }

      if (button) {
        button.classList.add("is-hidden");
      }

      video.play().catch(function () {});
    }

    if (button) {
      button.addEventListener("click", begin);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!loaded) {
          begin();
        }
      });
    }
  }

  ready(function () {
    initNavigation();
    initSearchForms();
    initFilters();
    initSearchPage();
    initHeroSlider();
    initPlayer();
  });
})();
