/**
 * Génère les positions des neurones en forme de cerveau humain
 * Distribution sur la surface — deux hémisphères avec sillon central
 */

export function generateBrainNeurons(count = 300) {
    const neurons = []

    for (let i = 0; i < count; i++) {
        const isLeft = i < count / 2

        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)

        let r = 2.8

        const sinPhi = Math.sin(phi)
        const cosPhi = Math.cos(phi)
        const sinTheta = Math.sin(theta)
        const cosTheta = Math.cos(theta)

        r += 0.3 * Math.sin(2 * phi) * Math.cos(2 * theta)
        r += 0.2 * Math.sin(3 * phi)
        r += 0.15 * Math.cos(4 * theta) * sinPhi

        let x = r * sinPhi * cosTheta
        let y = r * cosPhi * 0.85
        let z = r * sinPhi * sinTheta * 0.9

        const gap = 0.25
        if (isLeft) {
            x = x < 0 ? x - gap : -Math.abs(x) - gap
        } else {
            x = x > 0 ? x + gap : Math.abs(x) + gap
        }

        if (y < -2.2) y = -2.2 + Math.random() * 0.4

        neurons.push({
            id: i,
            position: [x, y, z],
            hemisphere: isLeft ? 'left' : 'right',
            activationDelay: Math.random() * 2000,
            size: 0.04 + Math.random() * 0.04,
            baseOpacity: 0.3,
        })
    }

    return neurons
}

/**
 * Génère les connexions entre neurones proches
 */
export function generateSynapses(neurons, maxDistance = 1.4, maxConnections = 4) {
    const synapses = []

    for (let i = 0; i < neurons.length; i++) {
        let connections = 0
        const [x1, y1, z1] = neurons[i].position

        for (let j = i + 1; j < neurons.length; j++) {
            if (connections >= maxConnections) break

            const [x2, y2, z2] = neurons[j].position
            const dist = Math.sqrt(
                (x2 - x1) ** 2 +
                (y2 - y1) ** 2 +
                (z2 - z1) ** 2
            )

            if (dist < maxDistance) {
                synapses.push({
                    from: i,
                    to: j,
                    distance: dist,
                    opacity: Math.max(0.05, 0.25 - dist / maxDistance * 0.2),
                })
                connections++
            }
        }
    }

    return synapses
}