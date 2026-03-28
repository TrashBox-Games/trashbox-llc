import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Apps } from './pages/Apps'
import { AppMarkdownPage } from './pages/apps/AppMarkdownPage'
import { Home } from './pages/Home'
import { Services } from './pages/Services'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/apps" element={<Apps />} />
        <Route path="/apps/:appSlug/:pageSlug" element={<AppMarkdownPage />} />
        <Route path="/services" element={<Services />} />
      </Route>
    </Routes>
  )
}
