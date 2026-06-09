(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play-button]");
            var message = player.querySelector("[data-player-message]");
            var source = player.getAttribute("data-m3u8");
            var hlsInstance = null;
            var started = false;

            function showMessage(text) {
                if (!message) {
                    return;
                }

                message.textContent = text;
                message.classList.add("is-visible");
            }

            function hideMessage() {
                if (message) {
                    message.textContent = "";
                    message.classList.remove("is-visible");
                }
            }

            function attachSource() {
                if (!video || !source || started) {
                    return;
                }

                started = true;
                hideMessage();

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });

                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);

                    hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (!data || !data.fatal) {
                            return;
                        }

                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            showMessage("网络连接不稳定，正在重新加载");
                            hlsInstance.startLoad();
                            return;
                        }

                        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            showMessage("播放状态正在恢复");
                            hlsInstance.recoverMediaError();
                            return;
                        }

                        showMessage("当前环境暂时无法播放该视频");
                    });

                    return;
                }

                video.src = source;
            }

            function play() {
                attachSource();

                if (!video) {
                    return;
                }

                var attempt = video.play();

                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {
                        showMessage("点击视频区域即可继续播放");
                    });
                }
            }

            if (button) {
                button.addEventListener("click", play);
            }

            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        play();
                    } else {
                        video.pause();
                    }
                });

                video.addEventListener("play", function () {
                    player.classList.add("is-playing");
                    hideMessage();
                });

                video.addEventListener("pause", function () {
                    player.classList.remove("is-playing");
                });
            }

            Array.prototype.slice.call(document.querySelectorAll("[data-scroll-player]")).forEach(function (link) {
                link.addEventListener("click", function (event) {
                    event.preventDefault();
                    player.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                    play();
                });
            });

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    });
})();
