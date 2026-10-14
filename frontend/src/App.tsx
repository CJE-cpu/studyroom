import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Header from './shared/components/Header'
import Footer from './shared/components/Footer'
import AppRouter from './app/AppRouter'
const client = new QueryClient()
export default function App() {
  return (
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <a className="skip-link" href="#main">
          본문으로 이동
        </a>
        <Header />
        <main id="main">
          <AppRouter />
        </main>
        <Footer />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
