import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SaasVideoEditor from './pages/SaasVideoEditor'
import { ExportStudio } from './export/ExportStudio'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/editor" element={<SaasVideoEditor />} />
        <Route path="/export" element={<ExportStudio />} />
        <Route path="/" element={<SaasVideoEditor />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
