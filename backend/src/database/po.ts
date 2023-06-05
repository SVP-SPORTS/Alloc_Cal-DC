import { Model, DataTypes } from "sequelize";
import sequelize from "../sequelize";
import Supplier from "./supplier";

class PurchaseOrder extends Model {
  public po_no!: string;
  public supplier_name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PurchaseOrder.init(
  {
    po_no: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    supplier_name: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Supplier,
        key: "supplier_name",
         
      }
        },
  },
  {
    tableName: "purchaseOrders",
    sequelize,
  }
);

// Relationships
PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplier_name', targetKey: 'supplier_name' });

export default PurchaseOrder;
