(function () {
    const input = document.getElementById('siteSearchInput');
    const button = document.getElementById('siteSearchButton');
    const results = document.getElementById('searchResults');
    const meta = document.getElementById('searchResultMeta');
    const hotwords = Array.from(document.querySelectorAll('[data-search-word]'));

    if (!input || !button || !results || !Array.isArray(movieSearchItems)) {
        return;
    }

    const escapeHtml = function (value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    const card = function (movie) {
        const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span class="tag-pill">' + escapeHtml(tag) + '</span>';
        }).join('');

        return '<article class="movie-card">' +
            '<a class="poster-wrap" href="' + escapeHtml(movie.url) + '">' +
                '<img class="poster-img" src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.style.display=\'none\';">' +
                '<span class="poster-shade"></span>' +
                '<span class="poster-badge">' + escapeHtml(movie.category) + '</span>' +
            '</a>' +
            '<div class="movie-card-body">' +
                '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
                '<p class="movie-meta">' + escapeHtml([movie.year, movie.region, movie.type].filter(Boolean).join(' / ')) + '</p>' +
                '<p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>' +
                '<div class="tag-row">' + tags + '</div>' +
            '</div>' +
        '</article>';
    };

    const runSearch = function () {
        const query = input.value.trim().toLowerCase();
        const list = query ? movieSearchItems.filter(function (movie) {
            const haystack = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.category, movie.oneLine, (movie.tags || []).join(' ')].join(' ').toLowerCase();
            return haystack.includes(query);
        }) : movieSearchItems.slice(0, 60);
        const limited = list.slice(0, 120);
        results.innerHTML = limited.map(card).join('');
        meta.textContent = query ? '找到 ' + list.length + ' 个相关结果' : '热门推荐';
    };

    button.addEventListener('click', runSearch);
    input.addEventListener('input', runSearch);
    input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            runSearch();
        }
    });

    hotwords.forEach(function (item) {
        item.addEventListener('click', function () {
            input.value = item.dataset.searchWord || '';
            runSearch();
        });
    });

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');

    if (q) {
        input.value = q;
    }

    runSearch();
}());
