import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Apps } from './pages/Apps'
import { AppMarkdownPage } from './pages/apps/AppMarkdownPage'
import { EmailPortal } from './pages/EmailPortal'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { Services } from './pages/Services'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/apps" element={<Apps />} />
        <Route path="/apps/:appSlug/:pageSlug" element={<AppMarkdownPage />} />
        <Route path="/services" element={<Services />} />
        <Route path="/email" element={<EmailPortal />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
