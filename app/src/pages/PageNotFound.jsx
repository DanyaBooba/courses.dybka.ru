import Container from '@mui/joy/Container'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import { Link as RouterLink } from 'react-router-dom'

import PageShell from '../components/Layout/PageShell'
import useSeo from '../seo/useSeo'
import { hiddenSeo } from '../seo/seo'

export default function PageNotFound() {
    useSeo(hiddenSeo('Страница не найдена — courses.dybka.ru'))

    return (
        <PageShell>
            <Container maxWidth="sm" sx={{ px: { xs: 2.5, sm: 3 }, py: { xs: 10, md: 16 } }}>
                <Typography
                    level="h1"
                    sx={{
                        mt: 3,
                        mb: 6,
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
