import { Fragment } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'

/**
 * Липкая полоса над страницей панели: где мы (крошки) и что можно сделать.
 * `crumbs` — [{ label, to? }], последняя крошка — текущая страница.
 */
export default function AdminTopBar({ crumbs, children }) {
    return (
        <Box
            sx={{
                position: 'sticky',
                top: 0,
                zIndex: 20,
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

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>{children}</Box>
        </Box>
    )
}
