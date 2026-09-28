// Оформление блоков контента (см. ContentBlocks.jsx).
//
// Вынесено отдельно: редактор уроков в панели управления рисует блоки теми же
// стилями, чтобы текст при правке выглядел ровно как на сайте.

export function headingSx(level) {
    return {
        // Раздел открывается тонкой линейкой — как в печатном справочнике
        mt: level === 2 ? 5 : 4,
        pt: level === 2 ? 2 : 0,
        mb: 1.5,
        borderTop: level === 2 ? '1px solid' : 'none',
        borderColor: 'page.border',
        fontWeight: 600,
        letterSpacing: '-0.02em',
        scrollMarginTop: '80px',
    }
}

export const headingLevel = (level) => (level === 2 ? 'h3' : 'h4')

export const paragraphSx = { my: 2, lineHeight: 1.75, color: 'text.secondary', fontSize: 'lg' }

export const quoteSx = {
    my: 3.5,
    mx: 0,
    pl: 2.5,
    borderLeft: '2px solid',
    borderColor: 'page.rule',
}

export const quoteTextSx = {
    fontFamily: 'display',
    fontStyle: 'italic',
    fontSize: 'lg',
    lineHeight: 1.6,
    color: 'text.primary',
}

export const noteSx = {
    my: 3,
    p: 2.25,
    borderRadius: 'md',
    display: 'flex',
    gap: 1.75,
    alignItems: 'flex-start',
    bgcolor: 'page.noteBg',
    borderLeft: '2px solid',
    borderColor: 'page.noteBar',
}

export const noteTextSx = { lineHeight: 1.7, color: 'text.primary' }

export const figureSx = {
    my: 4,
    mx: 0,
    borderRadius: 'md',
    overflow: 'hidden',
    border: '1px solid',
    borderColor: 'page.border',
    bgcolor: 'background.level1',
}

export const captionSx = {
    px: 2,
    py: 1.25,
    borderTop: '1px solid',
    borderColor: 'page.border',
    fontSize: 'sm',
    color: 'text.tertiary',
}

export const codeSheetSx = {
    my: 3,
    borderRadius: 'md',
    overflow: 'hidden',
    borderColor: 'page.border',
    bgcolor: 'page.codeBg',
    maxWidth: '100%',
}

export const codeHeaderSx = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    px: 2,
    py: 1,
    borderBottom: '1px solid',
    borderColor: 'page.border',
}

export const codeLabelSx = {
    fontFamily: 'code',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: 'text.tertiary',
}

export const codePreSx = {
    m: 0,
    p: 2.5,
    overflowX: 'auto',
    maxWidth: '100%',
    fontFamily: 'code',
    fontSize: '14px',
    lineHeight: 1.65,
    color: 'text.primary',
}

export const listSx = {
    my: 2,
    pl: 3,
    color: 'text.secondary',
    fontSize: 'lg',
    lineHeight: 1.7,
    '& ::marker': { color: 'primary.400' },
}

export const tableSheetSx = {
    my: 3,
    borderRadius: 'lg',
    borderColor: 'page.border',
    // Широкая таблица прокручивается сама, а не растягивает страницу
    maxWidth: '100%',
    overflowX: 'auto',
    overflowY: 'hidden',
    WebkitOverflowScrolling: 'touch',
}

export const tableSx = {
    '--TableCell-headBackground': 'var(--dd-palette-background-level1)',
    '--TableCell-paddingY': '12px',
    '--TableCell-paddingX': '16px',
    width: 'max-content',
    minWidth: '100%',
    '& th, & td': { whiteSpace: 'normal', minWidth: '132px' },
}

/** Колонка блоков и обёртка одного блока. */
export const blocksSx = { minWidth: 0, maxWidth: '100%', '& > *:first-of-type': { mt: 0 } }
export const blockSx = { minWidth: 0, maxWidth: '100%' }
