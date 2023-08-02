import bodyParser from 'body-parser';
import express from 'express';
import authRoutes from './routes/authRoute';
import styleRoutes from "./routes/styleRoute";
import supplierRoutes from "./routes/supplierRoute";
import sequelize from './sequelize';
import SequelizeStoreFactory from 'connect-session-sequelize';
import cookieParser from "cookie-parser";
import expressSession from 'express-session';
import passport from 'passport';
import './associations';
import allRoutes from './routes/allocationRoute';
import poRoutes from "./routes/purchaseOrderRoute";
import Style from './database/StyleData';
import Allocation from './database/AllocationData';
//import Allocation from './database/AllocationData';

 

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
      maxAge: 86400 * 1000
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate("session"));

app.use(bodyParser.json());  
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));


app.use(cors({
  origin: 'http://localhost:3000', // replace with your client app's URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // allowed HTTP methods
}));
//app.use ('/api/supplier', supplierRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/style', styleRoutes);
app.use('/api/supplier/', supplierRoutes);
app.use('/api/po', poRoutes);
app.use('/api/allocation', allRoutes);



const initDatabase = async () => { 
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
//await Allocation.sync({force:true});
//await Style.sync({force:true})
   
     sessionStore.sync({alter: true});
    
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


