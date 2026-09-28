// Цветовые темы курсов.
//
// Плоские заливки (градиент только у главных кнопок): у каждого курса одна заливка, одна «чернильная»
// краска для кнопок и цифр и один цветной контур для подписей. Цвет здесь —
// как краска в печатном справочнике: плашка, номер, тонкая линейка.
//
// Поля схемы (light / dark):
//   bg     — заливка плашки (карточка, шапка курса)
//   chip   — заливка мелких элементов на плашке (теги, кнопки-ссылки)
//   rule   — линейка и контур на плашке
//   text   — цвет текста на плашке
//   shadow — аккуратная тень под цвет плашки (только при наведении)

function accent({ solid, tint, light, dark, solidDark }) {
    return {
        solid,
        // Заливка кнопки в тёмной теме. У большинства курсов совпадает с solid,
        // но почти чёрные краски (Unity, Expo) на тёмной плашке пропадают —
        // для них задаётся осветлённый вариант.
        solidDark: solidDark ?? solid,
        // краска, читаемая на обычном фоне страницы в тёмной теме
        tint,
        light: {
            bg: light.bg,
            chip: light.chip,
            rule: light.rule,
            text: light.text,
            shadow: `0 12px 28px -12px ${solid}20`,
        },
        dark: {
            bg: dark.bg,
            chip: dark.chip,
            rule: dark.rule,
            text: dark.text,
            shadow: `0 12px 28px -12px ${tint}4d`,
        },
    }
}

const accents = {
    mint: accent({
        solid: '#0f7a5f',
        tint: '#5fc9a8',
        light: { bg: '#dcece4', chip: '#c5ded2', rule: '#a9cdbd', text: '#0b3327' },
        dark: { bg: '#18332b', chip: '#20463b', rule: '#2c5b4c', text: '#cbe7db' },
    }),
    lilac: accent({
        solid: '#6338c4',
        tint: '#a68ce8',
        light: { bg: '#e3def3', chip: '#d2cbec', rule: '#bdb3e2', text: '#2a1a5e' },
        dark: { bg: '#262046', chip: '#342c5e', rule: '#443a76', text: '#ded7f6' },
    }),
    peach: accent({
        solid: '#c1551d',
        tint: '#e79463',
        light: { bg: '#f4e0d0', chip: '#eccdb7', rule: '#e0b79c', text: '#54240d' },
        dark: { bg: '#3a251b', chip: '#4e3225', rule: '#664234', text: '#f2d9c6' },
    }),
    sky: accent({
        solid: '#155f97',
        tint: '#6aaedd',
        light: { bg: '#d9e6f0', chip: '#c3d8ea', rule: '#a8c5de', text: '#0d3050' },
        dark: { bg: '#17293a', chip: '#1f3a50', rule: '#2a4d68', text: '#cee2f2' },
    }),
    rose: accent({
        solid: '#b13760',
        tint: '#df7b9d',
        light: { bg: '#f2dbe2', chip: '#eac7d2', rule: '#dcadbd', text: '#541527' },
        dark: { bg: '#381d27', chip: '#4d2835', rule: '#653747', text: '#f2d6df' },
    }),
    amber: accent({
        solid: '#8f6508',
        tint: '#d9a938',
        light: { bg: '#f1e4c4', chip: '#e8d5ab', rule: '#d9c28c', text: '#433002' },
        dark: { bg: '#342a15', chip: '#48391d', rule: '#5f4c28', text: '#eedfb7' },
    }),
    teal: accent({
        solid: '#0b7280',
        tint: '#4fbac6',
        light: { bg: '#d8e8ea', chip: '#bfdade', rule: '#a3c8cd', text: '#073b42' },
        dark: { bg: '#143034', chip: '#1b4349', rule: '#255960', text: '#cbe6ea' },
    }),
    indigo: accent({
        solid: '#3a44b0',
        tint: '#8b93e4',
        light: { bg: '#dedff2', chip: '#ccceeb', rule: '#b4b7e0', text: '#1b2065' },
        dark: { bg: '#1f2245', chip: '#2c305d', rule: '#3b4076', text: '#d8dbf4' },
    }),
    // Графит самого редактора Unity: почти чёрный, без цветового уклона
    unity: accent({
        solid: '#22262b',
        solidDark: '#414a53',
        tint: '#a8b0b8',
        light: { bg: '#dfe1e3', chip: '#cdd0d3', rule: '#b3b7bb', text: '#1b1f23' },
        dark: { bg: '#212528', chip: '#2c3135', rule: '#3d4247', text: '#dde0e3' },
    }),
    // Зелёный Node.js
    node: accent({
        solid: '#3f7d34',
        tint: '#89c47a',
        light: { bg: '#dfebd8', chip: '#cbe0c1', rule: '#aecfa1', text: '#1f3d19' },
        dark: { bg: '#1b2c17', chip: '#243d1f', rule: '#325130', text: '#d3e8ca' },
    }),
    // Тёмно-синий, почти чёрный — как логотип Expo
    expo: accent({
        solid: '#1b1b2c',
        solidDark: '#3c3c58',
        tint: '#a3a3c4',
        light: { bg: '#dedee6', chip: '#cccdd8', rule: '#b3b4c4', text: '#17172a' },
        dark: { bg: '#1e1e2c', chip: '#282838', rule: '#38384c', text: '#dcdce8' },
    }),
}

export const accentNames = Object.keys(accents)

export function getAccent(name) {
    return accents[name] ?? accents.mint
}

/**
 * Краска курса для текста и линеек на обычном фоне страницы: в светлой теме
 * это насыщенный `solid`, в тёмной — осветлённый `tint`, иначе не читается.
 */
export function getInk(accent, scheme) {
    return scheme === 'dark' ? accent.tint : accent.solid
}

export default accents
