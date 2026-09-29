import Box from '@mui/joy/Box'
import Sheet from '@mui/joy/Sheet'
import Typography from '@mui/joy/Typography'

import AutoTextarea from './AutoTextarea'
import { handleTextKeys } from './keys'
import { codeHeaderSx, codeLabelSx, codePreSx, codeSheetSx } from '../../components/Content/blockStyles'

// Языки, которые умеет подсвечивать сайт (см. components/Content/highlight.js)
const LANGUAGES = ['C#', 'HTML', 'CSS', 'SCSS', 'JavaScript', 'JSX', 'TypeScript', 'JSON', 'PHP', 'SQL', 'YAML', 'Markdown', 'Bash', 'diff']
const INDENT = '    '

/**
 * Код правится в той же плашке, что на сайте. Tab ставит отступ, Enter
 * переносит строку и сохраняет отступ текущей строки — как в редакторе кода.
 * Подсветка появится, когда закончите правку блока.
 */
export default function CodeEditor({ block, onChange, focus, keys }) {
    const setContent = (el, content, caret) => {
        onChange({ ...block, content })
        // Курсор ставим после того, как React перерисует поле с новым текстом
        requestAnimationFrame(() => el.setSelectionRange(caret, caret))
    }

    const onKeyDown = (event) => {
        const el = event.currentTarget
        const { selectionStart: start, selectionEnd: end, value } = el

        if (event.key === 'Tab' && !event.shiftKey) {
            event.preventDefault()
            setContent(el, value.slice(0, start) + INDENT + value.slice(end), start + INDENT.length)
            return
        }

        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault()
            const lineStart = value.lastIndexOf('\n', start - 1) + 1
            const indent = value.slice(lineStart).match(/^[ \t]*/)[0]
            setContent(el, `${value.slice(0, start)}\n${indent}${value.slice(end)}`, start + 1 + indent.length)
            return
        }

        handleTextKeys(event, {
            onBackspaceAtStart: keys.onBackspaceAtStart,
            onPrev: keys.onPrev,
            onNext: keys.onNext,
            onEscape: keys.onEscape,
        })
    }

    return (
        <Sheet variant="outlined" sx={codeSheetSx}>
            <Box sx={codeHeaderSx}>
                <Box
                    component="input"
                    value={block.language ?? ''}
                    onChange={(event) => onChange({ ...block, language: event.target.value })}
                    placeholder="Язык"
                    list="code-languages"
                    aria-label="Язык кода"
                    sx={{
                        ...codeLabelSx,
                        p: 0,
                        m: 0,
                        width: 160,
                        border: 'none',
                        outline: 'none',
                        bgcolor: 'transparent',
                        '&::placeholder': { color: 'text.tertiary', opacity: 0.7 },
                    }}
                />
                <datalist id="code-languages">
                    {LANGUAGES.map((language) => (
                        <option key={language} value={language} />
                    ))}
                </datalist>
                <Typography sx={{ ...codeLabelSx, opacity: 0.6 }}>Tab — отступ</Typography>
            </Box>
            <Box sx={{ ...codePreSx, overflowX: 'auto' }}>
                <AutoTextarea
                    value={block.content}
                    onChange={(content) => onChange({ ...block, content })}
                    focus={focus}
                    onKeyDown={onKeyDown}
                    placeholder="Код"
                    aria-label="Код"
                    wrap="off"
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                    sx={{ whiteSpace: 'pre', overflowX: 'auto', minWidth: '100%', tabSize: 4 }}
                />
            </Box>
        </Sheet>
    )
}
