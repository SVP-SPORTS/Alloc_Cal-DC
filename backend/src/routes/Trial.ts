import express, { Request, Response } from 'express';
import Data from '../database/trial';// Update with the path to your store model file
import Store from '../database/StorePushData';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  const { storeName, sizeQuantities,  total, supplier_name, style_no, poNo, allocation_id } = req.body;

  // Check if all the required fields are present
  if (!storeName || !sizeQuantities  || !supplier_name || !style_no||  !total || !poNo) {
      return res.status(400).json({ message: "Missing required data" });
  } 

  try {
    const data = await Data.create({
      storeName,
      sizeQuantities,
      total,
      supplier_name,
      style_no, 
      po_no: poNo,
      allocation_id
    });
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while creating the store." });
  }
}); 

router.get('/', async (req: Request, res: Response) => {
  const { style_no, po_no } = req.query;

  if (!style_no || !po_no) {
    return res.status(400).json({ message: "Missing style number or purchase order number" });
  }

  try {
    let data = await Data.findAll({ where: { style_no, po_no } });

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    // Create a set to store unique style_no and po_no combinations
    const uniqueData = new Set();

    // Filter data to only include unique style_no, po_no, and storeName combinations
    data = data.filter(row => {
      const rowValues = row.get(); // Get plain data object from Sequelize model instance
      const uniqueKey = `${rowValues.style_no}-${rowValues.po_no}-${rowValues.storeName}`;
      if (uniqueData.has(uniqueKey)) {
        return false;
      }
      uniqueData.add(uniqueKey);
      return true;
    });

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while fetching the data." });
  }
});


router.patch('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  let store;
  try {
    store = await Store.findByPk(id);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }

  if (!store) {
    return res.status(404).json({ message: 'Store not found' });
  }

  try {
    await store.update(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }

  return res.status(200).json({ message: 'Data saved successfully' });
});

router.get('/get', async (req: Request, res: Response) => {
  try {
    let data = await Data.findAll();

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Data not found" });
    }

    const formattedData = data.map(item => {
      const sizeQuantities = item.sizeQuantities || []; // if not already an array, default to an empty array
      let sizes = [];
      let quantities = [];

      if (Array.isArray(sizeQuantities)) {
        sizes = sizeQuantities.map(qty => qty.size !== undefined ? qty.size : 'N/A');
        quantities = sizeQuantities.map(qty => qty.quantity !== undefined ? qty.quantity : 0);
      }

      return { ...item.get(), sizes, quantities };
    });

    res.status(200).json(formattedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while fetching the data." });
  }
});



export default router;
 