import { useRef, useState } from 'react'
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Input from '@mui/joy/Input'
import Typography from '@mui/joy/Typography'
import { ImageIcon, TrashIcon, UploadSimpleIcon } from '@phosphor-icons/react'

import AutoTextarea from './AutoTextarea'
import useFileDrop from './useFileDrop'
import { IMAGE_TYPES, pickImages, uploadImages } from '../uploads'
import { captionSx, figureSx } from '../../components/Content/blockStyles'

/**
 * Картинка в редакторе. Пустая — это зона «перетащите фото сюда» размером с
 * будущую картинку. Заполненная — та же рамка, что на сайте, плюс кнопки
 * «Заменить» и «Убрать». Подпись правится прямо в подписи.
 * Несколько файлов, брошенных на пустую картинку, займут её и встанут следом.
 */
export default function ImageEditor({ block, onChange, onExtraImages, selected, focus }) {
    const fileRef = useRef(null)
    const [uploading, setUploading] = useState(false)

    const accept = async (files) => {
        const [first, ...rest] = files
        // Остальные файлы грузятся параллельно и встанут следом отдельными блоками
        if (rest.length) onExtraImages?.(rest)
        setUploading(true)
        const [src] = await uploadImages([first])
        setUploading(false)
        if (src) onChange({ ...block, src, alt: block.alt || fileTitle(first) })
    }

    // Уже заполненную картинку заменяем перетаскиванием, только когда она выбрана,
    // иначе брошенный на неё файл встаёт новым блоком рядом — это решает холст
    const drop = useFileDrop(accept, { enabled: !block.src || selected })

    const picker = (
        <input
            ref={fileRef}
            type="file"
            accept={IMAGE_TYPES.join(',')}
            multiple={!block.src}
            hidden
            onChange={(event) => {
                const files = pickImages(event.target.files)
                event.target.value = ''
                if (files.length) accept(files)
            }}
        />
    )

    return (
        <Box>
            <Box component="figure" data-own-drop={drop.bind.onDrop ? '' : undefined} {...drop.bind} sx={{ ...figureSx, position: 'relative' }}>
                {picker}

                {block.src ? (
                    <Box component="img" src={block.src} alt={block.alt || ''} sx={{ display: 'block', width: '100%', height: 'auto' }} />
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
                            aspectRatio: '16 / 9',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            px: 2,
                            textAlign: 'center',
                            cursor: 'pointer',
                            color: 'text.tertiary',
                            outline: 'none',
                            '&:focus-visible': { boxShadow: 'inset 0 0 0 2px var(--dd-palette-page-rule)' },
                        }}
                    >
                        <ImageIcon size={36} />
                        <Typography sx={{ fontFamily: 'display', fontSize: 'lg', color: 'text.secondary' }}>
                            Перетащите фото сюда
                        </Typography>
                        <Typography sx={{ fontSize: 'sm', color: 'text.tertiary' }}>
                            или нажмите, чтобы выбрать файл. JPG, PNG, WebP, GIF, AVIF до 10 МБ
                        </Typography>
                    </Box>
                )}

                {/* Поверх рамки, пока над ней файл: понятно, что отпустить можно здесь */}
                {(drop.isOver || uploading) && (
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'color-mix(in srgb, var(--dd-palette-background-body) 82%, transparent)',
                            border: '2px dashed',
                            borderColor: 'page.rule',
                            fontFamily: 'code',
                            fontSize: '12px',
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            color: 'text.primary',
                            pointerEvents: 'none',
                        }}
                    >
                        {uploading ? 'Загружаю фото…' : block.src ? 'Отпустите, чтобы заменить' : 'Отпустите, чтобы загрузить'}
                    </Box>
                )}

                {block.src && selected && (
                    <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 0.75 }}>
                        <Button
                            size="sm"
                            color="neutral"
                            variant="solid"
                            startDecorator={<UploadSimpleIcon />}
                            onClick={() => fileRef.current?.click()}
                        >
                            Заменить
                        </Button>
                        <Button
                            size="sm"
                            color="neutral"
                            variant="solid"
                            startDecorator={<TrashIcon />}
                            onClick={() => onChange({ ...block, src: null })}
                        >
                            Убрать
                        </Button>
                    </Box>
                )}

                <Typography component="figcaption" sx={{ ...captionSx, display: selected || block.caption ? 'block' : 'none' }}>
                    <AutoTextarea
                        inline
                        value={block.caption}
                        onChange={(caption) => onChange({ ...block, caption })}
                        focus={focus}
                        placeholder="Подпись к картинке — необязательно"
                        aria-label="Подпись к картинке"
                    />
                </Typography>
            </Box>

            {selected && (
                <Input
                    size="sm"
                    value={block.alt ?? ''}
                    onChange={(event) => onChange({ ...block, alt: event.target.value })}
                    placeholder="Что на картинке — для незрячих и поисковиков"
                    startDecorator={<Box component="span" sx={{ fontFamily: 'code', fontSize: '11px', color: 'text.tertiary' }}>ALT</Box>}
                    sx={{ mt: -2.5, mb: 4, boxShadow: 'none' }}
                />
            )}
        </Box>
    )
}

// «screenshot-unity_2.png» → «screenshot unity 2»: черновик описания, лучше пустоты
function fileTitle(file) {
    return file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim()
}
