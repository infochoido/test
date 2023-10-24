import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SolveTestTable from './pages/solveTest';
import MakeTest from './pages/maketest';
import Home from './pages/Home';
import React from 'react';
import NavigationBar from './navbar';

function App() {
  return ( <BrowserRouter>
    <div className="App mx-2">
      <NavigationBar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/solve' element={<SolveTestTable />} />
          <Route path='/make' element={<MakeTest />} />
        </Routes>
      
    </div></BrowserRouter>
  );
}

export default App;
