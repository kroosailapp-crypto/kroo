'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const PRESETS = [1, 2, 3, 5];

function formatTime(seconds) {
  const abs = Math.abs(seconds);
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  return { m: String(m), s: s.toString().padStart(2, '0'), over: seconds < 0 };
}

export default function RaceTimerPage() {
  const [durationMin, setDurationMin] = useState(3);
  const [timeLeft, setTimeLeft] = useState(3 * 60);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);

  const [heading, setHeading] = useState(null);
  const [speed, setSpeed] = useState(null);
  const [orientError, setOrientError] = useState(null);

  const startTimeRef = useRef(null);
  const durationRef = useRef(3 * 60);
  const orientListenerRef = useRef(null);

  useEffect(() => {
    if (!running && !started) {
      durationRef.current = durationMin * 60;
      setTimeLeft(durationMin * 60);
    }
  }, [durationMin, running, started]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTimeLeft(Math.round(durationRef.current - (Date.now() - startTimeRef.current) / 1000));
    }, 100);
    return () => clearInterval(id);
  }, [running]);

  const handleStart = useCallback(() => {
    durationRef.current = durationMin * 60;
    startTimeRef.current = Date.now();
    setTimeLeft(durationMin * 60);
    setRunning(true);
    setStarted(true);
  }, [durationMin]);

  const handleStop = useCallback(() => {
    setRunning(false);
    setStarted(false);
    setTimeLeft(durationMin * 60);
  }, [durationMin]);

  const handleReset = useCallback(() => {
    durationRef.current = durationMin * 60;
    startTimeRef.current = Date.now();
    setTimeLeft(durationMin * 60);
  }, [durationMin]);

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
  const headingDisplay = heading != null ? `${heading}°` : (
    orientError === 'needs-permission' ? '---' : '---'
  );

  const { m, s, over } = formatTime(timeLeft);

  return (
    <div className="fixed inset-0 bg-black flex flex-col" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* HEADING section */}
      <div className="flex-1 flex flex-col items-center justify-center border-b border-white/20 px-4">
        <div className="text-xl font-light tracking-widest uppercase mb-1" style={{ color: '#888888' }}>Heading</div>
        {orientError === 'needs-permission' ? (
          <button onClick={requestCompass} className="text-white/40 text-6xl font-bold underline">
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

      {/* CONTROLS + TIMER + START section */}
      <div className="flex-[2] flex flex-col px-4 pt-3 pb-4">

        {/* Control row: Reset | Count Down | Stop */}
        <div className="flex items-center justify-between mb-2 px-1">
          <button
            onClick={handleReset}
            className="font-bold text-xl tracking-wide active:opacity-60"
            style={{ color: '#22c55e' }}
          >
            Reset
          </button>
          <span className="text-white font-light text-lg tracking-widest">Count Down</span>
          <button
            onClick={handleStop}
            className="text-red-500 font-bold text-xl tracking-wide active:opacity-60"
          >
            Stop
          </button>
        </div>

        {/* Preset minute buttons */}
        <div className="flex justify-around mb-2 px-4">
          {PRESETS.map(m => (
            <button
              key={m}
              onClick={() => { setDurationMin(m); }}
              className={`text-3xl font-bold w-14 h-14 flex items-center justify-center active:opacity-50
                ${durationMin === m ? 'text-kroo-blue' : 'text-white'}`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Timer display */}
        <div className={`flex-1 flex items-center justify-center font-black leading-none
          ${over ? 'text-red-500' : 'text-white'}`}
          style={{ fontSize: 'clamp(100px, 30vw, 200px)' }}>
          <span>{m}</span>
          <span className="mx-1" style={{ fontSize: '60%', marginBottom: '0.05em' }}>•</span>
          <span>{s}</span>
        </div>

        {/* START button */}
        <button
          onClick={handleStart}
          className="w-full py-7 rounded-full bg-kroo-blue text-white font-black tracking-widest active:scale-95 transition-transform"
          style={{ fontSize: 'clamp(48px, 14vw, 80px)' }}
        >
          START
        </button>
      </div>
    </div>
  );
}
