// App.js

import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import SolveTestTable from './pages/solveTest';
import MakeTest from './pages/maketest';
import Home from './pages/Home';
import NavigationBar from './navbar';
import PostDetail from './pages/PostDetail';
import SimpleBottomNavigation from './MobileBotNavbar';
import Remarks from './pages/Remarks';
import LoginForm from './pages/Login';
import { Signup } from './pages/SignUp';
import MyPage from './pages/MyPage';
import Doto from './pages/Doto'

function App() {

  return (
    <BrowserRouter>
      <div className="mx-2 bg-white App">
        <NavigationBar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/post' element={<SolveTestTable />} />
          <Route path='/write' element={<MakeTest />} />
          <Route path="/post/:postId" element={<PostDetail />} />
          <Route path="/remarks" element={<Remarks />} />
          <Route path="/doto" element={<Doto />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
        <SimpleBottomNavigation />
      </div>
    </BrowserRouter>
  );
}

export default App;
