/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, ChangeEvent, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Text, Input, Grid, Table, Container, Checkbox, Flex, Center, Group, Col, Button, MantineProvider, } from '@mantine/core';
import axios from 'axios';
import Header from './styleInputTable';
import HomePage from '../Navigation/parentHome';



  




type SizeQuantity = {
  size: string;
  quantity: number;
};
interface Store {
  id: number;
  name: string;
  standardQuantity: number;
}
type StoreData = {
  storeName: string;
  sizeQuantities: SizeQuantity[];
};
let tableData: StoreData[][] = [];

interface AllocProps {}

const Alloc: React.ForwardRefRenderFunction<{ reset: () => void }, AllocProps> = (props, ref) => {
  const [sizes, setSizes] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [navbarOpened, setNavbarOpened] = useState(false);
  const [tableData, setTableData] = useState<StoreData[]>([]);
  const [totalProductionQuantities, setTotalProductionQuantities] = useState<number[]>([]);
  const [standardQuantities, setStandardQuantities] = useState<number[]>(new Array(12).fill(0));
  const [totalProductionSum, setTotalProductionSum] = useState<number>(0);
  const [calculateClicked, setCalculateClicked] = useState(false);
  const [totalStdQty, setTotalStdQty] = useState(0);
  const [overstockStore, setOverstockStore] = useState<string | null>(null);
  const [supplierName, setSupplierName] = useState('');
  const [styleNo, setStyleNo] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [cost, setCost] = useState('');
  const [msrp, setMsrp] = useState('');
  const [poNo, setPoNo] = useState('');
  
  



  const storeNames = [
    'STEELES', 'WEB', 'OPM', 'VAUGHAN', 'NIAGARA', 'ALLISTON',
    'SCARBOROUGH', 'CARTWRIGHT', 'BRAMPTON', 'PICKERING', 'YORKGATE', 'OPM-HAMILTON',
  ];

  const [stores, setStores] = useState<string[]>(storeNames);
  const [allChecked, setAllChecked] = useState<boolean>(true);


  useEffect(() => {
    updateTableData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizes, stores]);

  useEffect(() => {
    const newSum = totalProductionQuantities.reduce((total, currentQuantity) => total + currentQuantity, 0);
    setTotalProductionSum(newSum);
  }, [totalProductionQuantities]);


  const handleOverstockStoreChange = (storeName: string) => {
    setOverstockStore(storeName);
  };

  //Save
  const onSave = async () => {

    try {
      const response = await axios.post('http://localhost:5000/api/po', {
       poNo : poNo,
       supplierName: supplierName

      });
      console.log(response.data);
     
    } catch (error) {
      console.error('Error saving style:', error); 
    }

   



    try {
      const response = await axios.post('http://localhost:5000/api/style/create', {
        supplierName: supplierName,
        styleNo: styleNo,
        description: description, 
        color: color,
        cost: cost, 
        msrp: msrp,
        
      });
      console.log(response.data);
      //resetInputs();
    } catch (error) {
      console.error('Error saving style:', error); 
    }

    
    const allocationData = {
      storeName: tableData.map(data => data.storeName),
      sizeQuantities: tableData.map(data => data.sizeQuantities),
      receivedQty: sizes.map((size, index) => ({
        size: size,
        quantity: totalProductionQuantities[index],
      })),
      total: totalProductionQuantities.reduce((a, b) => a + b, 0),
      totalAllocationPerSize: sizes.map((size, index) => calculateTotalAllocation(index)), // assuming calculateTotalAllocation(index) returns the total allocation for a size
      overstockPerSize: sizes.map((size, index) => calculateOverstock(index)), // assuming calculateOverstock(index) returns the overstock for a size
      style_no: styleNo,
      supplierName: supplierName,
      poNo: poNo,
      initial : tableData.map(data => data.storeName),
    };
  
    try {
      const response = await axios.post('http://localhost:5000/api/allocation', allocationData);
      console.log(response.data);
    } catch (error) {
      console.error('Failed to save allocation to backend:', error);
    }
  
  
  
};

   
  


 


  const updateTableData = () => {
    let data = stores.map((store) => {
      return {
        storeName: store,
        sizeQuantities: sizes.map((size) => {
          return {
            size: size,
            quantity: 0,
          };
        }),
      };
    });
    setTableData(data);
  };

  const handleSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newSizes = event.target.value.split(',');
    setSizes(newSizes);
  };

  //handle Calculate

  const allocateSizesToStores = () => {
    const newTableData = [...tableData];

    // Step 1: Calculate the total production quantity across all sizes
    const totalProductionQuantity = totalProductionQuantities.reduce((total, qty) => total + qty, 0);

    newTableData.forEach((storeData, storeIndex) => {
      // Reset the size quantities for this store
      storeData.sizeQuantities.forEach((sizeData) => {
        sizeData.quantity = 0;
      });

      // Step 2: Determine the proportion of this store's standard quantity to the total production quantity
      const storeProportion = standardQuantities[storeIndex] / totalProductionQuantity;

      // Calculate the total standard quantity across all stores
      const totalStandardQuantity = standardQuantities.reduce((total, qty) => total + qty, 0);

      // Check if the total standard quantity is more than the total production quantity
      if (totalStandardQuantity > totalProductionQuantity) {
        // If it is, display an error message and terminate the function
        alert('You are over ambitious. The total standard quantity should not exceed the total production quantity.');
        return false;
      }

      // Step 3: Allocate this store's proportion of each size's production quantity
      storeData.sizeQuantities.forEach((sizeData, sizeIndex) => {
        const sizeAllocation = Math.floor(totalProductionQuantities[sizeIndex] * storeProportion);
        sizeData.quantity += sizeAllocation;
        //
        // Calculate total allocation quantity for this size
        const totalAllocationQuantity = newTableData.reduce((total, storeData) => total + storeData.sizeQuantities[sizeIndex].quantity, 0);
        if (totalAllocationQuantity > totalProductionQuantities[sizeIndex]) {
          // If it is, display an error message and terminate the function
          alert(`You are over ambitious. The total allocation quantity for size ${sizeData.size} should not exceed its total RCV Size quantity.`);
          return;
        }
      });
    });

    const allStoresAtMax = () => {
      return newTableData.every((storeData, index) => calculateRowTotal(index) >= standardQuantities[index]);
    };


    // Step 4: Allocate any remaining quantity for each size
    let sizeIndex = 0;
    const allocateRemainingQuantity = () => {
      if (sizeIndex >= totalProductionQuantities.length) {
        // Update state
        setTableData(newTableData);
        return;
      }

      let totalSizeQty = totalProductionQuantities[sizeIndex];
      let allocatedSizeQty = newTableData.reduce((total, storeData) => total + storeData.sizeQuantities[sizeIndex].quantity, 0);
      let remainingSizeQty = totalSizeQty - allocatedSizeQty;

      let storeIndex = 0;
      while (remainingSizeQty > 0 && !allStoresAtMax()) {
        const storeData = newTableData[storeIndex];
        if (calculateRowTotal(storeIndex) < standardQuantities[storeIndex]) {
          storeData.sizeQuantities[sizeIndex].quantity += 1;
          remainingSizeQty -= 1;
        }

        storeIndex = (storeIndex + 1) % newTableData.length;
      }

      sizeIndex += 1;
      setTimeout(allocateRemainingQuantity, 0); // Schedule the next chunk
    };
    allocateRemainingQuantity();

  };

  // Use useEffect to recalculate allocations when needed
  useEffect(() => {
    if (calculateClicked) {
      allocateSizesToStores();
      setCalculateClicked(false);
    }
  }, [standardQuantities, totalProductionQuantities, calculateClicked]);

  // Handler for button click
  const handleCalculateClick = () => {
    allocateSizesToStores();
    setCalculateClicked(true);
  };





  //Calculate OVERSTOCK
  const allocateOverstockToStore = (tableData: StoreData[], overstockStore: string | null) => {
    if (!overstockStore) {
      return tableData;
    }

    const overstockStoreData = tableData.find(storeData => storeData.storeName === overstockStore);
    if (!overstockStoreData) {
      return tableData;
    }

    const newTableData = [...tableData];

    overstockStoreData.sizeQuantities.forEach((sizeData, sizeIndex) => {
      const overstock = calculateOverstock(sizeIndex);
      if (overstock > 0) {
        sizeData.quantity += overstock;
      }
    });

    return newTableData;
  };



  const handleAllCheckedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAllChecked(event.target.checked);

    if (event.target.checked) {
      // If "Check All" is checked, add all store names to the stores state
      setStores(storeNames);
      const newData = storeNames.map((storeName) => {
        return {
          storeName: storeName,
          sizeQuantities: sizes.map((size) => {
            return {
              size: size,
              quantity: 0 , 
            };
          }),
        };
      });
      setTableData(newData);
    } else {
      // If "Check All" is unchecked, clear the stores and tableData states
      setStores([]);
      setTableData([]);
    }
  };



  const handleStoreChange = (event: React.ChangeEvent<HTMLInputElement>, storeName: string) => {
    const storeIndex = storeNames.indexOf(storeName);
    const newData = [...tableData];
    let newStandardQuantities = [...standardQuantities]; // Copy the current standardQuantities state

    if (!event.target.checked) {
      // Remove the store from the table data and stores state if it's unchecked
      const updatedData = newData.filter((row) => row.storeName !== storeName);
      setTableData(updatedData);
      setStores(stores.filter((store) => store !== storeName));
      setAllChecked(false); // uncheck the "Check All" checkbox

      // Also reset the standard quantity for the unchecked store
      newStandardQuantities[storeIndex] = 0;
      setStandardQuantities(newStandardQuantities);
    } else {
      // Only add the store back to the table and stores state if it's not already there
      if (!stores.includes(storeName)) {
        setStores([...stores, storeName]);
        const newRow = {
          storeName: storeName,
          sizeQuantities: sizes.map((size) => {
            return {
              size: size,
              quantity: 0, 
            };
          }),

        };


        newData.push(newRow);
        setTableData(newData);
        setAllChecked(stores.length + 1 === storeNames.length); // check the "Check All" checkbox if all stores are checked
      }
    }
  };





  const handleQuantityChange = (
    event: ChangeEvent<HTMLInputElement>,
    storeIndex: number,
    sizeIndex: number
  ) => {
    const newData = [...tableData];
    newData[storeIndex].sizeQuantities[sizeIndex].quantity = parseInt(
      event.target.value,
      10
    ) || 0;
    setTableData(newData);
  };

  const handleTotalProductionQuantityChange = (event: ChangeEvent<HTMLInputElement>, sizeIndex: number) => {
    const newTotalProductionQuantity = parseInt(event.target.value, 10) || 0;
    const newTotalProductionQuantities = [...totalProductionQuantities];
    newTotalProductionQuantities[sizeIndex] = newTotalProductionQuantity;
    setTotalProductionQuantities(newTotalProductionQuantities);
  };

  const handleStandardQuantityChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newQuantities = [...standardQuantities];
    newQuantities[index] = parseInt(event.target.value, 10) || 0;
    setStandardQuantities(newQuantities);
  };



  const calculateTotalAllocation = (sizeIndex: number) => {
    return tableData.reduce(
      (total, row) => {
        // Check if row and row.sizeQuantities are not null
        if (row && row.sizeQuantities) {
          // Check if sizeIndex is within the bounds of the sizeQuantities array
          if (sizeIndex < row.sizeQuantities.length) {
            return total + row.sizeQuantities[sizeIndex].quantity;
          }
        }
        return total;
      },
      0
    );
  };



  const calculateTotalStdQtySum = (): number => {
    return standardQuantities.reduce((total, currentQuantity) => total + (currentQuantity || 0), 0);
  };
  useEffect(() => {
    const newTotalStdQty = calculateTotalStdQtySum();
    setTotalStdQty(newTotalStdQty);
   
  }, [standardQuantities, tableData]);


  const calculateRowTotal = (rowIndex: number) => {
    return tableData[rowIndex].sizeQuantities.reduce((total, sizeData) => total + sizeData.quantity, 0);
  };

  const calculateTotalSizeQuantitiesSum = (): number => {
    return tableData.reduce((total, rowData, rowIndex) => total + calculateRowTotal(rowIndex), 0);
  };


  const calculateOverstock = (sizeIndex: number) => {
    const totalAllocation = calculateTotalAllocation(sizeIndex);
    const totalProductionQuantity = totalProductionQuantities[sizeIndex] || 0;
    const result = Math.max(totalProductionQuantity - totalAllocation);
    return isNaN(result) ? 0 : result;
  };

 
  const reset = () => {
    const confirmReset = window.confirm("Do you want to save before resetting?");

  if (confirmReset) {
    onSave();
  }
    
    setSizes([]);
    setTableData([]);
    setTotalProductionQuantities([]);
    setStandardQuantities(new Array(12).fill(0));
    setTotalProductionSum(0);
    setCalculateClicked(false);
    setTotalStdQty(0);
    setOverstockStore(null);
    setSupplierName('');
    setStyleNo('');
    setDescription('');
    setColor('');
    setCost('');
    setMsrp('');
    setPoNo('');
    setStores(storeNames);
    setAllChecked(true);
  };
  useImperativeHandle(ref, () => ({
    reset
  }));
  
 
 


  return (
    <div >
     
       <Header 
       poNo={poNo}
       setPoNo={setPoNo}
       supplierName={supplierName}
       setSupplierName={setSupplierName}
         styleNo={styleNo}
        setStyleNo={setStyleNo}
        description={description}
        setDescription={setDescription}
        color={color}
        setColor={setColor}
        cost={cost}
        setCost={setCost}
        msrp={msrp}
        setMsrp={setMsrp}
       
        onSave={onSave}  // pass onSave as prop
      />
      <Container id='no-print'>
        <Grid gutter="lg" justify="center">

          <Col span={8}>


            <Grid.Col >

              <Text component="label" htmlFor="size-input-field">
                Sizes:
              </Text>

              <Input
                type="text"
                id="size-input-field"
                name="size-input-field"
                placeholder="Enter size range"
                onChange={handleSizeChange}

              />
            </Grid.Col>



          </Col>
          <Group spacing="lg">
            <Col span={12}>


              <Grid.Col >
                <Flex justify="center" wrap="wrap" align="center" direction="row" rowGap="xs" columnGap="md">
                  <Checkbox
                    label="Check All"
                    checked={allChecked}
                    onChange={handleAllCheckedChange}
                  />




                  {storeNames.map((storeName, index) => (
                    <div key={storeName}>
                      <Checkbox
                        label={storeName}
                        checked={stores.includes(storeName)}
                        onChange={(e) => handleStoreChange(e, storeName)}
                      />
                    </div>
                  ))}


                </Flex>
              </Grid.Col>
            </Col>
          </Group>

        </Grid>
      </Container>
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
   
        <Grid>
          <Table id="table-to-print-1" className="table">
            <thead id='table-header'>
              <tr>
                <th >Store</th>
                {sizes.map((size) => (
                  <th key={size}>{size}</th>
                ))}
                <th>Total</th>
                <th> STD QTY</th>
              </tr>
            </thead>
            <tbody >
              <tr>
                <td>RCV QTY</td>
                {sizes.map((size, index) => (
                  <td key={`total-production-quantity-${index}`}>
                    <Input
                      type="number"
                      value={totalProductionQuantities[index] || 0}
                      onChange={(e) => handleTotalProductionQuantityChange(e, index)}
                      style={{width:"100%"}}
                    />
                  </td>
                ))}
                <td>
                  <Input type="number" value={totalProductionSum} readOnly  style={{width:"100%"}}/>
                </td>
                <td />
              </tr>
              {tableData.map((row, rowIndex) => (
                <tr key={row.storeName}>
                  <td>{row.storeName}</td>
                  {row.sizeQuantities.map((sizeData, sizeIndex) => (
                    
                    <td key={sizeData.size}>
                      <Input
                        type="number"
                        value={sizeData.quantity}
                        onChange={(e) =>
                          handleQuantityChange(e, rowIndex, sizeIndex)
                        }
                        style={{width:"100%"}}
                      />
                    </td>
                  ))}
                  <td>
                    <Input
                      type="number"
                      value={calculateRowTotal(rowIndex)}
                      readOnly
                      style={{width:"100%"}}
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      value={standardQuantities[rowIndex]}
                      onChange={(e) => handleStandardQuantityChange(e, rowIndex)}
                      placeholder="Enter standard quantity"
                      style={{width:"100%"}}
                    />
                  </td>
                  
                </tr>
              ))}
              <tr>
                <td>Total allocation</td>
                {sizes.map((_, index) => (
                  <td key={`total-allocation-${index}`}>
                    {calculateTotalAllocation(index)}
                  </td>
                ))}
                <td>{calculateTotalSizeQuantitiesSum()}</td>
                <td>{calculateTotalStdQtySum()}</td>
              </tr>
              <tr>
                <td>Overstock</td>
                {sizes.map((_, index) => (
                  <td key={`overstock-${index}`}>
                    {calculateOverstock(index)}
                  </td>

                ))}
                <td>
                  <Center maw={500} h={30} mx="auto">
                    {Math.max(totalProductionSum - calculateTotalSizeQuantitiesSum(), 0)}
                  </Center>
                </td>



              </tr>
            </tbody>
          </Table>
        </Grid>
      </Container>
      </MantineProvider>
      <Container>
        <Grid>

        </Grid>
      </Container>
      
      <Center style={{marginTop: "25px", marginBottom:"10px"}} >
      <Group>
          
            <Button onClick={handleCalculateClick}>Calculate</Button>
            <Button onClick={() => {
              const newTableData = allocateOverstockToStore(tableData, 'STEELES');
              setTableData(newTableData);
              }}>
              Send Overstock to STEELES
            </Button>

            <Button onClick={reset}>Reset</Button>
            <Button onClick={onSave}>Save</Button>

         
      </Group>
        
      </Center>

    </div>
  );
};

export default forwardRef(Alloc);

  