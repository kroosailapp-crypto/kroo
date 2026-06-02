'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { IconSettings, IconLock, IconLockOpen } from '@tabler/icons-react';

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
  oscillator.type = 'square';
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
  const [showStart, setShowStart] = useState(false); // flashing START phase
  const [flashOn, setFlashOn] = useState(true);

  const [heading, setHeading] = useState(null);
  const [speed, setSpeed] = useState(null);
  const [orientError, setOrientError] = useState(null);

  const [showSettings, setShowSettings] = useState(false);
  const [showHeading, setShowHeading] = useState(true);
  const [showSpeed, setShowSpeed] = useState(true);
  const [showTimer, setShowTimer] = useState(true);
  const [locked, setLocked] = useState(false);
  const [unlockProgress, setUnlockProgress] = useState(0);

  const startTimeRef = useRef(null);
  const durationRef = useRef(3 * 60);
  const orientListenerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const beeped = useRef(new Set());
  const showStartTimeout = useRef(null);
  const flashIntervalRef = useRef(null);
  const lockHoldRef = useRef(null);
  const lockProgressRef = useRef(null);

  // Derived layout states
  // - idle:      !started
  // - counting:  started && timeLeft > 0
  // - postStart: started && timeLeft <= 0 (showStart phase + after)
  const isIdle = !started;
  const isCounting = started && timeLeft > 0;
  const isPostStart = started && timeLeft <= 0;

  const ensureAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  const clearStartSequence = () => {
    clearTimeout(showStartTimeout.current);
    clearInterval(flashIntervalRef.current);
    setShowStart(false);
  };

  useEffect(() => {
    if (!running && !started) {
      durationRef.current = durationMin * 60;
      setTimeLeft(durationMin * 60);
    }
  }, [durationMin, running, started]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const t = Math.round(durationRef.current - (Date.now() - startTimeRef.current) / 1000);
      setTimeLeft(t);

      const ac = audioCtxRef.current;
      if (!ac || beeped.current.has(t)) return;
      beeped.current.add(t);

      if (t === 120 || t === 60) {
        createBeep(ac, 1.0, 1400);
      } else if (t === 30) {
        playPattern(ac, [
          { delay: 0,    duration: 0.12 },
          { delay: 0.25, duration: 0.12 },
          { delay: 0.5,  duration: 0.12 },
        ]);
      } else if (t === 20) {
        playPattern(ac, [
          { delay: 0,    duration: 0.12 },
          { delay: 0.25, duration: 0.12 },
        ]);
      } else if (t === 10) {
        createBeep(ac, 0.12, 1400);
      } else if (t >= 1 && t <= 5) {
        createBeep(ac, 0.12, 1600);
      } else if (t === 0) {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            if (audioCtxRef.current) createBeep(audioCtxRef.current, 2.0, 1600);
          }, i * 2500);
        }
        setShowStart(true);
        let on = true;
        flashIntervalRef.current = setInterval(() => { on = !on; setFlashOn(on); }, 400);
        showStartTimeout.current = setTimeout(() => {
          clearInterval(flashIntervalRef.current);
          setShowStart(false);
        }, 12000);
      }
    }, 100);
    return () => clearInterval(id);
  }, [running]);

  const handleStart = useCallback(() => {
    ensureAudio();
    beeped.current = new Set();
    clearStartSequence();
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
    // Keep running=true, started=true so we stay in counting mode
  }, [durationMin]);

  const handleSync = useCallback(() => {
    const current = durationRef.current - (Date.now() - startTimeRef.current) / 1000;
    const snapped = Math.round(current / 60) * 60;
    durationRef.current = snapped;
    startTimeRef.current = Date.now();
    beeped.current = new Set();
    setTimeLeft(snapped);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => setSpeed(pos.coords.speed),
      () => {},
      { enableHighAccuracy: true, maximumAge: 1000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

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

  const startUnlockHold = () => {
    let prog = 0;
    setUnlockProgress(0);
    lockProgressRef.current = setInterval(() => {
      prog += 100 / 20; // reach 100 in 2s (20 steps of 100ms)
      setUnlockProgress(prog);
      if (prog >= 100) {
        clearInterval(lockProgressRef.current);
        setLocked(false);
        setUnlockProgress(0);
      }
    }, 100);
  };

  const cancelUnlockHold = () => {
    clearInterval(lockProgressRef.current);
    setUnlockProgress(0);
  };

  const speedKnots = speed != null && speed >= 0 ? (speed * 1.94384).toFixed(1) : '--';
  const headingDisplay = heading != null ? `${heading}°` : '---';
  const { m, s, over } = formatTime(timeLeft);

  // Font sizes per state
  const sensorFontSize = isCounting
    ? 'clamp(40px, 12vw, 80px)'    // small while counting
    : isPostStart
    ? 'clamp(110px, 36vw, 220px)'  // huge after start
    : 'clamp(80px, 26vw, 160px)';  // normal idle

  const sensorLabelSize = isCounting ? '0.85rem' : '1.25rem';

  // Flex weights
  const sensorFlex = isCounting ? '0 0 auto' : '1';
  const controlsFlex = isCounting ? '1' : isPostStart ? '0 0 auto' : '2';

  return (
    <div className="fixed inset-0 bg-black flex flex-col" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* HEADER */}
      <div className="w-full flex-shrink-0" style={{ backgroundColor: '#02123E' }}>
        <svg width="100%" viewBox="0 0 402 45" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="402" height="45" fill="#02123E"/>
          <g clipPath="url(#clip0_403_4852)">
            <path d="M95.129 7.67037H56.1559C55.748 7.67037 55.3952 7.95261 55.307 8.3495L54.5264 11.8268C54.4051 12.3714 54.8175 12.8874 55.3753 12.8874H94.3485C94.7564 12.8874 95.1092 12.6051 95.1974 12.2082L95.978 8.73097C96.0992 8.18633 95.6869 7.67037 95.129 7.67037Z" fill="#08FF00"/>
            <path d="M25.6588 16.5189L21.3238 20.8054C20.6116 21.5088 19.4121 20.9068 19.551 19.9146L21.1055 8.86096C21.1937 8.23033 20.7042 7.66806 20.0691 7.66806H15.8576C15.335 7.66806 14.894 8.05173 14.8213 8.5699L11.0111 35.678C10.9229 36.3086 11.4124 36.8709 12.0474 36.8709H16.2589C16.7815 36.8709 17.2225 36.4872 17.2953 35.9691L17.9568 31.2702C17.9876 31.0453 18.0935 30.8359 18.2522 30.6749L19.7538 29.1733C20.2566 28.6706 21.1033 28.8051 21.4252 29.4379L24.9201 36.2954C25.0987 36.646 25.4581 36.8665 25.8528 36.8665H30.4679C31.2572 36.8665 31.7622 36.0264 31.3917 35.3296L25.8131 24.8251C25.5838 24.3951 25.683 23.8637 26.0513 23.544L32.3906 18.0513C33.1227 17.4163 32.675 16.2146 31.7049 16.2146H26.3952C26.1196 16.2146 25.855 16.3226 25.6588 16.5167V16.5189Z" fill="white"/>
            <path d="M49.8232 16.1133C49.1793 15.8751 48.4539 15.7561 47.6447 15.7561C46.723 15.7561 45.8013 16.0074 44.8796 16.5124C43.9579 17.0151 43.1619 17.7141 42.4916 18.6071C42.3417 18.8078 42.1697 19.1539 42.1697 19.1539C42.1432 19.2091 42.1234 19.2024 42.1278 19.1429L42.2491 17.3348C42.2887 16.7307 41.8103 16.2191 41.2039 16.2191H37.2834C36.7631 16.2191 36.3199 16.6028 36.2471 17.1187L33.6121 35.6781C33.5217 36.3087 34.0112 36.871 34.6485 36.871H38.8622C39.3826 36.871 39.8236 36.4895 39.8985 35.9736L40.9261 28.8118C40.9349 28.7522 40.9503 28.653 40.9613 28.5935C40.9613 28.5935 41.3671 26.4392 41.7155 25.4337C42.0638 24.4283 42.5754 23.6124 43.2457 22.984C43.916 22.3556 44.7958 22.0425 45.8851 22.0425C46.304 22.0425 46.745 22.1064 47.2037 22.2321C47.6645 22.3556 48.1761 22.6577 48.1761 22.6577C48.229 22.6885 48.2973 22.6709 48.3304 22.6202L51.7724 17.2753C51.8055 17.2246 51.79 17.1562 51.7371 17.1253C51.7371 17.1253 50.4626 16.3514 49.821 16.1133H49.8232Z" fill="white"/>
            <path d="M66.4973 16.9489C65.0861 16.1529 63.4324 15.7538 61.5339 15.7538C59.8294 15.7538 58.2506 16.0692 56.7998 16.6954C55.3467 17.3238 54.0832 18.1992 53.0072 19.3127C51.9334 20.4306 51.0955 21.7161 50.4935 23.167C49.8915 24.6201 49.5917 26.1702 49.5917 27.8173C49.5917 29.6894 49.9908 31.3431 50.7868 32.7807C51.5828 34.2206 52.6853 35.3363 54.0965 36.1323C55.5054 36.9283 57.1482 37.3274 59.018 37.3274C60.6938 37.3274 62.2571 37.0055 63.7102 36.3639C65.1633 35.72 66.4267 34.8402 67.5028 33.7245C68.5766 32.6088 69.4233 31.3166 70.0363 29.8503C70.6515 28.384 70.958 26.8273 70.958 25.178C70.958 23.3081 70.5655 21.6676 69.7849 20.2564C69.0022 18.8474 67.9063 17.7427 66.4951 16.9467L66.4973 16.9489ZM64.3408 27.8217C64.1181 28.5472 63.7896 29.2109 63.3574 29.8106C62.923 30.4126 62.3938 30.8933 61.7654 31.2571C61.137 31.6209 60.4181 31.8017 59.6067 31.8017C58.3212 31.8017 57.3797 31.3475 56.7799 30.4413C56.1802 29.5328 55.8803 28.5075 55.8803 27.3609C55.8803 26.6332 55.9905 25.9144 56.2154 25.2044C56.4381 24.4922 56.7601 23.8351 57.179 23.2354C57.598 22.6334 58.1294 22.1593 58.771 21.8087C59.4127 21.4604 60.1536 21.2862 60.9914 21.2862C62.3056 21.2862 63.2471 21.7249 63.8182 22.6047C64.3915 23.4845 64.6782 24.4988 64.6782 25.641C64.6782 26.3686 64.5657 27.0941 64.343 27.8195L64.3408 27.8217Z" fill="white"/>
            <path d="M92.8116 20.2586C92.0288 18.8496 90.9329 17.7449 89.5217 16.9489C88.1106 16.1529 86.4568 15.7538 84.5583 15.7538C82.8539 15.7538 81.2751 16.0692 79.8242 16.6954C78.3711 17.3238 77.1077 18.1992 76.0316 19.3127C74.9578 20.4306 74.1199 21.7161 73.518 23.167C72.916 24.6201 72.6161 26.1702 72.6161 27.8173C72.6161 29.6894 73.0152 31.3431 73.8112 32.7807C74.6072 34.2206 75.7097 35.3363 77.1209 36.1323C78.5299 36.9283 80.1726 37.3274 82.0424 37.3274C83.7182 37.3274 85.2816 37.0055 86.7346 36.3639C88.1877 35.72 89.4512 34.8402 90.5272 33.7245C91.6011 32.6088 92.4478 31.3166 93.0607 29.8503C93.6759 28.384 93.9824 26.8273 93.9824 25.178C93.9824 23.3081 93.5899 21.6676 92.8094 20.2564L92.8116 20.2586ZM87.3653 27.8217C87.1426 28.5472 86.814 29.2109 86.3818 29.8106C85.9475 30.4126 85.4183 30.8933 84.7898 31.2571C84.1614 31.6209 83.4426 31.8017 82.6312 31.8017C81.3457 31.8017 80.4041 31.3475 79.8044 30.4413C79.2046 29.5328 78.9047 28.5075 78.9047 27.3609C78.9047 26.6332 79.015 25.9144 79.2399 25.2044C79.4626 24.4922 79.7845 23.8351 80.2035 23.2354C80.6224 22.6334 81.1538 22.1593 81.7955 21.8087C82.4371 21.4604 83.178 21.2862 84.0159 21.2862C85.3301 21.2862 86.2716 21.7249 86.8427 22.6047C87.416 23.4845 87.7026 24.4988 87.7026 25.641C87.7026 26.3686 87.5902 27.0941 87.3675 27.8195L87.3653 27.8217Z" fill="white"/>
          </g>
          <path d="M109.463 18.7727L104.776 36.1875H102.88L107.567 18.7727H109.463ZM116.731 34V19.4545H125.751V21.3438H118.925V25.7756H125.104V27.6577H118.925V34H116.731ZM128.279 34V23.0909H130.403V34H128.279ZM129.352 21.4077C128.982 21.4077 128.665 21.2846 128.4 21.0384C128.139 20.7874 128.009 20.4891 128.009 20.1435C128.009 19.7931 128.139 19.4948 128.4 19.2486C128.665 18.9976 128.982 18.8722 129.352 18.8722C129.721 18.8722 130.036 18.9976 130.296 19.2486C130.561 19.4948 130.694 19.7931 130.694 20.1435C130.694 20.4891 130.561 20.7874 130.296 21.0384C130.036 21.2846 129.721 21.4077 129.352 21.4077ZM135.383 27.5227V34H133.26V23.0909H135.298V24.8665H135.433C135.684 24.2888 136.077 23.8248 136.612 23.4744C137.152 23.1241 137.831 22.9489 138.65 22.9489C139.394 22.9489 140.045 23.1051 140.603 23.4176C141.162 23.7254 141.595 24.1847 141.903 24.7955C142.211 25.4062 142.365 26.1615 142.365 27.0611V34H140.241V27.3168C140.241 26.526 140.035 25.9081 139.623 25.4631C139.211 25.0133 138.645 24.7884 137.926 24.7884C137.433 24.7884 136.995 24.8949 136.612 25.108C136.233 25.321 135.932 25.6335 135.71 26.0455C135.492 26.4527 135.383 26.9451 135.383 27.5227ZM149.297 34.2131C148.416 34.2131 147.63 33.9882 146.939 33.5384C146.252 33.0838 145.712 32.4375 145.319 31.5994C144.931 30.7566 144.737 29.7457 144.737 28.5668C144.737 27.3878 144.933 26.3793 145.326 25.5412C145.724 24.7031 146.269 24.0616 146.96 23.6165C147.651 23.1714 148.435 22.9489 149.311 22.9489C149.988 22.9489 150.532 23.0625 150.944 23.2898C151.361 23.5123 151.683 23.7727 151.91 24.071C152.142 24.3693 152.322 24.6321 152.45 24.8594H152.578V19.4545H154.701V34H152.627V32.3026H152.45C152.322 32.5346 152.137 32.7997 151.896 33.098C151.659 33.3963 151.333 33.6567 150.916 33.8793C150.499 34.1018 149.959 34.2131 149.297 34.2131ZM149.765 32.402C150.376 32.402 150.892 32.241 151.314 31.919C151.74 31.5923 152.062 31.1402 152.279 30.5625C152.502 29.9848 152.613 29.3125 152.613 28.5455C152.613 27.7879 152.504 27.125 152.287 26.5568C152.069 25.9886 151.749 25.5459 151.328 25.2287C150.906 24.9115 150.386 24.7528 149.765 24.7528C149.126 24.7528 148.593 24.9186 148.167 25.25C147.741 25.5814 147.419 26.0336 147.201 26.6065C146.988 27.1795 146.882 27.8258 146.882 28.5455C146.882 29.2746 146.991 29.9304 147.208 30.5128C147.426 31.0952 147.748 31.5568 148.174 31.8977C148.605 32.2339 149.136 32.402 149.765 32.402ZM164.368 38.0909C164.05 38.0909 163.761 38.0649 163.501 38.0128C163.241 37.9654 163.047 37.9134 162.919 37.8565L163.43 36.1165C163.818 36.2206 164.164 36.2656 164.467 36.2514C164.77 36.2372 165.038 36.1236 165.27 35.9105C165.506 35.6974 165.715 35.3494 165.895 34.8665L166.157 34.142L162.166 23.0909H164.439L167.201 31.5568H167.315L170.078 23.0909H172.358L167.862 35.456C167.654 36.0241 167.388 36.5047 167.066 36.8977C166.744 37.2955 166.361 37.5938 165.916 37.7926C165.471 37.9915 164.955 38.0909 164.368 38.0909ZM178.577 34.2202C177.555 34.2202 176.662 33.9858 175.9 33.517C175.138 33.0483 174.546 32.3925 174.124 31.5497C173.703 30.7069 173.492 29.7221 173.492 28.5952C173.492 27.4635 173.703 26.474 174.124 25.6264C174.546 24.7789 175.138 24.1207 175.9 23.652C176.662 23.1832 177.555 22.9489 178.577 22.9489C179.6 22.9489 180.493 23.1832 181.255 23.652C182.017 24.1207 182.609 24.7789 183.031 25.6264C183.452 26.474 183.663 27.4635 183.663 28.5952C183.663 29.7221 183.452 30.7069 183.031 31.5497C182.609 32.3925 182.017 33.0483 181.255 33.517C180.493 33.9858 179.6 34.2202 178.577 34.2202ZM178.585 32.4375C179.247 32.4375 179.797 32.2623 180.232 31.9119C180.668 31.5616 180.99 31.0952 181.198 30.5128C181.411 29.9304 181.518 29.2888 181.518 28.5881C181.518 27.892 181.411 27.2528 181.198 26.6705C180.99 26.0833 180.668 25.6122 180.232 25.2571C179.797 24.902 179.247 24.7244 178.585 24.7244C177.917 24.7244 177.363 24.902 176.923 25.2571C176.487 25.6122 176.163 26.0833 175.95 26.6705C175.741 27.2528 175.637 27.892 175.637 28.5881C175.637 29.2888 175.741 29.9304 175.95 30.5128C176.163 31.0952 176.487 31.5616 176.923 31.9119C177.363 32.2623 177.917 32.4375 178.585 32.4375ZM192.944 29.4759V23.0909H195.074V34H192.986V32.1108H192.873C192.622 32.6932 192.219 33.1785 191.665 33.5668C191.116 33.9503 190.432 34.142 189.613 34.142C188.912 34.142 188.292 33.9882 187.752 33.6804C187.217 33.3679 186.795 32.9062 186.488 32.2955C186.185 31.6847 186.033 30.9295 186.033 30.0298V23.0909H188.157V29.7741C188.157 30.5175 188.363 31.1094 188.775 31.5497C189.186 31.9901 189.721 32.2102 190.38 32.2102C190.777 32.2102 191.173 32.1108 191.566 31.9119C191.963 31.7131 192.292 31.4124 192.553 31.0099C192.818 30.6075 192.948 30.0961 192.944 29.4759ZM197.928 34V23.0909H199.98V24.8239H200.094C200.293 24.2367 200.643 23.7751 201.145 23.4389C201.652 23.098 202.224 22.9276 202.864 22.9276C202.996 22.9276 203.152 22.9323 203.332 22.9418C203.517 22.9512 203.661 22.9631 203.766 22.9773V25.0085C203.68 24.9848 203.529 24.9588 203.311 24.9304C203.093 24.8973 202.875 24.8807 202.658 24.8807C202.156 24.8807 201.708 24.9872 201.315 25.2003C200.927 25.4086 200.619 25.6998 200.392 26.0739C200.165 26.4432 200.051 26.8646 200.051 27.3381V34H197.928ZM215.491 34.2202C214.436 34.2202 213.527 33.9811 212.764 33.5028C212.007 33.0199 211.424 32.3546 211.017 31.5071C210.61 30.6596 210.406 29.6889 210.406 28.5952C210.406 27.4872 210.615 26.5095 211.031 25.6619C211.448 24.8097 212.035 24.1444 212.793 23.6662C213.55 23.188 214.443 22.9489 215.47 22.9489C216.299 22.9489 217.037 23.1027 217.686 23.4105C218.335 23.7135 218.858 24.1397 219.256 24.6889C219.658 25.2382 219.897 25.8797 219.973 26.6136H217.906C217.793 26.1023 217.532 25.6619 217.125 25.2926C216.723 24.9233 216.183 24.7386 215.506 24.7386C214.914 24.7386 214.395 24.8949 213.95 25.2074C213.51 25.5152 213.167 25.9555 212.92 26.5284C212.674 27.0966 212.551 27.7689 212.551 28.5455C212.551 29.3409 212.672 30.0275 212.913 30.6051C213.155 31.1828 213.496 31.6302 213.936 31.9474C214.381 32.2647 214.904 32.4233 215.506 32.4233C215.908 32.4233 216.273 32.3499 216.599 32.2031C216.931 32.0516 217.208 31.8362 217.43 31.5568C217.658 31.2775 217.816 30.9413 217.906 30.5483H219.973C219.897 31.2538 219.668 31.8835 219.284 32.4375C218.901 32.9915 218.387 33.4271 217.743 33.7443C217.104 34.0616 216.353 34.2202 215.491 34.2202ZM222.244 34V23.0909H224.297V24.8239H224.41C224.609 24.2367 224.959 23.7751 225.461 23.4389C225.968 23.098 226.541 22.9276 227.18 22.9276C227.313 22.9276 227.469 22.9323 227.649 22.9418C227.833 22.9512 227.978 22.9631 228.082 22.9773V25.0085C227.997 24.9848 227.845 24.9588 227.627 24.9304C227.41 24.8973 227.192 24.8807 226.974 24.8807C226.472 24.8807 226.025 24.9872 225.632 25.2003C225.243 25.4086 224.936 25.6998 224.708 26.0739C224.481 26.4432 224.368 26.8646 224.368 27.3381V34H222.244ZM234.231 34.2202C233.156 34.2202 232.23 33.9905 231.454 33.5312C230.682 33.0672 230.085 32.4162 229.664 31.5781C229.247 30.7353 229.039 29.7481 229.039 28.6165C229.039 27.4991 229.247 26.5142 229.664 25.6619C230.085 24.8097 230.673 24.1444 231.425 23.6662C232.183 23.188 233.068 22.9489 234.082 22.9489C234.697 22.9489 235.294 23.0507 235.871 23.2543C236.449 23.4579 236.968 23.7775 237.427 24.2131C237.886 24.6487 238.248 25.2145 238.513 25.9105C238.779 26.6018 238.911 27.4422 238.911 28.4318V29.1847H230.239V27.5938H236.83C236.83 27.035 236.717 26.5402 236.489 26.1094C236.262 25.6738 235.942 25.3305 235.531 25.0795C235.123 24.8286 234.645 24.7031 234.096 24.7031C233.499 24.7031 232.978 24.8499 232.533 25.1435C232.093 25.4323 231.752 25.8111 231.511 26.2798C231.274 26.7438 231.156 27.2481 231.156 27.7926V29.0355C231.156 29.7647 231.283 30.3849 231.539 30.8963C231.799 31.4077 232.162 31.7983 232.626 32.0682C233.09 32.3333 233.632 32.4659 234.252 32.4659C234.655 32.4659 235.022 32.4091 235.353 32.2955C235.684 32.1771 235.971 32.0019 236.212 31.7699C236.454 31.5379 236.638 31.2514 236.766 30.9105L238.776 31.2727C238.615 31.8646 238.326 32.383 237.91 32.8281C237.498 33.2685 236.979 33.6117 236.354 33.858C235.734 34.0994 235.026 34.2202 234.231 34.2202ZM243.613 34L240.403 23.0909H242.597L244.735 31.1023H244.842L246.987 23.0909H249.181L251.312 31.0668H251.418L253.542 23.0909H255.737L252.533 34H250.367L248.151 26.1236H247.988L245.772 34H243.613ZM257.667 34.1349C257.278 34.1349 256.944 33.9976 256.665 33.723C256.386 33.4437 256.246 33.1075 256.246 32.7145C256.246 32.3262 256.386 31.9948 256.665 31.7202C256.944 31.4408 257.278 31.3011 257.667 31.3011C258.055 31.3011 258.389 31.4408 258.668 31.7202C258.947 31.9948 259.087 32.3262 259.087 32.7145C259.087 32.9749 259.021 33.214 258.888 33.4318C258.76 33.6449 258.59 33.8153 258.377 33.9432C258.164 34.071 257.927 34.1349 257.667 34.1349Z" fill="white"/>
          <path d="M297.907 34H292.751V19.4545H297.949C299.412 19.4545 300.672 19.7457 301.728 20.3281C302.784 20.9058 303.596 21.7367 304.164 22.821C304.737 23.9053 305.023 25.2027 305.023 26.7131C305.023 28.2282 304.737 29.5303 304.164 30.6193C303.596 31.7083 302.779 32.544 301.714 33.1264C300.653 33.7088 299.384 34 297.907 34ZM295.826 31.3651H297.779C298.688 31.3651 299.453 31.2041 300.073 30.8821C300.698 30.5554 301.167 30.0511 301.479 29.3693C301.796 28.6828 301.955 27.7973 301.955 26.7131C301.955 25.6383 301.796 24.7599 301.479 24.0781C301.167 23.3963 300.7 22.8944 300.08 22.5724C299.46 22.2505 298.695 22.0895 297.786 22.0895H295.826V31.3651ZM312.173 34.2131C311.07 34.2131 310.116 33.9787 309.311 33.5099C308.511 33.0365 307.893 32.3783 307.458 31.5355C307.022 30.688 306.804 29.7055 306.804 28.5881C306.804 27.4612 307.022 26.4763 307.458 25.6335C307.893 24.786 308.511 24.1278 309.311 23.6591C310.116 23.1856 311.07 22.9489 312.173 22.9489C313.277 22.9489 314.228 23.1856 315.029 23.6591C315.834 24.1278 316.454 24.786 316.889 25.6335C317.325 26.4763 317.543 27.4612 317.543 28.5881C317.543 29.7055 317.325 30.688 316.889 31.5355C316.454 32.3783 315.834 33.0365 315.029 33.5099C314.228 33.9787 313.277 34.2131 312.173 34.2131ZM312.188 31.8693C312.69 31.8693 313.109 31.7273 313.445 31.4432C313.781 31.1544 314.034 30.7614 314.205 30.2642C314.38 29.767 314.468 29.2012 314.468 28.5668C314.468 27.9323 314.38 27.3665 314.205 26.8693C314.034 26.3722 313.781 25.9792 313.445 25.6903C313.109 25.4015 312.69 25.2571 312.188 25.2571C311.681 25.2571 311.255 25.4015 310.909 25.6903C310.568 25.9792 310.31 26.3722 310.135 26.8693C309.965 27.3665 309.879 27.9323 309.879 28.5668C309.879 29.2012 309.965 29.767 310.135 30.2642C310.31 30.7614 310.568 31.1544 310.909 31.4432C311.255 31.7273 311.681 31.8693 312.188 31.8693ZM321.389 34L318.42 23.0909H321.481L323.171 30.4205H323.271L325.032 23.0909H328.036L329.826 30.3778H329.919L331.58 23.0909H334.634L331.673 34H328.47L326.595 27.1392H326.46L324.585 34H321.389ZM339.274 27.6932V34H336.248V23.0909H339.132V25.0156H339.26C339.501 24.3812 339.906 23.8793 340.474 23.5099C341.042 23.1359 341.731 22.9489 342.541 22.9489C343.299 22.9489 343.959 23.1146 344.523 23.446C345.086 23.7775 345.524 24.2509 345.836 24.8665C346.149 25.4773 346.305 26.2064 346.305 27.054V34H343.28V27.5938C343.284 26.9261 343.114 26.4053 342.768 26.0312C342.423 25.6525 341.947 25.4631 341.341 25.4631C340.934 25.4631 340.574 25.5507 340.261 25.7259C339.953 25.901 339.712 26.1567 339.537 26.4929C339.366 26.8243 339.279 27.2244 339.274 27.6932ZM351.715 19.4545V34H348.69V19.4545H351.715ZM359.068 34.2131C357.965 34.2131 357.011 33.9787 356.206 33.5099C355.406 33.0365 354.788 32.3783 354.352 31.5355C353.916 30.688 353.699 29.7055 353.699 28.5881C353.699 27.4612 353.916 26.4763 354.352 25.6335C354.788 24.786 355.406 24.1278 356.206 23.6591C357.011 23.1856 357.965 22.9489 359.068 22.9489C360.171 22.9489 361.123 23.1856 361.923 23.6591C362.728 24.1278 363.348 24.786 363.784 25.6335C364.22 26.4763 364.437 27.4612 364.437 28.5881C364.437 29.7055 364.22 30.688 363.784 31.5355C363.348 32.3783 362.728 33.0365 361.923 33.5099C361.123 33.9787 360.171 34.2131 359.068 34.2131ZM359.082 31.8693C359.584 31.8693 360.003 31.7273 360.339 31.4432C360.675 31.1544 360.929 30.7614 361.099 30.2642C361.274 29.767 361.362 29.2012 361.362 28.5668C361.362 27.9323 361.274 27.3665 361.099 26.8693C360.929 26.3722 360.675 25.9792 360.339 25.6903C360.003 25.4015 359.584 25.2571 359.082 25.2571C358.576 25.2571 358.149 25.4015 357.804 25.6903C357.463 25.9792 357.205 26.3722 357.03 26.8693C356.859 27.3665 356.774 27.9323 356.774 28.5668C356.774 29.2012 356.859 29.767 357.03 30.2642C357.205 30.7614 357.463 31.1544 357.804 31.4432C358.149 31.7273 358.576 31.8693 359.082 31.8693ZM369.515 34.206C368.819 34.206 368.199 34.0852 367.655 33.8438C367.11 33.5975 366.679 33.2353 366.362 32.7571C366.05 32.2741 365.893 31.6728 365.893 30.9531C365.893 30.3471 366.005 29.8381 366.227 29.4261C366.45 29.0142 366.753 28.6828 367.136 28.4318C367.52 28.1809 367.955 27.9915 368.443 27.8636C368.935 27.7358 369.452 27.6458 369.991 27.5938C370.626 27.5275 371.137 27.4659 371.525 27.4091C371.914 27.3475 372.195 27.2576 372.371 27.1392C372.546 27.0208 372.633 26.8456 372.633 26.6136V26.571C372.633 26.1212 372.491 25.7732 372.207 25.527C371.928 25.2808 371.53 25.1577 371.014 25.1577C370.47 25.1577 370.036 25.2784 369.714 25.5199C369.392 25.7566 369.179 26.0549 369.075 26.4148L366.277 26.1875C366.419 25.5246 366.698 24.9517 367.115 24.4688C367.532 23.9811 368.069 23.607 368.727 23.3466C369.39 23.0814 370.157 22.9489 371.028 22.9489C371.634 22.9489 372.214 23.0199 372.768 23.1619C373.327 23.304 373.822 23.5241 374.253 23.8224C374.688 24.1207 375.032 24.5043 375.282 24.973C375.533 25.437 375.659 25.9934 375.659 26.642V34H372.79V32.4872H372.704C372.529 32.8281 372.295 33.1288 372.001 33.3892C371.708 33.6449 371.355 33.8461 370.943 33.9929C370.531 34.1349 370.055 34.206 369.515 34.206ZM370.382 32.1179C370.827 32.1179 371.22 32.0303 371.561 31.8551C371.902 31.6752 372.169 31.4337 372.363 31.1307C372.558 30.8277 372.655 30.4844 372.655 30.1009V28.9432C372.56 29.0047 372.43 29.0616 372.264 29.1136C372.103 29.161 371.921 29.206 371.717 29.2486C371.514 29.2865 371.31 29.322 371.106 29.3551C370.903 29.3835 370.718 29.4096 370.552 29.4332C370.197 29.4853 369.887 29.5682 369.622 29.6818C369.357 29.7955 369.151 29.9493 369.004 30.1435C368.857 30.3329 368.784 30.5696 368.784 30.8537C368.784 31.2656 368.933 31.5805 369.231 31.7983C369.534 32.0114 369.918 32.1179 370.382 32.1179ZM382.026 34.1776C381.198 34.1776 380.447 33.9645 379.775 33.5384C379.107 33.1075 378.577 32.4754 378.184 31.642C377.796 30.804 377.601 29.7765 377.601 28.5597C377.601 27.3097 377.803 26.2704 378.205 25.4418C378.608 24.6084 379.143 23.9858 379.81 23.5739C380.483 23.1572 381.219 22.9489 382.019 22.9489C382.63 22.9489 383.139 23.053 383.546 23.2614C383.958 23.465 384.289 23.7206 384.54 24.0284C384.796 24.3314 384.99 24.6297 385.123 24.9233H385.215V19.4545H388.233V34H385.251V32.2528H385.123C384.981 32.5559 384.779 32.8565 384.519 33.1548C384.263 33.4484 383.93 33.6922 383.518 33.8864C383.11 34.0805 382.613 34.1776 382.026 34.1776ZM382.985 31.7699C383.473 31.7699 383.885 31.6373 384.221 31.3722C384.562 31.1023 384.822 30.7259 385.002 30.2429C385.187 29.7599 385.279 29.1941 385.279 28.5455C385.279 27.8968 385.189 27.3333 385.009 26.8551C384.829 26.3769 384.569 26.0076 384.228 25.7472C383.887 25.4867 383.473 25.3565 382.985 25.3565C382.488 25.3565 382.069 25.4915 381.728 25.7614C381.387 26.0312 381.129 26.4053 380.954 26.8835C380.778 27.3617 380.691 27.9157 380.691 28.5455C380.691 29.1799 380.778 29.741 380.954 30.2287C381.134 30.7116 381.392 31.0904 381.728 31.3651C382.069 31.6349 382.488 31.7699 382.985 31.7699Z" fill="#0161F0"/>
          <defs>
            <clipPath id="clip0_403_4852">
              <rect width="85" height="29.6593" fill="white" transform="translate(11 7.67037)"/>
            </clipPath>
          </defs>
        </svg>
      </div>

      {/* HEADING */}
      {showHeading && <div
        className="flex flex-col items-center justify-center border-b border-white/20 px-4 transition-all duration-300"
        style={{ flex: sensorFlex, paddingTop: isCounting ? '6px' : '12px', paddingBottom: isCounting ? '6px' : '12px' }}
      >
        <div className="font-light tracking-widest uppercase" style={{ color: '#888888', fontSize: sensorLabelSize }}>Heading</div>
        {orientError === 'needs-permission' ? (
          <button onClick={requestCompass} className="font-bold underline" style={{ color: '#555', fontSize: sensorFontSize }}>
            {headingDisplay}
          </button>
        ) : (
          <div className="text-white font-bold leading-none" style={{ fontSize: sensorFontSize }}>
            {headingDisplay}
          </div>
        )}
      </div>}

      {/* SPEED */}
      {showSpeed && <div
        className="flex flex-col items-center justify-center border-b border-white/20 px-4 transition-all duration-300"
        style={{ flex: sensorFlex, paddingTop: isCounting ? '6px' : '12px', paddingBottom: isCounting ? '6px' : '12px' }}
      >
        <div className="font-light tracking-widest uppercase" style={{ color: '#888888', fontSize: sensorLabelSize }}>Speed</div>
        <div className="text-white font-bold leading-none" style={{ fontSize: sensorFontSize }}>
          {speedKnots}
        </div>
      </div>}

      {/* CONTROLS + TIMER + BUTTON */}
      {showTimer && <div
        className="flex flex-col px-4 pt-3 pb-2 transition-all duration-300"
        style={{ flex: controlsFlex }}
      >
        {/* Control row: always visible */}
        <div className="flex items-center justify-between mb-2 px-1">
          <button onClick={handleReset} className="font-bold text-xl tracking-wide active:opacity-60" style={{ color: '#22c55e' }}>
            Reset
          </button>
          <span className="text-white font-light text-lg tracking-widest">Count Down</span>
          <button onClick={handleStop} className="text-red-500 font-bold text-xl tracking-wide active:opacity-60">
            Stop
          </button>
        </div>

        {/* Preset buttons — idle only */}
        {isIdle && (
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
        )}

        {/* Timer display or flashing START */}
        <div className="flex-1 flex items-center justify-center font-black leading-none">
            {showStart ? (
              <span style={{ color: flashOn ? '#ffffff' : '#000000', fontSize: 'clamp(80px, 24vw, 180px)' }}>
                START
              </span>
            ) : (
              <span style={{
                display: 'flex', alignItems: 'center',
                color: over ? '#ef4444' : '#ffffff',
                fontSize: isPostStart
                  ? 'clamp(70px, 20vw, 130px)'
                  : 'clamp(130px, 39vw, 260px)',
              }}>
                <span>{m}</span>
                <span style={{ fontSize: '60%', margin: '0 4px', paddingBottom: '0.05em' }}>•</span>
                <span>{s}</span>
              </span>
            )}
          </div>

        {/* START / SYNC button — above the bottom bar */}
        {isIdle && (
          <button
            onClick={handleStart}
            className="w-full rounded-full bg-kroo-blue text-white font-black tracking-widest active:scale-95 transition-transform mb-2"
            style={{ fontSize: 'clamp(48px, 14vw, 80px)', paddingTop: '1.2rem', paddingBottom: '1.2rem' }}
          >
            START
          </button>
        )}
        {isCounting && (
          <button
            onClick={handleSync}
            className="w-full rounded-full font-black tracking-widest active:scale-95 transition-transform mb-2"
            style={{ fontSize: 'clamp(48px, 14vw, 80px)', paddingTop: '1.2rem', paddingBottom: '1.2rem', backgroundColor: '#f59e0b', color: '#000' }}
          >
            SYNC
          </button>
        )}
      </div>}

      {/* BOTTOM BAR */}
      <div className="flex-shrink-0 flex items-center justify-between px-8 pb-6 pt-2">
        <button
          onClick={() => setShowSettings(true)}
          className="p-3 rounded-full active:opacity-60"
          style={{ color: '#888' }}
        >
          <IconSettings size={32} stroke={1.5} />
        </button>
        <button
          onClick={() => setLocked(true)}
          className="p-3 rounded-full active:opacity-60"
          style={{ color: '#888' }}
        >
          <IconLock size={32} stroke={1.5} />
        </button>
      </div>

      {/* SETTINGS PANEL */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowSettings(false)}>
          <div
            className="w-full rounded-t-3xl p-8 pb-12"
            style={{ backgroundColor: '#111' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1 rounded-full bg-white/20 mx-auto mb-6" />
            <div className="text-white font-bold text-2xl mb-6 tracking-wide">Display Settings</div>
            {[
              { label: 'Heading', value: showHeading, set: setShowHeading },
              { label: 'Speed',   value: showSpeed,   set: setShowSpeed   },
              { label: 'Timer',   value: showTimer,   set: setShowTimer   },
            ].map(({ label, value, set }) => (
              <div key={label} className="flex items-center justify-between py-4 border-b border-white/10">
                <span className="text-white text-xl">{label}</span>
                <button
                  onClick={() => set(v => !v)}
                  className="w-14 h-8 rounded-full transition-colors relative"
                  style={{ backgroundColor: value ? '#0161f0' : '#333' }}
                >
                  <span
                    className="absolute top-1 w-6 h-6 bg-white rounded-full transition-all"
                    style={{ left: value ? '2rem' : '0.125rem' }}
                  />
                </button>
              </div>
            ))}
            <button
              onClick={() => setShowSettings(false)}
              className="mt-8 w-full py-4 rounded-full text-white font-bold text-xl"
              style={{ backgroundColor: '#222' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* LOCK OVERLAY */}
      {locked && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
          onTouchStart={startUnlockHold}
          onTouchEnd={cancelUnlockHold}
          onMouseDown={startUnlockHold}
          onMouseUp={cancelUnlockHold}
          onMouseLeave={cancelUnlockHold}
        >
          <IconLockOpen size={64} stroke={1.2} color="#888" />
          <div className="text-white/50 text-lg mt-4 mb-8">Hold to unlock</div>
          {/* Progress ring */}
          <svg width="80" height="80" className="absolute" style={{ opacity: unlockProgress > 0 ? 1 : 0 }}>
            <circle cx="40" cy="40" r="36" fill="none" stroke="#0161f0" strokeWidth="4"
              strokeDasharray={`${(unlockProgress / 100) * 226} 226`}
              strokeLinecap="round"
              transform="rotate(-90 40 40)" />
          </svg>
        </div>
      )}
    </div>
  );
}
