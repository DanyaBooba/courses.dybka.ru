import { useEffect } from 'react'
import Container from '@mui/joy/Container'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'

import PageShell from '../../components/Layout/PageShell'
import { setToken } from '../../auth/session'

// Заготовка: форма добавления программы появится здесь следующим шагом
export default function PageNewCourse() {
    useEffect(() => {
        document.title = 'Новая программа — courses.dybka.ru'
    }, [])

    return (
        <PageShell>
            <Container maxWidth="sm" sx={{ px: { xs: 2.5, sm: 3 }, py: { xs: 10, md: 16 } }}>
                <Typography
                    level="h1"
                    sx={{
                        fontWeight: 450,
                        letterSpacing: '-0.03em',
                        lineHeight: 1.05,
                        fontSize: { xs: '38px', md: '48px' },
                    }}
                >
                    Новая программа
                </Typography>

                <Typography sx={{ mt: 1.5, color: 'text.secondary', lineHeight: 1.7 }}>
                    Здесь появится форма добавления программы.
                </Typography>

                <Button variant="outlined" color="neutral" onClick={() => setToken(null)} sx={{ mt: 4 }}>
                    Выйти
                </Button>
            </Container>
        </PageShell>
    )
}
