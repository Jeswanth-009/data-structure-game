'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, ChevronRight } from 'lucide-react';

interface StoryViewerProps {
  title: string;
  brief: string;
  onComplete: () => void;
}

export default function StoryViewer({ title, brief, onComplete }: StoryViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Split story into paragraphs
  const paragraphs = brief.split(/\.\s+/).filter(p => p.trim().length > 0);
  
  // Background images/themes based on story progression
  const backgrounds = [
    'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', // Night city
    'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', // Cyber archives
    'linear-gradient(135deg, #141e30 0%, #243b55 100%)', // Terminal
    'linear-gradient(135deg, #434343 0%, #000000 100%)', // Mystery
  ];

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    // Change background as story progresses
    const bgInterval = setInterval(() => {
      setBackgroundIndex((prev) => (prev + 1) % backgrounds.length);
    }, 5000);

    return () => clearInterval(bgInterval);
  }, []);

  const speakText = (text: string) => {
    if (!voiceEnabled || !text) return;

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Priority list for expressive female voices for detective storytelling
    const preferredVoice = 
      // Microsoft Natural female voices (best quality)
      voices.find(voice => 
        voice.name.includes('Natural') && 
        voice.lang.startsWith('en') && 
        (voice.name.includes('Female') || voice.name.includes('Aria') || voice.name.includes('Jenny'))
      ) ||
      // Try UK female voices (more dramatic)
      voices.find(voice => 
        voice.lang.includes('en-GB') && 
        (voice.name.includes('Female') || voice.name.includes('Susan') || voice.name.includes('Hazel'))
      ) ||
      // Google female voices
      voices.find(voice => 
        voice.name.includes('Google') && 
        voice.lang.startsWith('en') && 
        voice.name.toLowerCase().includes('female')
      ) ||
      // Premium voices: Samantha (Mac), Zira (Windows)
      voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.includes('Samantha') || voice.name.includes('Zira'))
      ) ||
      // Any female English voice
      voices.find(voice => 
        voice.lang.startsWith('en') && 
        voice.name.toLowerCase().includes('female')
      ) ||
      // US or UK English
      voices.find(voice => voice.lang.startsWith('en-US') || voice.lang.startsWith('en-GB')) ||
      voices.find(voice => voice.lang.startsWith('en')) ||
      voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
      console.log('Using voice:', preferredVoice.name, '| Language:', preferredVoice.lang);
    }
    
    // Adjust speech parameters for expressive, engaging storytelling
    utterance.rate = 1.0;   // Moderately slow for drama and clarity
    utterance.pitch = 0.7;   // Slightly higher for expressiveness and warmth
    utterance.volume = 1.0;  // Full volume

    utterance.onend = () => {
      setIsPlaying(false);
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const playParagraph = () => {
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      const text = paragraphs[currentParagraph] + '.';
      speakText(text);
    }
  };

  const nextParagraph = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    
    if (currentParagraph < paragraphs.length - 1) {
      setCurrentParagraph(currentParagraph + 1);
    }
  };

  const skipToCase = () => {
    window.speechSynthesis.cancel();
    onComplete();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-1000"
      style={{ background: backgrounds[backgroundIndex] }}
    >
      {/* Animated background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-detective-amber rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-36 h-36 bg-purple-500 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="max-w-4xl w-full relative z-10">
        {/* Title */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl sm:text-5xl font-bold text-detective-amber mb-3 font-mono drop-shadow-lg">
            🕵️‍♀️ {title}
          </h1>
          <div className="h-1 w-32 bg-detective-amber mx-auto rounded-full" />
        </div>

        {/* Story Content */}
        <div className="detective-file backdrop-blur-sm bg-detective-dark/80 shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-detective-grey">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleVoice}
                className={`p-3 rounded-lg transition-all ${
                  voiceEnabled 
                    ? 'bg-detective-amber text-detective-dark' 
                    : 'bg-detective-grey text-foreground'
                }`}
                title={voiceEnabled ? 'Voice enabled' : 'Enable voice narration'}
              >
                {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              {voiceEnabled && (
                <button
                  onClick={playParagraph}
                  className="p-3 bg-detective-amber text-detective-dark rounded-lg hover:bg-detective-amber-light transition-all"
                  title={isPlaying ? 'Pause' : 'Play narration'}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
              )}
            </div>

            <div className="text-sm text-detective-amber">
              Part {currentParagraph + 1} of {paragraphs.length}
            </div>
          </div>

          {/* Story Text */}
          <div className="min-h-[300px] mb-6">
            <p className="text-base sm:text-lg text-foreground leading-relaxed animate-fade-in">
              {paragraphs[currentParagraph]}.
            </p>

            {/* Clue boxes for specific parts */}
            {currentParagraph === 2 && (
              <div className="mt-6 bg-detective-charcoal border-2 border-detective-amber rounded-lg p-4 animate-slide-up">
                <div className="text-detective-amber font-bold mb-2 font-mono">
                  📋 EVIDENCE FOUND:
                </div>
                <div className="space-y-2 text-sm sm:text-base font-mono">
                  <div className="text-foreground">1️⃣ ((Secret)(Safe))</div>
                  <div className="text-foreground">2️⃣ )Locked(</div>
                  <div className="text-foreground">3️⃣ !dlroW olleH</div>
                </div>
              </div>
            )}

            {currentParagraph === 3 && (
              <div className="mt-6 bg-detective-red/20 border-2 border-detective-red rounded-lg p-4 animate-pulse-slow">
                <div className="text-detective-red font-bold mb-2 font-mono">
                  💬 HACKER'S NOTE:
                </div>
                <div className="text-foreground italic font-mono">
                  "I hide things the way I store them..."
                </div>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="w-full bg-detective-charcoal rounded-full h-2">
              <div
                className="bg-detective-amber h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentParagraph + 1) / paragraphs.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3 flex-wrap">
            {currentParagraph < paragraphs.length - 1 ? (
              <button
                onClick={nextParagraph}
                className="detective-button flex items-center gap-2 flex-1"
              >
                Continue Story
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={skipToCase}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center gap-2 flex-1 shadow-lg"
              >
                🔍 Begin Investigation
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={skipToCase}
              className="bg-detective-grey hover:bg-detective-charcoal text-foreground py-3 px-6 rounded-lg transition-all text-sm"
            >
              Skip Story
            </button>
          </div>
        </div>

        {/* Hint */}
        <div className="text-center mt-4 text-foreground/50 text-sm animate-fade-in">
          💡 Tip: Enable voice narration for an immersive experience
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        .delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
