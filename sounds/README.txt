SOUNDS FOLDER
=============

Place your audio files here.

Required file:
- crt-hum.mp3 (or .wav, .ogg) - Looping ambient CRT/terminal hum sound

The ambient sound is configured to:
- Loop seamlessly using Web Audio API (no gaps between loops)
- Play at 30% volume (adjustable in script.js line 33)
- Start automatically when the page loads

If you use a different file format (like .wav or .ogg), update the file path in:
- script.js line 37

You can adjust the volume by changing the value in script.js line 33:
gainNode.gain.value = 0.3;  // 0.0 (silent) to 1.0 (full volume)

For best results, make sure your audio file is trimmed with no silence at the
beginning or end. The Web Audio API will loop it perfectly seamlessly.
