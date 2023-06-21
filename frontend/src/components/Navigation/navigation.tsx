import { NavLink, Text, Navbar } from "@mantine/core";
import { IconBuildingWarehouse, IconLogin, IconUser } from "@tabler/icons-react";
import {
	
	
	IconTools,
	
	IconPackageImport,
	
	IconReportAnalytics,
} from "@tabler/icons-react";
import React, { useContext } from "react";
import { UserContext } from "../../App";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navigation({
	setNavbarOpened,
}: {
	setNavbarOpened: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const navigate = useNavigate();
	const location = useLocation();
	const {
		authenticatedUser,
		setAuthenticatedUser,
	}: { authenticatedUser: IUserSessionInfo; setAuthenticatedUser: any } = useContext(UserContext);

	const loginUserFromSession = async () => {
		try {
			let fetchRes = await fetch("http://localhost:5000/api/auth/user", {
				method: "POST",
				credentials: "include",
			});
			let response = await fetchRes.json();
			if (response.user._id === undefined) {
				navigate("/user/login");
			} else {
				setAuthenticatedUser(response.user);
			}
		} catch (e) {
			console.log(e);
		}
	};

	const handleLogout = async () => {
		try {
			let fetchRes = await fetch("http://localhost:5000/api/auth/logout", {
				credentials: "include",
			});
			await fetchRes.json();
			setAuthenticatedUser({
				_id: null,
				email: "",
				first_name: "",
				last_name: "",
				scope: "",
			});
		} catch (e) {
			console.log(e);
		}
	};
	return (
        <>
        
                <Navbar.Section grow>
                    <NavLink
                        label={<Text>Allocation Calculator</Text>}
                        icon={<IconBuildingWarehouse />}
                        onClick={() => {
                            setNavbarOpened(false);
                            navigate("/allocCal");
                        }}
                    ></NavLink>
                    <NavLink
                        label={<Text>Floor Leader</Text>}
                        icon={<IconTools />}
                        onClick={() => {
                            setNavbarOpened(false);
                            navigate("/floorUser");
                        }}
                    ></NavLink>
                    <NavLink
                        label={<Text>Select Store</Text>}
                        icon={<IconPackageImport />}
                        onClick={() => {
                            setNavbarOpened(false);
                            navigate("/storedata");
                        }}
                    ></NavLink>
                    <NavLink
                        label={<Text>Reports</Text>}
                        icon={<IconReportAnalytics />}
                        onClick={() => {
                            setNavbarOpened(false);
                            navigate("/");
                        }}
                    >
                       	<NavLink
						label={<Text>Allocation Data</Text>}
						icon={<IconReportAnalytics />}
						active={location.pathname === "/allocData"}
						onClick={() => {
							setNavbarOpened(false);
							navigate("/allocData");
						}}
					/>
					<NavLink
						label={<Text>Style List</Text>}
						icon={<IconReportAnalytics />}
						active={location.pathname === "/styleData"}
						onClick={() => {
							setNavbarOpened(false);
							navigate("/styleData");
						}}
					/>
					<NavLink
						label={<Text>Style RCV QTY</Text>}
						icon={<IconReportAnalytics />}
						active={location.pathname === "/styleqty"}
						onClick={() => {
							setNavbarOpened(false);
							navigate("/styleqty");
						}}
					/>
                    </NavLink>
                </Navbar.Section>
            
                <Navbar.Section>
                    {authenticatedUser._id !== null && authenticatedUser._id !== undefined ? (
                        <>
                            <NavLink
                                pt={"md"}
                                pb={"md"}
                                icon={<IconUser />}
                                label={
                                    <React.Fragment>
                                        <Text>
                                            {authenticatedUser.first_name} {authenticatedUser.last_name}
                                        </Text>
                                        <Text color="dimmed">{authenticatedUser.email}</Text>
                                    </React.Fragment>
                                }
                                defaultOpened={true}
                            >
                                <NavLink
                                    label={<Text>Profile</Text>}
                                    active={location.pathname === "/user/login"}
                                    onClick={() => {
                                        setNavbarOpened(false);
                                        navigate("/user/login");
                                    }}
                                />
                                <NavLink label={<Text>Logout</Text>} onClick={handleLogout} />
                            </NavLink>
                        </>
                    ) : (
                        <NavLink
                            pt={"md"}
                            pb={"md"}
                            icon={<IconLogin />}
                            label={<Text>Click here to login</Text>}
                            onClick={() => {
                                setNavbarOpened(false);
                                loginUserFromSession();
                            }}
                        />
                    )}
                </Navbar.Section>
            
    </>
	);
}