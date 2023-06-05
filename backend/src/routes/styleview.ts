import express, { Request, Response } from 'express';
import sequelize from '../sequelize'; 
import Data from '../database/trial';
import Store from '../database/store';
const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const { style_no, po_no } = req.query;

  if (!style_no || !po_no) {
    return res.status(400).json({ error: "Missing style number or purchase order number" });
  }
 
  try {
    const results = await sequelize.query(
      'SELECT * FROM summary WHERE LOWER(style_no) = LOWER(:style_no) AND LOWER(po_no) = LOWER(:po_no)',  
      { 
        type:'SELECT',
        replacements: { style_no, po_no },
      }
    );
    res.json(results);
  } catch (error) {
    console.error('An error occurred while fetching the data:', error);
    res.status(500).json({ error: 'An error occurred, please try again' });
  }
}); 


router.post('/push-to-store', async (req: Request, res: Response) => {
  const { storeName } = req.body;

  // Retrieve the data for the store
  const data = await Data.findOne({ where: { storeName } });

  // Check if the data exists
  if (!data) {
    return res.status(404).json({ error: 'Data not found' });
  }

  // Extract the data
  const { style_no, sizeQuantities, total, supplier_name } = data as any;


  // Create a new row in the stores table
  try {
    const newStore = await Store.create({ 
      storeName, 
      style_no,
      sizeQuantities, 
      total, 
      supplier_name
    });
    res.status(201).json(newStore);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create store' });
  }
});




export default router;
    