import { Model, DataTypes } from 'sequelize';
import sequelize from "../sequelize";

class SKUCounter extends Model {
  public id!: number;
  public counter!: number;
}

SKUCounter.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  counter: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10000
  },
}, {
  sequelize, 
  tableName: "skuCounters",
});

export default SKUCounter;
