import { useRef, useState } from 'react'
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Typography from '@mui/joy/Typography'
import { ImageIcon, TrashIcon, UploadSimpleIcon } from '@phosphor-icons/react'

import useFileDrop from './useFileDrop'
import { IMAGE_TYPES, pickImages, uploadImages } from '../uploads'

/**
 * Обложка курса: перетащите фото в рамку или выберите файл.
 * Рамка тех же пропорций, что обложка в карточке каталога.
 */
export default function CoverDrop({ src, onChange, ratio = '16 / 9', sx }) {
    const fileRef = useRef(null)
    const [uploading, setUploading] = useState(false)

    const accept = async ([file]) => {
        setUploading(true)
        const [src] = await uploadImages([file])
        setUploading(false)
        if (src) onChange(src)
    }
    const drop = useFileDrop(accept)

    return (
        <Box
            {...drop.bind}
            sx={{
                position: 'relative',
                aspectRatio: ratio,
                overflow: 'hidden',
                border: '1px dashed',
                borderColor: drop.isOver ? 'page.rule' : 'page.border',
                bgcolor: 'background.level1',
                ...sx,
            }}
        >
            <input
                ref={fileRef}
                type="file"
                accept={IMAGE_TYPES.join(',')}
                hidden
                onChange={(event) => {
                    const files = pickImages(event.target.files)
                    event.target.value = ''
                    if (files.length) accept(files)
                }}
            />

            {src ? (
                <>
                    <Box component="img" src={src} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <Box sx={{ position: 'absolute', right: 10, bottom: 10, display: 'flex', gap: 0.75 }}>
                        <Button size="sm" color="neutral" variant="solid" startDecorator={<UploadSimpleIcon />} onClick={() => fileRef.current?.click()}>
                            Заменить
                        </Button>
                        <Button size="sm" color="neutral" variant="solid" startDecorator={<TrashIcon />} onClick={() => onChange(null)}>
                            Убрать
                        </Button>
                    </Box>
                </>
            ) : (
                <Box
                    role="button"
                    tabIndex={0}
                    onClick={() => fileRef.current?.click()}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            fileRef.current?.click()
                        }
                    }}
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.75,
                        px: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        color: 'text.tertiary',
                    }}
                >
                    <ImageIcon size={30} />
                    <Typography sx={{ fontSize: 'sm', color: 'text.secondary' }}>Перетащите обложку сюда</Typography>
                    <Typography sx={{ fontSize: 'xs', color: 'text.tertiary' }}>или нажмите, чтобы выбрать файл</Typography>
                </Box>
            )}

            {(drop.isOver || uploading) && (
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'color-mix(in srgb, var(--dd-palette-background-body) 82%, transparent)',
                        fontFamily: 'code',
                        fontSize: '12px',
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        pointerEvents: 'none',
                    }}
                >
                    {uploading ? 'Загружаю…' : 'Отпустите, чтобы загрузить'}
                </Box>
            )}
        </Box>
    )
}
