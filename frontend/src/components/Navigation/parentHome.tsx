import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Group, Col, Container, Grid, MantineProvider, Paper, createStyles, MantineTheme, Image, Text, NavLink, Navbar,  } from '@mantine/core';
import logo from './logo.jpg';
import { UserContext } from '../../App';
import { IconLogin, IconUser } from '@tabler/icons-react';

const useStyles = createStyles((theme: MantineTheme) => ({
  navBar: {
    position: 'fixed', 
    top: 0, 
    width: '100%', 
    zIndex: 1000, 
    padding: theme.spacing.xs,
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
  },
  navButton: {
    marginRight: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
    color: '#ffffff',
    backgroundColor: '#003580',
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
  },
  header: {
    color: '#ffffff',
    backgroundColor: '#003580',
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',  
  },
  logo: {
    marginRight: theme.spacing.md,
  }
}));

export default function Homepage({
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
  //const navigate = useNavigate();
  const { classes } = useStyles();
 
  return (
    <MantineProvider>
      <Paper shadow="xl" className={classes.navBar}>
        <Container size="100rem" px={0}>
          <Navbar.Section grow>
          <Grid align="center" grow gutter={'xs'}>
            <Col span="content">
              <Group>
                <Link to='/' > 
                  <Image
                    height={55}
                    width={100}
                    src={logo}
                    alt="SVP SPORTS"
                    withPlaceholder
                    placeholder={<Text>This image contained the meaning of life</Text>}
                    className={classes.logo}
                  />
                </Link>
                <Button className={classes.navButton} onClick={() => navigate('/allocCal')}>Allocation Calculator</Button>
                <Button className={classes.navButton} onClick={() => navigate('/floorUser')}>Floor User</Button>
                <Button className={classes.navButton} onClick={()=> navigate('/storedata')}>GO TO STORE</Button>
                <Button className={classes.navButton} onClick={()=> navigate('/allocData')}>Transfer List</Button>
                <Button className={classes.navButton} onClick={()=> navigate('/styleData')}>Style List</Button>
                <Button className={classes.navButton} onClick={()=> navigate('/styleqty')}>PO Worksheet</Button>
            
            

            <Container size="90rem" px={0}>
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
                                defaultOpened={false}
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
                </Container>
                </Group>
                </Col>
          </Grid>
          </Navbar.Section>
        </Container>
       
      </Paper>
    
    </MantineProvider>
  );
};


