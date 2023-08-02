import { DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize';

class User extends Model {
  public _id!: string;
  public email!: string;
  public password!: string;
  public first_name!: string;
  public last_name!: string;
  public scope!: 'User' | 'Admin' | 'SuperAdmin';
  public location!: string;
}

User.init({
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  scope: {
    type: DataTypes.ENUM('User', 'Admin', 'SuperAdmin'),
    defaultValue: 'Admin'
  },
  location : {
    type: DataTypes.STRING,
    defaultValue: 'DC'
  }
  
}, {
  sequelize,
  modelName: 'User', 
  tableName: 'users',
  timestamps: false,
});

export default User;
 