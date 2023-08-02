import { Grid, Table, Paper, Col, Input, Button, Modal,Text, createStyles, Group } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import "./AllocTable.css";
import Homepage from '../components/Navigation/parentHome';
import createPdf from './poReport';
import { IconDownload, IconFilter, IconFilterX } from '@tabler/icons-react';
//import HomePage from './parent';

interface ReceivedQty{
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

interface AllocationData {
  style_no: string;
  supplierName: string;
  receivedQty: ReceivedQty[];
  total: number;
  totalAllocationPerSize: number[];
  overstockPerSize: number[];
  poNo: string;
  skuNumbers: string[];
  styleQty_id: number;
  styles: StyleData;
}

const initialFilterState = {
  supplierName: '',
  poNo: '',
};

const useStyles = createStyles((theme) => ({
  fixedBar: {
    position: 'fixed',
    bottom: 0,
    width: '100%',
    background: '#ECF0F1 ',
    padding: '10px 0',
    boxShadow: '0px -2px 10px rgba(0,0,0,0.1)'
  },
  tableContainer: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    //tableLayout: 'fixed',
    borderCollapse: 'collapse',
    border: '1px solid',
  },
  tableCell: {
    border: '1px solid',
    //maxWidth:500
  },
}));

const StyleQuantitiesTable: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { classes, cx } = useStyles();
  const [data, setData] = useState<AllocationData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filter, setFilter] = useState(initialFilterState);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [navbarOpened, setNavbarOpened] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/allocation/')
      .then(response => response.json())
      .then(jsonData => {
        setData(jsonData);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const resetFilter = () => {
    setFilter(initialFilterState);
    setSearchTerm("");
    setTempFilter(initialFilterState);
  };

  const [filterModalOpen, setFilterModalOpen] = useState<boolean>(false);
  const [tempFilter, setTempFilter] = useState(initialFilterState);

  const filteredData = data.filter((row) =>
    (!filter.supplierName || row.supplierName.toLowerCase().includes(filter.supplierName.toLowerCase())) &&
    (!filter.poNo || row.poNo.toLowerCase().includes(filter.poNo.toLowerCase()))
  );

  const applyFilter = () => {
    setFilterModalOpen(false);
    setFilter(tempFilter);
  }

  return (
    <>
      <Homepage setNavbarOpened={setNavbarOpened}/>
      <Grid gutter="md" className="alloc-table">
        <Col span={12}>
        <Paper shadow="xs"  className="table-wrapper">
  <Table className={classes.table}>
              <thead className={classes.tableCell}>
                <tr className="tableHeader">
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
                  fw={600}
                  >
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
                  fw={600}>
               
                    Supplier
                  </Text>  
                    </th>
                    <th>
          <Text 
                  ta="center"
                  fz="md"
                  fw={600}>
            PO No.
          </Text>
            </th>
            <th >
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
            Size
          </Text>
            </th>
          <th >
          <Text 
                  ta="center"
                  fz="lg"
                  fw={600}>
           RCV Qty
          </Text>
            </th>
                           
            <th>
          <Text 
                  ta="center"
                  fz="lg"
                  fw={600}>
           Total Allocation
          </Text>
            </th>
          <th >
          <Text 
                  ta="center"
                  fz="lg"
                  fw={600}>
            Overstock
          </Text>
            </th>
                  
                </tr>
              </thead>
              <tbody className={classes.tableCell}>
              {Array.isArray(filteredData) && filteredData
  .filter((row) => row.style_no.toLowerCase().includes(searchTerm.toLowerCase()))
  .flatMap((allocation, index) => (
    allocation.receivedQty.map((rq, rqIndex) => (
      <tr key={`${index}-${rqIndex}`} className={classes.tableCell}>
        <td className={classes.tableCell}>{allocation.skuNumbers[rqIndex]}</td>
        <td className={classes.tableCell}>{rqIndex === 0 ? allocation.style_no : ''}</td>
         {/* Here you can access the style properties */}
         <td className={classes.tableCell}>{rqIndex === 0 && allocation.styles ? allocation.styles.description : ''}</td>
        <td className={classes.tableCell}>{rqIndex === 0 && allocation.styles ? allocation.styles.color : ''}</td>
        <td className={classes.tableCell}>{rqIndex === 0 && allocation.styles ? allocation.styles.cost : ''}</td>
        <td className={classes.tableCell}>{rqIndex === 0 && allocation.styles ? allocation.styles.msrp : ''}</td>

        <td className={classes.tableCell}>{rqIndex === 0 ? allocation.supplierName : ''}</td>
        <td className={classes.tableCell} >{rqIndex === 0 ? allocation.poNo : ''}</td>
        <td className={classes.tableCell}>{rqIndex === 0 ? allocation.total : ''}</td>
        <td className={classes.tableCell}>{rq.size}</td>
        <td className={classes.tableCell}>{rq.quantity}</td>
        
        <td className={classes.tableCell}>{allocation.totalAllocationPerSize[rqIndex]}</td>
        <td className={classes.tableCell}>{allocation.overstockPerSize[rqIndex]}</td>
        
       
        
      </tr>
    )) 
  ))}

</tbody>
            </Table>
          </Paper>
        </Col>
        <div className={classes.fixedBar}>
        <Grid gutter="md" style={{marginRight:"2px", marginLeft:"10px"}}>
          
          <Col span={9} > 
          <Input
              placeholder="Search by Style No"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.currentTarget.value)}
            />
          </Col>
          <Col span={1}>
            <Button onClick={() => setFilterModalOpen(true)} leftIcon={<IconFilter/>} variant="subtle" color="dark" uppercase>Filter</Button>
            <Modal
              
              opened={filterModalOpen}
              onClose={() => setFilterModalOpen(false)}
              centered
            >
              <Group position='center'>
              <Input
                placeholder="Filter by Supplier Name"
                value={tempFilter.supplierName}
                onChange={(event) => setTempFilter({ ...tempFilter, supplierName: event.currentTarget.value })}
              />
              <Input
                placeholder="Filter by PO No"
                value={tempFilter.poNo}
                onChange={(event) => setTempFilter({ ...tempFilter, poNo: event.currentTarget.value.toLowerCase() })}
              />
              <Button onClick={applyFilter}>Apply</Button>
              </Group>
            </Modal>
          </Col>
          <Col span={1}>
            <Button 
              title="Reset Filter"
              onClick={resetFilter}
              leftIcon={<IconFilterX/>}
              variant="subtle" color="dark"
               />
          </Col>
          <Col span={1}>
          <Button onClick={() => createPdf(filteredData, filter)} leftIcon={<IconDownload/>}  variant="subtle" color="dark"/>
          </Col>
         
        </Grid>
      </div>
      </Grid>
    </>
  );
}

export default StyleQuantitiesTable;
 