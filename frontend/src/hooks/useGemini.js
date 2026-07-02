import { useState, useRef, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { AudioService } from '../services/audioService';


export const useGemini = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState("Tap the microphone to start ordering.");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentAction, setPaymentAction] = useState(null); // { action: 'show_payment', paymentDetails: {} }
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  
  const audioServiceRef = useRef(null);

  const startSession = useCallback(async () => {
    setIsConnecting(true);
    setOrderPlaced(false);
    setTranscript("Listening...");

    try {
      audioServiceRef.current = new AudioService();
      await audioServiceRef.current.startRecording();
      setIsConnecting(false);
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
      setIsConnecting(false);
      setTranscript("Failed to access microphone.");
    }
  }, []);

  const stopSession = useCallback(async () => {
    if (!isRecording || !audioServiceRef.current) return;
    
    setIsRecording(false);
    setIsConnecting(true);
    setTranscript("Thinking...");

    try {
      const audioData = await audioServiceRef.current.stopRecording();
      if (audioData) {
        const response = await apiService.sendAudio(sessionId, audioData.base64, audioData.mimeType);
        
        setTranscript(response.text);

        // Speak the text
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(response.text);
            // Try to find a good English voice
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.lang.includes('en-') && (v.name.includes('Female') || v.name.includes('Google')));
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
            window.speechSynthesis.speak(utterance);
        }

        if (response.orderPlaced) {
          setOrderPlaced(true);
        }

        if (response.action === 'show_payment') {
          setPaymentAction({
            action: response.action,
            paymentDetails: response.paymentDetails
          });
        }
      }
    } catch (err) {
      console.error("Failed to send audio to backend", err);
      setTranscript("Sorry, I didn't catch that. Tap the mic to try again.");
    } finally {
      setIsConnecting(false);
      audioServiceRef.current = null;
    }
    
  }, [isRecording, sessionId]);

  return {
    isRecording,
    isConnecting,
    transcript,
    orderPlaced,
    paymentAction,
    setPaymentAction,
    setOrderPlaced,
    startSession,
    stopSession,
    setTranscript
  };
};
