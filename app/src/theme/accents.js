// Цветовые темы курсов. По одному градиенту на курс — цветные, но не кричащие.
// Используются в карточках, орбите на главной и в шапке страницы курса.

function accent(solid, light, dark, text) {
    return {
        solid,
        light: {
            gradient: `linear-gradient(135deg, ${light[0]} 0%, ${light[1]} 55%, ${light[2]} 100%)`,
            glow: `${solid}4d`,
            chip: 'rgba(255, 255, 255, 0.58)',
            text: text[0],
        },
        dark: {
            gradient: `linear-gradient(135deg, ${dark[0]} 0%, ${dark[1]} 55%, ${dark[2]} 100%)`,
            glow: `${solid}4d`,
            chip: 'rgba(255, 255, 255, 0.12)',
            text: text[1],
        },
    }
}

const accents = {
    mint: accent(
        '#12866a',
        ['#a8e9cf', '#c6f0de', '#b6e8f2'],
        ['#0f5a48', '#12554f', '#0f4657'],
        ['#0a3a2d', '#d8f8ec'],
    ),
    lilac: accent(
        '#6b3fd4',
        ['#d3c2fa', '#ded1fb', '#c9d6fd'],
        ['#3b2585', '#432477', '#252a7a'],
        ['#2b1362', '#e7dcff'],
    ),
    peach: accent(
        '#dd5f1b',
        ['#fbd3b4', '#fce0c6', '#fbcfc6'],
        ['#7a3a14', '#743214', '#6d2323'],
        ['#5d2b0b', '#ffe3cf'],
    ),
    sky: accent(
        '#1668c9',
        ['#b6dcfa', '#cae7fc', '#bdeaf2'],
        ['#12456f', '#124d78', '#0f5561'],
        ['#0b3357', '#d7ecff'],
    ),
    rose: accent(
        '#cf3b6f',
        ['#fac3d6', '#fbd2e2', '#f3c9fa'],
        ['#73203f', '#6c2140', '#5c2263'],
        ['#5b1533', '#ffdae8'],
    ),
    amber: accent(
        '#b07800',
        ['#fbe3a8', '#fcecc4', '#f8e8b0'],
        ['#6b4e0c', '#63480f', '#5e4a14'],
        ['#4a3200', '#fdefc7'],
    ),
    teal: accent(
        '#0c8a96',
        ['#a9e6ec', '#c2eef2', '#b4ecd9'],
        ['#0b5a63', '#0c6068', '#0c5b4e'],
        ['#053f47', '#d2f4f8'],
    ),
    indigo: accent(
        '#4048cd',
        ['#c3c8fa', '#d3d6fc', '#c2d5fb'],
        ['#282e86', '#2a3190', '#233c8c'],
        ['#1c2172', '#dfe2ff'],
    ),
}

export const accentNames = Object.keys(accents)

export function getAccent(name) {
    return accents[name] ?? accents.mint
}

export default accents
