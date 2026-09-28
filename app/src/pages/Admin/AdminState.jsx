import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'

import AdminTopBar from './AdminTopBar'
import Bone, { BoneLines } from '../../components/Ui/Bone'
import LoadError from '../../components/Ui/LoadError'

/**
 * Что показать вместо программы или урока, пока их нет: скелет при загрузке,
 * «не найдено» и ошибку связи с кнопкой «Повторить».
 */
export default function AdminState({ loading, error, onRetry, notFound }) {
    if (loading) {
        return (
            <>
                <AdminTopBar crumbs={[{ label: 'Программы', to: '/admin' }, { label: 'Загружаю…' }]} />
                <Box aria-busy sx={{ px: { xs: 2, md: 5 }, py: { xs: 3, md: 5 }, maxWidth: 900 }}>
                    <Bone width={120} height={10} />
                    <Bone width="70%" height={44} sx={{ mt: 2 }} />
                    <BoneLines lines={4} height={16} gap={1.5} sx={{ mt: 5 }} />
                    <BoneLines lines={3} height={16} gap={1.5} sx={{ mt: 3 }} />
                </Box>
            </>
        )
    }

    if (error && error.status !== 404) {
        return (
            <>
                <AdminTopBar crumbs={[{ label: 'Программы', to: '/admin' }, { label: 'Ошибка' }]} />
                <Box sx={{ p: { xs: 2, md: 5 }, maxWidth: 720 }}>
                    <LoadError title="Не получилось загрузить программу" error={error} onRetry={onRetry} />
                </Box>
            </>
        )
    }

    return (
        <>
            <AdminTopBar crumbs={[{ label: 'Программы', to: '/admin' }, { label: 'Не найдено' }]} />
            <Box sx={{ p: 5 }}>
                <Typography level="h2">{notFound.title}</Typography>
                <Typography sx={{ mt: 1, color: 'text.secondary' }}>{notFound.text}</Typography>
            </Box>
        </>
    )
}
