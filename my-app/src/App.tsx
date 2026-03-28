import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SaasVideoEditor from './pages/SaasVideoEditor'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SaasVideoEditor />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
