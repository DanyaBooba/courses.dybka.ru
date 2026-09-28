// Типы блоков, которые можно добавить в урок, — в том порядке, в каком они
// стоят в меню «Добавить блок». Схема каждого блока — в src/data/courses.js.

import {
    CodeIcon,
    ExamIcon,
    ImageIcon,
    LightbulbIcon,
    ListBulletsIcon,
    ListChecksIcon,
    ListNumbersIcon,
    QuotesIcon,
    SquaresFourIcon,
    TableIcon,
    TextHThreeIcon,
    TextHTwoIcon,
    TextTIcon,
} from '@phosphor-icons/react'

let questionCounter = 0

/** Уникальный id вопроса теста: по нему тест помнит ответы. */
export function questionId() {
    questionCounter += 1
    return `q${Date.now().toString(36)}${questionCounter}`
}

export function blankQuestion() {
    return { id: questionId(), question: '', options: ['', ''], correct: [0], hint: '' }
}

export const BLOCK_TYPES = [
    { type: 'p', label: 'Текст', icon: TextTIcon, create: () => ({ block: 'p', content: '' }) },
    { type: 'h2', label: 'Заголовок', icon: TextHTwoIcon, create: () => ({ block: 'h2', content: '' }) },
    { type: 'h3', label: 'Подзаголовок', icon: TextHThreeIcon, create: () => ({ block: 'h3', content: '' }) },
    { type: 'img', label: 'Картинка', icon: ImageIcon, create: () => ({ block: 'img', src: null, alt: '', caption: '' }) },
    { type: 'ul', label: 'Список', icon: ListBulletsIcon, create: () => ({ block: 'ul', items: [''] }) },
    { type: 'ol', label: 'Нумерованный список', icon: ListNumbersIcon, create: () => ({ block: 'ol', items: [''] }) },
    { type: 'code', label: 'Код', icon: CodeIcon, create: () => ({ block: 'code', content: '', language: '' }) },
    { type: 'note', label: 'Заметка', icon: LightbulbIcon, create: () => ({ block: 'note', content: '' }) },
    { type: 'quote', label: 'Цитата', icon: QuotesIcon, create: () => ({ block: 'quote', content: '' }) },
    {
        type: 'table',
        label: 'Таблица',
        icon: TableIcon,
        create: () => ({ block: 'table', head: ['', ''], rows: [['', '']] }),
    },
    {
        type: 'checklist',
        label: 'Чек-лист',
        icon: ListChecksIcon,
        create: () => ({ block: 'checklist', title: '', items: [''] }),
    },
    {
        type: 'courses',
        label: 'Подборка курсов',
        icon: SquaresFourIcon,
        create: () => ({ block: 'courses', title: '', items: [] }),
    },
    {
        type: 'quiz',
        label: 'Тест',
        icon: ExamIcon,
        create: () => ({
            block: 'quiz',
            quiz: { title: 'Проверка усвоенного', intro: '', questions: [blankQuestion()] },
        }),
    },
]

export function blockType(type) {
    return BLOCK_TYPES.find((item) => item.type === type) ?? BLOCK_TYPES[0]
}

/** Блоки с одним полем текста: их можно превращать друг в друга без потерь. */
export const TEXT_TYPES = ['p', 'h2', 'h3', 'quote', 'note']

/** Блок пустой — его можно удалить Backspace'ом, не спрашивая. */
export function isEmptyBlock(block) {
    if (TEXT_TYPES.includes(block.block) || block.block === 'code') return !block.content
    if (block.block === 'img') return !block.src && !block.caption
    if (block.block === 'ul' || block.block === 'ol') {
        return block.items.every((item) => (typeof item === 'string' ? !item : false))
    }
    return false
}

/**
 * Markdown-сокращения в начале пустого абзаца, как в заметках:
 * «## » — заголовок, «> » — цитата, «- » — список и т. д.
 */
export const SHORTCUTS = [
    { prefix: '### ', type: 'h3' },
    { prefix: '## ', type: 'h2' },
    { prefix: '# ', type: 'h2' },
    { prefix: '> ', type: 'quote' },
    { prefix: '! ', type: 'note' },
    { prefix: '- ', type: 'ul' },
    { prefix: '* ', type: 'ul' },
    { prefix: '1. ', type: 'ol' },
    { prefix: '```', type: 'code' },
]

// ── Вложенные списки ─────────────────────────────────────────────────────
//
// В данных список — дерево: ['пункт', { text: 'пункт', items: ['вложенный'] }].
// В редакторе его удобнее держать плоским: [{ text, depth }], а Tab и
// Shift+Tab просто меняют depth.

export function flattenItems(items, depth = 0) {
    return items.flatMap((item) =>
        typeof item === 'string'
            ? [{ text: item, depth }]
            : [{ text: item.text ?? '', depth }, ...flattenItems(item.items ?? [], depth + 1)],
    )
}

export function nestItems(flat) {
    const root = { items: [] }
    const stack = [{ depth: -1, node: root }]

    flat.forEach(({ text, depth }) => {
        while (stack[stack.length - 1].depth >= depth) stack.pop()
        const node = { text, items: [] }
        stack[stack.length - 1].node.items.push(node)
        stack.push({ depth, node })
    })

    const simplify = (nodes) =>
        nodes.map((node) => (node.items.length ? { text: node.text, items: simplify(node.items) } : node.text))

    return simplify(root.items)
}
