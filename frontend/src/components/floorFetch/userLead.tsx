import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Col, Container, Grid, Input, Table, TextInput, Text, Center, MantineProvider, Group } from '@mantine/core';
import Homepage from '../Navigation/parentHome';


const AllocationComponent: React.FC = () => {
    const [allocationData, setAllocationData] = useState<any>(null);
    const [styleData, setStyleData] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [navbarOpened, setNavbarOpened] = useState(false);
    const [poNo, setPoNo] = useState<string>('');
    const [styleNo, setStyleNo] = useState<string>('');
    const [storeTotals, setStoreTotals] = useState<number[]>([]);
  const [totalAllocation, setTotalAllocation] = useState<number>(0);
  const [overstockTotal, setOverstockTotal] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  




  
    useEffect(() => {
      // Fetch allocation data when the component mounts
      fetchAllocationData();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  
    // Add any additional helper functions or hooks you need
    // For example, a function to fetch the allocation data based on po_no and style_no:
    const fetchAllocationData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await axios.get(`http://localhost:5000/api/allocation/style_no/${styleNo}/poNo/${poNo}`);
          setAllocationData(response.data);
          setIsLoading(false);
        } catch (error) {
          console.error(error);
          setError('The provided styleNo or poNo does not exist or match any records.');
          setIsLoading(false);
        }
        try {
          const response = await axios.get(`http://localhost:5000/api/style/style_no/${styleNo}`);
          setStyleData(response.data);
        } catch (error) {
          console.error(error);
          setError('The provided styleNo does not exist or match any records.');
        }
      };
  

    useEffect(() => {

        // Update total of received quantities
   if(allocationData?.receivedQty){
    const total = allocationData.receivedQty.reduce((sum: number, obj: { quantity: number }) => sum + obj.quantity, 0);
    setAllocationData((prevState: typeof allocationData) => ({...prevState, total}));
}

if(allocationData?.sizeQuantities){
    const total = allocationData.sizeQuantities.flat().reduce((sum: number, obj: { quantity: number }) => sum + obj.quantity, 0);
    setTotalAllocation(total);
}
        // Calculate row totals and total allocation when allocationData changes
        calculateRowTotals();
        calculateTotalAllocation();
        calculateOverstockTotal();
        calculateOverstockPerSize();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [allocationData]);
  
  // Update the calculateRowTotals function
const calculateRowTotals = () => {
    if (!allocationData) return;
  
    const totals: number[] = [];
  
    allocationData.storeName.forEach((store: string, rowIndex: number) => {
      let rowTotal = 0;
  
      allocationData.sizeQuantities[rowIndex].forEach((sizeObj: any) => {
        rowTotal += sizeObj.quantity;
      });
  
      totals.push(rowTotal);
    });
  
    setStoreTotals(totals);
  };
  
      
      // Function to calculate the total allocation
  const calculateTotalAllocation = () => {
    if (!allocationData) return;

    let total = 0;

    allocationData.totalAllocationPerSize.forEach((quantity: number) => {
      total += quantity;
    });

    setTotalAllocation(total);
  };

  // Function to calculate the overstock total
  const calculateOverstockTotal = () => {
    if (!allocationData) return;

    let total = 0;

    allocationData.overstockPerSize.forEach((quantity: number) => {
      total += quantity;
    });

    setOverstockTotal(total);
  };

  //
  // Function to update allocation data
const updateAllocationData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.put(`http://localhost:5000/api/allocation/update/${allocationData.allocation_id}`, {
        storeName: allocationData.storeName,
        sizeQuantities: allocationData.sizeQuantities,
        receivedQty: allocationData.receivedQty,
        total: allocationData.total,
        totalAllocationPerSize: allocationData.totalAllocationPerSize,
        overstockPerSize: allocationData.overstockPerSize,
        style_no: allocationData.style_no,
        supplierName: allocationData.supplierName,
        poNo: allocationData.poNo,
        initial: allocationData.initial
      });
      setAllocationData(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setError('An error occurred while updating the allocation data.');
      setIsLoading(false);
    }

  };
  
  // Function to update style data
  const updateStyleData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.put(`http://localhost:5000/api/style/update/${styleData.style_no}`, {
        description: styleData.description,
        color: styleData.color,
        cost: styleData.cost,
        msrp: styleData.msrp
      });
      setStyleData(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setError('An error occurred while updating the style data.');
      setIsLoading(false);
    }
  
  
  };
    

  const handleStyleDataChange = (key: string, value: any) => {
    const newData = { ...styleData, [key]: value };
    setStyleData(newData);
  };
  
