'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const PRESETS = [1, 2, 3, 5];

function formatTime(seconds) {
  const abs = Math.abs(seconds);
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  return { m: String(m), s: s.toString().padStart(2, '0'), over: seconds < 0 };
}

function createBeep(audioCtx, duration, frequency = 1400, volume = 2.5) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.type = 'square'; // louder, more piercing than sine
  oscillator.frequency.value = frequency;
  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + duration);
}

function playPattern(audioCtx, pattern) {
  pattern.forEach(({ delay, duration, freq = 1400 }) => {
    setTimeout(() => createBeep(audioCtx, duration, freq), delay * 1000);
  });
}

export default function RaceTimerPage() {
  const [durationMin, setDurationMin] = useState(3);
  const [timeLeft, setTimeLeft] = useState(3 * 60);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [showStart, setShowStart] = useState(false);
  const [flashOn, setFlashOn] = useState(true);

  const [heading, setHeading] = useState(null);
  const [speed, setSpeed] = useState(null);
  const [orientError, setOrientError] = useState(null);

  const startTimeRef = useRef(null);
  const durationRef = useRef(3 * 60);
  const orientListenerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const beeped = useRef(new Set());
  const showStartTimeout = useRef(null);
  const flashIntervalRef = useRef(null);
  const startBeepIntervalRef = useRef(null);

  const ensureAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const clearStartSequence = () => {
    clearTimeout(showStartTimeout.current);
    clearInterval(flashIntervalRef.current);
    clearInterval(startBeepIntervalRef.current);
    setShowStart(false);
  };

  useEffect(() => {
    if (!running && !started) {
      durationRef.current = durationMin * 60;
      setTimeLeft(durationMin * 60);
    }
  }, [durationMin, running, started]);

  // Main countdown + beep logic
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const t = Math.round(durationRef.current - (Date.now() - startTimeRef.current) / 1000);
      setTimeLeft(t);

      const ac = audioCtxRef.current;
      if (!ac) return;

      if (beeped.current.has(t)) return;
      beeped.current.add(t);

      if (t === 120 || t === 60) {
        createBeep(ac, 1.0, 1400);
      } else if (t === 30) {
        playPattern(ac, [
          { delay: 0,   duration: 0.12 },
          { delay: 0.25, duration: 0.12 },
          { delay: 0.5, duration: 0.12 },
        ]);
      } else if (t === 20) {
        playPattern(ac, [
          { delay: 0,   duration: 0.12 },
          { delay: 0.25, duration: 0.12 },
        ]);
      } else if (t === 10) {
        createBeep(ac, 0.12, 1400);
      } else if (t >= 1 && t <= 5) {
        createBeep(ac, 0.12, 1600);
      } else if (t === 0) {
        // long 3-second beep
        createBeep(ac, 3.0, 1600);
        // flashing START
        setShowStart(true);
        let on = true;
        flashIntervalRef.current = setInterval(() => {
          on = !on;
          setFlashOn(on);
        }, 400);
        // beep every 1.5s during the START flash
        startBeepIntervalRef.current = setInterval(() => {
          if (audioCtxRef.current) createBeep(audioCtxRef.current, 0.2, 1600);
        }, 1500);
        // stop after 10s
        showStartTimeout.current = setTimeout(() => {
          clearInterval(flashIntervalRef.current);
          clearInterval(startBeepIntervalRef.current);
          setShowStart(false);
        }, 10000);
      }
    }, 100);
    return () => clearInterval(id);
  }, [running]);

  const handleStart = useCallback(() => {
    ensureAudio();
    beeped.current = new Set();
    clearStartSequence();
    // Reset timer to selected duration and begin
    durationRef.current = durationMin * 60;
    startTimeRef.current = Date.now();
    setTimeLeft(durationMin * 60);
    setRunning(true);
    setStarted(true);
  }, [durationMin]);

  const handleStop = useCallback(() => {
    setRunning(false);
    setStarted(false);
    clearStartSequence();
    setTimeLeft(durationMin * 60);
    beeped.current = new Set();
  }, [durationMin]);

  const handleReset = useCallback(() => {
    ensureAudio();
    beeped.current = new Set();
    clearStartSequence();
    durationRef.current = durationMin * 60;
    startTimeRef.current = Date.now();
    setTimeLeft(durationMin * 60);
  }, [durationMin]);

  // Sync: snap display to the nearest whole minute, keep counting from there
  const handleSync = useCallback(() => {
    // How many seconds are left right now?
    const current = durationRef.current - (Date.now() - startTimeRef.current) / 1000;
    // Round to nearest minute
    const snapped = Math.round(current / 60) * 60;
    // From now, count down from `snapped` seconds
    durationRef.current = snapped;
    startTimeRef.current = Date.now();
    beeped.current = new Set();
    setTimeLeft(snapped);
  }, []);

  // Geolocation speed
  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => setSpeed(pos.coords.speed),
      () => {},
      { enableHighAccuracy: true, maximumAge: 1000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // Compass
  useEffect(() => {
    const handler = (e) => {
      if (e.webkitCompassHeading != null) setHeading(Math.round(e.webkitCompassHeading));
      else if (e.alpha != null) setHeading(Math.round((360 - e.alpha) % 360));
    };
    orientListenerRef.current = handler;

    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      setOrientError('needs-permission');
    } else if (typeof DeviceOrientationEvent !== 'undefined') {
      window.addEventListener('deviceorientation', handler, true);
    }
    return () => window.removeEventListener('deviceorientation', handler, true);
  }, []);

  const requestCompass = async () => {
    try {
      const res = await DeviceOrientationEvent.requestPermission();
      if (res === 'granted') {
        setOrientError(null);
        window.addEventListener('deviceorientation', orientListenerRef.current, true);
      }
    } catch {}
  };

  const speedKnots = speed != null && speed >= 0 ? (speed * 1.94384).toFixed(1) : '--';
  const headingDisplay = heading != null ? `${heading}°` : '---';
  const { m, s, over } = formatTime(timeLeft);

  return (
    <div className="fixed inset-0 bg-black flex flex-col" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* HEADING section */}
      <div className="flex-1 flex flex-col items-center justify-center border-b border-white/20 px-4">
        <div className="text-xl font-light tracking-widest uppercase mb-1" style={{ color: '#888888' }}>Heading</div>
        {orientError === 'needs-permission' ? (
          <button onClick={requestCompass} className="font-bold underline" style={{ color: '#555', fontSize: 'clamp(80px, 26vw, 160px)' }}>
            {headingDisplay}
          </button>
        ) : (
          <div className="text-white font-bold leading-none" style={{ fontSize: 'clamp(80px, 26vw, 160px)' }}>
            {headingDisplay}
          </div>
        )}
      </div>

      {/* SPEED section */}
      <div className="flex-1 flex flex-col items-center justify-center border-b border-white/20 px-4">
        <div className="text-xl font-light tracking-widest uppercase mb-1" style={{ color: '#888888' }}>Speed</div>
        <div className="text-white font-bold leading-none" style={{ fontSize: 'clamp(80px, 26vw, 160px)' }}>
          {speedKnots}
        </div>
      </div>

      {/* CONTROLS + TIMER + BUTTON section */}
      <div className="flex-[2] flex flex-col px-4 pt-3 pb-4">

        {/* Control row */}
        <div className="flex items-center justify-between mb-2 px-1">
          <button onClick={handleReset} className="font-bold text-xl tracking-wide active:opacity-60" style={{ color: '#22c55e' }}>
            Reset
          </button>
          <span className="text-white font-light text-lg tracking-widest">Count Down</span>
          <button onClick={handleStop} className="text-red-500 font-bold text-xl tracking-wide active:opacity-60">
            Stop
          </button>
        </div>

        {/* Preset minute buttons */}
        <div className="flex justify-around mb-2 px-4">
          {PRESETS.map(n => (
            <button
              key={n}
              onClick={() => setDurationMin(n)}
              className={`text-3xl font-bold w-14 h-14 flex items-center justify-center active:opacity-50
                ${durationMin === n ? 'text-kroo-blue' : 'text-white'}`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Timer display or flashing START */}
        <div className="flex-1 flex items-center justify-center font-black leading-none">
          {showStart ? (
            <span style={{ color: flashOn ? '#ffffff' : '#000000', fontSize: 'clamp(80px, 24vw, 180px)' }}>
              START
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', fontSize: 'clamp(130px, 39vw, 260px)', color: over ? '#ef4444' : '#ffffff' }}>
              <span>{m}</span>
              <span style={{ fontSize: '60%', margin: '0 4px', paddingBottom: '0.05em' }}>•</span>
              <span>{s}</span>
            </span>
          )}
        </div>

        {/* START / SYNC button */}
        {running ? (
          <button
            onClick={handleSync}
            className="w-full py-7 rounded-full font-black tracking-widest active:scale-95 transition-transform"
            style={{ fontSize: 'clamp(48px, 14vw, 80px)', backgroundColor: '#f59e0b', color: '#000' }}
          >
            SYNC
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="w-full py-7 rounded-full bg-kroo-blue text-white font-black tracking-widest active:scale-95 transition-transform"
            style={{ fontSize: 'clamp(48px, 14vw, 80px)' }}
          >
            START
          </button>
        )}
      </div>
    </div>
  );
}
