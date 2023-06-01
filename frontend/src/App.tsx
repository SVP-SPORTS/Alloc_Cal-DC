import React from 'react';

import './App.css';
//import { MantineProvider } from '@mantine/core';
import AllocationTables from './components/AllocationTables';
import { DataSearch } from './components/pop';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/parent';

const App: React.FC = () => (
 
<Router>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/allocCal" element={<AllocationTables />} />
      <Route path="/floorUser" element={<DataSearch />} />
    </Routes>
    </Router>
   
);
export default App;