// Function to handle received quantity changes
const handleReceivedQtyChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newQty = Number(event.target.value);
    setAllocationData((prevData: any) => {
      const newData = {...prevData};
      newData.receivedQty[index].quantity = newQty;
      return newData;
    });
  
    // Update total of received quantities
    if(allocationData?.receivedQty){
        const total = allocationData.receivedQty.reduce((sum: number, obj: {quantity: number}) => sum + obj.quantity, 0);
        setAllocationData((prevState: any) => ({...prevState, total}));
    }
  };

  

// Function to handle size quantity changes
const handleSizeQuantityChange = (event: React.ChangeEvent<HTMLInputElement>, storeIndex: number, sizeIndex: number) => {
    const newQty = Number(event.target.value);
    setAllocationData((prevData: any) => {
      const newData = {...prevData};
      newData.sizeQuantities[storeIndex][sizeIndex].quantity = newQty;

      // Update total allocation
      if(newData.sizeQuantities){
          const total = newData.sizeQuantities.flat().reduce((sum: number, obj: {quantity: number}) => sum + obj.quantity, 0);
          setTotalAllocation(total);
      }
      
      // Calculate total allocation per size (column-wise sum)
      if(newData.sizeQuantities){
          const totalAllocationPerSize: number[] = [];
          const columnLength = newData.sizeQuantities[0].length;
          for(let i=0; i < columnLength; i++){
              let sum = 0;
              for(let j=0; j< newData.sizeQuantities.length; j++){
                  sum += newData.sizeQuantities[j][i].quantity;
              }
              totalAllocationPerSize.push(sum);
          }
          newData.totalAllocationPerSize = totalAllocationPerSize;
      }

      return newData;
    });
};

//Calculate OverstockPerSize after Changes
const calculateOverstockPerSize = () => {
    if(allocationData?.receivedQty && allocationData?.totalAllocationPerSize){
        const overstockPerSize: number[] = [];
        const length = Math.min(allocationData.receivedQty.length, allocationData.totalAllocationPerSize.length);
        for(let i=0; i < length; i++){
            let overstock = allocationData.receivedQty[i].quantity - allocationData.totalAllocationPerSize[i];
            overstockPerSize.push(overstock);
        }
        setAllocationData((prevState: any) => ({...prevState, overstockPerSize: overstockPerSize}));
    }
};

