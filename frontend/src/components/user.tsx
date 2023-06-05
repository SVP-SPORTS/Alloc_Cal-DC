import { Button, Col, Container, Grid, Input,  Table, TextInput } from '@mantine/core';
import React, { useState, useEffect } from 'react';
import {  useNavigate } from 'react-router-dom';

interface SizeQuantity {
  size: string;
  quantity: number;
}

interface DataTableProps {
  data: StoreData[];
  
}



interface StoreData {
  allocation_id: number;
  storeName: string;
  sizeQuantities: SizeQuantity[];
  total: number;
  po_no: string;
  supplier_name: string;
  style_no: string;
  description: string;
  color: string;
  cost: number;
  msrp: number;
  receivedQuantities: SizeQuantity[];
  [key: string]: any;
}


export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [sizes, setSizes] = useState<string[]>([]);
  const [name, setName] = useState<Record<string, string>>({} as Record<string, string>);
  const [totalNames, setTotalNames] = useState<Record<string, string>>({} as Record<string, string>);

  const handleinitialChange = (name: string, value: string) => {
    setName(prevName => ({...prevName, [name]: value}));
  };

  // Use the useNavigate hook to get the navigate function.
  const navigate = useNavigate();
  
  // Create a function that will be called when the user clicks the push button.
 

  const handleTotalNamesChange = (storeId: number, value: string) => {
    setTotalNames(prevNames => ({...prevNames, [storeId]: value}));
  };


  ///
  // Inside your handlePushButtonClick function:
const handlePushButtonClick = async (storeId: number) => {
  const response = await fetch(`http://localhost:5000/api/store_data/${storeId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      totalNames: totalNames[storeId], 
      ...name // contains the sizes and their quantities
    })
  });
  
  if (response.ok) {
    // Maybe you want to navigate to the store page here
    navigate(`/store/${storeId}`);
  } else {
    console.error("Failed to update store data");
  }
};


  useEffect(() => {
    const allSizes: string[] = [];
    data.forEach(store => {
      ['sizeQuantities', 'receivedQuantities'].forEach(field => {
        store[field].forEach((sq: SizeQuantity) => {
          if (!allSizes.includes(sq.size)) allSizes.push(sq.size);
        });
      });
    });
    setSizes(allSizes);
  }, [data]);
  

  const receivedQuantities: Record<string, number> = {};
  sizes.forEach(size => {
    receivedQuantities[size] = 0;

    const sq = data[0].receivedQuantities.find(sq => sq.size === size);
    if (sq) {
      receivedQuantities[size] += sq.quantity;
    }
  });

  // Calculate total allocation and overstock for each size
  const totalAllocation: Record<string, number> = {};
  const overstock: Record<string, number> = {};
  sizes.forEach(size => {
    totalAllocation[size] = 0;

    data.forEach(store => {
      const sq = store.sizeQuantities.find(sq => sq.size === size);
      if (sq) {
        totalAllocation[size] += sq.quantity;
      }
    });

    overstock[size] = receivedQuantities[size] - totalAllocation[size];
  });
     

  return (
    <div>
        <Container>
<Table>
  <Grid gutter="lg"   justify="center" >
        <Col span={6}>
    <TextInput
      label="PO Number"
      value={data[0].po_no}
      readOnly
    />
    </Col>
    </Grid>
     <Grid gutter="lg"   justify="center" >
       <Col span={4}>
    <TextInput
      label="Supplier Name"
      value={data[0].supplier_name}
      readOnly
    />
    <TextInput
      label="Style Number"
      value={data[0].style_no}
      readOnly
    />
  
  
      
    <TextInput
      label="Description"
      value={data[0].description}
      readOnly
    />
    </Col>
      <Col span={4}>
    <TextInput
      label="Color"
      value={data[0].color}
      readOnly
    />
    <TextInput
      label="Cost"
      value={data[0].cost}
      readOnly
    />
    <TextInput
      label="MSRP"
      value={data[0].msrp} 
      readOnly
    />
    </Col>
    </Grid>
   
</Table>
<Grid>
      <Table>
        <thead>
          <tr>
            <th>Store Name</th>
            {sizes.map(size => <th key={size}>{size}</th>)}
            <th>Total</th>
            <th>Initial</th>
          </tr>
        </thead>
        <tbody>
              {/* Received Quantities row */}
              <tr>
                <td>RCV QTY</td>
                {sizes.map(size => {
                  
                  const sq = data[0].receivedQuantities.find(sq => sq.size === size);
                  return (
                    <td key={size}>
                      <Input type="number" value={sq ? sq.quantity : 0} readOnly />
                    </td>
                  );
                })}
                <td>
                  <Input type="text" value={data[0].receivedQuantities.reduce((total, { quantity }) => total + quantity, 0)} readOnly />
                </td>
               
               
              </tr>

              {/* Existing data rows */}
              {data.map(store => (
                <tr key={store.allocation_id}>
                  <td>{store.storeName}</td>
                  {sizes.map(size => {
                    const sq = store.sizeQuantities.find(sq => sq.size === size);
                    return (
                      <td key={`${size}-${store.allocation_id}`}>
                        <Input type="text" value={sq ? sq.quantity : 0} readOnly />
                      </td>
                    );
                  })}
                  <td>
                    <Input type="text" value={store.sizeQuantities.reduce((total, { quantity }) => total + quantity, 0)} readOnly />
                  </td>
                 
                <td>
                    <TextInput
                      type="text" 
                      value={totalNames[store.allocation_id] || ''} 
                      onChange={(event) => handleTotalNamesChange(store.allocation_id, event.target.value)} 
                    />
                  </td>
                     
                  <td>
              <Button onClick={() => handlePushButtonClick(store.allocation_id)}>
                Push to Store
              </Button>
            </td>
                 
          
                

                </tr>
              ))}
              <tr>
  <td>Total Allocation</td>
  {sizes.map(size => <td key={size}><Input type='number' value={totalAllocation[size]} readOnly/></td>)}
  <td>
    <Input type="text" value={Object.values(totalAllocation).reduce((total, quantity) => total + quantity, 0)} readOnly />
  </td>
</tr> 
    {/* Overstock row */}
<tr>
  <td>Overstock</td>
  {sizes.map(size => {
    return (
      <td key={size}>
        <Input type="number" value={overstock[size] || 0} readOnly />
      </td>
    );
  })}
  <td>
    <Input type="text" value={Object.values(overstock).reduce((total, quantity) => total + quantity, 0)} readOnly />
  </td>
</tr>
<tr>
              <td></td>
              {sizes.map(size => {
                return (
                  <td key={size}>
                    <Input 
                      type="text" 
                      value={name[size] || ''} 
                      onChange={(event) => handleinitialChange(size, event.target.value)} 
                    />
                  </td>
                );
              })}
            </tr>


            </tbody>


      </Table>
      </Grid>
      </Container>
    </div>
  );
};
