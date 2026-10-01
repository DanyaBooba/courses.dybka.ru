import { useRef, useState } from 'react'
import Box from '@mui/joy/Box'

import AutoTextarea from './AutoTextarea'
import { handleTextKeys } from './keys'
import { flattenItems, nestItems } from '../blocks'
import { listSx } from '../../components/Content/blockStyles'

// Маркеры вложенных пунктов — как у браузера во вложенных списках на сайте
const NESTED_MARKERS = ['disc', 'circle', 'square']

/**
 * Список правится по пунктам, как в заметках: Enter — новый пункт,
 * Enter на пустом — выход из списка, Tab / Shift+Tab — вложить и вынуть.
 *
 * Выход из списка — `keys.onBreak(до, текст, после)`: список режется абзацем
 * с этим текстом, пункты до и после остаются двумя списками.
 */
export default function ListEditor({ block, onChange, focus, keys, onPaste }) {
    const ordered = block.block === 'ol'
    const flat = flattenItems(block.items)
    const [itemFocus, setItemFocus] = useState(null)
    const focusCounter = useRef(0)

    const focusItem = (index, caret) => {
        focusCounter.current += 1
        setItemFocus({ index, caret, token: focusCounter.current })
    }

    // Запрос фокуса снаружи (перешли стрелкой из соседнего блока) — в первый
    // или последний пункт; внутренний — в конкретный пункт
    const outerIndex = focus ? (focus.caret === 'start' ? 0 : flat.length - 1) : -1

    const commit = (next, focusIndex, caret) => {
        onChange({ ...block, items: nestItems(next) })
        if (focusIndex !== undefined) focusItem(focusIndex, caret)
    }

    const setItem = (index, change) => commit(flat.map((item, i) => (i === index ? { ...item, ...change } : item)))

    const indent = (index, step) => {
        const item = flat[index]
        // Вложить можно на один уровень глубже предыдущего пункта, не больше
        const max = index === 0 ? 0 : flat[index - 1].depth + 1
        const depth = Math.max(0, Math.min(max, item.depth + step))
        if (depth === item.depth) return
        // Вынимая пункт, тянем за ним и его собственные вложенные пункты
        const next = flat.map((other, i) => {
            if (i === index) return { ...other, depth }
            if (i > index && isDescendant(flat, index, i)) return { ...other, depth: Math.max(0, other.depth + (depth - item.depth)) }
            return other
        })
        // Фокус не трогаем: поле того же пункта остаётся на месте
        commit(next)
    }

    // Номера для нумерованного списка: считаются только пункты верхнего уровня
    const numbers = flat.map((_, index) => flat.slice(0, index + 1).filter((item) => item.depth === 0).length)

    return (
        <Box component={ordered ? 'ol' : 'ul'} sx={listSx}>
            {flat.map((item, index) => {
                const itemFocusRequest =
                    itemFocus?.index === index ? itemFocus : outerIndex === index ? focus : null

                return (
                    <Box
                        component="li"
                        key={index}
                        value={ordered && item.depth === 0 ? numbers[index] : undefined}
                        sx={{
                            mb: 1,
                            ml: item.depth * 3,
                            // Во вложенном пункте и нумерованного списка — маркер, а не номер
                            ...(item.depth > 0 && { listStyleType: NESTED_MARKERS[Math.min(item.depth, 2)] }),
                        }}
                    >
                        <AutoTextarea
                            inline
                            value={item.text}
                            onChange={(text) => setItem(index, { text })}
                            focus={itemFocusRequest}
                            placeholder={index === 0 ? 'Пункт списка' : ''}
                            aria-label={`Пункт ${index + 1}`}
                            onPaste={onPaste}
                            onKeyDown={(event) => {
                                if (event.key === 'Tab') {
                                    event.preventDefault()
                                    indent(index, event.shiftKey ? -1 : 1)
                                    return
                                }

                                handleTextKeys(event, {
                                    onSplit: (before, after) => {
                                        // Enter на пустом пункте: вложенный — вынимаем, верхний — выходим из списка
                                        if (!item.text) {
                                            if (item.depth > 0) return indent(index, -1)
                                            return keys.onBreak(nestItems(flat.slice(0, index)), '', nestItems(flat.slice(index + 1)))
                                        }
                                        const next = [...flat]
                                        next.splice(index, 1, { ...item, text: before }, { text: after, depth: item.depth })
                                        commit(next, index + 1, 'start')
                                    },
                                    onBackspaceAtStart: (text) => {
                                        if (item.depth > 0) return indent(index, -1)
                                        // Первый пункт превращается в абзац над списком
                                        if (index === 0) return keys.onBreak([], text, nestItems(flat.slice(1)))
                                        const prev = flat[index - 1]
                                        const next = flat.filter((_, i) => i !== index)
                                        next[index - 1] = { ...prev, text: prev.text + text }
                                        commit(next, index - 1, prev.text.length)
                                    },
                                    onPrev: () =>
                                        index > 0 ? focusItem(index - 1, 'end') : keys.onPrev?.(),
                                    onNext: () =>
                                        index < flat.length - 1
                                            ? focusItem(index + 1, 'start')
                                            : keys.onNext?.(),
                                    onEscape: keys.onEscape,
                                })
                            }}
                        />
                    </Box>
                )
            })}
        </Box>
    )
}

// Пункт `i` вложен в пункт `parent`: идёт после него и глубже, пока не встретился равный
function isDescendant(flat, parent, i) {
    for (let k = parent + 1; k <= i; k += 1) {
        if (flat[k].depth <= flat[parent].depth) return false
    }
    return true
}
