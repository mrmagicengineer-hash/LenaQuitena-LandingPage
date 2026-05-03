import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './context/LanguageContext.tsx'
import { RestaurantProvider } from './context/RestaurantContext.tsx'
import { CartProvider } from './context/CartContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <RestaurantProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </RestaurantProvider>
    </LanguageProvider>
  </StrictMode>,
)
