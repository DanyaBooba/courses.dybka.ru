import { Route } from 'react-router-dom';

import PageIndex from '../pages/PageIndex';

export default [
    <Route index element={<PageIndex />} key="route-index" />,

    <Route path="/course/:id" element={<PageIndex />} key="route-course-:id" />,
]
