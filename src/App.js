import './App.css';
import Header from './pages/Header.jsx';
import { ToastContainer } from 'react-toastify';
import AppRoutes from './routes/AppRoutes';


function App() {
  return (
    <>
    <div>
      <div className='app-container'>
        <Header /> {/* Hiển thị Header */}
        <AppRoutes />
        
      </div>
    </div>
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      />
    <ToastContainer />
    </>
  );
}

export default App;
