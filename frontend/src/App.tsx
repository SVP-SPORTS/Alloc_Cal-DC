import React from 'react';

import './App.css';
//import { MantineProvider } from '@mantine/core';
import AllocationTables from './components/AllocationTable';
import { DataSearch } from './components/pop';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/parent';
import StorePage from './components/storepush';
import AllocTable from './components/rcvAllocData';
import StylesTable from './components/styleData';
import StyleQuantitiesTable from './components/styleQty';

const App: React.FC = () => (
 
<Router>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/allocCal" element={<AllocationTables />} />
      <Route path="/floorUser" element={<DataSearch />} />
      <Route path="/storedata" element={<StorePage />} />
      <Route path="/allocData" element={<AllocTable/>}/>
      <Route path="/styleData" element={<StylesTable/>}/>
      <Route path="/styleqty" element={<StyleQuantitiesTable/>}/>
    </Routes>
    </Router>
   
);
export default App;
