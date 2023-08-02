import React, { useState, useEffect } from 'react';
import { Table, Select, Text, Container, Grid, Notification, Col, Input, Center, Checkbox, TextInput } from '@mantine/core';
import Homepage from '../Navigation/parentHome';

interface SizeQuantity {
  size: string;
  quantity: number;
}
interface StyleData {
  
  supplier_name: string;
  style_no: string;
  description: string;
  color: string;
  cost: number;
  msrp: number;
  total_qty: number;
  location: string;
  first_name: string;
}

interface Allocation {
  allocation_id: number;
  storeName: string;
  poNo: string;
  style_no: string;
  supplierName: string;
  sizeQuantities: SizeQuantity[];
  styles: StyleData;
}

const AllocationComponent1: React.FC = () => {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [storeName, setStoreName] = useState<string>('');
  const [storeNames, setStoreNames] = useState<string[]>([]);
  const [styleNo, setStyleNo] = useState<string>('');  
  const [styleNos, setStyleNos] = useState<string[]>([]);  
  const [error, setError] = useState<string>('');
  const [isNotificationVisible, setIsNotificationVisible] = useState<boolean>(false);
  const [navbarOpened, setNavbarOpened] = useState(false);
  const [isChecked, setIsChecked] = useState<boolean[]>([]);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);

  useEffect(() => {
    const fetchStoreNames = async () => {
      const storeNames = [ 'STEELES', 'WEB', 'OPM', 'VAUGHAN', 'NIAGARA', 'ALLISTON',
      'SCARBOROUGH', 'CARTWRIGHT', 'BRAMPTON', 'PICKERING', 'YORKGATE', 'OPM-HAMILTON', 'SC SuperStore'];
      setStoreNames(storeNames);
    };
  
    const fetchStyleNos = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/allocation/get/${storeName}`);
        const data = await response.json();
        console.log(data);  // Log the data to see what you're getting from the API
        setStyleNos(data);
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchStoreNames();
    fetchStyleNos();
  }, [storeName]);

  useEffect(() => {
    const fetchData = async () => {
      if (storeName && styleNo) { 
        try {
          const response = await fetch(`http://localhost:5000/api/allocation/get/${storeName}/${styleNo}`);
          const data: Allocation[] = await response.json();
    
          if (data.length > 0) { 
            let total = 0;
            for (let allocation of data) {
              for (let sizeQuantity of allocation.sizeQuantities) {
                total += sizeQuantity.quantity;
              }
            }
            setTotalQuantity(total);  
            // Handle Style data
            for (let allocation of data) {
              let style = allocation.styles; // Get the Style data
              // Do something with style data here
              console.log(style);
            }
            setAllocations(data);
            setIsChecked(new Array(data[0].sizeQuantities.length).fill(false)); 
            setError(''); 
          } else {
            setAllocations([]);
            setTotalQuantity(0); 
            setError(`No data found for store ${storeName} and style no ${styleNo}`);
            setIsNotificationVisible(true);
          }
        } catch (err) {
          console.error(err);
          setError(`Error fetching data for store ${storeName} and style no ${styleNo}`);
          setIsNotificationVisible(true);
        }
      }
    };
    
  
    fetchData();
  }, [storeName, styleNo]);
  

  const handleChange = async (value: string) => {
    if (isChecked.every(checked => checked)) {
      setStoreName(value);
      setError('');
    } else {
      setError('You are missing the last step. Please check all checkboxes before proceeding.');
      setIsNotificationVisible(true);
    }
  };

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
              data={storeNames} 
              placeholder="Select a store" 
              onChange={(value) => value && handleChange(value)} 
              value={storeName}
            />
            <Text 
              ta="center"
              fz="xl"
              fw={700}>
              SELECT STYLE NO
            </Text>
            <Select 
              data={styleNos} 
              placeholder="Select a style" 
              searchable
              onChange={(value) => value && setStyleNo(value)} 
              value={styleNo}
            />
            {isNotificationVisible && (
              <Notification title={error} color="red" onClose={() => setIsNotificationVisible(false)} />
            )}
          </Col>
        </Grid>
      </Container>

          {allocations.map((allocation) =>(
            
            
               
              <Grid gutter="lg"   justify="center" >
              <Col span={3}> 
              <Text 
                  ta="center"
                  fz="xl"
                  fw={700}>
                  Supplier Name
            </Text>
       <TextInput
         value={allocation.supplierName}
         mih={60}
         readOnly
       />
       <Text 
                  ta="center"
                  fz="xl"
                  fw={700}>
                  Description
            </Text>
       <TextInput
         value={ allocation.styles.description}  
         mih={60}  
         readOnly    
       />  
        <Text 
                  ta="center"
                  fz="xl"
                  fw={700}>
                  Color
            </Text>
       <TextInput
         value={ allocation.styles.color}  
         mih={60} 
         readOnly     
       />  
       </Col>
       <Col span={3}>
        <Text 
                  ta="center"
                  fz="xl"
                  fw={700}>
                  Cost
            </Text>
       <TextInput
         value={ allocation.styles.cost}  
         mih={60} 
         readOnly     
       /> 
        <Text 
                  ta="center"
                  fz="xl"
                  fw={700}>
                  MSRP
            </Text>
       <TextInput
         value={ allocation.styles.msrp}  
         mih={60}
         readOnly      
       />   
       <Text 
                  ta="center"
                  fz="xl"
                  fw={700}>
                 PO NO
            </Text>
       <TextInput
         value={allocation.poNo}  
         mih={60}  
         readOnly    
       />  
          </Col>
          </Grid>

            ))
}
         
      <Table>
      <thead>
            <tr>
              <th>Store Name</th>
              {allocations.map((allocation) =>
            allocation.sizeQuantities.map((sizeQuantity, index) => (
             
               
                <th>{sizeQuantity.size}</th>
                
             
            ))
          )}
              <th>Total</th>
            </tr>
          </thead>
        <tbody>
          <tr>
        <td>{storeName}</td>
          {allocations.map((allocation) =>
            allocation.sizeQuantities.map((sizeQuantity, index) => (
              
               
                
               <td key={sizeQuantity.size}><Input value={sizeQuantity.quantity} readOnly style={{width:"100%"}}/></td>
            
            ))
          )}
           <td><Input value={totalQuantity} readOnly style={{width:"100%"}}/></td>  {/* Show total quantity here */}
          </tr>
          <tr>
              <td></td>
              {allocations.map((allocation) =>
            allocation.sizeQuantities.map((sizeQuantity, index) => (
              <td key={sizeQuantity.size}>
                  <Center>
                  <Checkbox checked={isChecked[index]} onChange={(e) => handleCheckboxChange(index, e.currentTarget.checked)} />
                  </Center>
                </td>
            ))
          )}
              <td>
                <Center>
                <Checkbox checked={isChecked.every(checked => checked)} onChange={(e) => setIsChecked(new Array(isChecked.length).fill(e.currentTarget.checked))} />
                </Center>
              </td>
            </tr>
       </tbody>
      </Table>
    </div>
  );
};

export default AllocationComponent1;
