import Box from '@mui/joy/Box'
import Container from '@mui/joy/Container'
import Typography from '@mui/joy/Typography'
import Link from '@mui/joy/Link'
import { Link as RouterLink } from 'react-router-dom'

export default function Footer() {
    return (
        <Box component="footer" sx={{ mt: 10 }}>
            <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 3 } }}>
                <Box
                    sx={{
                        py: 2.5,
                        borderTop: '1px solid',
                        borderColor: 'page.border',
                        display: 'grid',
                        alignItems: 'center',
                        justifyItems: { xs: 'center', sm: 'stretch' },
                        gap: { xs: 1, sm: 1 },
                        // На телефонах: название, почта, копирайт
                        gridTemplateColumns: { xs: '1fr', sm: '1fr auto 1fr' },
                        gridTemplateAreas: {
                            xs: '"name" "mail" "copy"',
                            sm: '"copy name mail"',
                        },
                    }}
                >
                    <Typography
                        component={RouterLink}
                        to="/"
                        level="body-sm"
                        // Возврат на главную из подвала — всегда к началу страницы.
                        // Обработчик нужен и когда мы уже на главной: там маршрут
                        // не меняется, и сама по себе ссылка ничего не прокрутит.
                        onClick={() => window.scrollTo({ top: 0, behavior: 'auto' })}
                        sx={{
                            gridArea: 'name',
                            fontFamily: 'code',
                            fontSize: '12px',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            textDecoration: 'none',
                            color: 'text.primary',
                            justifySelf: 'center',
                        }}
                    >
                        courses.dybka.ru
                    </Typography>

                    <Link
                        href="mailto:daniil@dybka.ru"
                        level="body-xs"
                        color="neutral"
                        sx={{
                            gridArea: 'mail',
                            fontFamily: 'code',
                            justifySelf: { xs: 'center', sm: 'end' },
                        }}
                    >
                        daniil@dybka.ru
                    </Link>

                    <Typography
                        level="body-xs"
                        sx={{
                            gridArea: 'copy',
                            fontFamily: 'code',
                            color: 'text.tertiary',
                            justifySelf: { xs: 'center', sm: 'start' },
                        }}
                    >
                        © courses.dybka.ru, {new Date().getFullYear()}
                    </Typography>
                </Box>
            </Container>
        </Box>
    )
}
