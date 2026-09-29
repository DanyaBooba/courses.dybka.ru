import { Fragment } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/joy/Box'
import IconButton from '@mui/joy/IconButton'
import Tooltip from '@mui/joy/Tooltip'
import Typography from '@mui/joy/Typography'
import { ArrowLineUpIcon, CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'

import { setChromeHidden, useHiddenChrome } from '../../admin/chrome'

/**
 * Липкая полоса над страницей панели: где мы (крошки) и что можно сделать.
 * `crumbs` — [{ label, to? }], последняя крошка — текущая страница.
 * `below` — панель под полосой (настройки урока): она прилипает вместе
 * с полосой и видна, как бы далеко ни прокрутили страницу.
 *
 * Полосу можно спрятать кнопкой справа — вернёт её кнопка в углу экрана
 * (она в AdminLayout).
 */
export default function AdminTopBar({ crumbs, children, below }) {
    const hidden = useHiddenChrome().topbar
    if (hidden) return null

    return (
        <Box sx={{ position: 'sticky', top: 0, zIndex: 20, bgcolor: 'background.body' }}>
            <Box
                sx={{
                    px: { xs: 2, md: 3 },
                    py: 1.25,
                    minHeight: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    flexWrap: 'wrap',
                    bgcolor: 'background.body',
                    borderBottom: '1px solid',
                    borderColor: 'page.border',
                }}
            >
                <Box component="nav" aria-label="Путь" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                    {/* На телефоне списка слева нет — возвращаемся к нему отсюда */}
                    <Box
                        component={RouterLink}
                        to="/admin"
                        aria-label="Все программы"
                        sx={{ display: { xs: 'flex', md: 'none' }, color: 'text.secondary', mr: 0.5 }}
                    >
                        <CaretLeftIcon size={20} weight="bold" />
                    </Box>

                    {crumbs.map((crumb, index) => (
                        <Fragment key={index}>
                            {index > 0 && <CaretRightIcon size={12} weight="bold" style={{ flexShrink: 0, opacity: 0.4 }} />}
                            <Typography
                                component={crumb.to ? RouterLink : 'span'}
                                to={crumb.to}
                                aria-current={index === crumbs.length - 1 ? 'page' : undefined}
                                sx={{
                                    fontSize: 'sm',
                                    fontWeight: index === crumbs.length - 1 ? 600 : 400,
                                    color: index === crumbs.length - 1 ? 'text.primary' : 'text.tertiary',
                                    textDecoration: 'none',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: { xs: 160, sm: 280 },
                                    '&:hover': crumb.to ? { color: 'text.primary' } : undefined,
                                }}
                            >
                                {crumb.label}
                            </Typography>
                        </Fragment>
                    ))}
                </Box>

                {/* Кнопки — к правому краю. На телефоне они уходят второй строкой
                    во всю ширину: статус сохранения — слева, кнопки — справа */}
                <Box
                    sx={{
                        ml: 'auto',
                        width: { xs: '100%', sm: 'auto' },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 1,
                        flexWrap: 'wrap',
                        '& > .save-status': { mr: { xs: 'auto', sm: 0 } },
                    }}
                >
                    {children}
                    <Tooltip title="Скрыть верхнюю панель" size="sm" variant="soft">
                        <IconButton size="sm" color="neutral" onClick={() => setChromeHidden('topbar', true)} aria-label="Скрыть верхнюю панель">
                            <ArrowLineUpIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            {below}
        </Box>
    )
}
