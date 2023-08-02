import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Text, Table, Input, Grid, Col, Paper, Textarea, TextInput } from "@mantine/core";
import { createUseStyles } from 'react-jss';
import Homepage from "../components/Navigation/parentHome";
import './AllocTable.css';

interface IUser {
  _id: string;
  email: string;
  first_name: string;
  last_name: string;
  scope: string;
  location: string;
}

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

const UserEditor: React.FC = () => {
  const classes = useStyles();
  const [users, setUsers] = useState<IUser[]>([]);
  const [editedUsers, setEditedUsers] = useState<string[]>([]);
  const [changed, setChanged] = useState<boolean>(false);
  const [navbarOpened, setNavbarOpened] = useState(false);

  const [search, setSearch] = useState<string>("");

const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSearch(e.target.value);
};

// Filter users based on search term
const filteredUsers = users.filter(
  user =>
    user.first_name.toLowerCase().includes(search.toLowerCase()) ||
    user.last_name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.scope.toLowerCase().includes(search.toLowerCase()) ||
    user.location.toLowerCase().includes(search.toLowerCase())
);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await axios.get<IUser[]>("http://localhost:5000/api/auth/users", {withCredentials:true});
      setUsers(response.data);
    };
    fetchUsers();
  }, []);

  const handleEdit = (user: IUser, field: keyof IUser, value: string) => {
    user[field] = value;
    if (!editedUsers.includes(user._id)) {
      setEditedUsers([...editedUsers, user._id]);
    }
    setUsers([...users]);
    setChanged(true);
  };

  const handleSave = async () => {
    for (const user of users.filter(user => editedUsers.includes(user._id))) {
      const updateData = { first_name: user.first_name, last_name: user.last_name, scope: user.scope, location: user.location };
      console.log("Updating user: ", user._id, "with data: ", updateData);
      await axios.put(`http://localhost:5000/api/auth/update/${user._id}`, updateData, {withCredentials:true});
    }
    setEditedUsers([]);
    setChanged(false);
  };
  
  return (
    <div>
      <Homepage setNavbarOpened={setNavbarOpened}/>
      <Grid gutter="md" className="table-wrapper">
        <Col span={12}>
        <Paper shadow="xs" className="alloc-table">
            <Table className={classes.table}>
        <thead className={classes.tableCell}>
        <tr className="tableHeader">
            <th> <Text 
                  ta="center"
                  fz="lg"
                  fw={600}>
               
                    First Name
                  </Text>  </th>
            <th> <Text 
                  ta="center"
                  fz="lg"
                  fw={600}>
               
                    Last Name
                  </Text>  </th>
            <th> <Text 
                  ta="center"
                  fz="lg"
                  fw={600}>
               
                    Email
                  </Text>  </th>
            <th> <Text 
                  ta="center"
                  fz="lg"
                  fw={600}>
               
                    Scope
                  </Text>  </th>
            <th> <Text 
                  ta="center"
                  fz="lg"
                  fw={600}>
               
                    Location
                  </Text>  </th>
          </tr>
        </thead>
        <tbody className={classes.tableCell}>
          {filteredUsers.map((user) => (
            <tr key={user._id} className={classes.tableCell}>
              <td>{user.first_name}</td>
              <td>{user.last_name}</td>
              <td>{user.email}</td>
              <td >
                <TextInput
                  value={user.scope}
                  onChange={(event) => handleEdit(user, "scope", event.currentTarget.value)}
                  variant="unstyled"
                  size="sm"
                 />
              </td>
              <td>
                <TextInput
                  value={user.location}
                  onChange={(event) => handleEdit(user, "location", event.currentTarget.value)}
                  variant="unstyled" 
                  size="sm"    
                   />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className={classes.fixedBar}>
        <Grid>
        <Col span={1}>
    
    <Button color={changed ? "red" : "blue"} onClick={handleSave} style={{marginLeft: '15px'}}>
  Save
</Button>
</Col>
          <Col span={11}>
      <TextInput
    placeholder="Search..."
    value={search}
    onChange={handleSearch}
    style={{ marginRight: "80px" }}
  />
  </Col>
 
      </Grid>
      </div>
      </Paper>
      </Col>
      </Grid>
    </div>
  );
};

export default UserEditor;
