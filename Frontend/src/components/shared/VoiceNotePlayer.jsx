import React, { useState, useRef } from 'react';
import { Mic, Play, Pause, Square, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const VoiceNotePlayer = ({ 
  voiceNotes = [], 
  className = "",
  showTitle = true,
  title = "Voice Notes"
}) => {
  const [playingNote, setPlayingNote] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const playVoiceNote = (note) => {
    if (playingNote && playingNote.id === note.id) {
      // Same note - toggle play/pause
      if (audioRef.current.paused) {
        audioRef.current.play();
        setPlayingNote({ ...note, isPlaying: true });
      } else {
        audioRef.current.pause();
        setPlayingNote({ ...note, isPlaying: false });
      }
    } else {
      // New note - stop current and play new
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      const audio = new Audio(URL.createObjectURL(note.audioBlob));
      audioRef.current = audio;
      
      audio.onended = () => {
        setPlayingNote(null);
      };
      
      audio.onpause = () => {
        setPlayingNote(prev => prev ? { ...prev, isPlaying: false } : null);
      };
      
      audio.onplay = () => {
        setPlayingNote({ ...note, isPlaying: true });
      };
      
      audio.muted = isMuted;
      audio.play();
    }
  };

  const stopVoiceNote = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlayingNote(null);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  if (!voiceNotes || voiceNotes.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showTitle && (
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-blue-600" />
          <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
          <Badge variant="outline" className="text-xs">
            {voiceNotes.length} {voiceNotes.length === 1 ? 'note' : 'notes'}
          </Badge>
        </div>
      )}
      
      <div className="space-y-3">
        {voiceNotes.map((note) => {
          const isCurrentlyPlaying = playingNote && playingNote.id === note.id;
          const isPlaying = isCurrentlyPlaying && playingNote.isPlaying;
          
          return (
            <div 
              key={note.id} 
              className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 ${
                isCurrentlyPlaying 
                  ? 'bg-blue-50 border-blue-300 shadow-sm' 
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Voice Note Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isCurrentlyPlaying 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <Mic className="w-5 h-5" />
              </div>
              
              {/* Voice Note Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-800">
                    Voice Note ({formatDuration(note.duration)})
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {note.size} MB
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  Recorded on {formatTimestamp(note.timestamp)}
                </p>
              </div>
              
              {/* Playback Controls */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={() => playVoiceNote(note)}
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-2 ${
                    isCurrentlyPlaying 
                      ? 'text-blue-600 border-blue-300 hover:bg-blue-50' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                
                {isCurrentlyPlaying && (
                  <Button
                    type="button"
                    onClick={stopVoiceNote}
                    variant="outline"
                    size="sm"
                    className="text-gray-600 hover:bg-gray-50"
                  >
                    <Square className="w-4 h-4" />
                    Stop
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Global Controls */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
        <Button
          type="button"
          onClick={toggleMute}
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-gray-800"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          {isMuted ? 'Unmute' : 'Mute'}
        </Button>
        
        {playingNote && (
          <span className="text-sm text-gray-500">
            Currently playing: Voice Note ({formatDuration(playingNote.duration)})
          </span>
        )}
      </div>
    </div>
  );
};

export default VoiceNotePlayer;

