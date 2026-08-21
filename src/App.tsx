import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { EventsPage } from './pages/EventsPage'
import { HomePage } from './pages/HomePage'
import { PostPage } from './pages/PostPage'
import { TeamPage } from './pages/TeamPage'
import { TokenKitchenSink } from './pages/TokenKitchenSink'
import { UpdatesPage } from './pages/UpdatesPage'
import { LoginPage } from './pages/admin/Login'
import { ResetPasswordPage } from './pages/admin/ResetPassword'
import { AdminProfilePage } from './pages/admin/Profile'
import { DashboardLayout } from './pages/admin/dashboard/Layout'
import { DashboardIndex } from './pages/admin/dashboard/Index'
import { EventsManager } from './pages/admin/dashboard/Events'
import { BlogManager } from './pages/admin/dashboard/Blog'
import { BroadcastsManager } from './pages/admin/dashboard/Broadcasts'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/updates" element={<UpdatesPage />} />
          <Route path="/posts/:slug" element={<PostPage />} />
          <Route path="/admin" element={<LoginPage />} />
          <Route path="/admin/reset-password" element={<ResetPasswordPage />} />
          <Route path="/admin/profile" element={<AdminProfilePage />} />
        </Route>
        <Route path="/admin/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardIndex />} />
          <Route path="events" element={<EventsManager />} />
          <Route path="blog" element={<BlogManager />} />
          <Route path="broadcasts" element={<BroadcastsManager />} />
        </Route>
        <Route path="/tokens" element={<TokenKitchenSink />} />
      </Routes>
    </BrowserRouter>
  )
}
