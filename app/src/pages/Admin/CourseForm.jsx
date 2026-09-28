import Box from '@mui/joy/Box'
import Autocomplete from '@mui/joy/Autocomplete'
import FormControl from '@mui/joy/FormControl'
import FormHelperText from '@mui/joy/FormHelperText'
import FormLabel from '@mui/joy/FormLabel'
import Input from '@mui/joy/Input'
import Option from '@mui/joy/Option'
import Select from '@mui/joy/Select'
import Switch from '@mui/joy/Switch'
import Textarea from '@mui/joy/Textarea'
import Tooltip from '@mui/joy/Tooltip'
import ToggleButtonGroup from '@mui/joy/ToggleButtonGroup'
import Button from '@mui/joy/Button'
import Typography from '@mui/joy/Typography'
import { CheckIcon } from '@phosphor-icons/react'

import CourseCard from '../../components/CourseCard/CourseCard'
import { pressedInkSx } from './adminStyles'
import CoverDrop from '../../admin/editor/CoverDrop'
import sections from '../../data/sections'
import accents, { accentNames } from '../../theme/accents'

const fieldSx = { boxShadow: 'none', bgcolor: 'background.body' }

const LEVELS = ['Для начинающих', 'Нужны основы программирования', 'Нужны основы вёрстки', 'Для опытных']
const DIFFICULTY = ['Совсем просто', 'Просто', 'Средне', 'Сложно', 'Очень сложно']

function Group({ title, children }) {
    return (
        <Box component="fieldset" sx={{ m: 0, p: 0, border: 'none', minWidth: 0 }}>
            <Typography
                component="legend"
                sx={{
                    p: 0,
                    mb: 1.5,
                    pb: 1,
                    width: '100%',
                    fontFamily: 'display',
                    fontSize: 'lg',
                    fontWeight: 500,
                    borderBottom: '1px solid',
                    borderColor: 'page.border',
                }}
            >
                {title}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{children}</Box>
        </Box>
    )
}

/**
 * Настройки программы: всё, что видно в карточке каталога и в шапке курса.
 * Справа — карточка, как её увидят в каталоге; меняется вместе с полями.
 *
 * `idEditable` — адрес можно менять только у новой программы: у готовой
 * на него уже ведут ссылки. `idError` — текст ошибки адреса или null.
 */
