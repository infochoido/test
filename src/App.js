import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SolveTestTable from './pages/solveTest';
import MakeTest from './pages/maketest';
import Home from './pages/Home';
import React from 'react';
import NavigationBar from './navbar';
import PostDetail from './pages/PostDetail';

function App() {
  return ( <BrowserRouter>
    <div className="mx-2 App">
      <NavigationBar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/post' element={<SolveTestTable />} />
          <Route path='/write' element={<MakeTest />} />
          <Route path="/post/:postId" element={<PostDetail />} />
        </Routes>
      
    </div></BrowserRouter>
  );
}

export default App;
