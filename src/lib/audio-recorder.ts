/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { audioContext } from "./utils";
import AudioRecordingWorklet from "./worklets/audio-processing";
import VolMeterWorket from "./worklets/vol-meter";

import { createWorketFromSrc } from "./audioworklet-registry";
import EventEmitter from "eventemitter3";

function arrayBufferToBase64(buffer: ArrayBuffer) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export class AudioRecorder extends EventEmitter {
  stream: MediaStream | undefined;
  audioContext: AudioContext | undefined;
  source: MediaStreamAudioSourceNode | undefined;
  recording: boolean = false;
  recordingWorklet: AudioWorkletNode | undefined;
  vuWorklet: AudioWorkletNode | undefined;
  shouldBeRecording: boolean = false;
  retryCount: number = 0;
  maxRetries: number = 3;
  retryTimeout: number | null = null;

  private starting: Promise<void> | null = null;
  private deviceChangeHandler: () => void;

  constructor(public sampleRate = 16000) {
    super();
    this.deviceChangeHandler = this.handleDeviceChange.bind(this);
    navigator.mediaDevices?.addEventListener('devicechange', this.deviceChangeHandler);
  }

  private async checkAudioDevices(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      
      if (audioDevices.length === 0) {
        throw new Error("No audio input devices found");
      }

      // Check if we have permission to access any audio devices
      const hasPermission = audioDevices.some(device => device.label !== '');
      if (!hasPermission) {
        // This will trigger a permission prompt
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      return true;
    } catch (error) {
      console.error('Audio device check failed:', error);
      return false;
    }
  }

  private async handleDeviceChange() {
    if (this.shouldBeRecording) {
      try {
        const hasAudioDevices = await this.checkAudioDevices();
        if (!hasAudioDevices) {
          this.emit("error", "No audio input devices found");
          return;
        }
        
        // Stop current recording
        this.stop();
        // Attempt to restart with new device
        await this.start();
        this.emit("deviceReconnected");
        this.retryCount = 0; // Reset retry count on successful connection
      } catch (error) {
        this.handleStartError(error);
      }
    }
  }

  private handleStartError(error: any) {
    console.error('Audio start error:', error);
    
    let errorMessage = "Could not start audio recording";
    if (error.name === 'NotAllowedError') {
      errorMessage = "Microphone access denied. Please allow microphone access and try again.";
    } else if (error.name === 'NotFoundError') {
      errorMessage = "No microphone found. Please connect a microphone and try again.";
    } else if (error.name === 'NotReadableError') {
      errorMessage = "Microphone is in use by another application. Please close other apps using the microphone.";
    }

    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.emit("error", `${errorMessage} - Retrying (${this.retryCount}/${this.maxRetries})`);
      
      // Clear any existing retry timeout
      if (this.retryTimeout) {
        clearTimeout(this.retryTimeout);
      }
      
      // Retry after a delay
      this.retryTimeout = window.setTimeout(() => {
        if (this.shouldBeRecording) {
          this.start().catch(err => this.handleStartError(err));
        }
      }, 2000);
    } else {
      this.emit("error", `${errorMessage} - Please refresh the page to try again.`);
      this.shouldBeRecording = false;
    }
  }

  async start() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Browser does not support audio recording");
    }

    const hasAudioDevices = await this.checkAudioDevices();
    if (!hasAudioDevices) {
      throw new Error("No audio input devices found");
    }

    this.shouldBeRecording = true;
    this.starting = new Promise(async (resolve, reject) => {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: this.sampleRate
          }
        });
        
        this.audioContext = await audioContext({ sampleRate: this.sampleRate });
        await this.audioContext.resume();
        this.source = this.audioContext.createMediaStreamSource(this.stream);

        const workletName = "audio-recorder-worklet";
        const src = createWorketFromSrc(workletName, AudioRecordingWorklet);

        await this.audioContext.audioWorklet.addModule(src);
        this.recordingWorklet = new AudioWorkletNode(
          this.audioContext,
          workletName,
        );

        this.recordingWorklet.port.onmessage = async (ev: MessageEvent) => {
          const arrayBuffer = ev.data.data.int16arrayBuffer;

          if (arrayBuffer) {
            const arrayBufferString = arrayBufferToBase64(arrayBuffer);
            this.emit("data", arrayBufferString);
          }
        };
        this.source.connect(this.recordingWorklet);

        // vu meter worklet
        const vuWorkletName = "vu-meter";
        await this.audioContext.audioWorklet.addModule(
          createWorketFromSrc(vuWorkletName, VolMeterWorket),
        );
        this.vuWorklet = new AudioWorkletNode(this.audioContext, vuWorkletName);
        this.vuWorklet.port.onmessage = (ev: MessageEvent) => {
          this.emit("volume", ev.data.volume);
        };

        this.source.connect(this.vuWorklet);
        this.recording = true;
        resolve();
      } catch (error) {
        reject(error);
      }
      this.starting = null;
    });

    return this.starting;
  }

  stop() {
    this.shouldBeRecording = false;
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    
    const handleStop = () => {
      if (this.audioContext) {
        this.audioContext.suspend().catch(console.error);
      }
      this.source?.disconnect();
      this.stream?.getTracks().forEach((track) => track.stop());
      this.stream = undefined;
      this.recordingWorklet = undefined;
      this.vuWorklet = undefined;
      this.recording = false;
    };
    
    if (this.starting) {
      this.starting.then(handleStop);
      return;
    }
    handleStop();
  }

  cleanup() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
    navigator.mediaDevices?.removeEventListener('devicechange', this.deviceChangeHandler);
    this.stop();
  }
}
