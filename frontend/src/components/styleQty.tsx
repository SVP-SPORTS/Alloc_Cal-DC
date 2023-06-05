import { Grid, Table, Paper, Col, Input, Button, Modal, createStyles, Group } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import "./AllocTable.css";
import HomePage from './parent';

interface ReceivedQuantity {
  size: string;
  quantity: number;
}

interface StyleQuantitiesRow {
  style_no: string;
  supplier_name: string;
  receivedQuantities: ReceivedQuantity[];
  total: number;
  totalAllocation: number;
  overstock: number;
  po_no: string;
  styleQty_id: number;
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
    background: '#fff',
    padding: '10px 0',
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
    border: '1px solid',
  },
  tableCell: {
    border: '1px solid',
  },
}));

const StyleQuantitiesTable: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { classes, cx } = useStyles();
  const [data, setData] = useState<StyleQuantitiesRow[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filter, setFilter] = useState(initialFilterState);

  useEffect(() => {
    fetch('http://localhost:5000/api/styleqty/get')
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
    (!filter.supplierName || row.supplier_name.toLowerCase().includes(filter.supplierName.toLowerCase())) &&
    (!filter.poNo || row.po_no.toLowerCase().includes(filter.poNo.toLowerCase()))
  );

  const applyFilter = () => {
    setFilterModalOpen(false);
    setFilter(tempFilter);
  }

  return (
    <>
    <HomePage/>
      <Grid gutter="md" className="gridContainer">
        <Col span={12}>
        <Paper shadow="xs"  className={classes.tableContainer}>
  <Table className={classes.table}>
              <thead className={classes.tableCell}>
                <tr className="tableHeader">
                  <th className={classes.tableCell}>Style No</th>
                  <th className={classes.tableCell}>Supplier Name</th>
                  <th className={classes.tableCell}>Size</th>
                  <th className={classes.tableCell}>Quantity</th>
                  <th className={classes.tableCell}>Total</th>
                  <th className={classes.tableCell}>Total Allocation</th>
                  <th className={classes.tableCell}>Overstock</th>
                  <th style={{ borderLeft: '1px  solid'}}>PO No</th>
                </tr>
              </thead>
              <tbody className={classes.tableCell}>
              {Array.isArray(filteredData) && filteredData
  .filter((row) => row.style_no.toLowerCase().includes(searchTerm.toLowerCase()))
  .flatMap((row, index) => (
    row.receivedQuantities.map((rq, rqIndex) => (
                    <tr key={`${index}-${rqIndex}`} className={classes.tableCell}>
                      <td className={classes.tableCell}>{row.style_no}</td>
                      <td className={classes.tableCell}>{row.supplier_name}</td>
                      <td className={classes.tableCell}>{rq.size}</td>
                      <td className={classes.tableCell}>{rq.quantity}</td>
                      <td className={classes.tableCell}>{row.total}</td>
                      <td className={classes.tableCell}>{row.totalAllocation}</td>
                      <td className={classes.tableCell}>{row.overstock}</td>
                      <td style={{ borderLeft: '1px  solid', border:'1px solid'}}>{row.po_no}</td>
                     
                    </tr>
                  ))
                ))}
              </tbody>
            </Table>
          </Paper>
        </Col>
        <div className={classes.fixedBar}>
        <Grid gutter="md" >
          <Col span={10}>
          <Input
              placeholder="Search by Style No"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.currentTarget.value)}
            />
          </Col>
          <Col span={1}>
            <Button onClick={() => setFilterModalOpen(true)}>Filter</Button>
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
            
               />
          </Col>
        </Grid>
      </div>
      </Grid>
    </>
  );
}

export default StyleQuantitiesTable;
