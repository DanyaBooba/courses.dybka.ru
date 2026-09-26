import { CssVarsProvider } from '@mui/joy/styles'
import CssBaseline from '@mui/joy/CssBaseline'

import themeVariant from './themeVariant'

export default function ThemeProvider({ children }) {
    return (
        <CssVarsProvider theme={themeVariant} defaultMode="system" modeStorageKey="dd-mode">
            <CssBaseline />
            {children}
        </CssVarsProvider>
    )
}
