var player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: $(document).height() * 2 / 3,
        width: $(document).width(),
    });
}
