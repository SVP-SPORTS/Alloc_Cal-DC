import { Model, DataTypes } from 'sequelize';
import sequelize from "../sequelize"; 
import Supplier from './supplier';
import Style from './style';
import PurchaseOrder from './po';
import Store from './store';

class Data extends Model {
  public storeName!: string;
  public sizeQuantities!: any; 
  public standardQuantity!: number;
  public total! : number;
  public po_no!: string;
 public allocation_id! : number;
}

Data.init({
  allocation_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  
  storeName: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Store,
      key: "storeName"
    }
  },
  sizeQuantities: {
    type: DataTypes.JSONB,
    allowNull: false
  },
 
  total: { 
    type: DataTypes.INTEGER,
    allowNull: false
  },
  po_no: {   
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: PurchaseOrder,
      key: "po_no"
    },
    onUpdate:"CASECADE"
  },
  supplier_name: { 
    type: DataTypes.STRING, 
    allowNull: false,
   
  },
  style_no: {  
    type: DataTypes.STRING,
    allowNull: false,
  
  },
 
 
}, {
  sequelize, // passing the `sequelize` instance is required
  tableName: "data", // Replace with your custom table name
  
});

Data.belongsTo(PurchaseOrder, { foreignKey: 'po_no', targetKey: 'po_no' });
Data.belongsTo(Style, { foreignKey: 'style_no', as: 'styles' }); 
Data.belongsTo(Store, { foreignKey: 'storeName', as: 'stores'})
  
export default Data; 