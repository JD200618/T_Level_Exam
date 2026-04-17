import { RouterProvider } from 'react-router';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#2E7D32',
              color: 'white',
              border: 'none',
            },
          }}
        />
      </CartProvider>
    </AuthProvider>
  );
}