import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Col, Container, Grid, Input, Table, TextInput, Text, Center, MantineProvider, Group, Select } from '@mantine/core';
import Homepage from '../Navigation/parentHome';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';


pdfMake.vfs = pdfFonts.pdfMake.vfs;

type OrientationType = 'portrait' | 'landscape';

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
  const [imageData, setImageData] = useState<string>("");
  

  


  
  
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
        const response = await axios.get(`http://localhost:5000/api/allocation/style_no/${styleNo}/poNo/${poNo}`, {withCredentials:true});
        setStyleData(response.data.style);
        setAllocationData(response.data.allocation);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setError('The provided styleNo or poNo does not exist or match any records.');
        setIsLoading(false);
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
  
  
   // Add handlers for file and image URL inputs
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageData(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleImageUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    const response = await fetch(url);
    const blob = await response.blob();
    const reader = new FileReader();
    reader.onload = () => {
      setImageData(reader.result as string);
    };
    reader.readAsDataURL(blob);
  };
//state to check the orientation


const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

// Handler for orientation change
const handleOrientationChange = (value: 'portrait' | 'landscape') => {
  setOrientation(value);
};

// Function to generate code
const generateCode = (): string => {
  // Find index of "Steeles" in storeName array
  const steelesIndex = allocationData.storeName.findIndex((store: string) => store.toUpperCase() === 'STEELES');

  // If "Steeles" is not found, return an error or handle this situation as needed
  if(steelesIndex === -1) return 'Steeles not found';

  // Get total for "Steeles"
  const steelesTotal = storeTotals[steelesIndex];

  // Get current month and year
  const date = new Date();
  const month = date.getMonth() + 1; // JavaScript Date's getMonth() method returns a zero-based month, so we add 1
  const year = date.getFullYear();

  // Calculate code
  const code = overstockTotal + steelesTotal;

  // Handle cost
  let cost: string = '';
  const costValue = parseFloat(styleData.cost.toString());
  if (isNaN(costValue)) {
    return 'Cost is not a number';
  } else {
    if (Number.isInteger(costValue)) {
      cost = costValue.toString();
    } else {
      const costParts = styleData.cost.toString().split('.');
      cost = costParts[0] + '.' + costParts[1].slice(0, 2);
    }
  }

  // Format code
  const formattedCode = `${code.toString().padStart(3, '0')} - ${month.toString().padStart(2, '0')}${year.toString().slice(-2)}${cost.padStart(4, '0')}`;

  return formattedCode;
};


   // Function to generate PDF
   const generatePDF = () => {
   
    const portraitMode = orientation === 'portrait';

    const contentData: Content[] =  [
        {
          columns: [
            {
              text: `${styleData.supplier_name}`,
              
              fontSize: portraitMode ? 14 : 20,
        alignment: 'left',
        margin: [-15,-30,0,10]
            },
            
          ],
        },
        {
        columns: [
          {
          
        text: 
        `${styleData.description}`,
        fontSize: portraitMode ? 36 : 42,
        alignment: 'center',
        margin: [3,3,3,3]
            
          },
        ],
      },
      {
        columns: [
          {
            text: 
        `#${styleData.style_no}`,
        fontSize: portraitMode ? 44 : 72,
        alignment: 'center',
        bold: true,
        margin: [3,3,3,3]
            
          },
        ],
      },
        {
          columns: [
            {
              text: `${styleData.color}`,
              width: '*',
              fontSize: portraitMode ? 16 : 20,
        alignment: 'center',
        margin: [3,3,3,3]
            },
            {
              text: `R - ${styleData.msrp}`,
              width: '*',
              fontSize: portraitMode ? 16 : 20,
        alignment: 'center',
        margin: [3,3,3,3]
            },
          ],
        },
        {
          columns: [
            {
              text: 
          `${generateCode()}`,
          fontSize: portraitMode ? 16 : 20,
          alignment: 'center',
          margin: [3,3,3,3]
              
            },
          ],
        }, // Add quantity data
        
        {
          image: imageData, // Use imageData as image source
          width: portraitMode ? 300 : 450, // smaller size for portrait
          height: portraitMode ? 175 : 300,
          margin: [5,10,0,5], 
          alignment: 'center',
        },
         // Add overstock data
      ];

      const contentData1: Content[] =  [
        {
          columns: [
            {
              text: `${styleData.supplier_name}`,
              
              fontSize: portraitMode ? 14 : 20,
        alignment: 'left',
        margin: [-15,-30,0,10]
            },
            
          ],
        },
        {
        columns: [
          {
          
        text: 
        `${styleData.description}`,
        fontSize: portraitMode ? 36 : 42,
        alignment: 'center',
        margin: [3,3,3,3]
            
          },
        ],
      },
      {
        columns: [
          {
            text: 
        `#${styleData.style_no}`,
        fontSize: portraitMode ? 44 : 72,
        alignment: 'center',
        bold: true,
        margin: [3,3,3,3]
            
          },
        ],
      },
        {
          columns: [
            {
              text: `${styleData.color}`,
              width: '*',
              fontSize: portraitMode ? 16 : 20,
        alignment: 'center',
        margin: [3,3,3,3]
            },
            {
              text: `R - ${styleData.msrp}`,
              width: '*',
              fontSize: portraitMode ? 16 : 20,
        alignment: 'center',
        margin: [3,3,3,3]
            },
          ],
        },
        {
          columns: [
            {
              text: 
          `${generateCode()}`,
          fontSize: portraitMode ? 16 : 20,
          alignment: 'center',
          margin: [3,3,3,3]
              
            },
          ],
        }, // Add quantity data
        
        {
          image: imageData, // Use imageData as image source
          width: portraitMode ? 300 : 450, // smaller size for portrait
          height: portraitMode ? 150 : 300,
          margin: [5,10,0,5], 
          alignment: 'center',
        },
         // Add overstock data
      ];
    
      let content: Content[];
  
      if (portraitMode) {
        // Add a page break and duplicate the content
        contentData.push({ text: '', marginTop: 40 });
        content = [...contentData, ...contentData1];
      } else {
        content = contentData;
      }
    
      const docDefinition: TDocumentDefinitions = {
        content: content,
        pageSize: 'LETTER',
        pageOrientation: orientation,
      };
    
      pdfMake.createPdf(docDefinition).open();
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
              <Group>
          <Input type="file"  onChange={handleFileChange}  />
      <TextInput
        
        placeholder="Enter image URL"
        onChange={handleImageUrlChange}
      />
</Group>
<Select 
  data={[
    { value: 'portrait', label: 'Portrait' },
    { value: 'landscape', label: 'Landscape' },
  ]}
  value={orientation}
  onChange={handleOrientationChange}
/>

 <Button onClick={generatePDF}>Generate PDF</Button>

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


