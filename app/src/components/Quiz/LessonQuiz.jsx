import { useMemo, useState } from 'react'
import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'
import { CheckIcon, XIcon } from '@phosphor-icons/react'
import InlineText from '../Content/InlineText'

/**
 * Тест после уроков: несколько вопросов с вариантами ответа и разбор в конце.
 *
 * Компонент пока нигде не подключён — это готовое оформление на будущее.
 * Данные приходят в `quiz` (схема — в ./quizSample.js), цвет курса — в `ink`.
 * Ничего не сохраняется и никуда не отправляется: результат живёт в состоянии
 * компонента и стирается при «Пройти заново».
 *
 * Оформление то же, что и во всём справочнике: линейки вместо теней,
 * моноширинные пометки на полях, метки вариантов вместо булетов.
 */

/** Совпадает ли выбор с правильным ответом (порядок не важен). */
function isRight(picked, correct) {
    if (picked.length !== correct.length) return false
    return correct.every((index) => picked.includes(index))
}

/** Итог теста человеческим языком. */
function verdict(score, total) {
    const share = total ? score / total : 0
    if (share === 1) return { title: 'Материал усвоен', note: 'Ни одной ошибки — можно идти дальше.' }
    if (share >= 0.8) {
        return { title: 'Хороший результат', note: 'Загляните в разбор: пара мест стоит перечитать.' }
    }
    if (share >= 0.5) {
        return { title: 'Основное понятно', note: 'Половина ответов мимо — вернитесь к отмеченным урокам.' }
    }
    return { title: 'Стоит вернуться к урокам', note: 'Пройдите уроки ещё раз и повторите тест.' }
}

/**
 * Метка варианта. Форма говорит, сколько ответов можно отметить:
 * квадрат — можно несколько, кружок — только один. Букв нет: форма и так
 * всё объясняет, а буквы рядом с тегами вроде `<meta>` только мешали читать.
 *
 * Выбранный квадрат заливается и показывает галочку, выбранный кружок —
 * точку внутри рамки, как обычный переключатель.
 *
 * После проверки метка по-прежнему отражает выбор человека: зелёная галочка —
 * отметил верно, красный крестик — отметил зря, пустая зелёная рамка —
 * правильный вариант, который пропустили.
 */
function Marker({ state, multiple }) {
    const palette = {
        idle: { bgcolor: 'transparent', color: 'text.tertiary', borderColor: 'page.border' },
        picked: { bgcolor: 'text.primary', color: 'background.body', borderColor: 'text.primary' },
        right: { bgcolor: 'success.500', color: '#fff', borderColor: 'success.500' },
        wrong: { bgcolor: 'danger.500', color: '#fff', borderColor: 'danger.500' },
        // Правильный вариант, который не отметили: рамка пустая, но зелёная
        missed: { bgcolor: 'transparent', color: 'success.500', borderColor: 'success.500' },
    }[state]

    const dot = state === 'picked' && !multiple

    return (
        <Box
            aria-hidden
            sx={{
                flexShrink: 0,
                width: 24,
                height: 24,
                mt: '1px',
                display: 'grid',
                placeItems: 'center',
                borderRadius: multiple ? 0 : '50%',
                border: '1px solid',
                lineHeight: 1,
                transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
                ...palette,
                // Точка выбора рисуется внутри, поэтому сама рамка остаётся пустой
                ...(dot && { bgcolor: 'transparent', borderColor: 'text.primary' }),
            }}
        >
            {dot && (
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'text.primary' }} />
            )}
            {state === 'picked' && multiple && <CheckIcon size={13} weight="bold" />}
            {state === 'right' && <CheckIcon size={13} weight="bold" />}
            {state === 'wrong' && <XIcon size={13} weight="bold" />}
        </Box>
    )
}