// Function to handle initials changes
const handleInitialChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newInitial = event.target.value;
    setAllocationData((prevData: any) => {
      const newData = {...prevData};
      newData.initial[index] = newInitial;
      return newData;
    });
  };
  
  
  const checkIfStoreExists = async (storeName: string): Promise<boolean> => {
    try {
      const response = await axios.get(`http://localhost:5000/api/store/store-data/${storeName}`);
      return response.status === 200;
    } catch (error) {
      console.error(error);
      return false;
    }
  };
  
  const sendDataToBackend = async (data: object) => {
    try {
      const response = await axios.post('http://localhost:5000/api/store/store-data', data);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  };
  
  const updateDataInBackend = async (storeName: string, data: object) => {
    try {
      await axios.put(`http://localhost:5000/api/store/store-data/${storeName}`, data);
    } catch (error) {
      console.error(error);
    }
  };
   
  
  const handlePushToStore = async (storeIndex: number) => {
    const storeData = {
      storeName: allocationData.storeName[storeIndex],
      style_number: styleData.style_no,
      supplierName: styleData.supplier_name,
      poNo: allocationData.poNo,
      sizeQuantities: allocationData.sizeQuantities[storeIndex],
      total: storeTotals[storeIndex],
    };
    
    console.log(storeData);  // print out the storeData to check it's correctly formatted
  
    // Check if the store data already exists in the backend
    if (await checkIfStoreExists(storeData.storeName)) {
      // If it exists, update it
      const updateResponse = await updateDataInBackend(storeData.storeName, storeData);
      console.log(updateResponse);  // print out the response from the update request
    } else {
      // If it doesn't exist, create it
      const createResponse = await sendDataToBackend(storeData);
      console.log(createResponse);  // print out the response from the create request
    }
  }; 
  
    return (
        <div>
          <Homepage setNavbarOpened={setNavbarOpened}/>
                 <Container  style={{marginTop: "125px"}}>
        {!isLoading && !error && allocationData && styleData ? null : (
          <Grid gutter="lg" justify="center" style={{marginTop: "50px"}}>
            <Col span={4}>
              <Input type="text" value={poNo} onChange={(e) => setPoNo(e.target.value)} placeholder="Enter po_no" mih={50}/>
              <Input type="text" value={styleNo} onChange={(e) => setStyleNo(e.target.value)} placeholder="Enter style_no"  mih={50}/>
              <Center>
              <Button onClick={fetchAllocationData}>Get Allocation Data</Button>
              </Center>
              {error && <Text color="red">{error}</Text>}
              {isLoading && <Text>Loading...</Text>}
            </Col>
          </Grid>
        )}
      </Container>

           
            {styleData && (
     <Container style={{marginTop: "70px"}}>

    <Table>
   
       <Grid gutter="lg"   justify="center" >
         <Col span={4}>
      <TextInput
        label="Supplier Name"
        value={styleData.supplier_name}
                ta="center"                  
      />
      <TextInput
        label="Style Number"
        value={styleData.style_no}
        ta="center" 
      />   
 
        
      <TextInput
        label="Description"
        value={styleData.description}
        onChange={(e) => handleStyleDataChange('description', e.target.value)}
        ta="center" 
      />
      </Col>
        <Col span={4}>
      <TextInput
        label="Color"
        value={styleData.color}
        onChange={(e) => handleStyleDataChange('color', e.target.value)}
        ta="center" 
      />
      <TextInput
        label="Cost"
        value={styleData.cost}
        ta="center" 
       
      />
      <TextInput
        label="MSRP"
        value={styleData.msrp}
        ta="center" 
      />
      </Col>
      </Grid>
     
  </Table>
  <Center style={{margin:'20px'}}>
  <Button onClick={updateStyleData}>Confirm Style</Button>
  </Center>
  </Container>
    )}

  

            
                   
          {/* Render the allocation data */}
        
          {allocationData && (
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
                        xl: 1520,
                      },
                    },
                  },
                },
              }}
            >
             <Container style={{marginTop: "30px"}} size="xl">
                  <Grid>
            <Table>
              <thead>
                <tr>
                  <th>Store Name</th>
                  {/* Render size quantities as the first row */}
                  {allocationData.sizeQuantities[0].map((sizeObj: any) => (
                    <th key={sizeObj.size}>{sizeObj.size}</th>
                  ))}
                  <th>Total</th>
                  <th>Initial</th>
            <th>Push to Store</th>
                </tr>
              </thead>
              <tbody>
          {/* Render received quantities as the second row */}
          <tr>
          <td>RCV QTY</td>
          {allocationData.receivedQty.map((receivedObj: any, i: number) => (
            <td key={receivedObj.size}>
              <Input 
                type='number' 
                value={receivedObj.quantity} 
                onChange={(e) => handleReceivedQtyChange(e, i)} 
                style={{width:"100%"}}
              />
            </td>
          ))}
           <td><Input value={allocationData?.total} style={{width:"100%"}}/></td>
          </tr>
          {/* ... */}
          {/* Render size quantities for each store */}
          {allocationData.storeName.map((store: string, storeIndex: number) => (
            <tr key={store}>
              <td>{store}</td>
              {allocationData.sizeQuantities[storeIndex].map((sizeObj: any, sizeIndex: number) => (
                <td key={sizeObj.size}>
                  <Input 
                    type="number" 
                    value={sizeObj.quantity} 
                    onChange={(e) => handleSizeQuantityChange(e, storeIndex, sizeIndex)} 
                    style={{width:"100%"}}
                  />
                </td>
              ))}
              <td><Input value={storeTotals[storeIndex]} style={{ width: "100%" }} readOnly /></td>
              {/* Handling initial */}
              <td>
              <Input 
                type='text' 
                value={allocationData.initial[storeIndex]} 
                onChange={(e) => handleInitialChange(e, storeIndex)} 
                style={{width:"100%"}}
                />

              </td>
              <td>
                <Button onClick={() => handlePushToStore(storeIndex)}>Push to Store</Button>
              </td>
            </tr>
          ))}
                {/* Render the overstock row */}
                <tr>
                    
                  <td>Total Allocation</td>
                  {allocationData.totalAllocationPerSize.map((quantity: number, index: number) => (
                    <td key={index}><Input value={quantity} style={{width:"100%"}}/></td>
                  ))}
                 <td><Input  value={totalAllocation} style={{width:"100%"}} readOnly /></td>

                </tr>
                <tr>
                    
                  <td>Overstock</td>
                  {allocationData.overstockPerSize.map((quantity: number, index: number) => (
                    <td key={index}><Input value={quantity} style={{width:"100%"}}/></td>
                  ))}
                  <td><Input value={overstockTotal} style={{width:"100%"}}></Input></td>
                  
                </tr>
               
              </tbody>
            </Table>
            </Grid>
            <Center style={{marginTop: "30PX"}}>
            <Group>
            <Button onClick={updateAllocationData}>SAVE CHANGES</Button>
            <Button onClick={updateAllocationData}>DONE</Button>
            </Group>
            </Center>
          </Container>.
          </MantineProvider>
          )}
         
         </div>
         
      );
  };
  
  export default AllocationComponent;


