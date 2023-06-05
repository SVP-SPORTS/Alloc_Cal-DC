import { Model, DataTypes } from "sequelize";
import sequelize from "../sequelize";


class Store extends Model {
  public store_id!: number;
  public store_name!: string;
  
  // Add this. It won't be used for database, but will provide autocompletion and type safety

} 

Store.init({
  store_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    unique : true
  },
  storeName: {
    type: new DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    primaryKey: true,
    onUpdate: 'CASECADE' 
  },

}, {
  tableName: "stores",
  sequelize, // passing the `sequelize` instance is required
});
 
// Add this after initializing the Store model


export default Store;
