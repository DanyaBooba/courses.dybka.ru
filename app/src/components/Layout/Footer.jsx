import Box from '@mui/joy/Box'
import Container from '@mui/joy/Container'
import Typography from '@mui/joy/Typography'
import Link from '@mui/joy/Link'
import { Link as RouterLink } from 'react-router-dom'

export default function Footer() {
    return (
        <Box component="footer" sx={{ mt: 10, py: 3 }}>
            <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
                <Box
                    sx={{
                        display: 'grid',
                        alignItems: 'center',
                        gap: 1,
                        gridTemplateColumns: { xs: '1fr', sm: '1fr auto 1fr' },
                        textAlign: { xs: 'center', sm: 'left' },
                    }}
                >
                    <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                        © dev.dybka.ru, {new Date().getFullYear()}
                    </Typography>

                    <Typography
                        component={RouterLink}
                        to="/"
                        level="body-sm"
                        sx={{
                            fontWeight: 700,
                            textDecoration: 'none',
                            color: 'text.primary',
                            justifySelf: 'center',
                        }}
                    >
                        dev.dybka.ru
                    </Typography>

                    <Link
                        href="mailto:daniil@dybka.ru"
                        level="body-xs"
                        color="neutral"
                        sx={{ justifySelf: { xs: 'center', sm: 'end' } }}
                    >
                        daniil@dybka.ru
                    </Link>
                </Box>
            </Container>
        </Box>
    )
}
