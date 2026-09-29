import { useState } from 'react'
import Box from '@mui/joy/Box'
import Container from '@mui/joy/Container'
import Typography from '@mui/joy/Typography'
import Input from '@mui/joy/Input'
import Button from '@mui/joy/Button'
import Link from '@mui/joy/Link'
import { Link as RouterLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeftIcon, CaretLeftIcon } from '@phosphor-icons/react'

import PageShell from '../../components/Layout/PageShell'
import { shineSx } from '../../components/Ui/shine'
import { requestCode, verifyCode } from '../../auth/api'
import { setToken } from '../../auth/session'
import useSeo from '../../seo/useSeo'
import { hiddenSeo } from '../../seo/seo'

const ease = [0.22, 1, 0.36, 1]

// Экраны сменяют друг друга сдвигом: вперёд — уезжают влево, назад — вправо
const slide = {
    enter: (direction) => ({ opacity: 0, x: direction * 48 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.45, ease } },
    exit: (direction) => ({ opacity: 0, x: direction * -48, transition: { duration: 0.2, ease } }),
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CODE_LENGTH = 6

const buttonSx = {
    mt: 3,
    px: 3,
    fontWeight: 700,
    width: '100%'
}

/** Ошибка под полем: появляется плавно и раздвигает место под себя. */
function FormError({ message }) {
    return (
        <AnimatePresence initial={false}>
            {message && (
                <Box
                    component={motion.div}
                    key="error"
                    role="alert"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto', transition: { duration: 0.3, ease } }}
                    exit={{ opacity: 0, height: 0, transition: { duration: 0.2, ease } }}
                    sx={{ overflow: 'hidden' }}
                >
                    <Typography sx={{ pt: 1.5, color: 'danger.plainColor', fontSize: 'sm', lineHeight: 1.6 }}>
                        {message}
                    </Typography>
                </Box>
            )}
        </AnimatePresence>
    )
}

/** Согласие под кнопкой отправки почты: документы открываются в новой вкладке, чтобы не сбросить форму. */
function Consent() {
    const linkProps = {
        component: RouterLink,
        target: '_blank',
        rel: 'noopener',
        color: 'neutral',
        underline: 'always',
        sx: { color: 'text.secondary', textDecorationColor: 'var(--joy-palette-neutral-outlinedBorder)' },
    }

    return (
        <Typography
            level="body-xs"
            sx={{ mt: 2, color: 'text.tertiary', lineHeight: 1.6, textAlign: 'center', textWrap: 'balance' }}
        >
            Нажимая «Далее», вы даёте{' '}
            <Link to="/consent" {...linkProps}>
                согласие на обработку персональных данных
            </Link>{' '}
            и принимаете{' '}
            <Link to="/privacy" {...linkProps}>
                политику конфиденциальности
            </Link>
            .
        </Typography>
    )
}

function Title({ children }) {
    return (
        <Typography
            level="h1"
            sx={{
                fontWeight: 450,
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
                fontSize: { xs: '32px', md: '42px' },
                textAlign: 'center'
            }}
        >
            {children}
        </Typography>
    )
}

export default function PageLogin() {
    const [step, setStep] = useState('email')
    const [direction, setDirection] = useState(1)
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    useSeo(hiddenSeo('Авторизация — courses.dybka.ru'))

    function goTo(next, dir) {
        setDirection(dir)
        setError('')
        setStep(next)
    }

    async function submitEmail(event) {
        event.preventDefault()
        const value = email.trim()

        if (!emailPattern.test(value)) {
            setError('Проверьте почту: в адресе нужна @ и домен, например name@mail.ru.')
            return
        }

        setLoading(true)
        setError('')
        try {
            await requestCode(value)
            setEmail(value)
            setCode('')
            goTo('code', 1)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function submitCode(event) {
        event.preventDefault()

        if (code.length !== CODE_LENGTH) {
            setError(`В коде ${CODE_LENGTH} символов.`)
            return
        }

        setLoading(true)
        setError('')
        try {
            // После сохранения токена GuestMiddleware сам уведёт со страницы входа
            setToken(await verifyCode(email, code))
        } catch (err) {
            setError(err.message)
            setLoading(false)
        }
    }

    return (
        <PageShell centered>
            <Container maxWidth="sm" sx={{ px: { xs: 2.5, sm: 3 }, py: { xs: 6, md: 8 }, overflow: 'hidden' }}>
                <Box sx={{ maxWidth: 440, mx: 'auto' }}>
                    <AnimatePresence mode="wait" custom={direction} initial={false}>
                        {step === 'email' ? (
                            <Box
                                key="email"
                                component={motion.form}
                                custom={direction}
                                variants={slide}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                onSubmit={submitEmail}
                                noValidate
                                // Блок центрируется по вертикали, поэтому отступ сверху вдвое больше сдвига: 116px → вниз на 58px
                                sx={{ pt: '116px' }}
                            >
                                <Title>Авторизация</Title>

                                <Input
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    autoFocus
                                    size="lg"
                                    placeholder="Почта"
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(event.target.value)
                                        setError('')
                                    }}
                                    error={Boolean(error)}
                                    slotProps={{ input: { 'aria-label': 'Почта' } }}
                                    sx={{ mt: 4, boxShadow: 'none' }}
                                />

                                <FormError message={error} />

                                <Button type="submit" size="lg" loading={loading} sx={buttonSx}>
                                    Далее
                                </Button>

                                <Consent />
                            </Box>
                        ) : (
                            <Box
                                key="code"
                                component={motion.form}
                                custom={direction}
                                variants={slide}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                onSubmit={submitCode}
                                noValidate
                            >
                                <Box sx={{
                                    display: 'flex',
                                    width: '100%',
                                }}>
                                    <Button
                                        variant="plain"
                                        color="neutral"
                                        size="sm"
                                        startDecorator={<CaretLeftIcon />}
                                        onClick={() => goTo('email', -1)}
                                        disabled={loading}
                                        sx={{ mb: 2, ml: -1, mx: 'auto', color: 'text.tertiary', fontWeight: 500, transform: 'translateX(-14px)' }}
                                    >
                                        Изменить почту
                                    </Button>
                                </Box>

                                <Title>Введите код</Title>

                                <Typography sx={{ mt: 1.5, color: 'text.secondary', lineHeight: 1.7, textAlign: 'center' }}>
                                    На указанную почту был отправлен код из 6 букв и цифр. Введите его в поле ниже.
                                </Typography>

                                <Input
                                    name="code"
                                    autoComplete="one-time-code"
                                    autoFocus
                                    size="lg"
                                    placeholder="A1B2C3"
                                    value={code}
                                    onChange={(event) => {
                                        // Код из латинских букв и цифр: регистр не важен, пробелы и прочее отбрасываем.
                                        // maxLength на поле не ставим — иначе браузер обрежет вставку «A B C 1 2 3» до чистки
                                        setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH))
                                        setError('')
                                    }}
                                    error={Boolean(error)}
                                    slotProps={{
                                        input: {
                                            autoCapitalize: 'characters',
                                            autoCorrect: 'off',
                                            spellCheck: false,
                                            'aria-label': 'Код из письма',
                                        },
                                    }}
                                    sx={{
                                        mt: 4,
                                        fontFamily: 'code',
                                        fontSize: '22px',
                                        letterSpacing: '0.4em',
                                        boxShadow: 'none'
                                    }}
                                />

                                <FormError message={error} />

                                <Button type="submit" size="lg" loading={loading} sx={buttonSx}>
                                    Войти
                                </Button>
                                <Typography sx={{ mt: 1.5, color: 'text.secondary', lineHeight: 1.7, textAlign: 'center' }}>
                                    Письмо могло попасть в спам.
                                </Typography>
                            </Box>
                        )}
                    </AnimatePresence>
                </Box>
            </Container>
        </PageShell>
    )
}
