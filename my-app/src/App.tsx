import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SaasVideoEditor from './pages/SaasVideoEditor'
import HomePage from './pages/HomePage'
import { ExportStudio } from './export/ExportStudio'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/editor" element={<SaasVideoEditor />} />
          <Route path="/export" element={<ExportStudio />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
