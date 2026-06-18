function setupStaticPlayer(config) {
    function start() {
        var video = document.getElementById(config.videoId);
        var overlay = document.getElementById(config.overlayId);
        if (!video) {
            return;
        }
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        video.controls = true;
        if (!video.getAttribute("data-ready")) {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = config.source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(config.source);
                hls.attachMedia(video);
                video.hlsInstance = hls;
            } else {
                video.src = config.source;
            }
            video.setAttribute("data-ready", "true");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function() {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }
    }

    function bind() {
        var button = document.getElementById(config.buttonId);
        var overlay = document.getElementById(config.overlayId);
        if (button) {
            button.addEventListener("click", function(event) {
                event.stopPropagation();
                start();
            });
        }
        if (overlay) {
            overlay.addEventListener("click", start);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bind);
    } else {
        bind();
    }
}
