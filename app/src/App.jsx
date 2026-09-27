import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import ThemeProvider from './theme/theme'
import PageNotFound from './pages/PageNotFound'
import setupLightbox from './components/Content/lightbox'

import routes from './routes/RoutesMain'

function App() {
    // Картинки открываются на весь экран: один обработчик на всё приложение
    useEffect(() => {
        setupLightbox()
    }, [])

    return (
        <ThemeProvider>
            <BrowserRouter>
                <Routes>
                    {routes}
                    <Route path="*" element={<PageNotFound />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    )
}

export default App
