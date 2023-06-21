import express from 'express';
import bodyParser from 'body-parser';
import supplierRoutes from "./routes/supplierRoute";
import styleRoutes from "./routes/styleRoute";
import sequelize from './sequelize';
import Style from './database/StyleData';
import dataRoutes from "./routes/Trial"; 
import cookieParser from "cookie-parser";
import './associations';
import Data from './database/trial';
import poRoutes from "./routes/purchaseOrderRoute";
import PurchaseOrder from './database/PurchaseOrderData';
import Store from './database/StorePushData';
import storeRoutes from './routes/storePushRoute';
import allRoutes from './routes/allocationRoute';
import Allocation from './database/AllocationData';
import AuthRoutes from './Auth/authRoute';
import User from './Auth/user';
import passport from 'passport';
import expressSession from 'express-session';
import SequelizeStoreFactory from 'connect-session-sequelize';


const cors = require ('cors');



const SequelizeStore = SequelizeStoreFactory(expressSession.Store);


const app = express();
const port = process.env.PORT || 5055;

const sharedSecret = process.env.SESSION_SECRET || "Shared Secret";
//replace with your session secret

const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: "user_sessions",
  checkExpirationInterval: 15 * 60 * 1000, 
  expiration: 86400  
});

app.use(
  expressSession({
    store: sessionStore,
    secret: sharedSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 86400
    }
  })
);



app.use(bodyParser.json()); 

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate("session"));
 
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));

app.use(cors({
  origin: 'http://localhost:3000', // replace with your client app's URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // allowed HTTP methods
}));
//app.use ('/api/supplier', supplierRoutes);
app.use('/api/style', styleRoutes);
app.use('/api/supplier/', supplierRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/tabledata', dataRoutes); 
app.use('/api/po', poRoutes);
app.use('/api/search', dataRoutes);
app.use('/api/allocation', allRoutes);
app.use("/api/auth", AuthRoutes);

const initDatabase = async () => { 
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Drop existing tables and recreate them
     await User.sync({alter: false});
     sessionStore.sync({alter: true});
    await Store.sync({alter: false});    
    await Style.sync({alter: false}); 
   // await StyleQuantities.sync({alter: false});
    await PurchaseOrder.sync({alter:false});
    await Data.sync({alter: false});  
    //await StoreData.sync({alter:true});
    await Allocation.sync({alter: false});  
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


