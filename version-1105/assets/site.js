(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupNavigation() {
    var toggle = $('[data-nav-toggle]');
    var panel = $('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('.hero-slide', hero);
    var dots = $all('.hero-dot', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        startTimer();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        startTimer();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        startTimer();
      });
    });
    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    show(0);
    startTimer();
  }

  function setupFilters() {
    var scope = $('[data-filter-scope]');
    if (!scope) {
      return;
    }
    var search = $('#pageSearch');
    var region = $('#regionFilter');
    var year = $('#yearFilter');
    var category = $('#categoryFilter');
    var reset = $('[data-reset-filter]');
    var empty = $('#emptyState');
    var cards = $all('.movie-card', scope);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || params.get('search') || '';

    if (search && initialQuery) {
      search.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function apply() {
      var q = normalize(search ? search.value : '');
      var r = region ? region.value : 'all';
      var y = year ? year.value : 'all';
      var c = category ? category.value : 'all';
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.summary,
          card.dataset.tags,
          card.dataset.category,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type
        ].join(' '));
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (r !== 'all' && card.dataset.region !== r) {
          ok = false;
        }
        if (y !== 'all' && card.dataset.year !== y) {
          ok = false;
        }
        if (c !== 'all' && card.dataset.categorySlug !== c) {
          ok = false;
        }
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [search, region, year, category].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (search) {
          search.value = '';
        }
        if (region) {
          region.value = 'all';
        }
        if (year) {
          year.value = 'all';
        }
        if (category) {
          category.value = 'all';
        }
        apply();
      });
    }

    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
}());

window.initMoviePlayer = function (videoId, overlayId, buttonId, source) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var button = document.getElementById(buttonId);
  var started = false;
  var hlsInstance = null;

  if (!video || !overlay || !button || !source) {
    return;
  }

  function hideOverlay() {
    overlay.classList.add('is-hidden');
  }

  function showOverlay() {
    overlay.classList.remove('is-hidden');
  }

  function begin() {
    hideOverlay();
    if (started) {
      video.play().catch(showOverlay);
      return;
    }
    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.play().catch(showOverlay);
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(showOverlay);
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showOverlay();
        }
      });
      return;
    }

    video.src = source;
    video.play().catch(showOverlay);
  }

  overlay.addEventListener('click', begin);
  button.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    begin();
  });
  video.addEventListener('play', hideOverlay);
  video.addEventListener('pause', function () {
    if (!video.ended && !video.currentTime) {
      showOverlay();
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
};
