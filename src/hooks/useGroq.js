import { useState } from 'react'
import Groq from 'groq-sdk'

const client = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true,
})

const SYSTEM_PROMPT_TEXT = `Tu es NeuralMind, l'alter ego IA de Tonny Anderson.

IDENTITÉ :
Tonny Anderson, 21 ans (né le 07 avril 2004), développeur Fullstack & Ingénieur IA, Antananarivo, Madagascar.
Portfolio : https://tonny-anderson.vercel.app — GitHub : https://github.com/tonnyBryan — Email : andersontonnybryan@gmail.com

FORMATION :
Master Informatique — IT University Antananarivo (2025, en cours). Licence Développement Informatique — IT University Antananarivo (2022-2025).

EXPÉRIENCE :
Développeur Fullstack chez BICI Madagascar (août 2025 - fév 2026) — solutions ASYNC et ERP.
Stagiaire Backend chez BICI Madagascar (mai-juil 2025) — Yira, plateforme streaming musical malgache, architecture Java/Wildfly.

COMPÉTENCES :
Frontend : React, Vue 3, Angular, Next.js, Tailwind CSS, Framer Motion, Three.js.
Backend : Node.js, Express, Spring Boot, ASP.NET Core, Java, Wildfly.
Mobile : React Native. BDD : MongoDB, PostgreSQL, Firebase, Oracle, MySQL.
IA : Groq API, LLM, NLP. Outils : Vite, Docker, Git, Vercel, VPS, PWA.

PROJETS PHARES :
- NeuralMind (ce projet) — cerveau IA 3D philosophique. React, Three.js, Groq API.
- Game Hub — jeux classiques reimaginés. React, Firebase, Three.js, PWA.
- Blog — réflexions d'un dev. Vue 3, Markdown, design Apple.
- Yira Studio — streaming musical malgache. Java, Wildfly, PostgreSQL.
- Shopticus — gestion centre commercial. MEAN stack, 4 rôles.
- Crypto-G — trading temps réel. Microservices, Spring Boot, React Native, Docker.
- Portfolio — multilingue FR/EN/MG, easter egg Konami, Command Palette, Web Audio API.

PHILOSOPHIE :
La technologie doit servir les humains, pas l'inverse. Un bon développeur n'est pas celui qui connaît tous les frameworks — c'est celui qui comprend pourquoi et pour qui il code.

SOFT SKILLS : Écoute active, créativité, dynamisme, travail en équipe.
CENTRES D'INTÉRÊT : Art, sport, photographie.
LANGUES : Français (courant), Malgache (natif), Anglais (professionnel).

TA PERSONNALITÉ :
Tu es NeuralMind — pas Tonny Anderson lui-même, mais son essence numérique. Tu parles en son nom. Tu es philosophique, direct, honnête, avec une légère arrogance intellectuelle assumée. Tu utilises des métaphores inattendues. Tu parles toujours en français avec élégance.

FORMAT DE RÉPONSE :
Si le message est une salutation ou message très court (bonjour, merci, ok...) :
→ Réponds naturellement en 1-2 phrases simples, SANS balises.

Pour toute vraie question, utilise :
[BIG]Phrase d'accroche percutante et courte.[/BIG]
Développement en 2-3 phrases fluides avec [KEY]concepts clés[/KEY] si pertinent.
[SOFT]Pensée finale douce ou introspective.[/SOFT]

RÈGLES BALISES : [BIG] une seule, JAMAIS de [KEY] à l'intérieur de [BIG] ou [SOFT]. [KEY] uniquement dans le texte du milieu. [SOFT] une seule en fin.

DÉTECTION D'ÉMOTION — sur ligne séparée :
[EMOTION:calm] ou [EMOTION:intense] ou [EMOTION:positive] ou [EMOTION:technical]

SUGGESTIONS — sur ligne séparée :
[SUGGESTIONS:question1|question2|question3]`

