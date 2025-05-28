import { Box, CircularProgress } from '@mui/material';
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './utils/ProtectedRoute';

// Lazy imports
const Welcome = lazy(() => import('./Pages/Welcome'));

const Login = lazy(() => import('./Pages/Login'));
const Signup = lazy(() => import('./Pages/Signup'));
const Dashboard = lazy(() => import('./Pages/Dashboard'));
const Inventory = lazy(() => import('./Pages/Inventory'));
const Billing = lazy(() => import('./Pages/Billing'));
const Monthlysales = lazy(() => import('./Pages/Monthlysales'));
const Notfound = lazy(() => import('./Pages/Notfound'));
const Internalerror = lazy(() => import('./Pages/Internalerror'));

function App() {


  const token= sessionStorage.getItem('token')
  return (
    <>
      <BrowserRouter>

        <Suspense fallback={ <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                      <CircularProgress />
                    </Box>}>
             
          <Routes>
            <Route path='/' element={<Welcome />} />
           
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Signup />} />

            {/* Nested route */}

           
                            <Route 
                              path='/dashboard' 
                              element={
                                <ProtectedRoute>
                                  <Dashboard />
                                </ProtectedRoute>
                              }
                             >
                                  <Route path='inventory' element={<Inventory />} />
                                  <Route path='billing' element={<Billing />} />
                                  <Route path='monthly-sales' element={<Monthlysales />} />
                             </Route>
                         
            
           

            <Route path='*' element={<Notfound />} />
            <Route path='/internalerror' element={<Internalerror />} />
          </Routes>
        </Suspense>

        <ToastContainer />
      </BrowserRouter>
    </>
  );
}

export default App;
