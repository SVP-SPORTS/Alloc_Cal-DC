import express,  { NextFunction, Request, Response } from 'express';
import Style from '../database/StyleData';
import Supplier from '../database/SupplierData';
import sequelize from '../sequelize';




import { checkScope, isAuthenticated } from '../Auth/authMiddleware';

const router = express.Router();




router.post('/create', isAuthenticated, checkScope('Admin'), async (req: Request, res: Response) => {
  const { supplierName, styleNo, description, color, cost, msrp } = req.body;



  // Validate if the supplier exists
  const supplierData = await Supplier.findOne({ where: { supplier_name: supplierName } });
  if (!supplierData) {
    return res.status(400).json({ error: 'Supplier not found' });
  }

  // Extracting firstName and location from the user session
  const { first_name, location } = req.user as IUserSessionInfo;

  const transaction = await sequelize.transaction();

  // Check if a style with the given styleNo exists
  let styleData = await Style.findOne({ where: { style_no: styleNo } });

  if (styleData) {
    // If style exists, return the existing data
    res.status(200).json(styleData);
  } else {
    // If style does not exist, create new style
    const newStyleData = await Style.create({
      supplier_name: supplierName, 
      style_no: styleNo, 
      description: description,
      color: color,
      cost: cost,
      msrp: msrp,
      first_name,  // added firstName
      location,   // added location
    }, { transaction });

    await transaction.commit();
    res.status(200).json(newStyleData);
  }
  
});

router.get('/get',async (req: Request, res: Response) => {
  try {
      const stylesData = await Style.findAll();
      res.status(200).json(stylesData);
  } catch (error) {
    
      console.error('Error fetching styles:', error);
      res.status(500).json({ error: 'An error occurred while fetching styles.' });
  }
});

router.put('/update/:styleNo',isAuthenticated, checkScope('Admin'), async (req: Request, res: Response) => {
  const { description, color, cost, msrp } = req.body;
  const { location } = req.user as IUserSessionInfo;

  // Check if a style with the given styleNo exists
  let styleData = await Style.findOne({ where: { style_no: req.params.styleNo, location } });

  if (!styleData) {
    // If style does not exist, return error
    return res.status(404).json({ error: 'Style not found' });
  } 
 
  // Update style
  await Style.update({
    description: description,
    color: color,
    cost: cost,
    msrp: msrp 
  }, {
    where: { style_no: req.params.styleNo }
  });

  const updatedStyleData = await Style.findOne({ where: { style_no: req.params.styleNo, location } });
  res.status(200).json(updatedStyleData);
});

// Read style data by style_no
router.get('/style_no/:style_no', async (req: Request, res: Response) => {
  const { location } = req.user as IUserSessionInfo;

  const style = await Style.findOne({
    where: {
      style_no: req.params.style_no,
      location
    }
  });

  if (!style) return res.status(404).json({ message: "Style not found" });

  res.status(200).json(style);
});




export default router; 
