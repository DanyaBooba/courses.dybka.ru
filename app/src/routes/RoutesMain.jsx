import { Navigate, Route } from 'react-router-dom'

import PageIndex from '../pages/PageIndex'
import PageCourse from '../pages/PageCourse'
import PageLesson from '../pages/PageLesson'
import PageLegal from '../pages/PageLegal'
import PageLogin from '../pages/CreateCourse/PageLogin'
import AdminLayout from '../pages/Admin/AdminLayout'
import PageAdminHome from '../pages/Admin/PageAdminHome'
import PageAdminNewCourse from '../pages/Admin/PageAdminNewCourse'
import PageAdminCourse from '../pages/Admin/PageAdminCourse'
import PageAdminLesson from '../pages/Admin/PageAdminLesson'
import PageAdminUsers from '../pages/Admin/PageAdminUsers'

import AuthMiddleware from '../middlewares/AuthMiddleware'
import AdminMiddleware from '../middlewares/AdminMiddleware'
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
        {/* Панель управления — для авторов и администратора */}
        <Route element={<AdminMiddleware />}>
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<PageAdminHome />} />
                <Route path="new" element={<PageAdminNewCourse />} />
                <Route path="course/:id" element={<PageAdminCourse />} />
                <Route path="course/:id/lesson/:slug" element={<PageAdminLesson />} />
                <Route path="users" element={<PageAdminUsers />} />
            </Route>
        </Route>

        {/* Старый адрес добавления программы */}
        <Route path="/new" element={<Navigate to="/admin/new" replace />} />
    </Route>,
]
