function createPlayer(videoId, buttonId, sourceUrl) {
    const video = document.getElementById(videoId);
    const button = document.getElementById(buttonId);
    let hlsInstance = null;
    let loaded = false;

    if (!video || !button || !sourceUrl) {
        return;
    }

    const loadVideo = function () {
        if (loaded) {
            video.play().catch(function () {});
            return;
        }

        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
            video.addEventListener('loadedmetadata', function () {
                video.play().catch(function () {});
            }, { once: true });
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
        } else {
            video.src = sourceUrl;
            video.play().catch(function () {});
        }
    };

    button.addEventListener('click', function () {
        button.classList.add('hidden');
        loadVideo();
    });

    video.addEventListener('click', function () {
        if (!loaded) {
            button.classList.add('hidden');
            loadVideo();
        }
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
