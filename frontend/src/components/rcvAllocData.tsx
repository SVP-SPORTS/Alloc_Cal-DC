import { Button, Grid, Table, Paper, Col, Input,  Center, Modal, Group } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import "./AllocTable.css"
import HomePage from './parent';

interface DataRow {
  storeName: string;
  supplier_name: string;
  style_no: string;
  po_no: string;
  total: number;
  sizes: string[];
  quantities: number[];
}

interface FlattenedDataRow extends Omit<DataRow, 'sizes' | 'quantities'> {
  size: string;
  quantity: number;
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
    background: '#fff',
    padding: '10px 0',
    boxShadow: '0px -2px 10px rgba(0,0,0,0.1)'
  },
 
});

const AllocTable: React.FC = () => {
  const classes = useStyles();
  const [data, setData] = useState<FlattenedDataRow[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  //const [filter, setFilter] = useState<{storeName?: string, supplierName?: string, styleNo?: string, poNo?: string}>({});
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);
  const [filter, setFilter] = useState(initialFilterState);

  useEffect(() => {
    fetch('http://localhost:5000/api/tabledata/get')
      .then(response => response.json())
      .then(jsonData => {
        const flattenedData = jsonData.reduce((acc: FlattenedDataRow[], row: DataRow) => {
          row.sizes.forEach((size, index) => {
            acc.push({
              ...row,
              size: size,
              quantity: row.quantities[index]
            });
          });
          return acc;
        }, []);
        setData(flattenedData);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const filteredData = data.filter((row) =>
    (filter.storeName ? row.storeName.toLowerCase().includes(filter.storeName.toLowerCase()) : true) &&
    (filter.supplierName ? row.supplier_name.toLowerCase().includes(filter.supplierName.toLowerCase()) : true) &&
    (filter.poNo ? row.po_no.toLowerCase().includes(filter.poNo.toLowerCase()) : true) &&
    (filter.styleNo ? row.style_no.toLowerCase().includes(filter.styleNo.toLowerCase()) : true) &&
    (searchTerm ? (
      row.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.style_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.po_no.toLowerCase().includes(searchTerm.toLowerCase())
    ) : true)
  );


  return (
    <>
    <HomePage/>
      <Grid  className="gridContainer">
        <Col span={12}>
          <Paper shadow="xl" className="tableContainer">
            <Table>
              <thead >
                <tr className="tableHeader">
                  <th>Store Name</th>
                  <th>Supplier Name</th>
                  <th>Style No</th>
                  <th>PO No</th>
                  <th>Total</th>
                  <th>Size</th>
                  <th style={{ borderLeft: '1px  solid'}}>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(filteredData) && filteredData.map((row, index, arr) => (
                  <tr key={index} className="tableRow">
                    <td>{index === 0 || row.storeName !== arr[index - 1].storeName ? row.storeName : null}</td>
                    <td>{index === 0 || row.supplier_name !== arr[index - 1].supplier_name ? row.supplier_name : null}</td>
                    <td>{index === 0 || row.style_no !== arr[index - 1].style_no ? row.style_no : null}</td>
                    <td>{index === 0 || row.po_no !== arr[index - 1].po_no ? row.po_no : null}</td>
                    <td>{index === 0 || row.total !== arr[index - 1].total ? row.total : null}</td>
                    <td  >{row.size}</td>
                    <td style={{ borderLeft: '1px  solid'}}>{row.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Paper>
        </Col>
      </Grid>
      <div className={classes.fixedBar}>
        <Grid gutter="xs" >
          <Col span={11}>
            <Input placeholder="Global search..."  onChange={(event) => {
              setSearchTerm(event.currentTarget.value);
              setFilter(initialFilterState);
            }} />
          </Col>
          <Col span={1}>
            <Button onClick={() => setIsFilterVisible(true)} >Show filter</Button>
          </Col>
        </Grid>
      </div>
      <Center>
      <Modal
          centered
          opened={isFilterVisible}
          onClose={() => setIsFilterVisible(false)}
        >
       <Group position='center'>
            <Input placeholder="Store name..." onChange={(e) => setFilter({...filter, storeName: e.currentTarget.value})} />
            <Input placeholder="Supplier name..." onChange={(e) => setFilter({...filter, supplierName: e.currentTarget.value})} />
            <Input placeholder="PO number..." onChange={(e) => setFilter({...filter, poNo: e.currentTarget.value})} />
            <Input placeholder="Style number..." onChange={(e) => setFilter({...filter, styleNo: e.currentTarget.value})} />
            <Button style={{ alignSelf: "center" }} onClick={() => setIsFilterVisible(false)}>Apply</Button>
          </Group>
        </Modal>
      </Center>
    </>
  );
}

export default AllocTable;
