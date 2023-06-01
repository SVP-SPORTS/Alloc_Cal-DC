import { Model, DataTypes } from "sequelize";
import sequelize from "../sequelize";
import Style from "./style";
import Supplier from "./supplier";
import { AllowNull } from "sequelize-typescript";
import PurchaseOrder from "./po";

class StyleQuantities extends Model {
  public style_no!: string;
  public supplier_name!: string;
  public receivedQuantities!: {size: string, quantity: number}[];
  public total!: number;
  public totalAllocation! : number;
  public overstock! : number;
  public po_no!: string;
  public styleQty_id! : number;

 
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StyleQuantities.init(
  {

    styleQty_id : {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    
    style_no: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Style,
        key: "style_no"
      }
    }, 
    supplier_name: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Supplier,
        key: "supplier_name"
      }
    },
    po_no: {   
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: PurchaseOrder,
        key: "po_no"
      }
    },
    receivedQuantities: {
      type: DataTypes.ARRAY(DataTypes.JSONB),
      allowNull: false
    },
    total: { 
      type: DataTypes.INTEGER, 
      allowNull: false
    },
    totalAllocation: {
      type: DataTypes.INTEGER,
      allowNull: false 
    },
    overstock: {
      type: DataTypes.INTEGER,
      allowNull: false  
    }
  },
  {
    tableName: "styleQuantities",
    sequelize,
  }
);

// Relationships
StyleQuantities.belongsTo(Style, { foreignKey: 'style_no', targetKey: 'style_no' });
StyleQuantities.belongsTo(Supplier, { foreignKey: 'supplier_name', targetKey: 'supplier_name' });
StyleQuantities.belongsTo(PurchaseOrder, { foreignKey: 'po_no', targetKey: 'po_no' });

export default StyleQuantities;
  