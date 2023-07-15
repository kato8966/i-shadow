/*
   Copyright 2020-2022 Ciaran O'Reilly

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

class RecognizerAudioProcessor extends AudioWorkletProcessor {
    constructor(options) {
        super(options);

        this.port.onmessage = this._processMessage.bind(this);
    }

    _processMessage(event) {
        // console.debug(`Received event ${JSON.stringify(event.data, null, 2)}`);
        if (event.data.action === "init") {
            this._recognizerId = event.data.recognizerId;
            this._recognizerPort = event.ports[0];
        }
    }

    process(inputs, outputs, parameters) {
        const data = inputs[0][0];
        if (this._recognizerPort && data) {
            // AudioBuffer samples are represented as floating point numbers between -1.0 and 1.0 whilst
            // Kaldi expects them to be between -32768 and 32767 (the range of a signed int16)
            const audioArray = data.map((value) => value * 0x8000);

            this._recognizerPort.postMessage(
                {
                    action: "audioChunk",
                    data: audioArray,
                    recognizerId: this._recognizerId,
                    sampleRate, // Part of AudioWorkletGlobalScope
                },
                {
                    transfer: [audioArray.buffer],
                }
            );
        }
        return true;
    }
}

registerProcessor('recognizer-processor', RecognizerAudioProcessor)