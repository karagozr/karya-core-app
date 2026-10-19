import { Routes, Route, Navigate } from 'react-router-dom';
import AppLoginPage from './app-pages/login-page/login-page';
import ResetPasswordFormPage from './app-pages/login-page/reset-password-form-page';

export default function UnauthenticatedContent() {
  return (
    <Routes>
      <Route path='/login' element={<AppLoginPage />} />    
      <Route path='/reset-password' element={ <ResetPasswordFormPage /> } />
      <Route path='*' element={<Navigate to={'/login'} />}></Route>
    </Routes>
  );
}
