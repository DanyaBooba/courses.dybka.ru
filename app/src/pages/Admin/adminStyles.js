// Общие стили панели управления.

/** Нажатая кнопка в группе переключателей — чернилами сайта, а не голубым Joy. */
export const pressedInkSx = {
    '&& .MuiButton-root[aria-pressed="true"]': {
        bgcolor: 'text.primary',
        color: 'background.body',
        borderColor: 'text.primary',
    },
}
