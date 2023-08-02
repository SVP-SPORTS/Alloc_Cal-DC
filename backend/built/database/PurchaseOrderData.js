import { Model, DataTypes } from "sequelize";
import sequelize from "../sequelize";
import Supplier from "./SupplierData";
class PurchaseOrder extends Model {
    po_no;
    supplier_name;
    createdAt;
    updatedAt;
}
PurchaseOrder.init({
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
}, {
    tableName: "purchaseOrders",
    sequelize,
});
// Relationships
PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplier_name', targetKey: 'supplier_name' });
export default PurchaseOrder;
