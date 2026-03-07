import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { generateBrainNeurons, generateSynapses } from '../utils/brainGeometry.js'

const EMOTION_COLORS = {
    calm:      '#60a5fa',
    intense:   '#f87171',
    positive:  '#4ade80',
    technical: '#fb923c',
}

export default function Brain({ isThinking = false, emotion = 'calm' }) {
    const mountRef = useRef(null)
    const sceneRef = useRef({})
    const isThinkingRef = useRef(isThinking)
    const emotionRef = useRef(emotion)
    const activationTimersRef = useRef([])

    useEffect(() => {
        emotionRef.current = emotion
        if (isThinkingRef.current) applyEmotionColor(emotion)
    }, [emotion])

    useEffect(() => {
        isThinkingRef.current = isThinking
        if (isThinking) {
            triggerActivation()
        } else {
            resetNeurons()
        }
    }, [isThinking])

    function clearActivationTimers() {
        activationTimersRef.current.forEach(t => clearTimeout(t))
        activationTimersRef.current = []
    }

    function applyEmotionColor(emo) {
        const { neuronMeshes, synapseLines } = sceneRef.current
        if (!neuronMeshes) return
        const color = EMOTION_COLORS[emo] || EMOTION_COLORS.calm
        neuronMeshes.forEach(mesh => {
            if (mesh.userData.activated) mesh.material.color.set(color)
        })
        synapseLines?.forEach(line => {
            if (line.userData.activated) line.material.color.set(color)
        })
    }

    function triggerActivation() {
        const { neuronMeshes, synapseLines, neurons } = sceneRef.current
        if (!neuronMeshes) return
        clearActivationTimers()
        const color = EMOTION_COLORS[emotionRef.current] || EMOTION_COLORS.calm

        const sorted = neuronMeshes
            .map((mesh, i) => ({ mesh, x: neurons[i].position[0] }))
            .sort((a, b) => a.x - b.x)

        sorted.forEach(({ mesh }, i) => {
            const t = setTimeout(() => {
                if (!isThinkingRef.current) return
                mesh.material.color.set(color)
                mesh.userData.activated = true
                mesh.userData.activePulsePhase = Math.random() * Math.PI * 2
            }, i * 80)
            activationTimersRef.current.push(t)
        })

        synapseLines?.forEach((line, i) => {
            const t = setTimeout(() => {
                if (!isThinkingRef.current) return
                line.material.color.set(color)
                line.material.opacity = 0.3
                line.userData.activated = true
            }, i * 30)
            activationTimersRef.current.push(t)
        })
    }

    function resetNeurons() {
        const { neuronMeshes, synapseLines, neurons } = sceneRef.current
        if (!neuronMeshes) return
        clearActivationTimers()

        neuronMeshes.forEach((mesh, i) => {
            const t = setTimeout(() => {
                mesh.material.color.set('#ffffff')
                mesh.userData.activated = false
                mesh.material.opacity = neurons[i].baseOpacity
            }, i * 15)
            activationTimersRef.current.push(t)
        })

        synapseLines?.forEach((line, i) => {
            const t = setTimeout(() => {
                line.material.color.set('#ffffff')
                line.material.opacity = line.userData.baseOpacity
                line.userData.activated = false
            }, i * 5)
            activationTimersRef.current.push(t)
        })
    }

    useEffect(() => {
        const mount = mountRef.current
        const width = mount.clientWidth
        const height = mount.clientHeight

        const scene = new THREE.Scene()
        scene.background = new THREE.Color('#050508')
        scene.fog = new THREE.FogExp2('#050508', 0.04)

        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100)
        camera.position.set(0, 0, 9)

        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(width, height)
        renderer.setPixelRatio(window.devicePixelRatio)
        mount.appendChild(renderer.domElement)

        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.05
        controls.autoRotate = true
        controls.autoRotateSpeed = 0.4
        controls.enablePan = false
        controls.minDistance = 5
        controls.maxDistance = 15

        const neurons = generateBrainNeurons(300)
        const synapses = generateSynapses(neurons)
        const neuronMeshes = []

        neurons.forEach((neuron) => {
            const geo = new THREE.SphereGeometry(neuron.size, 8, 8)
            const mat = new THREE.MeshBasicMaterial({
                color: new THREE.Color('#ffffff'),
                transparent: true,
                opacity: neuron.baseOpacity,
            })
            const mesh = new THREE.Mesh(geo, mat)
            mesh.position.set(...neuron.position)
            mesh.userData = {
                baseOpacity: neuron.baseOpacity,
                phase: Math.random() * Math.PI * 2,
                activated: false,
            }
            scene.add(mesh)
            neuronMeshes.push(mesh)
        })

        const synapseLines = []
        synapses.forEach((synapse) => {
            const from = neurons[synapse.from].position
            const to = neurons[synapse.to].position
            const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)]
            const geo = new THREE.BufferGeometry().setFromPoints(points)
            const mat = new THREE.LineBasicMaterial({
                color: new THREE.Color('#ffffff'),
                transparent: true,
                opacity: synapse.opacity,
            })
            const line = new THREE.Line(geo, mat)
            line.userData = { baseOpacity: synapse.opacity, activated: false }
            scene.add(line)
            synapseLines.push(line)
        })

        sceneRef.current = { renderer, neuronMeshes, synapseLines, controls, neurons }

        let animId
        const clock = new THREE.Clock()

        const animate = () => {
            animId = requestAnimationFrame(animate)
            const t = clock.getElapsedTime()

            neuronMeshes.forEach((mesh) => {
                const phase = mesh.userData.phase
                if (mesh.userData.activated) {
                    const pulse = 0.25 * Math.sin(t * 6 + phase)
                    mesh.material.opacity = 0.7 + pulse
                } else {
                    const pulse = 0.15 * Math.sin(t * 1.5 + phase)
                    mesh.material.opacity = mesh.userData.baseOpacity + pulse
                }
            })

            controls.update()
            renderer.render(scene, camera)
        }

        animate()

        const handleResize = () => {
            const w = mount.clientWidth
            const h = mount.clientHeight
            camera.aspect = w / h
            camera.updateProjectionMatrix()
            renderer.setSize(w, h)
        }
        window.addEventListener('resize', handleResize)

        const handleMouseDown = () => { controls.autoRotate = false }
        const handleMouseUp = () => { controls.autoRotate = true }
        mount.addEventListener('mousedown', handleMouseDown)
        mount.addEventListener('mouseup', handleMouseUp)

        return () => {
            clearActivationTimers()
            cancelAnimationFrame(animId)
            window.removeEventListener('resize', handleResize)
            mount.removeEventListener('mousedown', handleMouseDown)
            mount.removeEventListener('mouseup', handleMouseUp)
            renderer.dispose()
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
        }
    }, [])

    return <div ref={mountRef} className="w-full h-full absolute inset-0" />
}