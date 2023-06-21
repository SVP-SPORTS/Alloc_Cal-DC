import { Model, DataTypes } from "sequelize";
import sequelize from "../sequelize";



class Location extends Model {
  public locationId!: number;
  public locationName!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Location.init(
  {
    locationId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    locationName: {
      type: DataTypes.STRING,
      allowNull: false,
        },
  },
  {
    tableName: "Location",
    sequelize,
  }
);



export default Location;
