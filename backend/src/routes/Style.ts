import express,  { Request, Response } from 'express';
import Style from '../database/style';
import Supplier from '../database/supplier';

const router = express.Router();
router.post('/create', async (req: Request, res: Response) => {
  const { supplierName, styleNo, description, color, cost, msrp } = req.body;

  // Validate if the supplier exists
  const supplierData = await Supplier.findOne({ where: { supplier_name: supplierName } });
  if (!supplierData) {
    return res.status(400).json({ error: 'Supplier not found' });
  }

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
      msrp: msrp
     
    });

    res.status(200).json(newStyleData);
  }
});


export default router; 
