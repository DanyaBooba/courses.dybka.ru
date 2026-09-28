import { useColorScheme } from '@mui/joy/styles'

/** Тема, которая сейчас на экране: 'light' или 'dark' (с учётом системной). */
export default function useScheme() {
    const { mode, systemMode } = useColorScheme()
    return mode === 'system' ? systemMode || 'light' : mode || 'light'
}
