
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Group,  MantineProvider, Space, Text } from '@mantine/core';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <MantineProvider>
      <Container>
       <Text>
      SVP Sports - Distribution Center
      </Text>
     
      <Space h="xl" />
       <Group>
    
        <Button onClick={() => navigate('/allocCal')}>Allocation Calculator</Button>
      <Button onClick={() => navigate('/floorUser')}>Floor User</Button>
      </Group>
      </Container>
      </MantineProvider>
    </div>
  );
};

export default HomePage;
