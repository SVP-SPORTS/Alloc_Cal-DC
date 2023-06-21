import axios from 'axios';
import { Grid, Table, Paper, Col, Input, Button, Modal,Text, Group} from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import './AllocTable.css';
import Homepage from '../components/Navigation/parentHome';
import { IconDeviceFloppy, IconFilter, IconFilterX } from '@tabler/icons-react';
//import HomePage from './parent';

interface StyleRow {
  supplier_name: string;
  style_no: string;
  description: string;
  color: string;
  cost: number;
  msrp: number;
}

const initialFilterState = {
  supplierName: '',
  styleNo: '',
  description: '',
  color: ''
};

const useStyles = createUseStyles({
  fixedBar: {
    position: 'fixed',
    bottom: 0,
    width: '100%',
    background: '#ECF0F1 ',
    padding: '8px 0',
    boxShadow: '0px -2px 10px rgba(0,0,0,0.1)'
  },
  tableContainer: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    tableLayout: 'fixed',
    borderCollapse: 'collapse',
  },
  tableCell: {
    border: '1px solid',
   
   
  },
});
const StylesTable: React.FC = () => {
  const classes = useStyles();
  const [data, setData] = useState<StyleRow[]>([]);
  const [editedData, setEditedData] = useState<StyleRow[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filter, setFilter] = useState(initialFilterState);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [navbarOpened, setNavbarOpened] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/style/get')
      .then(response => response.json())
      .then(jsonData => {
        setData(jsonData);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);


  const handleEdit = (style_no: string, key: string, newValue: string) => {
    const isRowInEditedData = editedData.some(row => row.style_no === style_no);
  
    if (isRowInEditedData) {
      setEditedData(editedData.map(row => {
        if (row.style_no === style_no) {
          return { ...row, [key]: newValue };
        } else {
          return row;
        }
      }));
    } else {
      const row = data.find(row => row.style_no === style_no);
      if (row) {
        setEditedData([...editedData, { ...row, [key]: newValue }]);
      }
    }
  };
  
  const handleSave = async () => {
    let tempData = [...data];
    for (const row of editedData) {
      try {
        const response = await axios.put(`http://localhost:5000/api/style/update/${row.style_no}`, row);
        if (response.status === 200) {
          tempData = tempData.map(item => {
            if (item.style_no === row.style_no) {
              return row;
            } else {
              return item;
            }
          });
        }
      } catch (error) { 
        console.error('Error updating style:', error);
      }
    }
    setData(tempData);
    setEditedData([]); // Clear the editedData after successful save
  };
  
  const filteredData = data.filter((row) =>
  (!filter.supplierName || row.supplier_name.toLowerCase().includes(filter.supplierName.toLowerCase())) &&
  (row.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  row.style_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
  row.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
  row.color.toLowerCase().includes(searchTerm.toLowerCase()))
);


  const resetFilter = () => {
    setFilter(initialFilterState);
    setSearchTerm("");
    
  };
  const [filterModalOpen, setFilterModalOpen] = useState<boolean>(false);
  const [tempFilter, setTempFilter] = useState(initialFilterState);

  const applyFilter = () => {
    setFilterModalOpen(false);
    setFilter(tempFilter);
  }


  return (
    <>
      <Homepage setNavbarOpened={setNavbarOpened}/>
      <Grid gutter="md" className="table-wrapper">
        <Col span={12}>
          <Paper shadow="xs" className="alloc-table">
            <Table className={classes.table}>
              <thead className={classes.tableCell}>
                <tr className="tableHeader">
                  <th>
                  <Text 
                  ta="center"
                  fz="lg"
                  fw={600}>
               
                    Supplier Name
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
                </tr>
              </thead>
              <tbody className={classes.tableCell}>
                {Array.isArray(filteredData) && filteredData.map((row, index) => (
                  <tr key={index} className={classes.tableCell}>
                    <td>{row.supplier_name}</td>
                    <td>{row.style_no}</td>
                    <td><Input defaultValue={row.description} onBlur={(e) => handleEdit(row.style_no, 'description', e.target.value)} variant="unstyled" /></td>
                    <td><Input defaultValue={row.color} onBlur={(e) => handleEdit(row.style_no, 'color', e.target.value)} variant="unstyled"/></td>
                    <td><Input defaultValue={row.cost.toString()} onBlur={(e) => handleEdit(row.style_no, 'cost', e.target.value)} variant="unstyled"/></td>
                    <td><Input defaultValue={row.msrp.toString()} onBlur={(e) => handleEdit(row.style_no, 'msrp', e.target.value)} variant="unstyled"/></td>
                  </tr>
                ))}
              </tbody>
            </Table>
           
          </Paper>
        </Col>
        <div className={classes.fixedBar}>
          <Grid gutter="xs" >
            
          <Col span={1} >
              <Button onClick={handleSave} leftIcon={<IconDeviceFloppy/>} variant="subtle" color="dark">Save</Button>
            </Col>
            <Col span={9}>
              <Input 
                placeholder="Global search..." 
                onChange={(event) => {
                  setSearchTerm(event.currentTarget.value.toLowerCase());
                }} 
              />
            </Col>
            <Col span={1}>
            <Button onClick={() => setFilterModalOpen(true)} leftIcon={<IconFilter/>} variant="subtle" color="dark" uppercase>Filter</Button>
            </Col>
            <Modal  
              title= 'Filter'
              opened={filterModalOpen}
              onClose={() => setFilterModalOpen(false)}
              centered>
            <Group position='center'>
            <Input
                placeholder="Filter by Supplier Name"
                value={tempFilter.supplierName}
                onChange={(event) => setTempFilter({ ...tempFilter, supplierName: event.currentTarget.value })}
              />
            
            <Button onClick={applyFilter}>Apply</Button>
            </Group>
            </Modal>
            <Col span={1}>
            <Button 
            leftIcon={<IconFilterX/>}
              title="Reset Filter"
              onClick={resetFilter}
              variant="subtle" color="dark"
               />
            </Col>
            
           
            
          </Grid>
        </div>
      </Grid>
    </>
  );
}

export default StylesTable;
