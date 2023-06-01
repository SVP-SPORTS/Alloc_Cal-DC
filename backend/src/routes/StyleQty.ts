import express,  { Request, Response } from 'express';
import StyleQuantities from '../database/styleqty';
import Supplier from '../database/supplier';

const router = express.Router();
router.post('/add', async (req: Request, res: Response) => {
  const { supplierName, styleNo,  receivedQuantities, total, totalAllocation, overstock, poNo, allocation_id } = req.body;

  // Validate if the supplier exists
  const supplierData = await Supplier.findOne({ where: { supplier_name: supplierName } });
  if (!supplierData) {
    return res.status(400).json({ error: 'Supplier not found' });
  }


  try{
  
    const newstyleqtyData = await StyleQuantities.create({
      supplier_name: supplierName,
      style_no: styleNo,      
      receivedQuantities, 
      total,
      totalAllocation,
      overstock,
      po_no : poNo,
      allocation_id
    });
    res.status(200).json(newstyleqtyData);
} catch {
    res.status(500).json("Hardik You are failed.")
}

    
   
});
 

export default router; 