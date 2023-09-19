import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Group,
  Col,
  Container,
  Grid,
  MantineProvider,
  Paper,
  createStyles,
  MantineTheme,
  Image,
  Text,
  NavLink,
  Navbar,  
  Flex,
  Burger,
  Drawer,
  Center,
  Menu,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconLogin, IconUser } from "@tabler/icons-react";
import logo from "./logo.jpg";
import { UserContext } from "../../App";


const useStyles = createStyles((theme: MantineTheme) => ({
  navBar: {
    position: "fixed",
    top: 0,
    width: "100%",
    zIndex: 1000,
    padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[7]
        : theme.colors.gray[0],
  },
  navButton: {
    marginRight: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
    color: "#ffffff",
    backgroundColor: "#003580",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },
  logo: {
    marginRight: theme.spacing.md,
  },
  loginInfo: {
    display: 'flex',
    alignItems: 'center',
    
  }
}));


type Scope = 'User' | 'Admin' | 'SuperAdmin'


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
  }: { authenticatedUser: IUserSessionInfo; setAuthenticatedUser: any } =
    useContext(UserContext);

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

  const storeNames = [ 'STEELES', 'WEB', 'OPM', 'VAUGHAN', 'NIAGARA', 'ALLISTON',
      'SCARBOROUGH', 'CARTWRIGHT', 'BRAMPTON', 'PICKERING', 'YORKGATE', 'OPM-HAMILTON', 'SC SuperStore'];
  const isTabletOrMobile = useMediaQuery("(max-width: 1100px)");

  const storeNamesMenu = (
    <Paper px="md" shadow="xs">
      <Menu>
        {storeNames.map((store) => (
          <Link key={store} to={`/storeData/${store}`}>
            <Menu.Item>{store.toUpperCase()}</Menu.Item>
          </Link>
        ))}
      </Menu>
    </Paper>
  );

  //
  function getNavItemsForScope(scope: Scope | null): string[] {
    if (!scope) return [];
  
    switch (scope) {
      case 'User':
        return ['/storeData'];
      case 'Admin':
        return ['/allocCal', '/floorUser', '/allocData', '/styleData', '/styleqty'];
      case 'SuperAdmin':
        return [
          '/allocCal',
          '/floorUser',
          '/storeData',
          '/allocData',
          '/styleData',
          '/styleqty',
          '/users',
        ];
      default:
        return [];
    }
  }
  
  const NavButtons = (
    <>
    
      <Navbar.Section grow>
      <Flex justify="space-between" align="center" direction="row" style={{ width: '100%' }}>
          <Link to="/" onClick={() => navigate("/")}>
            <Image
              height={55}
              width={100}
              src={logo}
              alt="SVP SPORTS"
              withPlaceholder
              placeholder={
                <Text>This image contained the meaning of life</Text>
              }
              className={classes.logo}
            />
          </Link>

          {getNavItemsForScope(authenticatedUser.scope as Scope | null).includes('/allocCal') && (
      <Button
        className={classes.navButton}
        onClick={() => navigate("/allocCal")}
      >
        Allocation Calculator
      </Button>
    )}
       {getNavItemsForScope(authenticatedUser.scope as Scope | null).includes('/floorUser') && (
          <Button
            className={classes.navButton}
            onClick={() => navigate("/floorUser")}
          >
            Floor User
          </Button>
       )}
       {getNavItemsForScope(authenticatedUser.scope as Scope | null).includes('/storeData') && (
      <Menu>
      <Menu.Target>
      <Button className={classes.navButton}>GO TO STORE</Button>
      </Menu.Target>
        <Menu.Dropdown>
         
          
              <Menu.Item>
              {storeNamesMenu}
              </Menu.Item>
           
        
        </Menu.Dropdown>
      </Menu>
       )}
         {getNavItemsForScope(authenticatedUser.scope as Scope | null).includes('/allocData') && (
          <Button
            className={classes.navButton}
            onClick={() => navigate("/allocData")}
          >
            Transfer List
          </Button>
         )}
          {getNavItemsForScope(authenticatedUser.scope as Scope | null).includes('/styleData') && (
          <Button
            className={classes.navButton}
            onClick={() => navigate("/styleData")}
          >
            Style List
          </Button>
          )}
           {getNavItemsForScope(authenticatedUser.scope as Scope | null).includes('/styleqty') && (
          <Button
            className={classes.navButton}
            onClick={() => navigate("/styleqty")}
          >
            PO Worksheet
          </Button>
           )}
           {getNavItemsForScope(authenticatedUser.scope as Scope | null).includes('/users') && (
          <Button
            className={classes.navButton}
            onClick={() => navigate("/users")}
          >
            USER
          </Button>
           )}
           <div className={classes.loginInfo}>
          {authenticatedUser._id !== null &&
            authenticatedUser._id !== undefined ? (
              <>
                <NavLink
                  pt={"md"}
                  pb={"md"}
                  icon={<IconUser />}
                  label={
                    <React.Fragment>
                      <Text fz="lg" fw={450}>{authenticatedUser.email}</Text>
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
                label={<Text>LogIn</Text>}
                onClick={() => {
                  setNavbarOpened(false);
                  loginUserFromSession();
                  navigate("/user/login");
                  
                }}
              />
            )}
        </div>
        </Flex>
      </Navbar.Section>
    </>
  );

  const [opened, setOpened] = useState(false);

  const BurgerMenu = (
    <>
      <Flex gap={350} align={Center} justify={Center}>
        <Burger opened={opened} onClick={() => setOpened(!opened)} size="xl" />

        <Link to="/" onClick={() => navigate("/")}>
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
      </Flex>
    </>
  );

  const NavDrawer = (
    <Drawer
      opened={opened}
      onClose={() => setOpened(false)}
      padding="xs"
      size="20%"
      position="left"
      transitionProps={{
        transition: "rotate-left",
        duration: 150,
        timingFunction: "linear",
      }}
    >
      <Flex direction="column" style={{ marginTop: "35px" }}>
      {getNavItemsForScope(authenticatedUser.scope as Scope | null).includes('/allocCal') && (
        <NavLink
          label={<Text>Allocation Calculator</Text>}
          onClick={() => navigate("/allocCal")}
        />
      )}
      {getNavItemsForScope(authenticatedUser.scope as Scope | null).includes('/floorUser') && (
        <NavLink
          label={<Text>Floor User</Text>}
          onClick={() => navigate("/floorUser")}
        />
      )}
      {getNavItemsForScope(authenticatedUser.scope as Scope | null).includes('/storeData') && (
         <Menu>
      <Menu.Target>
      <NavLink
          label={<Text>Go To Store</Text>}          
        />
      </Menu.Target>
        <Menu.Dropdown>
         
          
              <Menu.Item>
              {storeNamesMenu}
              </Menu.Item>
           
        
        </Menu.Dropdown>
      </Menu>
      )}
      {getNavItemsForScope(authenticatedUser.scope as Scope | null).includes('/allocData') && (
        <NavLink
          label={<Text>Transfer List</Text>}
          onClick={() => navigate("/allocData")}
        />
      )}
      {getNavItemsForScope(authenticatedUser.scope as Scope | null).includes('/styleData') && (
        <NavLink
          label={<Text>Style List</Text>}
          onClick={() => navigate("/styleData")}
        />
      )}
      {getNavItemsForScope(authenticatedUser.scope as Scope | null).includes('/styleqty') && (
        <NavLink
          label={<Text>PO Data</Text>}
          onClick={() => navigate("/styleqty")}
        />
      )}
      {getNavItemsForScope(authenticatedUser.scope as Scope | null).includes('/users') && (
        <NavLink
          label={<Text>Users</Text>}
          onClick={() => navigate("/users")}
        />
      )}
        {authenticatedUser._id !== null &&
        authenticatedUser._id !== undefined ? (
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
            label={<Text>LogIn</Text>}
            onClick={() => {
              setNavbarOpened(false);
              loginUserFromSession();
              navigate("/user/login");
            }}
          />
        )}
      </Flex>
    </Drawer>
  );

  return (
    <MantineProvider>
      <Paper shadow="xl" className={classes.navBar}>
        <Container size="100rem" px={0}>
          <Navbar.Section grow>
            <Grid align="center" grow gutter={"xs"}>
              <Col span="content">
                <Group>
                  {/* Switch between buttons and menu based on screen size */}
                  {isTabletOrMobile ? BurgerMenu : NavButtons}

                  {isTabletOrMobile && NavDrawer}
                </Group>
              </Col>
            </Grid>
          </Navbar.Section>
        </Container>
      </Paper>
    </MantineProvider>
  );
}
