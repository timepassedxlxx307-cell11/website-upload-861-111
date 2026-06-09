
(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobilePanel.hidden = expanded;
    });
  }

  document.querySelectorAll('.js-search-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      var base = form.getAttribute('data-search-base') || 'movies.html';
      if (query) {
        window.location.href = base + '?q=' + encodeURIComponent(query);
      } else {
        window.location.href = base;
      }
    });
  });

  function initHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var list = document.querySelector('[data-movie-list]');
    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var search = document.querySelector('[data-list-search]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var counter = document.querySelector('[data-result-count]');
    var reset = document.querySelector('[data-reset-filter]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (search && initialQuery) {
      search.value = initialQuery;
    }

    function matchesYear(cardYear, selectedYear) {
      if (selectedYear === '全部') {
        return true;
      }
      if (selectedYear === '2022') {
        return Number(cardYear) <= 2022;
      }
      return cardYear === selectedYear;
    }

    function applyFilters() {
      var query = search ? search.value.trim().toLowerCase() : '';
      var type = typeFilter ? typeFilter.value : '全部';
      var year = yearFilter ? yearFilter.value : '全部';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.category
        ].join(' ').toLowerCase();
        var okQuery = !query || haystack.indexOf(query) !== -1;
        var okType = type === '全部' || card.dataset.type === type || card.dataset.type.indexOf(type) !== -1;
        var okYear = matchesYear(card.dataset.year, year);
        var show = okQuery && okType && okYear;
        card.classList.toggle('is-filtered-out', !show);
        if (show) {
          visible += 1;
        }
      });

      if (counter) {
        counter.textContent = visible;
      }
    }

    [search, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (search) {
          search.value = '';
        }
        if (typeFilter) {
          typeFilter.value = '全部';
        }
        if (yearFilter) {
          yearFilter.value = '全部';
        }
        applyFilters();
      });
    }

    applyFilters();
  }

  function initPlayer() {
    document.querySelectorAll('.play-trigger').forEach(function (button) {
      button.addEventListener('click', function () {
        var shell = button.closest('.video-shell');
        var video = shell ? shell.querySelector('video') : null;
        if (!video) {
          return;
        }

        var source = video.getAttribute('data-video');
        if (!source) {
          return;
        }

        button.classList.add('is-hidden');

        if (window.Hls && window.Hls.isSupported()) {
          if (video._hlsInstance) {
            video._hlsInstance.destroy();
          }
          var hls = new window.Hls({ enableWorker: true });
          video._hlsInstance = hls;
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {});
          }, { once: true });
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
      });
    });
  }

  function initImageFallback() {
    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.opacity = '0';
        image.parentElement.classList.add('image-pending');
      }, { once: true });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHero();
    initFilters();
    initPlayer();
    initImageFallback();
  });
}());
