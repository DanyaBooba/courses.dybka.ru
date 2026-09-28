import { useEffect } from 'react'
import Box from '@mui/joy/Box'
import Container from '@mui/joy/Container'
import Typography from '@mui/joy/Typography'

import PageShell from '../components/Layout/PageShell'
import InlineText from '../components/Content/InlineText'

/** Правовой документ сайта (политика, согласие): заголовок, дата редакции и нумерованные разделы. */
export default function PageLegal({ doc }) {
    useEffect(() => {
        document.title = `${doc.title} — courses.dybka.ru`
        window.scrollTo({ top: 0, behavior: 'auto' })
    }, [doc])

    // Нумеруются только разделы с заголовком: вступление к документу идёт без номера
    const numbers = doc.sections.reduce(
        (acc, section) => [...acc, section.title ? (acc.findLast(Boolean) ?? 0) + 1 : null],
        [],
    )

    return (
        <PageShell>
            <Container maxWidth="sm" sx={{ px: { xs: 2.5, sm: 3 }, py: { xs: 8, md: 12 } }}>
                <Typography
                    level="h1"
                    sx={{
                        fontWeight: 450,
                        letterSpacing: '-0.03em',
                        lineHeight: 1.1,
                        fontSize: { xs: '32px', md: '42px' },
                        textWrap: 'balance',
                    }}
                >
                    {doc.title}
                </Typography>

                {doc.subtitle && (
                    <Typography sx={{ mt: 1.5, color: 'text.secondary', lineHeight: 1.7 }}>
                        {doc.subtitle}
                    </Typography>
                )}

                <Typography level="body-xs" sx={{ mt: 2, fontFamily: 'code', color: 'text.tertiary' }}>
                    Редакция от {doc.updated} г.
                </Typography>

                {doc.sections.map((section, index) => {
                    const sectionNumber = numbers[index]

                    return (
                        <Box component="section" key={section.title ?? index} sx={{ mt: 5 }}>
                            {section.title && (
                                <Typography level="h2" sx={{ mb: 2, fontSize: 'xl', fontWeight: 600, letterSpacing: '-0.01em' }}>
                                    {sectionNumber}. {section.title}
                                </Typography>
                            )}

                            <Box
                                component="ol"
                                sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 1.5 }}
                            >
                                {section.items.map((item, itemIndex) => (
                                    <Typography
                                        component="li"
                                        key={itemIndex}
                                        sx={{ display: 'flex', gap: 1.5, color: 'text.secondary', lineHeight: 1.7 }}
                                    >
                                        {sectionNumber && (
                                            <Box
                                                component="span"
                                                sx={{ flexShrink: 0, minWidth: '2.2em', fontFamily: 'code', fontSize: 'sm', lineHeight: 'inherit', color: 'text.tertiary' }}
                                            >
                                                {sectionNumber}.{itemIndex + 1}
                                            </Box>
                                        )}
                                        <span>
                                            <InlineText text={item} />
                                        </span>
                                    </Typography>
                                ))}
                            </Box>
                        </Box>
                    )
                })}
            </Container>
        </PageShell>
    )
}
