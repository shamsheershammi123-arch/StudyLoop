'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

export type AmbientSoundType = 'none' | 'whitenoise' | 'rain' | 'cafe';

export function AmbientAudio() {
  const [sound, setSound] = useState<AmbientSoundType>('none');
  const [volume, setVolume] = useState<number>(0.25);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioNode | null>(null);

  const stopCurrentSound = () => {
    if (sourceNodeRef.current) {
      try {
        (sourceNodeRef.current as any).stop?.();
        sourceNodeRef.current.disconnect();
      } catch (e) {}
      sourceNodeRef.current = null;
    }
  };

  const startSound = (type: AmbientSoundType) => {
    stopCurrentSound();
    if (type === 'none') return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Master Gain
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.connect(ctx.destination);
      gainNodeRef.current = gainNode;

      // 5 seconds buffer loop
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      if (type === 'whitenoise') {
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;

        // Gentle low-pass filter to make it soft brownian/pink noise
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        whiteNoise.start();
        sourceNodeRef.current = whiteNoise;
      } else if (type === 'rain') {
        // Rain simulator: pink noise + bandpass
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          data[i] = (b0 + b1 + b2) * 0.3;
        }
        const rainSource = ctx.createBufferSource();
        rainSource.buffer = buffer;
        rainSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);

        rainSource.connect(filter);
        filter.connect(gainNode);
        rainSource.start();
        sourceNodeRef.current = rainSource;
      } else if (type === 'cafe') {
        // Warm cafe hum (low resonance)
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.2;
        }
        const cafeSource = ctx.createBufferSource();
        cafeSource.buffer = buffer;
        cafeSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(350, ctx.currentTime);
        filter.Q.setValueAtTime(1.5, ctx.currentTime);

        cafeSource.connect(filter);
        filter.connect(gainNode);
        cafeSource.start();
        sourceNodeRef.current = cafeSource;
      }
    } catch (e) {
      console.warn('Could not start ambient sound:', e);
    }
  };

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      stopCurrentSound();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try {
          audioCtxRef.current.close();
        } catch (e) {}
      }
    };
  }, []);

  const handleSelectSound = (newSound: AmbientSoundType) => {
    if (sound === newSound) {
      setSound('none');
      stopCurrentSound();
    } else {
      setSound(newSound);
      startSound(newSound);
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
      <div className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400 px-1">
        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
        <span>Soundscape:</span>
      </div>

      <button
        onClick={() => handleSelectSound('rain')}
        className={`px-2 py-1 rounded transition-colors ${
          sound === 'rain'
            ? 'bg-emerald-500 text-white font-medium'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
      >
        Rain
      </button>

      <button
        onClick={() => handleSelectSound('whitenoise')}
        className={`px-2 py-1 rounded transition-colors ${
          sound === 'whitenoise'
            ? 'bg-emerald-500 text-white font-medium'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
      >
        Pink Noise
      </button>

      <button
        onClick={() => handleSelectSound('cafe')}
        className={`px-2 py-1 rounded transition-colors ${
          sound === 'cafe'
            ? 'bg-emerald-500 text-white font-medium'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
      >
        Cafe Hum
      </button>

      {sound !== 'none' && (
        <button
          onClick={() => {
            setSound('none');
            stopCurrentSound();
          }}
          className="text-rose-500 hover:text-rose-600 p-1"
          title="Turn off sound"
        >
          <VolumeX className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

