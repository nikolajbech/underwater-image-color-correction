'use strict';

module.exports = function getColorFilterMatrix(pixels, width, height) {

    // Magic values:
    const numOfPixels = width * height
    const thresholdRatio = 2000
    const thresholdLevel = numOfPixels / thresholdRatio
    const minAvgRed = 60
    const maxHueShift = 120
    const blueMagicValue = 1.2

    // Objects:
    let hist = { r: [], g: [], b: [] }
    let normalize = { r: [], g: [], b: [] }
    let adjust = { r: [], g: [], b: [] }
    let hueShift = 0

    // Initialize objects
    for (let i = 0; i < 256; i++) {
        hist.r.push(0)
        hist.g.push(0)
        hist.b.push(0)
    }

    const avg = calculateAverageColor(pixels, width, height)

    // Calculate shift amount:
    let newAvgRed = avg.r
    while (newAvgRed < minAvgRed) {
        const shifted = hueShiftRed(avg.r, avg.g, avg.b, hueShift)
        newAvgRed = shifted.r + shifted.g + shifted.b
        hueShift++
        if (hueShift > maxHueShift) newAvgRed = 60 // Max value
    }

    // Create hisogram with new red values:
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width * 4; x += 4) {
            const pos = x + (width * 4) * y

            let red = Math.round(pixels[pos + 0])
            const green = Math.round(pixels[pos + 1])
            const blue = Math.round(pixels[pos + 2])

            const shifted = hueShiftRed(red, green, blue, hueShift) // Use new calculated red value
            red = shifted.r + shifted.g + shifted.b
            red = Math.min(255, Math.max(0, red))
            red = Math.round(red)

            hist.r[red] += 1
            hist.g[green] += 1
            hist.b[blue] += 1
        }
    }

    // Push 0 as start value in normalize array:
    normalize.r.push(0)
    normalize.g.push(0)
    normalize.b.push(0)

    // Find values under threshold:
    for (let i = 0; i < 256; i++) {
        if (hist.r[i] - thresholdLevel < 2) normalize.r.push(i)
        if (hist.g[i] - thresholdLevel < 2) normalize.g.push(i)
        if (hist.b[i] - thresholdLevel < 2) normalize.b.push(i)
    }

    // Push 255 as end value in normalize array:
    normalize.r.push(255)
    normalize.g.push(255)
    normalize.b.push(255)

    adjust.r = normalizingInterval(normalize.r)
    adjust.g = normalizingInterval(normalize.g)
    adjust.b = normalizingInterval(normalize.b)

    // Make histogram:
    const shifted = hueShiftRed(1, 1, 1, hueShift)

    const redGain = 256 / (adjust.r.high - adjust.r.low)
    const greenGain = 256 / (adjust.g.high - adjust.g.low)
    const blueGain = 256 / (adjust.b.high - adjust.b.low)

    const redOffset = (-adjust.r.low / 256) * redGain
    const greenOffset = (-adjust.g.low / 256) * greenGain
    const blueOffset = (-adjust.b.low / 256) * blueGain

    const adjstRed = shifted.r * redGain
    const adjstRedGreen = shifted.g * redGain
    const adjstRedBlue = shifted.b * redGain * blueMagicValue

    return [
        adjstRed, adjstRedGreen, adjstRedBlue, 0, redOffset,
        0, greenGain, 0, 0, greenOffset,
        0, 0, blueGain, 0, blueOffset,
        0, 0, 0, 1, 0,
    ]
}

function calculateAverageColor(pixels, width, height) {
    const avg = { r: 0, g: 0, b: 0 }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width * 4; x += 4) {
            const pos = x + (width * 4) * y

            // Sum values:
            avg.r = avg.r + pixels[pos + 0]
            avg.g = avg.g + pixels[pos + 1]
            avg.b = avg.b + pixels[pos + 2]
        }
    }

    // Calculate average:
    avg.r = avg.r / (width * height)
    avg.g = avg.g / (width * height)
    avg.b = avg.b / (width * height)

    return avg
}

function hueShiftRed(r, g, b, h) {
    let U = Math.cos(h * Math.PI / 180)
    let W = Math.sin(h * Math.PI / 180)

    r = (0.299 + 0.701 * U + 0.168 * W) * r
    g = (0.587 - 0.587 * U + 0.330 * W) * g
    b = (0.114 - 0.114 * U - 0.497 * W) * b

    return { r, g, b }
}

function normalizingInterval(normArray) {
    let high = 255
    let low = 0
    let maxDist = 0

    for (let i = 1; i < normArray.length; i++) {
        let dist = normArray[i] - normArray[i - 1]
        if (dist > maxDist) {
            maxDist = dist;
            high = normArray[i]
            low = normArray[i - 1]
        }
    }

    return { low, high }
}