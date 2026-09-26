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
                        sx={{
                            gridArea: 'name',
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
                        sx={{ gridArea: 'mail', justifySelf: { xs: 'center', sm: 'end' } }}
                    >
                        daniil@dybka.ru
                    </Link>

                    <Typography
                        level="body-xs"
                        sx={{ gridArea: 'copy', color: 'text.tertiary', justifySelf: { xs: 'center', sm: 'start' } }}
                    >
                        © dev.dybka.ru, {new Date().getFullYear()}
                    </Typography>
                </Box>
            </Container>
        </Box>
    )
}
