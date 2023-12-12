// App.js

import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import SolveTestTable from './pages/solveTest';
import MakeTest from './pages/maketest';
import Home from './pages/Home';
import NavigationBar from './navbar';
import PostDetail from './pages/PostDetail';
import SimpleBottomNavigation from './MobileBotNavbar';

function App() {

  return (
    <BrowserRouter>
      <div className="mx-2 App">
        <NavigationBar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/post' element={<SolveTestTable />} />
          <Route path='/write' element={<MakeTest />} />
          <Route path="/post/:postId" element={<PostDetail />} />
          <Route path="/remarks" element={<PostDetail />} />
          <Route path="/doto" element={<PostDetail />} />
        </Routes>
        <SimpleBottomNavigation />
      </div>
    </BrowserRouter>
  );
}

export default App;
