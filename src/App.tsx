import './App.css'
import { AppRouter } from './router'
import { AppToastContainer } from './components/ui/toast'

function App() {
  return (
    <>
      <AppRouter />
      <AppToastContainer />
    </>
  )
}

export default App