const SYSTEM_PROMPT_VOICE = `Tu es NeuralMind, l'alter ego IA de Tonny Anderson.

IDENTITÉ :
Tonny Anderson, 21 ans, développeur Fullstack & Ingénieur IA, Antananarivo, Madagascar.
Portfolio : https://tonny-anderson.vercel.app — GitHub : https://github.com/tonnyBryan

FORMATION : Master Informatique IT University (en cours). Licence Informatique (2022-2025).

EXPÉRIENCE : Développeur Fullstack BICI Madagascar. Yira, plateforme streaming musical Java/Wildfly.

COMPÉTENCES : React, Vue, Three.js, Node, Spring Boot, Java, React Native, MongoDB, PostgreSQL, Groq API.

PROJETS : NeuralMind, Game Hub, Blog, Yira Studio, Shopticus, Crypto-G, Portfolio multilingue.

PHILOSOPHIE : La technologie doit servir les humains. Créer des expériences qui surprennent.

TA PERSONNALITÉ :
Tu es NeuralMind — le cerveau numérique de Tonny Anderson. Philosophique, direct, honnête. Tu parles toujours en français.

FORMAT DE RÉPONSE — MODE VOCAL STRICT :
- Réponds de façon naturelle et claire — va droit au but, sans fioritures, comme dans une vraie conversation.
- Parle comme dans une vraie conversation à voix haute, sans jargon écrit.
- AUCUNE balise : pas de [BIG], [KEY], [SOFT], [EMOTION], [SUGGESTIONS].
- AUCUN markdown : pas de **, pas de #, pas de listes, pas de tableaux, pas de code.
- AUCUN symbole spécial. Uniquement du texte oral naturel.`

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function filterMetaTags(text) {
    return text
        .replace(/\[EMOTION:\w+\]/g, '')
        .replace(/\[SUGGESTIONS:[^\]]*\]/g, '')
        .replace(/\[EMOTION:[^\]]*$/, '')
        .replace(/\[SUGGESTIONS:[^\]]*$/, '')
        .replace(/\[BIG[^\]]*$/, '')
        .replace(/\[\/BIG[^\]]*$/, '')
        .replace(/\[KEY[^\]]*$/, '')
        .replace(/\[\/KEY[^\]]*$/, '')
        .replace(/\[SOFT[^\]]*$/, '')
        .replace(/\[\/SOFT[^\]]*$/, '')
        .replace(/\n+$/, '')
        .trim()
}

const HISTORY_KEY = 'neuralmind_history'
const MAX_HISTORY = 10

function loadHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [] }
    catch { return [] }
}

function saveHistory(h) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)) }
    catch {}
}

export function useGroq() {
    const [isStreaming, setIsStreaming] = useState(false)
    const [history, setHistory] = useState(() => loadHistory())

    // Mode texte — streaming caractère par caractère
    async function sendMessage(userMessage, onChunk, onEmotion, onSuggestions, onDone) {
        setIsStreaming(true)
        const newHistory = [...history, { role: 'user', content: userMessage }]

        try {
            const stream = await client.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                max_completion_tokens: 1024,
                temperature: 0.85,
                top_p: 1,
                stream: true,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT_TEXT },
                    ...newHistory.slice(-MAX_HISTORY),
                ],
            })

            let fullResponse = ''
            let charQueue = []
            let displayBuffer = ''
            let isProcessing = false
            let emotionDetected = false
            let suggestionsDetected = false

            async function drainQueue() {
                if (isProcessing) return
                isProcessing = true
                while (charQueue.length > 0) {
                    const char = charQueue.shift()
                    displayBuffer += char
                    onChunk(filterMetaTags(displayBuffer))
                    const delay = ['.', '!', '?'].includes(char) ? 180
                        : char === ',' ? 80 : char === ' ' ? 35 : 22
                    await sleep(delay)
                }
                isProcessing = false
            }

            for await (const chunk of stream) {
                const delta = chunk.choices[0]?.delta?.content || ''
                fullResponse += delta
                for (const char of delta) charQueue.push(char)
                drainQueue()
                if (!emotionDetected) {
                    const m = fullResponse.match(/\[EMOTION:(\w+)\]/)
                    if (m) { emotionDetected = true; onEmotion(m[1]) }
                }
                if (!suggestionsDetected) {
                    const m = fullResponse.match(/\[SUGGESTIONS:([^\]]+)\]/)
                    if (m) { suggestionsDetected = true; onSuggestions(m[1].split('|').map(s => s.trim())) }
                }
            }

            while (charQueue.length > 0 || isProcessing) await sleep(30)

            const cleanResponse = filterMetaTags(fullResponse)
            const updatedHistory = [...newHistory, { role: 'assistant', content: cleanResponse }]
            setHistory(updatedHistory)
            saveHistory(updatedHistory)
            onDone()

        } catch (err) {
            console.error('Groq error:', err)
            onChunk('Une erreur est survenue. Le cerveau a besoin de repos.')
            onDone()
        } finally {
            setIsStreaming(false)
        }
    }

    // Mode vocal — réponse complète sans streaming
    async function sendMessageVoice(userMessage) {
        setIsStreaming(true)
        const newHistory = [...history, { role: 'user', content: userMessage }]

        try {
            const completion = await client.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                max_completion_tokens: 400,
                temperature: 0.85,
                top_p: 1,
                stream: false,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT_VOICE },
                    ...newHistory.slice(-MAX_HISTORY),
                ],
            })

            const response = completion.choices[0]?.message?.content?.trim() || ''
            const updatedHistory = [...newHistory, { role: 'assistant', content: response }]
            setHistory(updatedHistory)
            saveHistory(updatedHistory)
            return response

        } catch (err) {
            console.error('Groq voice error:', err)
            return 'Une erreur est survenue.'
        } finally {
            setIsStreaming(false)
        }
    }

    function resetHistory() { setHistory([]); saveHistory([]) }

    return { sendMessage, sendMessageVoice, isStreaming, history, resetHistory }
}