"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, Volume2, HelpCircle } from "lucide-react";
import { useVoiceCommand } from "@/hooks/useVoiceCommand";

export function VoiceCommandButton() {
  const {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    lastResult,
  } = useVoiceCommand();

  const [showPanel, setShowPanel] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Auto-show panel when listening
  useEffect(() => {
    if (isListening) {
      setShowPanel(true);
    }
  }, [isListening]);

  // Auto-hide panel after result
  useEffect(() => {
    if (lastResult && !isListening) {
      const timer = setTimeout(() => {
        if (!isListening) {
          setShowPanel(false);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [lastResult, isListening]);

  if (!isSupported) {
    return null;
  }

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      setShowPanel(true);
    }
  };

  return (
    <>
      {/* Floating Voice Button */}
      <motion.button
        onClick={handleToggle}
        className={`fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${
          isListening
            ? "bg-red-500 hover:bg-red-600"
            : "bg-emerald-600 hover:bg-emerald-700"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isListening ? "Stop listening" : "Start voice command"}
      >
        {isListening ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <MicOff className="w-6 h-6 text-white" />
          </motion.div>
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}
      </motion.button>

      {/* Voice Command Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-40 right-4 z-40 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-emerald-600 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                <span className="font-medium">Voice Command</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Help"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    stopListening();
                    setShowPanel(false);
                  }}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Listening Animation */}
              {isListening && (
                <div className="flex flex-col items-center py-4">
                  <div className="relative">
                    <motion.div
                      className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <Mic className="w-8 h-8 text-emerald-600" />
                    </motion.div>
                    <motion.div
                      className="absolute inset-0 bg-emerald-200 rounded-full -z-10"
                      animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-3">Listening...</p>
                </div>
              )}

              {/* Transcript */}
              {transcript && (
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-500 mb-1">You said:</p>
                  <p className="text-gray-800 font-medium">{transcript}</p>
                </div>
              )}

              {/* Result */}
              {lastResult && !isListening && (
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                  <p className="text-sm text-emerald-800">{lastResult.response}</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Help Panel */}
              <AnimatePresence>
                {showHelp && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 overflow-hidden"
                  >
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-700 mb-2">Try saying:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• &quot;Find hospitals near me&quot;</li>
                        <li>• &quot;I need an ambulance&quot;</li>
                        <li>• &quot;Check my symptoms&quot;</li>
                        <li>• &quot;Show health alerts&quot;</li>
                        <li>• &quot;Emergency help&quot;</li>
                        <li>• &quot;What&apos;s the emergency number?&quot;</li>
                        <li>• &quot;Go to home page&quot;</li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Start Button (when not listening) */}
              {!isListening && !transcript && !lastResult && (
                <button
                  onClick={startListening}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Mic className="w-5 h-5" />
                  Tap to Speak
                </button>
              )}

              {/* Try Again Button */}
              {!isListening && (transcript || lastResult) && (
                <button
                  onClick={startListening}
                  className="w-full mt-3 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Mic className="w-4 h-4" />
                  Speak Again
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
