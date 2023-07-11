var player;
let is_player_ready

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: $(document).height() * 2 / 3,
        width: $(document).width(),
        events: {
            "onReady": onPlayerReady
        }
    });
}

function onPlayerReady(){
    is_player_ready = true
}

function playYouTubeVideo(){
    const input = document.getElementById("url_input")
    if (input.reportValidity() && is_player_ready){
        document.getElementById("start").style.display = "none"
        document.getElementById("stage").style.display = "block"
        const video_url = input.value
        const video_id = video_url.substring(video_url.length - 11)
        player.loadVideoById(video_id)
    }
}

document.getElementById("start_button").addEventListener("click", playYouTubeVideo)
