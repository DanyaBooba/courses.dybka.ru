import { useEffect } from 'react'
import Container from '@mui/joy/Container'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import { Link as RouterLink } from 'react-router-dom'

import PageShell from '../components/Layout/PageShell'

export default function PageNotFound() {
    useEffect(() => {
        document.title = 'Страница не найдена — dev.dybka.ru'
    }, [])

    return (
        <PageShell>
            <Container maxWidth="sm" sx={{ px: { xs: 2.5, sm: 3 }, py: { xs: 10, md: 16 } }}>
                <Typography
                    sx={{
                        fontFamily: 'code',
                        fontSize: '11px',
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: 'text.tertiary',
                        pb: 1.25,
                        borderBottom: '2px solid',
                        borderColor: 'page.rule',
                    }}
                >
                    Ошибка 404
                </Typography>

                <Typography
                    level="h1"
                    sx={{
                        mt: 3,
                        fontWeight: 500,
                        fontSize: { xs: '72px', md: '112px' },
                        letterSpacing: '-0.05em',
                        lineHeight: 1,
                        color: 'text.primary',
                    }}
                >
                    404
                </Typography>

                <Typography level="h2" sx={{ mt: 1.5, fontWeight: 500, letterSpacing: '-0.02em' }}>
                    Такой страницы нет
                </Typography>

                <Typography sx={{ mt: 1.5, color: 'text.secondary', lineHeight: 1.7 }}>
                    Возможно, адрес устарел или в нём опечатка. Загляните в список курсов.
                </Typography>

                <Button component={RouterLink} to="/" size="lg" sx={{ mt: 4, px: 3 }}>
                    На главную
                </Button>
            </Container>
        </PageShell>
    )
}
