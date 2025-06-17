package com.airing.frontend

import android.media.AudioFormat
import android.media.AudioRecord
import android.media.AudioTrack
import android.media.MediaRecorder
import android.util.Base64
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlinx.coroutines.*
import org.java_websocket.client.WebSocketClient
import org.java_websocket.handshake.ServerHandshake
import org.json.JSONObject
import java.net.URI
import java.nio.ByteBuffer
import java.nio.ByteOrder

class AiCallModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var webSocket: WebSocketClient? = null
    private var audioRecord: AudioRecord? = null
    private var audioTrack: AudioTrack? = null
    private var isRecording = false
    private var isPlaying = false
    private var pcmData = mutableListOf<Short>()
    private var recordJob: Job? = null
    private val audioQueue = mutableListOf<ByteArray>()
    private var isConnected = false
    private var isSpeaking = false

    private val AUDIO_SAMPLE_RATE = 24000
    private val AUDIO_CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO
    private val AUDIO_ENCODING = AudioFormat.ENCODING_PCM_16BIT
    private val AUDIO_BUFFER_SIZE = AudioRecord.getMinBufferSize(AUDIO_SAMPLE_RATE, AUDIO_CHANNEL_CONFIG, AUDIO_ENCODING)

    override fun getName(): String = "AiCallModule"

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @ReactMethod
    fun connect(url: String, promise: Promise) {
        try {
            webSocket = object : WebSocketClient(URI(url)) {
                override fun onOpen(handshakedata: ServerHandshake?) {
                    isConnected = true
                    sendInitialSetupMessage()
                    val params = Arguments.createMap().apply {
                        putBoolean("connected", true)
                    }
                    sendEvent("onConnectionStateChange", params)
                }

                override fun onMessage(message: String?) {
                    message?.let {
                        val response = JSONObject(it)
                        val params = Arguments.createMap()
                        
                        if (response.has("text")) {
                            params.putString("text", response.getString("text"))
                        }
                        if (response.has("audio")) {
                            val audioData = response.getString("audio")
                            injestAudioChuckToPlay(audioData)
                            params.putString("audio", audioData)
                        }
                        sendEvent("onMessage", params)
                    }
                }

                override fun onClose(code: Int, reason: String?, remote: Boolean) {
                    isConnected = false
                    val params = Arguments.createMap().apply {
                        putBoolean("connected", false)
                        putString("reason", reason)
                    }
                    sendEvent("onConnectionStateChange", params)
                }

                override fun onError(ex: Exception?) {
                    val params = Arguments.createMap().apply {
                        putString("error", ex?.message)
                    }
                    sendEvent("onError", params)
                }
            }
            webSocket?.connect()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("CONNECTION_ERROR", e)
        }
    }

    private fun sendInitialSetupMessage() {
        val setupMessage = JSONObject()
        val setup = JSONObject()
        val generationConfig = JSONObject()
        val responseModalities = org.json.JSONArray()
        responseModalities.put("AUDIO")
        generationConfig.put("response_modalities", responseModalities)
        setup.put("generation_config", generationConfig)
        setupMessage.put("setup", setup)
        webSocket?.send(setupMessage.toString())
    }

    @ReactMethod
    fun startRecording(promise: Promise) {
        if (isRecording) {
            promise.reject("ALREADY_RECORDING", "Already recording")
            return
        }

        try {
            audioRecord = AudioRecord(
                MediaRecorder.AudioSource.VOICE_COMMUNICATION,
                AUDIO_SAMPLE_RATE,
                AUDIO_CHANNEL_CONFIG,
                AUDIO_ENCODING,
                AUDIO_BUFFER_SIZE
            )

            if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
                Log.e("Audio", "AudioRecord initialization failed")
                promise.reject("INIT_ERROR", "AudioRecord initialization failed")
                return
            }

            isRecording = true
            isSpeaking = true
            audioRecord?.startRecording()
            Log.d("Audio", "Start Recording")

            recordJob = CoroutineScope(Dispatchers.IO).launch {
                while (isRecording) {
                    val buffer = ShortArray(AUDIO_BUFFER_SIZE)
                    val readSize = audioRecord?.read(buffer, 0, buffer.size)
                    if (readSize != null && readSize > 0) {
                        pcmData.addAll(buffer.take(readSize))
                        if (pcmData.size >= readSize) {
                            sendAudioChunk()
                        }
                    }
                }
            }

            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("RECORDING_ERROR", e)
        }
    }

    private fun sendAudioChunk() {
        if (pcmData.isEmpty()) return
        if (webSocket?.isOpen == false) {
            Log.d("WebSocket", "websocket not open")
            return
        }

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val buffer = ByteBuffer.allocate(pcmData.size * 2).order(ByteOrder.LITTLE_ENDIAN)
                pcmData.forEach { value ->
                    buffer.putShort(value)
                }
                val byteArray = buffer.array()
                val base64 = Base64.encodeToString(byteArray, Base64.DEFAULT or Base64.NO_WRAP)
                Log.d("Audio", "Send Audio Chunk")

                val payload = JSONObject()
                val realtimeInput = JSONObject()
                val mediaChunks = org.json.JSONArray()
                val audioChunk = JSONObject()
                audioChunk.put("mime_type", "audio/pcm")
                audioChunk.put("data", base64)
                mediaChunks.put(audioChunk)
                realtimeInput.put("media_chunks", mediaChunks)
                payload.put("realtime_input", realtimeInput)

                webSocket?.send(payload.toString())
                pcmData.clear()
            } catch (e: Exception) {
                Log.e("Audio", "Error sending audio chunk", e)
            }
        }
    }

    @ReactMethod
    fun stopRecording(promise: Promise) {
        try {
            if (audioRecord == null || audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
                isRecording = false
                isSpeaking = false
                recordJob?.cancel()
                audioRecord = null
                Log.d("Audio", "StopRecording: AudioRecord is null or not initialized, skipping stop/release.")
                promise.resolve(null)
                return
            }
            isRecording = false
            isSpeaking = false
            recordJob?.cancel()
            audioRecord?.stop()
            audioRecord?.release()
            audioRecord = null
            Log.d("Audio", "Stop Recording")

            // Send end of stream message
            val payload = JSONObject()
            val realtimeInput = JSONObject()
            val mediaChunks = org.json.JSONArray()
            realtimeInput.put("media_chunks", mediaChunks)
            payload.put("realtime_input", realtimeInput)
            payload.put("end_of_stream", true)
            webSocket?.send(payload.toString())

            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("STOP_RECORDING_ERROR", e)
        }
    }

    private fun injestAudioChuckToPlay(base64AudioChunk: String?) {
        if (base64AudioChunk == null) return

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val arrayBuffer = Base64.decode(base64AudioChunk, Base64.DEFAULT)
                synchronized(audioQueue) {
                    audioQueue.add(arrayBuffer)
                }
                if (!isPlaying) {
                    playNextAudioChunk()
                }
                Log.d("Audio", "Audio chunk added to the queue")
            } catch (e: Exception) {
                Log.e("Audio", "Error processing chunk", e)
            }
        }
    }

    private fun playNextAudioChunk() {
        CoroutineScope(Dispatchers.IO).launch {
            while (true) {
                val chunk = synchronized(audioQueue) {
                    if (audioQueue.isNotEmpty()) audioQueue.removeAt(0) else null
                } ?: break

                isPlaying = true
                playAudio(chunk)
            }
            isPlaying = false

            synchronized(audioQueue) {
                if (audioQueue.isNotEmpty()) {
                    playNextAudioChunk()
                }
            }
        }
    }

    private fun playAudio(byteArray: ByteArray) {
        if (audioTrack == null) {
            audioTrack = AudioTrack(
                android.media.AudioManager.STREAM_MUSIC,
                AUDIO_SAMPLE_RATE,
                AudioFormat.CHANNEL_OUT_MONO,
                AudioFormat.ENCODING_PCM_16BIT,
                AUDIO_BUFFER_SIZE,
                AudioTrack.MODE_STREAM
            )
        }

        audioTrack?.write(byteArray, 0, byteArray.size)
        audioTrack?.play()
        
        CoroutineScope(Dispatchers.IO).launch {
            while (audioTrack?.playState == AudioTrack.PLAYSTATE_PLAYING) {
                delay(10)
            }
            audioTrack?.stop()
        }
    }

    @ReactMethod
    fun disconnect(promise: Promise) {
        try {
            isRecording = false
            isSpeaking = false
            recordJob?.cancel()
            if (audioRecord != null && audioRecord?.state == AudioRecord.STATE_INITIALIZED) {
                audioRecord?.stop()
                audioRecord?.release()
            }
            audioRecord = null
            audioTrack?.stop()
            audioTrack?.release()
            audioTrack = null
            webSocket?.close()
            webSocket = null
            isConnected = false
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("DISCONNECT_ERROR", e)
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for RN built in Event Emitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for RN built in Event Emitter
    }
} 