import {  Table, Paper, Text, Button, Col, Grid, Group, Input, Modal, TextInput,  } from '@mantine/core';
import React, { useEffect, useState } from 'react';

import "./AllocTable.css"

import Homepage from '../components/Navigation/parentHome';
import { createUseStyles } from 'react-jss';
import {  IconFilter, IconFilterX } from '@tabler/icons-react';
//import HomePage from './parent';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import PDFGenerator from './transferReport';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

interface SizeQuantity {
  size: string;
  quantity: number;
  sku: string;
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

interface AllocationData {
  allocation_id: number;
  storeName: string[];
  style_no: string;
  supplierName: string;
  poNo: string;
  status: boolean[];
  skuNumbers: string[];
  sizeQuantities: SizeQuantity[][];
  styles: StyleData;

}

const initialFilterState = {
  storeName: '',
  supplierName: '',
  styleNo: '',
  poNo: ''
};

const useStyles = createUseStyles({
  fixedBar: {
    position: 'fixed',
    bottom: 0,
    width: '100%',
    background: '#ECF0F1 ',
    padding: '10px 0',
    boxShadow: '0px -2px 10px rgba(0,0,0,0.1)'
  },
 
});






const AllocTable: React.FC = () => {
  const classes = useStyles();
  const [searchTerm, setSearchTerm] = useState<string>("");
  //const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);
  const [filter, setFilter] = useState(initialFilterState);

  const [allocations, setAllocations] = useState<AllocationData[]>([]);
 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [navbarOpened, setNavbarOpened] = useState(false);


  const resetFilter = () => {
    setFilter(initialFilterState);
    setSearchTerm("");
    setTempFilter(initialFilterState);
  };

  const [filterModalOpen, setFilterModalOpen] = useState<boolean>(false);
  const [tempFilter, setTempFilter] = useState(initialFilterState);

 
  const filteredData = allocations.filter((row) =>
  (filter.storeName ? row.storeName.some(store => store.toUpperCase().includes(filter.storeName.toUpperCase())) : true) &&
  (filter.supplierName ? row.supplierName.toUpperCase().includes(filter.supplierName.toUpperCase()) : true) &&
  (filter.poNo ? row.poNo.toUpperCase().includes(filter.poNo.toUpperCase()) : true) &&
  (filter.styleNo ? row.style_no.toUpperCase().includes(filter.styleNo.toUpperCase()) : true) &&
  (searchTerm ? (
    row.storeName.some(store=> store.includes(searchTerm.toLowerCase()) ||
    row.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.style_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.poNo.toLowerCase().includes(searchTerm.toLowerCase())
  )) : true)
);



  const applyFilter = () => {
    setFilterModalOpen(false);
    setFilter(tempFilter);
  }

  useEffect(() => {
    fetch('http://localhost:5000/api/allocation/')
      .then(response => response.json())
      .then(jsonData => {
        console.log(jsonData); // <- add this line
        setAllocations(jsonData);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);
  





 

  return (
    <>
    <Homepage setNavbarOpened={setNavbarOpened}/>
      <Paper shadow='xs'  className="alloc-table">
        <div className="table-wrapper">    
      
     <Table>
    <thead>
      <tr>
      <th>
          <Text 
                  ta="center"
                  fz="lg"
                  fw={600}>
            SKU
          </Text>
            </th>
            <th>
          <Text 
                  ta="center"
                  fz="lg"
                  fw={600}>
            Style No
          </Text>  
            </th>
            <th>
                  <Text 
                  ta="center"
                  fz="lg"
                  fw={600}>
               
                    Description
                  </Text>  
                    </th>
                    <th>
                  <Text 
                  ta="center"
                  fz="lg"
                  fw={600}>
               
                    Color
                  </Text>  
                    </th>
                    <th>
                  <Text 
                  ta="center"
                  fz="lg"
                  fw={600}>
               
                   Cost
                  </Text>  
                    </th>
                    <th>
                  <Text 
                  ta="center"
                  fz="lg"
                  fw={600}>
               
                    MSRP
                  </Text>  
                    </th>
          <th> 
                <Text 
                  ta="center"
                  fz="lg"
                  fw={600}>Store Name
                </Text>
          </th>
          
          <th >
          <Text 
                  ta="center"
                  fz="lg"
                  fw={600}>
            Supplier          </Text>
            </th>
          <th>
          <Text 
                  ta="center"
                  fz="lg"
                  fw={600}>
            PO NO
          </Text>
            </th>
          
          <th>
          <Text 
                  ta="center"
                  fz="lg"
                  fw={600}>
            Size
          </Text>
            </th>
           
          <th>            
          <Text 
                  ta="center"
                  fz="lg"
                  fw={600}>
            Quantity
          </Text>
            </th>
          <th>
          <Text 
                  ta="center"
                  fz="lg"
                  fw={600}>
            Total
          </Text>
            </th>
            <th>
          <Text 
                  ta="center"
                  fz="lg"
                  fw={600}>
           Status
          </Text>
            </th>
        </tr>
      </thead>
      <tbody>
      {Array.isArray(filteredData) && filteredData
  .filter((row) => row.style_no && row.style_no.toLowerCase().includes(searchTerm.toLowerCase()))

  .flatMap((allocation, index) => 
    allocation.storeName
    .filter(storeName => (!filter.storeName || storeName.toLowerCase().includes(filter.storeName.toLowerCase())))
    .map((storeName, i) => {
      const total = allocation.sizeQuantities[i].reduce(
        (acc, curr) => acc + curr.quantity,
        0
      );
      return allocation.sizeQuantities[i].map((sq, j) => (
        <tr key={`${allocation.allocation_id}-${storeName}-${j}`}>
           <td>{allocation.skuNumbers[j]}</td>
            {/* Here you can access the style properties */}
            <td>{j === 0 ? allocation.style_no : ""}</td>
         <td >{j === 0 && allocation.styles ? allocation.styles.description : ''}</td>
        <td >{j === 0 && allocation.styles ? allocation.styles.color : ''}</td>
        <td >{j === 0 && allocation.styles ? allocation.styles.cost : ''}</td>
        <td >{j === 0 && allocation.styles ? allocation.styles.msrp : ''}</td>
          <td>{j === 0 ? storeName : ""}</td>
          
          <td>{j === 0 ? allocation.supplierName : ""}</td>
          <td>{j === 0 ? allocation.poNo : ""}</td>
         
          <td>{sq.size}</td>
          <td>{sq.quantity}</td>
          <td>{j === 0 ? total : ""}</td> {/* display total only on the first row */}
          <td>{j === 0 ? (allocation.status[i] ? "Done" : "NO") : ""}</td>
        </tr>
      ));
    })
  )}
      </tbody>
    </Table>        
        </div>
        <div className={classes.fixedBar}>
        
        <Grid gutter="md" >
          <Col span={9}>
          
          <TextInput
              placeholder="Search by Style No"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.currentTarget.value)}
            />
          </Col>
          <Col span={1}>
            <Button leftIcon={<IconFilter/>} onClick={() => setFilterModalOpen(true)} variant="subtle" color="dark" uppercase>Filter</Button>
            <Modal
              
              opened={filterModalOpen}
              onClose={() => setFilterModalOpen(false)}
              centered
            >
              <Group position='center'>
              <Input
      placeholder="Filter by Style No"
      value={tempFilter.styleNo}
      onChange={(event) => setTempFilter({ ...tempFilter, styleNo: event.currentTarget.value.toUpperCase() })}
    />
    <Input
      placeholder="Filter by Supplier Name"
      value={tempFilter.supplierName}
      onChange={(event) => setTempFilter({ ...tempFilter, supplierName: event.currentTarget.value.toUpperCase() })}
    />
    <Input
      placeholder="Filter by PO No"
      value={tempFilter.poNo}
      onChange={(event) => setTempFilter({ ...tempFilter, poNo: event.currentTarget.value.toUpperCase() })}
    />
    <Input
      placeholder="Filter by Store Name"
      value={tempFilter.storeName}
      onChange={(event) => setTempFilter({ ...tempFilter, storeName: event.currentTarget.value.toUpperCase() })}
    />
              <Button onClick={applyFilter}>Apply</Button>
              </Group>
            </Modal>
          </Col>
          <Col span={1}>
            <Button 
             leftIcon={<IconFilterX/>}
              title="Reset Filter"
              onClick={resetFilter}
              variant="subtle" color="dark"
               />              
          </Col>
          <Col span={1}><PDFGenerator data={allocations} filter={filter} />
</Col>
         
        </Grid>
      </div>
    </Paper>
        </>
  );
};

export default AllocTable;
