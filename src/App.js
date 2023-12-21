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
import { useEffect } from 'react';
import { getUser } from './firebase';
import { addCoinsOnAttendance } from './firebase'; 
import { updateAttendance } from './firebase';
import { getAttendanceStatus, addAttendanceStatus } from './firebase';
import Gun from "./pages/Gun"
import GunGames from './pages/GunGame';



function App() {

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };


  useEffect(() => {
    getUser(async (user) => {
      if (user) {
        const currentDate = getCurrentDate();
        const hasAttendedToday = await getAttendanceStatus(user.email, currentDate);

        if (!hasAttendedToday) {
          updateAttendance(user.email, currentDate);
          addCoinsOnAttendance(user.email);
          const addedSuccessfully = await addAttendanceStatus(user.email, currentDate);

          if (addedSuccessfully) {
            console.log("코인 추가 및 출석 완료");
          } else {
            console.log("코인은 추가되었지만 출석 정보는 이미 존재합니다.");
          }
        } 
      }
    });
  }, []);
  
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
          <Route path="/gun" element={<Gun />} />
          <Route path="/gameplay/:gameId" element={<GunGames />} />
        </Routes>
        <SimpleBottomNavigation />
      </div>
    </BrowserRouter>
  );
}

export default App;
