import { Model, DataTypes } from "sequelize";
import sequelize from "../sequelize";
import Store from "./store";
import Supplier from "./supplier";
import Style from "./style";

class StoreData extends Model {
    public storeName!: string;
    public sizeQuantities!: any; 
    public total!: number;
    public supplier_name!: string;
    public style_no!: string;
    public store_id! : number;
  }
  
  StoreData.init({
    store_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
    allowNull: false,
    unique : true,
        primaryKey: true
    },
    storeName: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Store,
        key: 'storeName' 
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
    supplier_name: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Supplier,
        key: "supplier_name"
      }
    },
    style_no: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model : Style,
        key: "style_no"
      }
    }
  }, {
    sequelize,
    tableName: "store_data",
    timestamps: false
  });
  
  export default StoreData;