// PrivateRoute.js

import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { getUser } from './firebase'; // Replace with your actual authentication context

const PrivateRoute = ({ element, ...props }) => {
  const auth = getUser(); // Replace with your actual authentication context hook

  return auth.user ? (
    <Route {...props} element={element} />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default PrivateRoute;
