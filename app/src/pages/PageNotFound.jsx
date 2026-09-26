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
            <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 10, md: 16 }, textAlign: 'center' }}>
                <Typography
                    level="h1"
                    sx={{
                        fontWeight: 700,
                        fontSize: { xs: '80px', md: '120px' },
                        letterSpacing: '-0.05em',
                        lineHeight: 1,
                        background: 'linear-gradient(120deg, #5b74ef 0%, #9f7ef0 50%, #e07a3f 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}
                >
                    404
                </Typography>

                <Typography level="h2" sx={{ mt: 2, fontWeight: 700, letterSpacing: '-0.02em' }}>
                    Такой страницы нет
                </Typography>

                <Typography sx={{ mt: 1.5, color: 'text.secondary' }}>
                    Возможно, адрес устарел или в нём опечатка. Загляните в список курсов.
                </Typography>

                <Button component={RouterLink} to="/" size="lg" sx={{ mt: 4 }}>
                    На главную
                </Button>
            </Container>
        </PageShell>
    )
}
