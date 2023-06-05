import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Group, Col, Container, Grid, MantineProvider, Paper, createStyles, MantineTheme, Image, Text } from '@mantine/core';
import logo from './logo.jpg';

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

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { classes } = useStyles();

  return (
    <MantineProvider>
      <Paper shadow="lg" className={classes.navBar}>
        <Container>
          <Grid align="center">
            <Col span="content">
              <Group>
                <Link to='/' > 
                  <Image
                    height={55}
                    width={100}
                    src={logo}
                    alt="With custom placeholder"
                    withPlaceholder
                    placeholder={<Text>This image contained the meaning of life</Text>}
                    className={classes.logo}
                  />
                </Link>
                <Button className={classes.navButton} onClick={() => navigate('/allocCal')}>Allocation Calculator</Button>
                <Button className={classes.navButton} onClick={() => navigate('/floorUser')}>Floor User</Button>
                <Button className={classes.navButton} onClick={()=> navigate('/storedata')}>GO TO STORE</Button>
                <Button className={classes.navButton} onClick={()=> navigate('/allocData')}>Alloc Data</Button>
                <Button className={classes.navButton} onClick={()=> navigate('/styleData')}>Style List</Button>
                <Button className={classes.navButton} onClick={()=> navigate('/styleqty')}>Style Quantities</Button>
              </Group>
            </Col>
          </Grid>
        </Container>
      </Paper>
    
    </MantineProvider>
  );
};

export default HomePage;
