import React, { createContext, useEffect, useState } from 'react';

import './App.css';

import AllocationTables from './components/Calculator/allocationCalculator';

import {  Route, Routes } from 'react-router-dom';
import HomePage from './components/Navigation/parentHome';

import AllocTable from './Views/rcvAllocationDataView';
import StylesTable from './Views/styleDataView';
import StyleQuantitiesTable from './Views/styleRCVQtyView';

import LoginProfilePage from './Authentication/LoginProfilePage';
import RegisterPage from './Authentication/RegisterPage';

import PrivateRoute from './components/privateRoute/privateRoute';
import AllocationComponent from './components/floorFetch/userLead';
import AllocationComponent1 from './components/floorFetch/showOnWeb';

import UserEditor from './Views/userList';
import { RefreshContext } from './components/privateRoute/RefreshContext';


export const UserContext = createContext<any>({});

function App() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [navbarOpened, setNavbarOpened] = useState(false);
	const [refresh, setRefresh] = useState(false);
	const [authenticatedUser, setAuthenticatedUser] = useState<IUserSessionInfo>({
		_id: null,
		email: "",
		first_name: "",
		last_name: "",
		scope: "", 
		location: "",
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
  <RefreshContext.Provider value={{ refresh, setRefresh }}> 

    <Routes>
	<Route path="/user">
						<Route path="login" element={<LoginProfilePage />} />
						<Route path="register" element={<RegisterPage />} />
					</Route>
      <Route path="/" element={<HomePage setNavbarOpened={setNavbarOpened}/>} />
	  
	  <Route path="/allocCal" element={<PrivateRoute page={<AllocationTables />} />} />
	  
      <Route path="/floorUser" element={<PrivateRoute page={<AllocationComponent />} />} />
      <Route path="/storeData/:storeName" element={<PrivateRoute page={<AllocationComponent1 />} />} />
	  
      <Route path="/allocData" element={<PrivateRoute page={<AllocTable />} />}/>
      <Route path="/styleData" element={<PrivateRoute page={<StylesTable />} />}/>
      <Route path="/styleqty" element={<PrivateRoute page={<StyleQuantitiesTable />} />}/>
	  <Route path="/users" element={<PrivateRoute page={<UserEditor />} />}/>
      
					<Route errorElement={"Error occured"} />
    </Routes>
    
	</RefreshContext.Provider>
   </UserContext.Provider>
   </>
);
 }
export default App;
