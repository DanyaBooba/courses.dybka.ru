import { useRef } from 'react'
import Box from '@mui/joy/Box'
import Sheet from '@mui/joy/Sheet'
import Typography from '@mui/joy/Typography'

import AutoTextarea from './AutoTextarea'
import { handleTextKeys } from './keys'
import { NoteIcon } from '../../components/Content/ContentBlocks'
import {
    headingLevel,
    headingSx,
    noteSx,
    noteTextSx,
    paragraphSx,
    quoteSx,
    quoteTextSx,
} from '../../components/Content/blockStyles'

const placeholders = {
    p: 'Текст. «## » — заголовок, «- » — список, «> » — цитата, «```» — код',
    h2: 'Заголовок раздела',
    h3: 'Подзаголовок',
    quote: 'Цитата',
    note: 'Заметка на полях: совет, предупреждение, важная мысль',
}

/**
 * Правка текстовых блоков — абзаца, заголовков, цитаты и заметки — прямо в их
 * оформлении: вокруг поля та же вёрстка, что у блока на сайте.
 */
export default function TextBlockEditor({ block, onChange, focus, keys, onPaste }) {
    // Текст до начала набора через IME или «мёртвую» клавишу (в раскладках, где
    // ` ставит ударение, третий ` набирается так). Пока набор не закончен,
    // сокращения не срабатывают — иначе поле сменится, а недонабранный символ
    // попадёт в новое поле при следующем нажатии или вставке
    const beforeComposition = useRef(null)

    const field = (
        <AutoTextarea
            value={block.content}
            onChange={(content, { composing }) => onChange({ ...block, content }, { composing })}
            onCompositionStart={(event) => (beforeComposition.current = event.currentTarget.value)}
            onCompositionEnd={(event) =>
                onChange({ ...block, content: event.currentTarget.value }, { before: beforeComposition.current })
            }
            focus={focus}
            placeholder={placeholders[block.block]}
            onKeyDown={(event) => handleTextKeys(event, keys)}
            onPaste={onPaste}
            aria-label={placeholders[block.block]}
        />
    )

    if (block.block === 'h2' || block.block === 'h3') {
        const level = block.block === 'h2' ? 2 : 3
        return (
            <Typography component="div" level={headingLevel(level)} sx={headingSx(level)}>
                {field}
            </Typography>
        )
    }

    if (block.block === 'quote') {
        return (
            <Box component="blockquote" sx={quoteSx}>
                <Typography component="div" sx={quoteTextSx}>
                    {field}
                </Typography>
            </Box>
        )
    }

    if (block.block === 'note') {
        return (
            <Sheet variant="plain" sx={noteSx}>
                <NoteIcon />
                <Typography component="div" sx={{ ...noteTextSx, flex: 1 }}>
                    {field}
                </Typography>
            </Sheet>
        )
    }

    return (
        <Typography component="div" sx={paragraphSx}>
            {field}
        </Typography>
    )
}
