import { CssVarsProvider } from '@mui/joy/styles'
import CssBaseline from '@mui/joy/CssBaseline'

import { useState, useEffect } from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { extendTheme } from '@mui/joy/styles'

export const themeVariant = extendTheme({
    colorSchemes: {
        light: {
            palette: {
                head: {
                    themeColor: '#ffffff'
                },
                background: {
                    body: '#ffffff',
                },
                header: {
                    backgroundColor: 'rgba(31, 37, 43, 0.8)',
                },
                hero: {
                    backgroundColor: '#ffffff',
                    link: {
                        color: '#DC7334',
                    }
                },
                buttons: {
                    orange: {
                        default: '#e97b2e',
                        hover: '#cd6c28',
                        active: '#b15d23',
                        focusRing: '#f1a977',
                        color: '#ffffff',
                    }
                }
            },
        },
        dark: {
            palette: {
                head: {
                    themeColor: '#121212'
                },
                background: {
                    body: '#121212',
                    surface: '#1a1a1a',
                    popup: '#142735'
                },
                header: {
                    backgroundColor: '#20202066',
                },
                hero: {
                    backgroundColor: '#1a1a1a',
                    link: {
                        color: '#DC7334'
                    }
                }
            },
        },
    },
})

export const currentTheme = () => {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
    const [mode, setMode] = useState(prefersDarkMode ? 'dark' : 'light')

    useEffect(() => {
        setMode(prefersDarkMode ? 'dark' : 'light')
    }, [prefersDarkMode])

    return theme.colorSchemes[mode].palette
}


export default function ThemeProvider({ children }) {
    return (
        <CssVarsProvider theme={themeVariant} defaultMode='system'>
            {document.querySelector("meta[name='theme-color']")?.setAttribute('content', currentTheme().head.themeColor)}
            <CssBaseline />
            {children}
        </CssVarsProvider>
    )
}
