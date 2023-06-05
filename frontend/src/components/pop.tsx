import React, { useState } from 'react';
import { DataTable } from './user'; 
import { TextInput, Button, Grid, Col, Group, Center } from '@mantine/core';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const DataSearch: React.FC = () => {
  const [po_no, setPo_no] = useState("");
  const [style_no, setStyle_no] = useState("");
  
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    if (po_no && style_no) {
      try {
        const response = await axios.get(`http://localhost:5000/api/summary/?po_no=${po_no}&style_no=${style_no}`);
        const fetchedData = response.data;
        setData(fetchedData);
      } catch (error) {
        console.error('An error occurred while fetching the data:', error);
        setData(null);
      }
    }
  };

  const pushData = () => {
    navigate("/storedata", { state: { data: data } });
  };
  
  return (
    <div>
      <Grid gutter="lg" justify="center">
        <Col span={4}>
          <TextInput
            placeholder="PO number"
            value={po_no}
            onChange={e => setPo_no(e.target.value.toLowerCase())}
          />
          <TextInput
            placeholder="Style number"
            value={style_no}
            onChange={e => setStyle_no(e.target.value.toLowerCase())}
          />
        </Col>
      </Grid>
      <Center style={{marginTop: "15px", marginBottom:"10px"}}>
        <Group position="center" spacing="lg">
          <Button onClick={fetchData}>Search</Button>
          {data && <Button onClick={pushData}>Push</Button>}
        </Group>
      </Center>
      {data && <DataTable data={data} />}
    </div>
  );
};
