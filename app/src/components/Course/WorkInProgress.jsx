import Box from '@mui/joy/Box'
import Container from '@mui/joy/Container'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import { useColorScheme } from '@mui/joy/styles'
import { Link as RouterLink } from 'react-router-dom'
import { HammerIcon, HouseIcon } from '@phosphor-icons/react'

import ShareButton from '../Ui/ShareButton'
import { getAccent } from '../../theme/accents'
import useSeo from '../../seo/useSeo'
import { hiddenSeo } from '../../seo/seo'

/**
 * Закрытый курс для читателя: шапка курса его цветом и плашка «Ведётся работа»
 * вместо программы. Данные — из каталога (`course` без уроков); если каталог
 * ещё не пришёл, шапка курса просто не рисуется.
 */
export default function WorkInProgress({ course }) {
    useSeo(hiddenSeo(course ? `${course.title} — ведётся работа` : 'Ведётся работа — courses.dybka.ru'))

    const { mode, systemMode } = useColorScheme()
    const resolved = mode === 'system' ? systemMode || 'light' : mode || 'light'
    const accent = getAccent(course?.accent)
    const skin = accent[resolved] || accent.light

    return (
        <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 3 }, pt: { xs: 3, md: 4 } }}>
            {course && (
                <Box sx={{ p: { xs: 2.5, md: 4.5 }, bgcolor: skin.bg }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1,
                            fontFamily: 'code',
                            fontSize: '11px',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: skin.text,
                            opacity: 0.7,
                        }}
                    >
                        {course.chips.map((chip, index) => (
                            <Box component="span" key={chip} sx={{ display: 'flex', gap: 1 }}>
                                {index > 0 && <Box component="span" sx={{ opacity: 0.5 }}>/</Box>}
                                {chip}
                            </Box>
                        ))}
                    </Box>
                    <Typography
                        level="h1"
                        sx={{
                            mt: 2,
                            maxWidth: 760,
                            fontWeight: 500,
                            letterSpacing: '-0.03em',
                            color: skin.text,
                            fontSize: { xs: '32px', sm: '44px', md: '56px' },
                            lineHeight: 1.06,
                        }}
                    >
                        {course.title}
                    </Typography>
                    <Typography sx={{ mt: 2, maxWidth: 760, color: skin.text, opacity: 0.82, fontSize: 'lg', lineHeight: 1.65 }}>
                        {course.subtitle}
                    </Typography>
                </Box>
            )}

            <Box
                sx={{
                    mt: course ? { xs: 3, md: 4 } : { xs: 6, md: 10 },
                    py: { xs: 5, md: 8 },
                    px: 2.5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    border: '1px dashed',
                    borderColor: 'page.border',
                }}
            >
                <Box sx={{ display: 'flex', color: 'page.accentInk' }}>
                    <HammerIcon size={36} />
                </Box>
                <Typography
                    sx={{
                        mt: 2,
                        fontFamily: 'code',
                        fontSize: '12px',
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: 'text.tertiary',
                    }}
                >
                    Ведётся работа
                </Typography>
                <Typography level="h2" sx={{ mt: 1.5, maxWidth: 560, fontWeight: 500, letterSpacing: '-0.02em' }}>
                    Курс скоро откроется
                </Typography>
                <Typography sx={{ mt: 1.5, maxWidth: 520, color: 'text.secondary', lineHeight: 1.7 }}>
                    Уроки ещё дописываются и проверяются. Загляните чуть позже, а пока посмотрите другие курсы.
                </Typography>

                <Box
                    sx={{
                        mt: 3.5,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 1,
                        width: { xs: '100%', sm: 'auto' },
                    }}
                >
                    <Button component={RouterLink} to="/" size="lg" startDecorator={<HouseIcon size={20} />}>
                        Все курсы
                    </Button>
                    {course && (
                        <ShareButton
                            path={`/course/${course.id}`}
                            title={course.title}
                            size="lg"
                            variant="outlined"
                            color="neutral"
                            sx={{ borderColor: 'page.border', color: 'text.primary' }}
                        />
                    )}
                </Box>
            </Box>
        </Container>
    )
}
