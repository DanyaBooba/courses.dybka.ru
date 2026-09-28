// Клавиши в текстовых полях редактора — как в заметках:
//   Enter        — новый абзац (текст после курсора уезжает в него)
//   Shift+Enter  — перенос строки внутри блока
//   Backspace    — в начале блока: удалить пустой или склеить с предыдущим
//   ↑ / ↓        — на первой / последней строке: перейти в соседний блок
//   Esc          — закончить правку блока

/**
 * Обработчик keydown для поля. Каждое действие необязательно: если его
 * не передали, клавиша работает как обычно.
 */
export function handleTextKeys(event, { onSplit, onBackspaceAtStart, onPrev, onNext, onEscape }) {
    // Идёт набор через IME (китайский, японский) — Enter подтверждает слово
    if (event.nativeEvent.isComposing) return

    const el = event.currentTarget
    const { selectionStart: start, selectionEnd: end, value } = el
    const collapsed = start === end

    if (event.key === 'Enter' && !event.shiftKey && onSplit) {
        event.preventDefault()
        onSplit(value.slice(0, start), value.slice(end))
        return
    }

    if (event.key === 'Backspace' && collapsed && start === 0 && onBackspaceAtStart) {
        event.preventDefault()
        onBackspaceAtStart(value)
        return
    }

    // Стрелки уводят в соседний блок, только когда курсор уже на краю поля:
    // иначе они двигают его по строкам, как обычно
    if (event.key === 'ArrowUp' && collapsed && onPrev && !value.slice(0, start).includes('\n') && isFirstLine(el)) {
        event.preventDefault()
        onPrev()
        return
    }

    if (event.key === 'ArrowDown' && collapsed && onNext && !value.slice(end).includes('\n') && isLastLine(el)) {
        event.preventDefault()
        onNext()
        return
    }

    if (event.key === 'Escape' && onEscape) {
        event.preventDefault()
        onEscape()
    }
}

// Строки внутри поля считаем по высоте: переносы по ширине — тоже строки
function lineHeight(el) {
    const value = parseFloat(getComputedStyle(el).lineHeight)
    return Number.isFinite(value) ? value : 24
}

function caretTop(el, position) {
    // Меряем, на какой высоте окажется курсор, через зеркальный div с тем же текстом
    const mirror = document.createElement('div')
    const style = getComputedStyle(el)
    ;['font', 'letterSpacing', 'lineHeight', 'padding', 'border', 'boxSizing', 'whiteSpace', 'wordBreak', 'overflowWrap'].forEach(
        (key) => {
            mirror.style[key] = style[key]
        },
    )
    mirror.style.position = 'absolute'
    mirror.style.visibility = 'hidden'
    mirror.style.whiteSpace = 'pre-wrap'
    mirror.style.width = `${el.clientWidth}px`
    mirror.textContent = el.value.slice(0, position)
    const marker = document.createElement('span')
    marker.textContent = '​'
    mirror.appendChild(marker)
    document.body.appendChild(mirror)
    const top = marker.offsetTop
    mirror.remove()
    return top
}

function isFirstLine(el) {
    return caretTop(el, el.selectionStart) < lineHeight(el) * 0.9
}

function isLastLine(el) {
    return caretTop(el, el.selectionEnd) >= caretTop(el, el.value.length) - lineHeight(el) * 0.1
}
