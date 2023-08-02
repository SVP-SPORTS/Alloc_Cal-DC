import { DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize';
class Supplier extends Model {
    supplier_id;
    supplier_name;
}
Supplier.init({
    supplier_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
    },
    supplier_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
    },
}, {
    tableName: 'suppliers',
    sequelize,
});
export default Supplier;
