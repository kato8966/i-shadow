let player
let is_player_ready
const dictation_all = []
const dictation_lines = document.getElementsByClassName("dictation"), dictation_lines_content = [[], []]

function onYouTubeIframeAPIReady(){
    player = new YT.Player("player", {
        events: {
            "onReady": onPlayerReady
        }
    })
}

function onPlayerReady(){
    is_player_ready = true
}

function playYouTubeVideo(){
    const input = document.getElementById("url_input")
    if (!input.reportValidity()){
        return false
    }
    if (!is_player_ready){
        alert("A YouTube player is not ready.")
        return false
    }
    document.getElementById("start").style.display = "none"
    document.getElementById("stage").style.display = "block"
    player.setSize($(document).width(),
                   $(document).height() - $("#stop_button").outerHeight(true) - lineHeight(dictation_lines[0]) * 2)
    const video_url = input.value
    const video_id = video_url.substring(video_url.length - 11)
    player.loadVideoById(video_id)
    return true
}

function startShadowing(){
    if (playYouTubeVideo()){

    }
}

document.getElementById("start_button").addEventListener("click", startShadowing)

fetch("NOTICE.txt")
    .then(response => response.text())
    .then(text => document.getElementById("notice").textContent = text)
