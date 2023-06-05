import { Model, DataTypes } from "sequelize";
import sequelize from "../sequelize";
import Supplier from "./supplier";

class Style extends Model {
  public style_id!: number;
  public supplier_id!: number;
  public style_no!: string;
  public description!: string;
  public color!: string;
  public cost!: number;
  public msrp!: number;
  public total_qty!: number;
}

Style.init(
  {
    
    supplier_name: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: Supplier, // reference to the Supplier model
          key: "supplier_name",
          
        },
        onUpdate:"CASECADE"
      },
    style_no: {
      type: new DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,  
    },
    description: {
      type: new DataTypes.TEXT,
      allowNull: false,
    },
    color: {
      type: new DataTypes.STRING(255),
      allowNull: false, 
    }, 
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    msrp: {  
      type: DataTypes.DECIMAL(10, 2), 
      allowNull: false,
    },
      
    
  },
  {
    tableName: "styles",
    sequelize, // passing the `sequelize` instance is required
  }
);



export default Style; 