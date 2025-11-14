import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAIBlob, LiveSession } from '@google/genai';
import { User, CallStatus } from '../../types';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';
import { decode, decodeAudioData, createBlob } from '../../utils/audio';

interface CallViewProps {
  currentUser: User;
  targetUserId: string;
  allUsers: User[];
  onEndCall: () => void;
}

interface TranscriptionTurn {
    id: string;
    speaker: 'user' | 'model';
    text: string;
}

const CallView: React.FC<CallViewProps> = ({ currentUser, targetUserId, allUsers, onEndCall }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<CallStatus>('calling');
  const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionTurn[]>([]);
  const [currentTranscription, setCurrentTranscription] = useState<{ user: string; model: string }>({ user: '', model: '' });

  const targetUser = allUsers.find(u => u.id === targetUserId);

  // Fix: Initialized useRef with null for type safety and to follow React best practices.
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const outputSourcesRef = useRef(new Set<AudioBufferSourceNode>());

  useEffect(() => {
    const initializeCall = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('getUserMedia not supported on your browser!');
        }
        if (!process.env.API_KEY) {
            throw new Error("API_KEY is not configured.");
        }
        audioStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        sessionPromiseRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                inputAudioTranscription: {},
                outputAudioTranscription: {},
            },
            callbacks: {
                onopen: () => {
                    console.log('Live session opened.');
                    setStatus('connected');
                    if (!inputAudioContextRef.current || !audioStreamRef.current) return;

                    mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(audioStreamRef.current);
                    scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);

                    scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        sessionPromiseRef.current?.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    
                    mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                    scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.inputTranscription) {
                        setCurrentTranscription(prev => ({...prev, user: prev.user + message.serverContent.inputTranscription.text}));
                    }
                    if (message.serverContent?.outputTranscription) {
                        setCurrentTranscription(prev => ({...prev, model: prev.model + message.serverContent.outputTranscription.text}));
                    }

                    if (message.serverContent?.turnComplete) {
                        setTranscriptionHistory(prev => [
                            ...prev,
                            { id: `turn-${Date.now()}-user`, speaker: 'user', text: currentTranscription.user },
                            { id: `turn-${Date.now()}-model`, speaker: 'model', text: currentTranscription.model },
                        ]);
                        setCurrentTranscription({ user: '', model: '' });
                    }

                    const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (audioData && outputAudioContextRef.current) {
                        const outputCtx = outputAudioContextRef.current;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                        const audioBuffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
                        const source = outputCtx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputCtx.destination);
                        source.addEventListener('ended', () => {
                          outputSourcesRef.current.delete(source);
                        });
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        outputSourcesRef.current.add(source);
                    }
                },
                onerror: (e) => {
                    console.error('Live session error:', e);
                    setStatus('error');
                },
                onclose: () => {
                    console.log('Live session closed.');
                    setStatus('ended');
                },
            },
        });

      } catch (error: any) {
        console.error('Failed to initialize call:', error);
        if (error.message.includes("API_KEY")) {
            alert("Σφάλμα διαμόρφωσης: Το κλειδί API δεν έχει ρυθμιστεί. Η λειτουργία κλήσης δεν είναι διαθέσιμη.");
        }
        setStatus('error');
      }
    };

    initializeCall();

    return () => {
        // Cleanup function
        sessionPromiseRef.current?.then(session => session.close());
        audioStreamRef.current?.getTracks().forEach(track => track.stop());
        scriptProcessorRef.current?.disconnect();
        mediaStreamSourceRef.current?.disconnect();
        inputAudioContextRef.current?.close();
        outputAudioContextRef.current?.close();
        outputSourcesRef.current.forEach(source => source.stop());
        outputSourcesRef.current.clear();
    };
  }, []);

  const getStatusText = () => {
      switch(status) {
          case 'calling': return t('call_status_calling');
          case 'connected': return t('call_status_connected');
          case 'ended': return t('call_status_ended');
          case 'error': return t('call_status_error');
          default: return '';
      }
  }

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl h-full flex flex-col items-center justify-between p-6">
        <div className="text-center">
            <img src={`https://i.pravatar.cc/128?u=${targetUser?.email}`} alt={targetUser?.name} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-brand-yellow shadow-lg"/>
            <h2 className="text-3xl font-bold font-heading">{targetUser?.name}</h2>
            <p className="text-lg font-semibold text-light-text-secondary dark:text-dark-text-secondary">{getStatusText()}</p>
        </div>

        <div className="w-full max-w-2xl h-64 bg-black/5 dark:bg-white/5 p-4 rounded-lg overflow-y-auto">
            <h3 className="font-bold mb-2">{t('call_transcription_title')}</h3>
            <div className="space-y-2 text-sm">
                {transcriptionHistory.map(turn => turn.text.trim() && (
                    <div key={turn.id}>
                        <span className="font-semibold">{turn.speaker === 'user' ? `${t('call_user_turn')}: ` : `${t('call_model_turn')}: `}</span>
                        {turn.text}
                    </div>
                ))}
                 {currentTranscription.user && <div><span className="font-semibold">{`${t('call_user_turn')}: `}</span>{currentTranscription.user}</div>}
                 {currentTranscription.model && <div><span className="font-semibold">{`${t('call_model_turn')}: `}</span>{currentTranscription.model}</div>}
            </div>
        </div>

        <button onClick={onEndCall} className="flex items-center gap-3 px-8 py-4 rounded-full bg-red-600 text-white font-bold text-lg hover:bg-red-700 transition-colors">
            <Icon name="phone-off" className="w-6 h-6"/>
            <span>{t('call_end')}</span>
        </button>
    </div>
  );
};

export default CallView;