export default function CourseForm({ course, onChange, idEditable = false, idError = null, onIdChange }) {
    const set = (change) => onChange({ ...course, ...change })
    const setAuthor = (change) => set({ author: { ...(course.author ?? {}), ...change } })

    return (
        <Box
            sx={{
                display: 'grid',
                gap: { xs: 4, lg: 5 },
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 360px' },
                alignItems: 'start',
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                <Group title="Главное">
                    <FormControl required>
                        <FormLabel>Название</FormLabel>
                        <Input
                            value={course.title}
                            onChange={(event) => set({ title: event.target.value })}
                            placeholder="Например, «Основа Unity. Первый проект»"
                            size="lg"
                            sx={fieldSx}
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Описание</FormLabel>
                        <Textarea
                            minRows={2}
                            value={course.subtitle}
                            onChange={(event) => set({ subtitle: event.target.value })}
                            placeholder="Одна-две фразы: что получится в конце курса"
                            sx={fieldSx}
                        />
                        <FormHelperText>Показывается в карточке каталога и в шапке курса.</FormHelperText>
                    </FormControl>

                    <FormControl required error={Boolean(idError)}>
                        <FormLabel>Адрес</FormLabel>
                        <Input
                            value={course.id}
                            onChange={(event) => onIdChange?.(event.target.value)}
                            disabled={!idEditable}
                            startDecorator={<Box component="span" sx={{ fontFamily: 'code', fontSize: 'sm', color: 'text.tertiary' }}>/course/</Box>}
                            sx={{ ...fieldSx, fontFamily: 'code' }}
                        />
                        <FormHelperText>
                            {idError ?? (idEditable ? 'Латиница, цифры и дефис. Подставляется из названия.' : 'Адрес готовой программы не меняется: на него уже ведут ссылки.')}
                        </FormHelperText>
                    </FormControl>

                    <FormControl orientation="horizontal" sx={{ justifyContent: 'space-between', gap: 2 }}>
                        <Box>
                            <FormLabel>Скрыть от читателей</FormLabel>
                            <FormHelperText sx={{ mt: 0.25 }}>
                                Читатели видят карточку с плашкой «Ведётся работа», целиком курс видите только вы.
                            </FormHelperText>
                        </Box>
                        <Switch checked={Boolean(course.disabled)} onChange={(event) => set({ disabled: event.target.checked })} />
                    </FormControl>
                </Group>

                <Group title="Каталог">
                    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                        <FormControl>
                            <FormLabel>Раздел</FormLabel>
                            <Select value={course.section} onChange={(_, section) => section && set({ section })} sx={fieldSx}>
                                {sections.map((section) => (
                                    <Option key={section.id} value={section.id}>
                                        {section.title}
                                    </Option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Уровень</FormLabel>
                            <Autocomplete
                                freeSolo
                                options={LEVELS}
                                inputValue={course.level}
                                onInputChange={(_, level) => set({ level })}
                                sx={fieldSx}
                            />
                        </FormControl>
                    </Box>

                    <FormControl>
                        <FormLabel>Цвет</FormLabel>
                        <Box role="radiogroup" aria-label="Цвет программы" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {accentNames.map((name) => {
                                const active = course.accent === name
                                return (
                                    <Tooltip key={name} title={name} size="sm" variant="soft">
                                        <Box
                                            component="button"
                                            type="button"
                                            role="radio"
                                            aria-checked={active}
                                            aria-label={name}
                                            onClick={() => set({ accent: name })}
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                p: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                color: '#fff',
                                                bgcolor: accents[name].solid,
                                                border: '2px solid',
                                                borderColor: active ? 'page.rule' : 'transparent',
                                                outlineOffset: 2,
                                            }}
                                        >
                                            {active && <CheckIcon size={16} weight="bold" />}
                                        </Box>
                                    </Tooltip>
                                )
                            })}
                        </Box>
                    </FormControl>

                    <FormControl>
                        <FormLabel>Сложность</FormLabel>
                        <ToggleButtonGroup
                            value={String(course.difficulty)}
                            onChange={(_, value) => value && set({ difficulty: Number(value) })}
                            size="sm"
                            sx={{ flexWrap: 'wrap', ...pressedInkSx }}
                        >
                            {DIFFICULTY.map((label, index) => (
                                <Button key={label} value={String(index + 1)} sx={{ fontWeight: 500 }}>
                                    {index + 1} · {label}
                                </Button>
                            ))}
                        </ToggleButtonGroup>
                    </FormControl>

                    <FormControl>
                        <FormLabel>Теги</FormLabel>
                        <Autocomplete
                            multiple
                            freeSolo
                            options={[]}
                            value={course.chips}
                            onChange={(_, chips) => set({ chips: chips.map((chip) => chip.trim()).filter(Boolean) })}
                            placeholder="Unity, C#, 2D — Enter после каждого"
                            sx={fieldSx}
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Объём</FormLabel>
                        <Input
                            value={course.duration}
                            onChange={(event) => set({ duration: event.target.value })}
                            placeholder="10 уроков"
                            sx={fieldSx}
                        />
                        <FormHelperText>Задуманный размер — его показывает карточка, пока курс скрыт.</FormHelperText>
                    </FormControl>
                </Group>

                <Group title="Обложка и ссылки">
                    <FormControl>
                        <FormLabel>Обложка</FormLabel>
                        <CoverDrop src={course.image} onChange={(image) => set({ image })} sx={{ maxWidth: 480 }} />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Видео для карточки</FormLabel>
                        <Input
                            value={course.video ?? ''}
                            onChange={(event) => set({ video: event.target.value || null })}
                            placeholder="/video/courses/… .mp4 — играет при наведении"
                            sx={fieldSx}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel>GitHub</FormLabel>
                        <Input
                            value={course.github ?? ''}
                            onChange={(event) => set({ github: event.target.value || null })}
                            placeholder="https://github.com/…"
                            sx={fieldSx}
                        />
                    </FormControl>
                </Group>

                <Group title="Автор">
                    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' } }}>
                        <FormControl>
                            <FormLabel>Имя</FormLabel>
                            <Input value={course.author?.name ?? ''} onChange={(event) => setAuthor({ name: event.target.value })} sx={fieldSx} />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Почта</FormLabel>
                            <Input value={course.author?.email ?? ''} onChange={(event) => setAuthor({ email: event.target.value })} sx={fieldSx} />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Telegram</FormLabel>
                            <Input value={course.author?.telegram ?? ''} onChange={(event) => setAuthor({ telegram: event.target.value })} sx={fieldSx} />
                        </FormControl>
                    </Box>
                </Group>
            </Box>

            {/* Карточка как в каталоге. Щелчки по ней никуда не ведут — это образец */}
            <Box sx={{ position: { lg: 'sticky' }, top: { lg: 80 }, minWidth: 0 }}>
                <Typography
                    sx={{
                        mb: 1.25,
                        fontFamily: 'code',
                        fontSize: '11px',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'text.tertiary',
                    }}
                >
                    Так карточку увидят в каталоге
                </Typography>
                <Box
                    onClickCapture={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                    }}
                    sx={{ maxWidth: 380 }}
                >
                    <CourseCard
                        asReader
                        course={{ ...course, title: course.title || 'Название программы', subtitle: course.subtitle || 'Описание программы' }}
                    />
                </Box>
            </Box>
        </Box>
    )
}
