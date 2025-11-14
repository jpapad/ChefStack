import React, { useState, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, LiveSession, Modality } from '@google/genai';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';
import { createBlob } from '../../utils/audio';

interface WalkieTalkieButtonProps {
  onTranscriptionComplete: (text: string) => void;
  onRecordingStateChange: (isRecording: boolean) => void;
}

const WalkieTalkieButton: React.FC<WalkieTalkieButtonProps> = ({ onTranscriptionComplete, onRecordingStateChange }) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Refs for audio and API session management
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const transcriptionRef = useRef('');

  const stopRecording = () => {
    onRecordingStateChange(false);
    setIsRecording(false);
    setIsConnecting(false);

    // Stop and cleanup audio processing
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
      mediaStreamSourceRef.current.disconnect();
      mediaStreamSourceRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      inputAudioContextRef.current.close().catch(console.error);
      inputAudioContextRef.current = null;
    }

    // Close Gemini session and send final transcription
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => {
        session.close();
        // Use a short timeout to allow the final transcription message to arrive
        setTimeout(() => {
          if (transcriptionRef.current.trim()) {
            onTranscriptionComplete(transcriptionRef.current.trim());
          }
          transcriptionRef.current = ''; // Reset for next use
        }, 200);
      }).catch(console.error);
      sessionPromiseRef.current = null;
    } else if (transcriptionRef.current.trim()) {
      onTranscriptionComplete(transcriptionRef.current.trim());
      transcriptionRef.current = '';
    }
  };

  const startRecording = async () => {
    if (isRecording || isConnecting) return;
    setIsConnecting(true);
    onRecordingStateChange(true);
    transcriptionRef.current = '';

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported on your browser!');
      }
      if (!process.env.API_KEY) {
        throw new Error("API_KEY is not configured.");
      }
      audioStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          inputAudioTranscription: {},
          responseModalities: [Modality.AUDIO],
        },
        callbacks: {
          onopen: () => {
            console.log('Walkie-talkie session opened.');
            setIsConnecting(false);
            setIsRecording(true);
            
            if (!inputAudioContextRef.current || !audioStreamRef.current) return;

            mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(audioStreamRef.current);
            scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);

            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              }).catch(console.error);
            };

            mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              transcriptionRef.current += message.serverContent.inputTranscription.text;
            }
          },
          onerror: (e) => {
            console.error('Walkie-talkie session error:', e);
            stopRecording();
          },
          onclose: () => {
            // Already handled by stopRecording
          },
        },
      });

    } catch (error: any) {
      console.error('Failed to start recording:', error);
      if (error.message.includes("API_KEY")) {
        alert("Σφάλμα διαμόρφωσης: Το κλειδί API δεν έχει ρυθμιστεί.");
      } else {
        alert('Could not start recording. Please check microphone permissions.');
      }
      stopRecording();
    }
  };

  const handlePress = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    startRecording();
  };

  const handleRelease = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isRecording || isConnecting) {
      stopRecording();
    }
  };
  
  const buttonState = isConnecting ? 'connecting' : isRecording ? 'recording' : 'idle';
  const buttonClasses = {
    idle: 'bg-gray-200 dark:bg-gray-700 text-light-text-secondary dark:text-dark-text-secondary hover:bg-gray-300 dark:hover:bg-gray-600',
    connecting: 'bg-yellow-400 text-brand-dark animate-pulse',
    recording: 'bg-red-600 text-white shadow-lg scale-105 animate-pulse',
  };

  return (
    <button
      onMouseDown={handlePress}
      onMouseUp={handleRelease}
      onTouchStart={handlePress}
      onTouchEnd={handleRelease}
      onMouseLeave={handleRelease}
      className={`p-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-yellow ${buttonClasses[buttonState]}`}
      aria-label={isRecording ? "Recording..." : "Hold to talk"}
    >
      <Icon name="mic" className="w-6 h-6" />
    </button>
  );
};

export default WalkieTalkieButton;
