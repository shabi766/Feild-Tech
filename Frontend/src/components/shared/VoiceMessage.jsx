import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Play, Square, Trash2, FileText, Send } from 'lucide-react';
import { toast } from 'sonner';

const VoiceMessage = ({ 
    onSendMessage,
    placeholder = "Record a voice message...",
    className = ""
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isVoiceSupported, setIsVoiceSupported] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    
    const mediaRecorderRef = useRef(null);
    const audioRef = useRef(null);
    const durationIntervalRef = useRef(null);

    useEffect(() => {
        const checkVoiceSupport = () => {
            const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
            const hasMediaRecorder = !!window.MediaRecorder;
            setIsVoiceSupported(hasMediaDevices && hasMediaRecorder);
        };
        
        checkVoiceSupport();
    }, []);

    useEffect(() => {
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
            if (durationIntervalRef.current) {
                clearInterval(durationIntervalRef.current);
            }
        };
    }, [audioUrl]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            
            const chunks = [];
            mediaRecorderRef.current.ondataavailable = (event) => {
                chunks.push(event.data);
            };
            
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/wav' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingDuration(0);
            
            // Start duration timer
            durationIntervalRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
            
            toast.success("Recording started");
        } catch (error) {
            console.error('Error starting recording:', error);
            toast.error("Failed to start recording");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            
            if (durationIntervalRef.current) {
                clearInterval(durationIntervalRef.current);
            }
            
            toast.success("Recording stopped");
        }
    };

    const playAudio = () => {
        if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const pauseAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const deleteAudio = () => {
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingDuration(0);
        setIsPlaying(false);
        
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        
        toast.success("Voice message deleted");
    };

    const convertToText = async () => {
        if (!audioBlob) return;
        
        setIsConverting(true);
        try {
            // Check if Web Speech API is available
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                const recognition = new SpeechRecognition();
                
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.lang = 'en-US';
                
                recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    toast.success("Voice converted to text: " + transcript);
                    // You can emit this text or handle it as needed
                };
                
                recognition.onerror = (event) => {
                    console.error('Speech recognition error:', event.error);
                    toast.error("Failed to convert voice to text");
                };
                
                recognition.start();
            } else {
                toast.error("Speech recognition not supported in this browser");
            }
        } catch (error) {
            console.error('Error converting to text:', error);
            toast.error("Failed to convert voice to text");
        } finally {
            setIsConverting(false);
        }
    };

    const sendVoiceMessage = () => {
        if (audioBlob && onSendMessage) {
            onSendMessage(audioBlob, recordingDuration);
            deleteAudio();
            toast.success("Voice message sent");
        }
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isVoiceSupported) {
        return (
            <div className={`p-3 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
                <p className="text-sm text-yellow-700">
                    ⚠️ Voice recording is not supported in your browser.
                </p>
            </div>
        );
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {!audioUrl ? (
                <div className="space-y-3">
                    <p className="text-sm text-gray-600">{placeholder}</p>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            onClick={startRecording}
                            disabled={isRecording}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                        >
                            <Mic className="h-4 w-4" />
                            {isRecording ? 'Recording...' : 'Start Recording'}
                        </Button>
                        {isRecording && (
                            <Button
                                type="button"
                                onClick={stopRecording}
                                variant="destructive"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Square className="h-4 w-4" />
                                Stop
                            </Button>
                        )}
                    </div>
                    {isRecording && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                            Recording... {formatDuration(recordingDuration)}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white rounded border">
                        <div className="flex items-center gap-2">
                            <Mic className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">
                                Voice Message ({formatDuration(recordingDuration)})
                            </span>
                            <Badge variant="outline" className="text-xs">
                                {(audioBlob?.size / 1024 / 1024).toFixed(2)} MB
                            </Badge>
                        </div>
                        <div className="flex gap-2 ml-auto">
                            <Button
                                type="button"
                                onClick={isPlaying ? pauseAudio : playAudio}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                {isPlaying ? 'Pause' : 'Play'}
                            </Button>
                            <Button
                                type="button"
                                onClick={convertToText}
                                disabled={isConverting}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <FileText className="h-4 w-4" />
                                {isConverting ? 'Converting...' : 'Convert to Text'}
                            </Button>
                            <Button
                                type="button"
                                onClick={deleteAudio}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 text-red-600 hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            onClick={sendVoiceMessage}
                            variant="default"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <Send className="h-4 w-4" />
                            Send Voice Message
                        </Button>
                        <Button
                            type="button"
                            onClick={deleteAudio}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
            
            <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                style={{ display: 'none' }}
            />
        </div>
    );
};

export default VoiceMessage;






