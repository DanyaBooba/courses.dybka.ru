import { Route } from 'react-router-dom'

import PageIndex from '../pages/PageIndex'
import PageCourse from '../pages/PageCourse'
import PageLesson from '../pages/PageLesson'

export default [
    <Route index element={<PageIndex />} key="route-index" />,

    <Route path="/course/:id" element={<PageCourse />} key="route-course" />,

    <Route path="/course/:id/:slug" element={<PageLesson />} key="route-course-lesson" />,
]
