import { BrowserRouter, Routes, Route } from 'react-router-dom'

import ThemeProvider from './theme/theme'
import PageNotFound from './pages/PageNotFound'

import routes from './routes/RoutesMain'

function App() {
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
