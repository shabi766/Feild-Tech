import React, { useEffect, useRef } from "react";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAudioCall } from "@/context/AudioCallContext";

const AudioCallModal = () => {
    const {
        isInCall,
        isCallActive,
        caller,
        recipient,
        localStream,
        remoteStream,
        callType,
        acceptCall,
        rejectCall,
        endCall
    } = useAudioCall();

    const localAudioRef = useRef(null);
    const remoteAudioRef = useRef(null);
    const [isMuted, setIsMuted] = React.useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = React.useState(true);

    useEffect(() => {
        if (localStream && localAudioRef.current) {
            localAudioRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteStream && remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const toggleMute = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleSpeaker = () => {
        if (remoteAudioRef.current) {
            remoteAudioRef.current.muted = !remoteAudioRef.current.muted;
            setIsSpeakerOn(!remoteAudioRef.current.muted);
        }
    };

    const handleAcceptCall = () => {
        acceptCall(caller?._id);
    };

    const handleRejectCall = () => {
        rejectCall(caller?._id);
    };

    const handleEndCall = () => {
        endCall();
    };

    if (!isInCall) return null;

    const displayUser = callType === 'incoming' ? caller : recipient;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                {/* Call Status */}
                <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Avatar className="w-16 h-16">
                            <AvatarImage src={displayUser?.profile?.profilePhoto} />
                            <AvatarFallback className="bg-indigo-500 text-white text-xl">
                                {displayUser?.fullname?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {displayUser?.fullname || "Unknown User"}
                    </h3>
                    
                    <p className="text-gray-500">
                        {callType === 'incoming' && 'Incoming call...'}
                        {callType === 'outgoing' && 'Calling...'}
                        {callType === 'active' && 'Connected'}
                    </p>
                </div>

                {/* Audio Elements */}
                <audio ref={localAudioRef} autoPlay muted />
                <audio ref={remoteAudioRef} autoPlay />

                {/* Call Controls */}
                <div className="flex justify-center gap-4 mb-6">
                    {callType === 'incoming' ? (
                        <>
                            <Button
                                onClick={handleAcceptCall}
                                className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white"
                            >
                                <Phone size={24} />
                            </Button>
                            <Button
                                onClick={handleRejectCall}
                                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white"
                            >
                                <PhoneOff size={24} />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={toggleMute}
                                className={`w-12 h-12 rounded-full ${
                                    isMuted 
                                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                }`}
                            >
                                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                            </Button>
                            
                            <Button
                                onClick={handleEndCall}
                                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white"
                            >
                                <PhoneOff size={24} />
                            </Button>
                            
                            <Button
                                onClick={toggleSpeaker}
                                className={`w-12 h-12 rounded-full ${
                                    !isSpeakerOn 
                                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                }`}
                            >
                                {isSpeakerOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
                            </Button>
                        </>
                    )}
                </div>

                {/* Call Duration (if active) */}
                {callType === 'active' && (
                    <div className="text-center">
                        <p className="text-sm text-gray-500">Call in progress...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AudioCallModal;
