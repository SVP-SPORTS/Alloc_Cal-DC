import React, { createContext, useEffect, useState } from 'react';

import './App.css';
//import { MantineProvider } from '@mantine/core';
import AllocationTables from './components/Calculator/allocationCalculator';
//import { DataSearch } from './components/pop';
import {  Route, Routes } from 'react-router-dom';
import HomePage from './components/Navigation/parentHome';
import StorePage from './components/floorFetch/showOnWeb';
import AllocTable from './Views/rcvAllocationDataView';
import StylesTable from './Views/styleDataView';
import StyleQuantitiesTable from './Views/styleRCVQtyView';
//import Navigation from './components/navigation';
//import { AppShell, Navbar } from '@mantine/core';
import LoginProfilePage from './Authentication/LoginProfilePage';
import RegisterPage from './Authentication/RegisterPage';
//import AllocationTable from './components/AllocationTable';
import PrivateRoute from './components/privateRoute/privateRoute';
import AllocationComponent from './components/floorFetch/userLead';
//import DataTable from './components/user';


export const UserContext = createContext<any>({});

function App() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [navbarOpened, setNavbarOpened] = useState(false);
	const [authenticatedUser, setAuthenticatedUser] = useState<IUserSessionInfo>({
		_id: null,
		email: "",
		first_name: "",
		last_name: "",
		scope: "", 
	});
	useEffect(() => {
		async function loadUserSession() {
			try {
				let fetchRes = await fetch("http://localhost:5000/api/auth/user", {
					method: "POST",
					credentials: "include",
				});
				let response = await fetchRes.json();
				setAuthenticatedUser((val) => response.user);
			} catch (e) {
				console.log(e);
			}
		}
		loadUserSession();
	}, []);

  
 return(
  <>
  <UserContext.Provider value={{ authenticatedUser, setAuthenticatedUser }}>
		

    <Routes>
	<Route path="/user">
						<Route path="login" element={<LoginProfilePage />} />
						<Route path="register" element={<RegisterPage />} />
					</Route>
      <Route path="/" element={<HomePage setNavbarOpened={setNavbarOpened}/>} />
	  <Route path="/allocCal" element={<PrivateRoute page={<AllocationTables />} />} />
      <Route path="/floorUser" element={<PrivateRoute page={<AllocationComponent />} />} />
      <Route path="/storedata" element={<StorePage  />} />
      <Route path="/allocData" element={<PrivateRoute page={<AllocTable />} />}/>
      <Route path="/styleData" element={<PrivateRoute page={<StylesTable />} />}/>
      <Route path="/styleqty" element={<PrivateRoute page={<StyleQuantitiesTable />} />}/>
      
					<Route errorElement={"Error occured"} />
    </Routes>
   
 
   </UserContext.Provider>
   </>
);
 }
export default App;
