import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { EventsPage } from './pages/EventsPage'
import { HomePage } from './pages/HomePage'
import { TeamPage } from './pages/TeamPage'
import { TokenKitchenSink } from './pages/TokenKitchenSink'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/team" element={<TeamPage />} />
        </Route>
        <Route path="/tokens" element={<TokenKitchenSink />} />
      </Routes>
    </BrowserRouter>
  )
}
