import './App.css';
import { router } from './routes';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import { Provider } from 'react-redux';
import store from './redux/store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider> {/* Wrap the entire application in AuthProvider */}
        <RouterProvider router={router}>
          <div className="App">
            <main>
              <router.View />
            </main>
          </div>
        </RouterProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </AuthProvider>
    </Provider>
  );
}