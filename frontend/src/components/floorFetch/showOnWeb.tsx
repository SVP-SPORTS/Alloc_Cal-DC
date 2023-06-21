import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Select, Checkbox, Table,  Notification, Col, Container, Grid, TextInput, Input, Text, MantineProvider, Center } from '@mantine/core';
import Homepage from '../Navigation/parentHome';

const StoreDataPage: React.FC = () => {
  const storeNames = [
    'STEELES', 'WEB', 'OPM', 'VAUGHAN', 'NIAGARA', 'ALLISTON',
    'SCARBOROUGH', 'CARTWRIGHT', 'BRAMPTON', 'PICKERING', 'YORKGATE', 'OPM-HAMILTON',
  ];

  const [selectedStore, setSelectedStore] = useState<string>('');
  const [storeData, setStoreData] = useState<any>(null);
  const [isChecked, setIsChecked] = useState<boolean[]>([]);
  const [error, setError] = useState<string>('');
  const [isNotificationVisible, setIsNotificationVisible] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [navbarOpened, setNavbarOpened] = useState(false);

  const handleSelectStore = async (value: string) => {
    if (isChecked.every(checked => checked)) {
      setSelectedStore(value);
      setError('');
    } else {
      setError('You are missing the last step. Please check all checkboxes before proceeding.');
      setIsNotificationVisible(true);
    }
  };

  useEffect(() => {
    // Fetch store data when selectedStore changes
    if (selectedStore) {
      axios.get(`http://localhost:5000/api/store/store-data/${selectedStore}`).then(response => {
        if (response.data) {
          setStoreData(response.data);
          setIsChecked(new Array(response.data.sizeQuantities.length).fill(false));
          setError('');
        } else {
          setStoreData(null);
          setError(`Nothing is allocated to ${selectedStore}`);
          setIsNotificationVisible(true);
        }
      });
    }
  }, [selectedStore]);

  const handleCheckboxChange = (index: number, checked: boolean) => {
    setIsChecked(prevState => {
      const newState = [...prevState];
      newState[index] = checked;
      return newState;
    });
  }

  return (
    <div>
      <Homepage setNavbarOpened={setNavbarOpened}/>
      <Container style={{marginTop: "70px"}}>
        <Grid gutter="lg" justify="center" style={{marginTop: "100px"}}>
          <Col span={4}>
            <Text 
                  ta="center"
                  fz="xl"
                  fw={700}>
                  SELECT STORE
            </Text>
      <Select
        placeholder='Select store'
        data={storeNames.map(store => ({ value: store, label: store }))}
        onChange={handleSelectStore}
      />

{isNotificationVisible && (
        <Notification title={error} color="red" onClose={() => setIsNotificationVisible(false)} />
      )}
     </Col>
      </Grid>
</Container>
      {storeData && (
              <MantineProvider
              theme={{
                components: {
                  Container: {
                    defaultProps: {
                      sizes: {
                        xs: 540,
                        sm: 720,
                        md: 960,
                        lg: 1140,
                        xl: 1320,
                      },
                    },
                  },
                },
              }}
            >
             <Container style={{marginTop: "30px"}} size="xl">
         <Table style={{marginBottom: "50px"}}>
         <Grid gutter="lg"   justify="center" >
          <Col span={4}>
          <Text 
                  ta="center"
                  fz="xl"
                  fw={700}>
                  Supplier Name
            </Text>
       <TextInput
         value={storeData.supplierName}
         mih={60}
       />
       <Text 
                  ta="center"
                  fz="xl"
                  fw={700}>
                  Style No
            </Text>
       <TextInput
         value={storeData.style_number}  
         mih={60}      
       />  
       </Col>
       </Grid> 
       </Table>
 
        <Table>
          <thead>
            <tr>
              <th>Store Name</th>
              {storeData.sizeQuantities.map((sizeObj: any) => (
                <th key={sizeObj.size}>{sizeObj.size}</th>
              ))}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{storeData.storeName}</td>
              {storeData.sizeQuantities.map((sizeObj: any, i: number) => (
                <td key={sizeObj.size}><Input value={sizeObj.quantity} readOnly style={{width:"100%"}}/></td>
              ))}
              <td> <Input value={storeData.total} style={{width:"100%"}} readOnly/></td>
            </tr>
            <tr>
              <td></td>
              {storeData.sizeQuantities.map((sizeObj: any, i: number) => (
                <td key={sizeObj.size}>
                  <Center>
                  <Checkbox checked={isChecked[i]} onChange={(e) => handleCheckboxChange(i, e.currentTarget.checked)} />
                  </Center>
                </td>
              ))}
              <td>
                <Center>
                <Checkbox checked={isChecked.every(checked => checked)} onChange={(e) => setIsChecked(new Array(isChecked.length).fill(e.currentTarget.checked))} />
                </Center>
              </td>
            </tr>
          </tbody>
        </Table>
        </Container>
        </MantineProvider>
       
      )}
    </div>
  );
}

export default StoreDataPage;
