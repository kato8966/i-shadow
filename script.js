let player
let is_player_ready
let is_vosk_ready
const dictation_all = []
const dictation_lines = document.getElementsByClassName("dictation"), dictation_lines_content = [[], []]
let recognizerProcessor
let audio_source

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
    if (!is_vosk_ready){
        alert("A voice recognizer is not ready.")
        return
    }
    if (playYouTubeVideo()){
        audio_source.connect(recognizerProcessor)
    }
}

document.getElementById("start_button").addEventListener("click", startShadowing)

fetch("NOTICE.txt")
    .then(response => response.text())
    .then(text => document.getElementById("notice").textContent = text)

async function init_vosk(){
    /*
       Copyright 2020-2022 Ciaran O'Reilly
       Modified by addeight

       Licensed under the Apache License, Version 2.0 (the "License");
       you may not use this function except in compliance with the License.
       You may obtain a copy of the License at

           http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing, software
       distributed under the License is distributed on an "AS IS" BASIS,
       WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
       See the License for the specific language governing permissions and
       limitations under the License.
    */
    const channel = new MessageChannel()
    const model = await Vosk.createModel('vosk-model-small-en-us-0.15.tar.gz')
    model.registerPort(channel.port1)

    const sampleRate = 48000

    const recognizer = new model.KaldiRecognizer(sampleRate)

    recognizer.on("result", (message) => {
        vosk_result_ready(message.result.text, true)
    })
    recognizer.on("partialresult", (message) => {
        vosk_result_ready(message.result.partial, false)
    })

    const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            channelCount: 1,
            sampleRate
        },
    })

    const audioContext = new AudioContext()
    await audioContext.audioWorklet.addModule('recognizer-processor.js')
    recognizerProcessor = new AudioWorkletNode(audioContext, 'recognizer-processor', {channelCount: 1, numberOfInputs: 1, numberOfOutputs: 1})
    recognizerProcessor.port.postMessage({action: 'init', recognizerId: recognizer.id}, [channel.port2])
    recognizerProcessor.connect(audioContext.destination)

    audio_source = audioContext.createMediaStreamSource(mediaStream)

    is_vosk_ready = true
}

init_vosk()
