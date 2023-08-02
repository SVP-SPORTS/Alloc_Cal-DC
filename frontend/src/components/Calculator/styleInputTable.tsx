import React, { ChangeEvent, useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Text, Grid, Container, TextInput, Col, Paper, Table,  Select} from '@mantine/core';
import axios, { AxiosError } from 'axios';
import Homepage from '../Navigation/parentHome';

interface HeaderProps {
  
  styleNo: string;
  setStyleNo: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  color: string;
  setColor: (value: string) => void;
  cost: string;
  setCost: (value: string) => void;
  msrp: string;
  setMsrp: (value: string) => void;
 
  onSave: () => void;
  supplierName: string;
  setSupplierName: (value: string) => void;
  poNo : string;
  setPoNo: (value: string) => void;
}

type Suggestion = { label: string; value: string };

const Header: React.FC<HeaderProps> = ({
  supplierName,
  setSupplierName,
  styleNo,
  setStyleNo,
  description,
  setDescription,
  color,
  setColor,
  cost,
  setCost,
  msrp,
  setMsrp,
  poNo,
  setPoNo,
  
  onSave,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [supplierData, setSupplierData] = useState<any>(null);
  const [supplierNameId] = useState(uuid());
  const [styleNoId] = useState(uuid());
  const [descriptionId] = useState(uuid());
  const [colorId] = useState(uuid());
  const [costId] = useState(uuid());
  const [msrpId] = useState(uuid());
  const [poNoId] = useState(uuid());
  const [allSuppliers, setAllSuppliers] = useState<Suggestion[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [navbarOpened, setNavbarOpened] = useState(false);

  useEffect(() => {
    const fetchAllSuppliers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/supplier/');
        const suppliers: Suggestion[] = response.data.map((supplier: any) => ({
          label: supplier.supplier_name,
          value: supplier.supplier_name,
        }));
        setAllSuppliers(suppliers);
      } catch (error) {
        console.error('Error fetching all suppliers:', error);
      }
    };

    fetchAllSuppliers();
  }, []);

  
  
  
  const fetchSupplierByName = async (name: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/supplier/`);
      setSupplierData(response.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response && axiosError.response.status === 404) {
        alert('Supplier not found');
      } else {
        console.error('Error fetching supplier data:', axiosError);
      }
    }
  };

  

  const handleSupplierChange = async (value: string) => {
    setSupplierName(value);
    
    // Check if the supplier is not in the current list of suppliers
    const isSupplierNew = allSuppliers.every(supplier => supplier.value !== value);
    
    // If the supplier is new, create it
    if (isSupplierNew) {
      try {
        await axios.post('http://localhost:5000/api/supplier/add', { supplier_name: value });
        // Add the new supplier to the state
        setAllSuppliers(prev => [...prev, { label: value, value }]);
      } catch (error) {
        console.error('Error creating new supplier:', error);
      }
    }
  
    // Fetch the supplier by name, regardless of whether it's new or not
    fetchSupplierByName(value);
  };
  

  const handleStyleNoChange = (event: ChangeEvent<HTMLInputElement>) => {
    setStyleNo(event.target.value);
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };

  const handleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    setColor(event.target.value);
  };

  const handleCostChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCost(event.target.value);
  };

  const handleMSRPChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMsrp(event.target.value);
  };

  const handlePoNoChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPoNo(event.target.value);
  };

  return (
    <div>
       <Homepage setNavbarOpened={setNavbarOpened}/>
      <Paper p="xs" shadow="xs" style={{ marginBottom: '1rem', marginTop: "50px" }}>
       <Text align="center" size="xl" weight={500}>
          Store Allocation Calculator
        </Text> 
      </Paper>
      <Container>
        <Table id="table-to-print-2">
        <Grid gutter="xs"   justify="center" >
        <Col span={6}>
             <TextInput
                 label="PO No."
                 id={poNoId}
                 value={poNo}
                 placeholder="Enter PO No"
                 onChange={handlePoNoChange}
                 style={{ width: '80%' }}
               />
               </Col>
               </Grid>
             
          <Grid gutter="lg"   justify="center">
            
              <Col span={6}>
              <Select
  placeholder="Select supplier"
  label="Supplier"
  id={supplierNameId}
  value={supplierName}
  data={allSuppliers}
  searchable
  creatable
  onCreate={(value) => ({ value, label: value })}
  onChange={handleSupplierChange}
  getCreateLabel={(query) => `+ Create ${query}`}
  style={{ width: '80%' }}
  maxDropdownHeight={50}
/>

    
             
              <TextInput
                label="Style No."
                id={styleNoId}
                value={styleNo}
                placeholder="Enter style number"
                onChange={handleStyleNoChange}
                style={{ width: '80%' }}
              />
              
              <TextInput
                label="Description"
                id={descriptionId}
                value={description}
                placeholder="Enter description"
                onChange={handleDescriptionChange}
                style={{ width: '80%' }}
              />
            </Col>
            <Col span={6}>
              <TextInput
                label="Color"
                id={colorId}
                value={color}
                placeholder="Enter color"
                onChange={handleColorChange}
                style={{ width: '80%' }}
              />
              <TextInput
                label="Cost"
                id={costId}
                value={cost}
                placeholder="Enter cost"
                onChange={handleCostChange}
                style={{ width: '80%' }}
              />
              <TextInput
                label="MSRP"
                id={msrpId}
                value={msrp}
                placeholder="Enter MSRP"
                onChange={handleMSRPChange}
                style={{ width: '80%' }}
              />
            </Col>
          </Grid>
        </Table>
      
      </Container>
    </div>
  );
};

export default Header;
