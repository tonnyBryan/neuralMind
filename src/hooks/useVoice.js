import { useState, useCallback, useRef, useEffect } from 'react'
import { parseMessage } from '../utils/parseMessage.js'

function extractSpeechText(rawContent) {
    const segments = parseMessage(rawContent)
    return segments
        .filter(seg => seg.type === 'text' || seg.type === 'big')
        .map(seg => seg.content.trim())
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
}

function pickVoice(voices) {
    const preferred = ['Google français', 'Thomas', 'Microsoft Paul', 'Amelie']
    for (const name of preferred) {
        const found = voices.find(v => v.name.includes(name))
        if (found) return found
    }
    return voices.find(v => v.lang.startsWith('fr')) || voices[0] || null
}

export function useVoice() {
    const [voiceEnabled, setVoiceEnabled] = useState(false)
    const [listening, setListening]       = useState(false)
    const [speaking, setSpeaking]         = useState(false)
    const voicesRef       = useRef([])
    const recognitionRef  = useRef(null)

    const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
    const recognitionSupported = typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

    // Précharger les voix dès le montage — clé du fix Chrome
    useEffect(() => {
        if (!supported) return

        function loadVoices() {
            const v = window.speechSynthesis.getVoices()
            if (v.length > 0) {
                voicesRef.current = v
                console.log('[useVoice] voix préchargées:', v.length, v.map(x => x.name))
            }
        }

        loadVoices()
        window.speechSynthesis.onvoiceschanged = loadVoices
        // Forcer Chrome à exposer les voix
        window.speechSynthesis.getVoices()

        return () => { window.speechSynthesis.onvoiceschanged = null }
    }, [supported])

    const speak = useCallback((rawContent) => {
        if (!voiceEnabled || !supported) return
        const text = extractSpeechText(rawContent)
        if (!text) return

        console.log('[useVoice] speak:', text.slice(0, 60), '— voix dispo:', voicesRef.current.length)

        window.speechSynthesis.cancel()

        setTimeout(() => {
            const utter = new SpeechSynthesisUtterance(text)
            const voice = pickVoice(voicesRef.current)
            if (voice) {
                utter.voice = voice
                console.log('[useVoice] voix choisie:', voice.name)
            } else {
                console.warn('[useVoice] pas de voix — défaut système')
            }
            utter.rate   = 0.95
            utter.pitch  = 0.9
            utter.volume = 1

            utter.onstart = () => setSpeaking(true)
            utter.onend   = () => setSpeaking(false)
            utter.onerror = (e) => {
                console.error('[useVoice] erreur:', e.error)
                setSpeaking(false)
            }

            window.speechSynthesis.speak(utter)
        }, 150)
    }, [voiceEnabled, supported])

    const stopSpeaking = useCallback(() => {
        if (supported) window.speechSynthesis.cancel()
        setSpeaking(false)
    }, [supported])

    const startListening = useCallback((onResult, onEnd) => {
        if (!recognitionSupported) return
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SR()
        recognition.lang = 'fr-FR'
        recognition.interimResults = true
        recognition.maxAlternatives = 1

        recognition.onstart  = () => setListening(true)
        recognition.onresult = (e) => {
            const transcript = Array.from(e.results).map(r => r[0].transcript).join('')
            onResult(transcript, e.results[e.results.length - 1].isFinal)
        }
        recognition.onend   = () => { setListening(false); if (onEnd) onEnd() }
        recognition.onerror = (e) => {
            console.error('[useVoice] micro erreur:', e.error)
            setListening(false)
            if (onEnd) onEnd()
        }

        recognitionRef.current = recognition
        recognition.start()
    }, [recognitionSupported])

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop()
        setListening(false)
    }, [])

    return {
        voiceEnabled, setVoiceEnabled,
        listening, speaking, supported, recognitionSupported,
        speak, stopSpeaking, startListening, stopListening,
    }
}