import express from 'express';
import bodyParser from 'body-parser';
import supplierRoutes from "./routes/Supplier";
import styleRoutes from "./routes/Style";
import sequelize from './sequelize';
//import Supplier from './database/supplier';
import Style from './database/style';
import dataRoutes from "./routes/Trial"; 
import cookieParser from "cookie-parser";
import './associations';
import Data from './database/trial';
import styleqtyRoutes from "./routes/StyleQty";
import StyleQuantities from './database/styleqty';
import poRoutes from "./routes/PO";
import PurchaseOrder from './database/po';
import summaryRoutes from './routes/styleview';
import storeDataRoutes from './routes/StoreData';
//import Summary from './database/summary';
import Store from './database/store';
import storeRoutes from './routes/Store';
import StoreData from './database/storeData';
const cors = require ('cors');


const app = express();
const port = process.env.PORT || 5055;

app.use(bodyParser.json()); 

app.use(cookieParser());
app.use(express.urlencoded({extended: false}));

app.use(cors({
  origin: 'http://localhost:3000' // replace with your frontend URL
}));
//app.use ('/api/supplier', supplierRoutes);
app.use('/api/style', styleRoutes);
app.use('/api/supplier/', supplierRoutes);
app.use('/api/store', storeRoutes);

app.use('/api/tabledata', dataRoutes); 
app.use('/api/styleqty', styleqtyRoutes);
app.use('/api/po', poRoutes);
app.use('/api/search', dataRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/store_data', storeDataRoutes);

const initDatabase = async () => { 
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Drop existing tables and recreate them
     
    await Store.sync({alter: false});
    await Style.sync({alter: false}); 
    await StyleQuantities.sync({alter: false});
    await PurchaseOrder.sync({alter:false});
    await Data.sync({alter: false}); 
    await StoreData.sync({alter:true});
   // await Summary.sync({alter:false});
    console.log('Database synchronized.');
  } catch (error) {
    console.error('Unable to connect to the database:', error); 
  }
}; 

  

initDatabase();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
