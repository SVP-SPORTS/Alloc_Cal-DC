import { Model, DataTypes } from 'sequelize';
import sequelize from "../sequelize";
import Supplier from './SupplierData';
import Style from './StyleData';
import PurchaseOrder from './PurchaseOrderData';
class Allocation extends Model {
    allocation_id;
    sku;
    storeName;
    sizeQuantities;
    receivedQty;
    total;
    totalAllocationPerSize;
    overstockPerSize;
    style_no;
    supplierName;
    poNo;
    location;
    initial;
    skuNumbers;
    first_name;
}
Allocation.init({
    allocation_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    skuNumbers: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    storeName: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    sizeQuantities: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    receivedQty: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    total: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    totalAllocationPerSize: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    overstockPerSize: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    style_no: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Style,
            key: "style_no"
        },
        onUpdate: "CASECADE"
    },
    initial: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
    supplierName: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Supplier,
            key: "supplier_name"
        }
    },
    poNo: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: PurchaseOrder,
            key: "po_no"
        },
        onUpdate: "CASECADE"
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    tableName: "allocations",
});
Allocation.belongsTo(PurchaseOrder, { foreignKey: 'poNo', targetKey: 'po_no' });
Allocation.belongsTo(Style, { foreignKey: 'style_no', as: 'styles' });
Allocation.belongsTo(Supplier, { foreignKey: 'supplierName', as: 'suppliers' });
export default Allocation;
