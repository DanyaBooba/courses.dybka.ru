import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Checkbox from '@mui/joy/Checkbox'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import FormHelperText from '@mui/joy/FormHelperText'
import IconButton from '@mui/joy/IconButton'
import Input from '@mui/joy/Input'
import Textarea from '@mui/joy/Textarea'
import Autocomplete from '@mui/joy/Autocomplete'
import Typography from '@mui/joy/Typography'
import { PlusIcon, TrashIcon } from '@phosphor-icons/react'

import { ContentBlock } from '../../components/Content/ContentBlocks'
import { useCourses } from '../../api/courses'
import { blankQuestion } from '../blocks'

// Чек-лист, подборка курсов и тест слишком сложны, чтобы править их прямо
// в вёрстке. Поэтому сверху — живой блок, ровно как на сайте, а под ним —
// панель с полями: всё, что меняется в панели, сразу видно в блоке.

const fieldSx = { boxShadow: 'none' }

function Panel({ title, children }) {
    return (
        <Box
            data-editor-keep
            sx={{
                mt: -1,
                mb: 4,
                p: { xs: 2, sm: 2.5 },
                border: '1px solid',
                borderColor: 'page.border',
                bgcolor: 'background.surface',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}
        >
            <Typography
                sx={{
                    fontFamily: 'code',
                    fontSize: '11px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'text.tertiary',
                }}
            >
                {title}
            </Typography>
            {children}
        </Box>
    )
}

/** Строки textarea ↔ пункты списка. Пустые строки в середине — пустые пункты. */
const toLines = (items) => items.join('\n')
const fromLines = (text) => text.split('\n')

export function ChecklistEditor({ block, onChange, ink }) {
    return (
        <>
            <ContentBlock block={block} ink={ink} />
            <Panel title="Чек-лист">
                <FormControl>
                    <FormLabel>Заголовок</FormLabel>
                    <Input
                        value={block.title ?? ''}
                        onChange={(event) => onChange({ ...block, title: event.target.value })}
                        placeholder="Например, «Проверьте себя»"
                        sx={fieldSx}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel>Пункты</FormLabel>
                    <Textarea
                        minRows={3}
                        value={toLines(block.items ?? [])}
                        onChange={(event) => onChange({ ...block, items: fromLines(event.target.value) })}
                        placeholder="Каждый пункт — с новой строки"
                        sx={fieldSx}
                    />
                    <FormHelperText>Каждый пункт — с новой строки.</FormHelperText>
                </FormControl>
            </Panel>
        </>
    )
}

export function CoursesEditor({ block, onChange, ink }) {
    const { courses = [] } = useCourses()
    // Курс мог пропасть из каталога — его id всё равно остаётся в списке, чтобы не потерять
    const options = [...new Set([...courses.map((course) => course.id), ...(block.items ?? [])])]
    const titleOf = (id) => courses.find((course) => course.id === id)?.title ?? id

    return (
        <>
            <ContentBlock block={block} ink={ink} />
            <Panel title="Подборка курсов">
                <FormControl>
                    <FormLabel>Заголовок</FormLabel>
                    <Input
                        value={block.title ?? ''}
                        onChange={(event) => onChange({ ...block, title: event.target.value })}
                        placeholder="Например, «Что изучить дальше» — или оставьте пустым"
                        sx={fieldSx}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel>Курсы</FormLabel>
                    <Autocomplete
                        multiple
                        options={options}
                        value={block.items ?? []}
                        onChange={(_, items) => onChange({ ...block, items })}
                        getOptionLabel={titleOf}
                        placeholder="Выберите курсы"
                        slotProps={{ listbox: { 'data-editor-keep': '' } }}
                        sx={fieldSx}
                    />
                    <FormHelperText>Карточки встанут в том же порядке. Список курсов — с сайта.</FormHelperText>
                </FormControl>
            </Panel>
        </>
    )
}

export function QuizEditor({ block, onChange, ink }) {
    const quiz = block.quiz ?? { title: '', intro: '', questions: [] }
    const setQuiz = (change) => onChange({ ...block, quiz: { ...quiz, ...change } })
    const setQuestion = (index, change) =>
        setQuiz({ questions: quiz.questions.map((question, i) => (i === index ? { ...question, ...change } : question)) })

    return (
        <>
            <ContentBlock block={block} ink={ink} />
            <Panel title="Тест">
                <FormControl>
                    <FormLabel>Заголовок</FormLabel>
                    <Input value={quiz.title} onChange={(event) => setQuiz({ title: event.target.value })} sx={fieldSx} />
                </FormControl>
                <FormControl>
                    <FormLabel>Вступление</FormLabel>
                    <Textarea
                        minRows={2}
                        value={quiz.intro}
                        onChange={(event) => setQuiz({ intro: event.target.value })}
                        placeholder="Пара слов перед вопросами"
                        sx={fieldSx}
                    />
                </FormControl>

                {quiz.questions.map((question, index) => (
                    <Box
                        key={question.id}
                        sx={{ p: 2, border: '1px solid', borderColor: 'page.border', display: 'flex', flexDirection: 'column', gap: 1.5 }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography level="title-sm">Вопрос {index + 1}</Typography>
                            <IconButton
                                size="sm"
                                color="neutral"
                                aria-label="Удалить вопрос"
                                disabled={quiz.questions.length === 1}
                                onClick={() => setQuiz({ questions: quiz.questions.filter((_, i) => i !== index) })}
                            >
                                <TrashIcon />
                            </IconButton>
                        </Box>
                        <Input
                            value={question.question}
                            onChange={(event) => setQuestion(index, { question: event.target.value })}
                            placeholder="Текст вопроса"
                            sx={fieldSx}
                        />

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                            {question.options.map((option, optionIndex) => (
                                <Box key={optionIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Checkbox
                                        checked={question.correct.includes(optionIndex)}
                                        onChange={(event) =>
                                            setQuestion(index, {
                                                correct: event.target.checked
                                                    ? [...question.correct, optionIndex].sort((a, b) => a - b)
                                                    : question.correct.filter((i) => i !== optionIndex),
                                            })
                                        }
                                        slotProps={{ input: { 'aria-label': `Вариант ${optionIndex + 1} — верный` } }}
                                    />
                                    <Input
                                        value={option}
                                        onChange={(event) =>
                                            setQuestion(index, {
                                                options: question.options.map((item, i) => (i === optionIndex ? event.target.value : item)),
                                            })
                                        }
                                        placeholder={`Вариант ${optionIndex + 1}`}
                                        sx={{ ...fieldSx, flex: 1 }}
                                    />
                                    <IconButton
                                        size="sm"
                                        color="neutral"
                                        aria-label="Удалить вариант"
                                        disabled={question.options.length <= 2}
                                        onClick={() =>
                                            setQuestion(index, {
                                                options: question.options.filter((_, i) => i !== optionIndex),
                                                // Номера верных ответов после удалённого сдвигаются на один
                                                correct: question.correct
                                                    .filter((i) => i !== optionIndex)
                                                    .map((i) => (i > optionIndex ? i - 1 : i)),
                                            })
                                        }
                                    >
                                        <TrashIcon />
                                    </IconButton>
                                </Box>
                            ))}
                            <Button
                                size="sm"
                                variant="plain"
                                color="neutral"
                                startDecorator={<PlusIcon />}
                                onClick={() => setQuestion(index, { options: [...question.options, ''] })}
                                sx={{ alignSelf: 'flex-start' }}
                            >
                                Вариант
                            </Button>
                            <FormHelperText>Галочкой отметьте верные ответы. Если их несколько — вопрос станет с выбором нескольких.</FormHelperText>
                        </Box>

                        <Input
                            value={question.hint ?? ''}
                            onChange={(event) => setQuestion(index, { hint: event.target.value })}
                            placeholder="Подсказка после ответа — необязательно"
                            sx={fieldSx}
                        />
                    </Box>
                ))}

                <Button
                    variant="outlined"
                    color="neutral"
                    startDecorator={<PlusIcon />}
                    onClick={() => setQuiz({ questions: [...quiz.questions, blankQuestion()] })}
                    sx={{ alignSelf: 'flex-start' }}
                >
                    Вопрос
                </Button>
            </Panel>
        </>
    )
}
