import React, { useState, useEffect, useContext } from 'react';
import { Table,  Text, Container, Grid,  Col, Input, Center, Checkbox, TextInput, Button } from '@mantine/core';
import Homepage from '../Navigation/parentHome';
import { useLocation } from 'react-router-dom';
import { RefreshContext } from '../privateRoute/RefreshContext';


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
  initial : string;
  sizeQuantities: SizeQuantity[];
  styles: StyleData;
}

const AllocationComponent1: React.FC = () => {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  
  const [, setError] = useState<string>('');
  const [, setIsNotificationVisible] = useState<boolean>(false);
  const [, setNavbarOpened] = useState(false);
  const [isChecked, setIsChecked] = useState<boolean[]>([]);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const { refresh } = useContext(RefreshContext);


  const { pathname } = useLocation(); // Import useLocation from 'react-router-dom'
const encodedStoreName = pathname.split('/')[2]; // Extract store from URL
const store = decodeURIComponent(encodedStoreName); // Decode the URL-encoded store name
 
   
  useEffect(() => {
    const fetchData = async () => {
      if (store) { // Check if storeName is selected
        try {
          const response = await fetch(`http://localhost:5000/api/allocation/get/${store}`, {
            credentials: 'include', // Include credentials
          });
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
            setError(`No data found for store ${store}`);
            setIsNotificationVisible(true);
          }
        } catch (err) {
          console.error(err);
          setError(`Error fetching data for store ${store}`);
          setIsNotificationVisible(true);
        }
      }
    };
  
    fetchData();
  }, [store, refresh]);
  

  const updateInitialsAndStatus = async (statusValue: boolean) => {
    // Loop through the allocations and send updates to the server
    for (const allocation of allocations) {
      try {
        const response = await fetch(`http://localhost:5000/api/allocation/update/${allocation.allocation_id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          // Include the initial and status values in the request body
          body: JSON.stringify({ initial: allocation.initial, storeName: store, status: statusValue })
        });
  
        if (!response.ok) {
          // Log the status code and response text for more information
          const errorText = await response.text();
          console.error('Failed to update initial and status for allocation ID:', allocation.allocation_id, 'Status:', response.status, 'Response:', errorText);
        }
      } catch (err) {
        console.error('Error updating initial and status for allocation ID:', allocation.allocation_id, err);
      }
    }
    // Optionally, refresh the data or notify the user that the update was successful
    alert('Initials and status updated successfully');
  };
  

  // Function to handle initials changes
  const handleInitialChange = (e: React.ChangeEvent<HTMLInputElement>, allocationId: number) => {
    // Get the new initial value from the event
    const newInitialValue = e.target.value;
  
    // Update the state by finding the correct allocation by ID and updating its initial value
    setAllocations((prevAllocations) => {
      return prevAllocations.map((allocation) => {
        if (allocation.allocation_id === allocationId) {
          return {
            ...allocation,
            initial: newInitialValue, // Correctly update the initial value
          };
        }
        return allocation;
      });
    });
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
     
      <Container style={{marginTop: "110px"}}>
     

          {allocations.map((allocation) =>(
            
            
           <>
              <Grid gutter="lg"   justify="center" >
              <Col span={6}> 
              <Text 
              ta="center"
              fz="xl"
              fw={700}>
              STYLE NO
            </Text>
            <TextInput
         value={allocation.style_no}
         mih={60}
         readOnly
       />
       </Col>
       </Grid>
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
          </>
            ))
}
</Container>
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
              <th>Initial</th>
            </tr>
          </thead>
        <tbody>
          <tr>
        <td>{store}</td>
          {allocations.map((allocation) =>
            allocation.sizeQuantities.map((sizeQuantity, index) => (
              
               
                
               <td key={sizeQuantity.size}><Input value={sizeQuantity.quantity} readOnly style={{width:"100%"}}/></td>
            
            ))
          )}
           <td><Input value={totalQuantity} readOnly style={{width:"100%"}}/></td>  {/* Show total quantity here */}
           {allocations.map((allocation) => (
  <td key={allocation.allocation_id}>
    <Input
      value={allocation.initial || ''} // Handle undefined or null values by falling back to an empty string
      onChange={(e) => handleInitialChange(e, allocation.allocation_id)}
      style={{ width: "100%" }}
    />
  </td>
))}
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
      <Center style={{marginTop: "50px"}}  >
      <Button onClick={() => updateInitialsAndStatus(true)}>DONE</Button>
      </Center>
    </div>
  );
};

export default AllocationComponent1;
