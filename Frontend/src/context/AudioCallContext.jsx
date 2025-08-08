import React, { createContext, useState, useContext, useEffect } from "react";
import socket from "../components/shared/socket";
import { toast } from "sonner";

const AudioCallContext = createContext();

export const AudioCallProvider = ({ children }) => {
    const [isInCall, setIsInCall] = useState(false);
    const [isCallActive, setIsCallActive] = useState(false);
    const [caller, setCaller] = useState(null);
    const [recipient, setRecipient] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [peerConnection, setPeerConnection] = useState(null);
    const [callType, setCallType] = useState(null); // 'incoming', 'outgoing', 'active'
    const [currentUser, setCurrentUser] = useState(null);

    // WebRTC configuration
    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };

    // Get current user from localStorage or context
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user) {
            setCurrentUser(user);
        }
    }, []);

    useEffect(() => {
        // Socket event listeners for audio calls
        socket.on('audio_call_request', handleIncomingCall);
        socket.on('audio_call_accepted', handleCallAccepted);
        socket.on('audio_call_rejected', handleCallRejected);
        socket.on('audio_call_ended', handleCallEnded);
        socket.on('audio_call_ice_candidate', handleIceCandidate);
        socket.on('audio_call_offer', handleOffer);
        socket.on('audio_call_answer', handleAnswer);

        return () => {
            socket.off('audio_call_request');
            socket.off('audio_call_accepted');
            socket.off('audio_call_rejected');
            socket.off('audio_call_ended');
            socket.off('audio_call_ice_candidate');
            socket.off('audio_call_offer');
            socket.off('audio_call_answer');
        };
    }, []);

    const handleIncomingCall = async (data) => {
        setCaller(data.caller);
        setRecipient(data.recipient);
        setCallType('incoming');
        setIsInCall(true);
        
        // Play ringtone
        playRingtone();
        
        toast.info(`Incoming call from ${data.caller.fullname}`, {
            action: {
                label: 'Answer',
                onClick: () => acceptCall(data.caller._id)
            },
            cancel: {
                label: 'Decline',
                onClick: () => rejectCall(data.caller._id)
            }
        });
    };

    const handleCallAccepted = async (data) => {
        setCallType('active');
        setIsCallActive(true);
        stopRingtone();
        
        try {
            const pc = await initializePeerConnection();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setLocalStream(stream);
            
            // Add local stream to peer connection
            stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
            });

            // Create and send offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('audio_call_offer', {
                offer: offer,
                recipientId: data.caller._id
            });
        } catch (error) {
            console.error('Error starting call:', error);
            toast.error('Failed to start call');
            endCall();
        }
    };

    const handleCallRejected = (data) => {
        setIsInCall(false);
        setCallType(null);
        setCaller(null);
        setRecipient(null);
        stopRingtone();
        toast.info('Call was rejected');
    };

    const handleCallEnded = (data) => {
        endCall();
        toast.info('Call ended');
    };

    const handleOffer = async (data) => {
        try {
            const pc = await initializePeerConnection();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setLocalStream(stream);
            
            // Add local stream to peer connection
            stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
            });

            // Set remote description
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            
            // Create and send answer
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('audio_call_answer', {
                answer: answer,
                recipientId: data.callerId
            });
        } catch (error) {
            console.error('Error handling offer:', error);
            toast.error('Failed to establish call');
            endCall();
        }
    };

    const handleAnswer = async (data) => {
        try {
            if (peerConnection) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
            }
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    };

    const handleIceCandidate = async (data) => {
        try {
            if (peerConnection) {
                await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        } catch (error) {
            console.error('Error adding ICE candidate:', error);
        }
    };

    const initializePeerConnection = async () => {
        const pc = new RTCPeerConnection(configuration);
        
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('audio_call_ice_candidate', {
                    candidate: event.candidate,
                    recipientId: recipient?._id || caller?._id
                });
            }
        };

        pc.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        pc.oniceconnectionstatechange = () => {
            if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
                endCall();
            }
        };

        setPeerConnection(pc);
        return pc;
    };

    const initiateCall = async (recipientUser) => {
        try {
            setRecipient(recipientUser);
            setCallType('outgoing');
            setIsInCall(true);
            
            // Request microphone permission
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setLocalStream(stream);
            
            // Send call request
            socket.emit('audio_call_request', {
                recipientId: recipientUser._id,
                caller: {
                    _id: currentUser?._id || socket.id,
                    fullname: currentUser?.fullname || 'You'
                },
                recipient: recipientUser
            });

            toast.info(`Calling ${recipientUser.fullname}...`);
        } catch (error) {
            console.error('Error initiating call:', error);
            toast.error('Failed to start call. Please check microphone permissions.');
            setIsInCall(false);
            setCallType(null);
            setRecipient(null);
        }
    };

    const acceptCall = async (callerId) => {
        try {
            socket.emit('audio_call_accepted', { callerId });
            setCallType('active');
            setIsCallActive(true);
            stopRingtone();
        } catch (error) {
            console.error('Error accepting call:', error);
            toast.error('Failed to accept call');
        }
    };

    const rejectCall = (callerId) => {
        socket.emit('audio_call_rejected', { callerId });
        setIsInCall(false);
        setCallType(null);
        setCaller(null);
        setRecipient(null);
        stopRingtone();
    };

    const endCall = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        
        if (peerConnection) {
            peerConnection.close();
            setPeerConnection(null);
        }
        
        setRemoteStream(null);
        setIsInCall(false);
        setIsCallActive(false);
        setCallType(null);
        setCaller(null);
        setRecipient(null);
        stopRingtone();
        
        socket.emit('audio_call_ended', {
            recipientId: recipient?._id || caller?._id
        });
    };

    const playRingtone = () => {
        // Create a simple ringtone using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
        
        // Repeat ringtone
        const ringtoneInterval = setInterval(() => {
            if (!isInCall) {
                clearInterval(ringtoneInterval);
                return;
            }
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.5);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 1);
        }, 2000);
        
        // Store interval reference for cleanup
        window.ringtoneInterval = ringtoneInterval;
    };

    const stopRingtone = () => {
        if (window.ringtoneInterval) {
            clearInterval(window.ringtoneInterval);
            window.ringtoneInterval = null;
        }
    };

    return (
        <AudioCallContext.Provider value={{
            isInCall,
            isCallActive,
            caller,
            recipient,
            localStream,
            remoteStream,
            callType,
            initiateCall,
            acceptCall,
            rejectCall,
            endCall
        }}>
            {children}
        </AudioCallContext.Provider>
    );
};

export const useAudioCall = () => {
    const context = useContext(AudioCallContext);
    if (!context) {
        throw new Error('useAudioCall must be used within an AudioCallProvider');
    }
    return context;
};

export default AudioCallContext;
