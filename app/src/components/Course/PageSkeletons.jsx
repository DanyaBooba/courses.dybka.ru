import Box from '@mui/joy/Box'
import Container from '@mui/joy/Container'

import Bone, { BoneLines } from '../Ui/Bone'

/** Скелет страницы курса: шапка-плашка, «О курсе» слева, программа справа. */
export function CoursePageSkeleton() {
    return (
        <Container aria-busy maxWidth="lg" sx={{ px: { xs: 2.5, sm: 3 }, pt: { xs: 3, md: 4 } }}>
            <Bone width={120} height={28} sx={{ mb: 2.5 }} />

            <Box
                sx={{
                    p: { xs: 2.5, md: 4.5 },
                    border: '1px solid',
                    borderColor: 'page.border',
                    display: 'grid',
                    gap: { xs: 3, md: 4.5 },
                    gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 340px)' },
                }}
            >
                <Box>
                    <Bone width={180} height={10} />
                    <Bone width="85%" height={48} sx={{ mt: 2 }} />
                    <BoneLines lines={2} height={16} sx={{ mt: 2.5 }} />
                    <Box sx={{ mt: 3.5, pt: 3, borderTop: '1px solid', borderColor: 'page.border', display: 'flex', gap: 4 }}>
                        <Bone width={110} height={34} />
                        <Bone width={90} height={34} />
                        <Bone width={90} height={34} />
                    </Box>
                    <Box sx={{ mt: 3.5, display: 'flex', gap: 1 }}>
                        <Bone width={170} height={48} />
                        <Bone width={130} height={48} />
                    </Box>
                </Box>
                <Bone height="auto" sx={{ aspectRatio: '4 / 3', order: { xs: -1, md: 0 } }} />
            </Box>

            <Box
                sx={{
                    mt: { xs: 4, md: 6 },
                    display: 'grid',
                    gap: { xs: 4, md: 6 },
                    gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 320px' },
                }}
            >
                <Box>
                    <Box sx={{ pb: 1.25, mb: 2.5, borderBottom: '2px solid', borderColor: 'page.border' }}>
                        <Bone width={140} height={30} />
                    </Box>
                    <BoneLines lines={4} height={16} gap={1.5} />
                    <BoneLines lines={3} height={16} gap={1.5} sx={{ mt: 3 }} />
                </Box>
                <Box>
                    <Bone height={48} sx={{ display: { xs: 'none', md: 'block' }, mb: 3 }} />
                    <Box sx={{ pb: 1.25, borderBottom: '2px solid', borderColor: 'page.border' }}>
                        <Bone width={110} height={20} />
                    </Box>
                    {Array.from({ length: 6 }, (_, index) => (
                        <Box key={index} sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'page.border' }}>
                            <Bone width={`${60 + ((index * 17) % 35)}%`} height={12} />
                        </Box>
                    ))}
                </Box>
            </Box>
        </Container>
    )
}

/** Скелет урока: меню слева, над текстом — номер урока и заголовок. */
export function LessonPageSkeleton() {
    return (
        <Container aria-busy maxWidth="lg" sx={{ px: { xs: 2.5, sm: 3 }, pt: { xs: 3, md: 5 } }}>
            <Box
                sx={{
                    display: 'grid',
                    gap: { xs: 3, md: 6 },
                    gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '280px minmax(0, 1fr)' },
                }}
            >
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Bone height={32} />
                    {Array.from({ length: 8 }, (_, index) => (
                        <Bone key={index} width={`${55 + ((index * 23) % 40)}%`} height={12} sx={{ mt: 2.25 }} />
                    ))}
                </Box>
                <Box sx={{ width: '100%', maxWidth: { md: 824 }, mx: 'auto' }}>
                    <Bone width={110} height={10} />
                    <Bone width="80%" height={44} sx={{ mt: 2 }} />
                    <BoneLines lines={4} height={16} gap={1.5} sx={{ mt: 5 }} />
                    <Bone height="auto" sx={{ mt: 4, aspectRatio: '16 / 9' }} />
                    <BoneLines lines={3} height={16} gap={1.5} sx={{ mt: 4 }} />
                </Box>
            </Box>
        </Container>
    )
}
