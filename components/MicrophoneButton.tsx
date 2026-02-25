'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface MicrophoneButtonProps {
  transcript: string;
  onTranscriptChange: (value: string) => void;
}

type RecordingState = 'idle' | 'recording' | 'transcribing';

/** Pick the best supported MIME type for MediaRecorder */
function bestMimeType(): string {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? '';
}

/** Format seconds as M:SS */
function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, '0')}`;
}

export default function MicrophoneButton({
  transcript,
  onTranscriptChange,
}: MicrophoneButtonProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const sendAudio = useCallback(
    async (blob: Blob) => {
      setState('transcribing');
      setError(null);

      try {
        const mimeType = blob.type || 'audio/webm';
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const formData = new FormData();
        formData.append('audio', blob, `recording.${ext}`);

        const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Transcription failed.');

        if (data.text) {
          const separator = transcript ? ' ' : '';
          onTranscriptChange(transcript + separator + data.text);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Transcription failed. Please try again.');
      } finally {
        setState('idle');
      }
    },
    [transcript, onTranscriptChange]
  );

  const startRecording = useCallback(async () => {
    setError(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = bestMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        chunksRef.current = [];
        sendAudio(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setState('recording');
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (err) {
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError('Microphone access was denied. Please allow microphone permissions and try again.');
      } else {
        setError('Could not access microphone. Please check your device settings.');
      }
    }
  }, [sendAudio]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // Hold-to-record: prevent accidental/abusive toggling
  const handlePressStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (state === 'idle') startRecording();
  };

  const handlePressEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (state === 'recording') stopRecording();
  };

  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-5">
      {/* Microphone Button */}
      <div className="flex flex-col items-center gap-4 py-2">
        <motion.button
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={state === 'recording' ? handlePressEnd : undefined}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          disabled={state === 'transcribing'}
          whileTap={state !== 'transcribing' ? { scale: 0.92 } : undefined}
          whileHover={state !== 'transcribing' ? { scale: 1.06 } : undefined}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className={[
            'relative w-24 h-24 rounded-full flex items-center justify-center',
            'shadow-xl transition-colors duration-200 select-none',
            'focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2',
            state === 'recording'
              ? 'bg-red-500 animate-mic-pulse focus-visible:ring-red-300'
              : state === 'transcribing'
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary hover:bg-blue-600 focus-visible:ring-blue-300',
          ].join(' ')}
          aria-label={
            state === 'recording' ? 'Release to stop recording'
            : state === 'transcribing' ? 'Transcribing…'
            : 'Hold to record'
          }
        >
          {state === 'transcribing' ? (
            <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </motion.button>

        {/* Status indicator */}
        <AnimatePresence mode="wait">
          {state === 'recording' ? (
            <motion.div
              key="recording"
              initial={{ opacity: 0, scale: 0.85, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 4 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-1"
            >
              <Badge className="bg-red-500 text-white hover:bg-red-500 gap-1.5 px-3 py-1 text-xs">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Recording · {formatTime(seconds)}
              </Badge>
              <p className="text-xs text-gray-400">Release to stop</p>
            </motion.div>
          ) : state === 'transcribing' ? (
            <motion.div
              key="transcribing"
              initial={{ opacity: 0, scale: 0.85, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 4 }}
              transition={{ duration: 0.2 }}
            >
              <Badge className="bg-gray-500 text-white hover:bg-gray-500 gap-1.5 px-3 py-1 text-xs">
                Transcribing…
              </Badge>
            </motion.div>
          ) : (
            <motion.p
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-gray-500 text-center"
            >
              Hold the mic to record your project description
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Error display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-red-600 text-center px-4 py-2.5 bg-red-50 border border-red-100 rounded-lg">
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcript textarea */}
      <div className="space-y-2">
        <Label htmlFor="transcript" className="text-sm font-semibold text-gray-700">
          Voice Transcript{' '}
          <span className="font-normal text-gray-400">(editable)</span>
        </Label>
        <Textarea
          id="transcript"
          value={transcript}
          onChange={(e) => onTranscriptChange(e.target.value)}
          placeholder="Your voice transcript appears here after recording. You can also type directly or edit the text."
          className="min-h-[140px] resize-none text-sm leading-relaxed"
        />
        <p className="text-xs text-gray-400">
          {wordCount > 0 ? `${wordCount} word${wordCount === 1 ? '' : 's'} recorded` : 'No transcript yet'}
        </p>
      </div>
    </div>
  );
}
