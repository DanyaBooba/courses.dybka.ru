import Box from '@mui/joy/Box'

import Bone, { BoneLines } from '../Ui/Bone'

/** Скелет карточки курса: те же зоны и отступы, что у настоящей карточки. */
export default function CourseCardSkeleton() {
    return (
        <Box
            aria-hidden
            sx={{
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid',
                borderColor: 'page.border',
            }}
        >
            <Bone height="auto" sx={{ aspectRatio: '16 / 9' }} />

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    px: { xs: 2.25, sm: 2.75 },
                    py: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'page.border',
                }}
            >
                <Bone width={24} height={10} />
                <Bone width={110} height={10} />
            </Box>

            <Box sx={{ px: { xs: 2.25, sm: 2.75 }, pt: 2.25, pb: 2.5 }}>
                <Bone width="78%" height={26} />
                <BoneLines lines={2} height={12} sx={{ mt: 1.75 }} />
                <Bone width="45%" height={10} sx={{ mt: 2.25 }} />
            </Box>

            <Box
                sx={{
                    mt: 'auto',
                    mx: { xs: 2.25, sm: 2.75 },
                    pt: 1.5,
                    borderTop: '1px solid',
                    borderColor: 'page.border',
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
                <Bone width={120} height={10} />
                <Bone width={64} height={10} />
            </Box>

            <Box sx={{ mt: 2, px: { xs: 2.25, sm: 2.75 }, pb: { xs: 2.25, sm: 2.5 }, display: 'flex', gap: 1 }}>
                <Bone height={36} sx={{ flex: '1 1 150px' }} />
                <Bone width={112} height={36} />
            </Box>
        </Box>
    )
}
