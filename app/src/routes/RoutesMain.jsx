import { Route } from 'react-router-dom'

import PageIndex from '../pages/PageIndex'
import PageCourse from '../pages/PageCourse'
import PageLesson from '../pages/PageLesson'
import PageLegal from '../pages/PageLegal'
import PageLogin from '../pages/CreateCourse/PageLogin'
import PageNewCourse from '../pages/CreateCourse/PageNewCourse'

import AuthMiddleware from '../middlewares/AuthMiddleware'
import GuestMiddleware from '../middlewares/GuestMiddleware'

import { privacy, consent } from '../data/legal'

export default [
    <Route index element={<PageIndex />} key="route-index" />,

    <Route path="/course/:id" element={<PageCourse />} key="route-course" />,

    <Route path="/course/:id/:slug" element={<PageLesson />} key="route-course-lesson" />,

    <Route path={privacy.path} element={<PageLegal doc={privacy} />} key="route-privacy" />,

    <Route path={consent.path} element={<PageLegal doc={consent} />} key="route-consent" />,

    <Route element={<GuestMiddleware />} key="route-guest">
        <Route path="/login" element={<PageLogin />} />
    </Route>,

    <Route element={<AuthMiddleware />} key="route-auth">
        <Route path="/new" element={<PageNewCourse />} />
    </Route>,
]