function Question({ item, order, total, picked, checked, ink, onPick }) {
    const multiple = item.correct.length > 1
    const right = isRight(picked, item.correct)

    return (
        <Box component="li" sx={{ listStyle: 'none', mt: 4 }}>
            {/* Колонтитул вопроса: номер, тип, итог после проверки */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 2,
                    pb: 1,
                    borderBottom: '1px solid',
                    borderColor: 'page.border',
                    fontFamily: 'code',
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                }}
            >
                <Box component="span" sx={{ color: 'text.tertiary' }}>
                    Вопрос {String(order)} из {String(total)}
                    {multiple && ' · несколько ответов'}
                </Box>

                {checked && (
                    <Box
                        component="span"
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: right ? 'success.plainColor' : 'danger.plainColor',
                        }}
                    >
                        {right ? <CheckIcon size={14} weight="bold" /> : <XIcon size={14} weight="bold" />}
                        {right ? 'Верно' : 'Неверно'}
                    </Box>
                )}
            </Box>

            <Typography
                sx={{
                    mt: 1.75,
                    fontFamily: 'display',
                    fontSize: { xs: 'lg', md: 'xl' },
                    fontWeight: 600,
                    lineHeight: 1.35,
                    letterSpacing: '-0.015em',
                    // Код в вопросе — шрифтом вопроса, выделен только фоном
                    '& code': { fontFamily: 'inherit', fontSize: 'inherit' },
                }}
            >
                <InlineText text={item.question} />
            </Typography>

            <Box
                role={multiple ? 'group' : 'radiogroup'}
                aria-label={item.question.replace(/[`*_]/g, '')}
                sx={{ mt: 2, display: 'flex', flexDirection: 'column' }}
            >
                {item.options.map((option, index) => {
                    const chosen = picked.includes(index)
                    const correct = item.correct.includes(index)

                    // До проверки — только выбор. После метка показывает, что выбрал
                    // человек, а правильные варианты подсвечены фоном строки
                    let state = 'idle'
                    if (checked && chosen) state = correct ? 'right' : 'wrong'
                    else if (checked && correct) state = 'missed'
                    else if (chosen) state = 'picked'
                    const highlight = checked && correct

                    return (
                        <Box
                            // Ключ по номеру: тексты вариантов могут совпадать (в черновике — пустые)
                            key={index}
                            component="button"
                            type="button"
                            role={multiple ? 'checkbox' : 'radio'}
                            aria-checked={chosen}
                            disabled={checked}
                            onClick={() => onPick(index)}
                            sx={{
                                appearance: 'none',
                                width: '100%',
                                textAlign: 'left',
                                font: 'inherit',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1.5,
                                px: 1,
                                py: 1.25,
                                border: 'none',
                                borderBottom: '1px solid',
                                borderColor: 'page.border',
                                borderRadius: 0,
                                bgcolor: highlight ? 'success.softBg' : 'transparent',
                                color: 'text.secondary',
                                cursor: checked ? 'default' : 'pointer',
                                transition: 'background-color 0.15s ease, color 0.15s ease',
                                // Только для мыши: на тач-экранах :hover «залипает» после тапа
                                '@media (hover: hover)': {
                                    '&:hover': checked ? {} : { bgcolor: 'background.level1', color: 'text.primary' },
                                },
                                '&:focus-visible': { outline: '2px solid', outlineColor: ink, outlineOffset: '2px' },
                            }}
                        >
                            <Marker state={state} multiple={multiple} />

                            <Box
                                component="span"
                                sx={{
                                    fontSize: 'md',
                                    lineHeight: 1.55,
                                    color: checked && (correct || chosen) ? 'text.primary' : 'inherit',
                                }}
                            >
                                <InlineText text={option} />
                            </Box>
                        </Box>
                    )
                })}
            </Box>

            {/* Разбор появляется только после проверки */}
            {checked && item.hint && (
                <Typography
                    sx={{
                        mt: 1.75,
                        pl: 1.75,
                        borderLeft: '2px solid',
                        borderColor: ink,
                        fontSize: 'sm',
                        lineHeight: 1.65,
                        color: 'text.secondary',
                    }}
                >
                    <InlineText text={item.hint} />
                </Typography>
            )}
        </Box>
    )
}

export default function LessonQuiz({ quiz, ink = 'text.primary' }) {
    const [answers, setAnswers] = useState({})
    const [checked, setChecked] = useState(false)

    const questions = useMemo(() => quiz?.questions ?? [], [quiz])
    const total = questions.length

    const answered = useMemo(
        () => questions.filter((item) => (answers[item.id] ?? []).length > 0).length,
        [questions, answers],
    )

    const score = useMemo(
        () => questions.filter((item) => isRight(answers[item.id] ?? [], item.correct)).length,
        [questions, answers],
    )

    if (!total) return null

    const pick = (item, index) => {
        setAnswers((current) => {
            const picked = current[item.id] ?? []
            // Один ответ — заменяем, несколько — переключаем
            if (item.correct.length === 1) {
                return { ...current, [item.id]: picked[0] === index ? [] : [index] }
            }
            return {
                ...current,
                [item.id]: picked.includes(index)
                    ? picked.filter((value) => value !== index)
                    : [...picked, index],
            }
        })
    }

    const restart = () => {
        setAnswers({})
        setChecked(false)
    }

    const result = verdict(score, total)
    const percent = Math.round((score / total) * 100)

    return (
        <Box component="section" aria-label={quiz.title} sx={{ mt: 7 }}>
            {/* Шапка теста */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 2,
                    pb: 1.25,
                    borderBottom: '2px solid',
                    borderColor: 'page.rule',
                }}
            >
                <Typography
                    level="h2"
                    sx={{ fontWeight: 500, letterSpacing: '-0.02em', '& code': { fontFamily: 'inherit', fontSize: 'inherit' } }}
                >
                    <InlineText text={quiz.title} />
                </Typography>
                <Box
                    component="span"
                    sx={{
                        fontFamily: 'code',
                        fontSize: '11px',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'text.tertiary',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {checked ? `${score} из ${total}` : `${answered} из ${total}`}
                </Box>
            </Box>

            {quiz.intro && (
                <Typography sx={{ mt: 2, maxWidth: 640, color: 'text.secondary', lineHeight: 1.7 }}>
                    <InlineText text={quiz.intro} />
                </Typography>
            )}

            {/* Полоса заполнения: до проверки — прогресс, после — доля верных */}
            <Box
                aria-hidden
                sx={{ mt: 2.5, height: '3px', bgcolor: 'page.border', borderRadius: 0, overflow: 'hidden' }}
            >
                <Box
                    sx={{
                        height: '100%',
                        width: `${((checked ? score : answered) / total) * 100}%`,
                        bgcolor: ink,
                        transition: 'width 0.35s ease',
                    }}
                />
            </Box>

            <Box component="ol" sx={{ m: 0, p: 0 }}>
                {questions.map((item, index) => (
                    <Question
                        key={item.id}
                        item={item}
                        order={index + 1}
                        total={total}
                        picked={answers[item.id] ?? []}
                        checked={checked}
                        ink={ink}
                        onPick={(optionIndex) => pick(item, optionIndex)}
                    />
                ))}
            </Box>

            {/* Итог */}
            <Box
                sx={{
                    mt: 5,
                    pt: 2.5,
                    borderTop: '2px solid',
                    borderColor: 'page.rule',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 2.5,
                }}
            >
                {checked ? (
                    <>
                        <Button variant="outlined" color="neutral" size="lg" onClick={restart} sx={{ px: 3 }}>
                            Пройти заново
                        </Button>

                        <Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    gap: 1.25,
                                    fontFamily: 'display',
                                }}
                            >
                                <Box sx={{ fontSize: { xs: '40px', md: '52px' }, lineHeight: 1, color: ink }}>
                                    {score}
                                </Box>
                                <Box sx={{ fontSize: '20px', color: 'text.tertiary' }}>из {total}</Box>
                                <Box
                                    sx={{
                                        fontFamily: 'code',
                                        fontSize: '11px',
                                        letterSpacing: '0.1em',
                                        color: 'text.tertiary',
                                    }}
                                >
                                    {percent}%
                                </Box>
                            </Box>

                            <Typography
                                sx={{ mt: 1.5, fontFamily: 'display', fontSize: 'lg', fontWeight: 600 }}
                            >
                                {result.title}
                            </Typography>
                            <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: 'sm' }}>
                                {result.note}
                            </Typography>
                        </Box>
                    </>
                ) : (
                    <>
                        <Button
                            size="lg"
                            onClick={() => setChecked(true)}
                            disabled={answered === 0}
                            sx={{ px: 3 }}
                        >
                            Проверить ответы
                        </Button>
                    </>
                )}
            </Box>
        </Box>
    )
}
