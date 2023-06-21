import express from 'express';
import Supplier from '../database/SupplierData';
import { Op } from 'sequelize'; 

const router = express.Router();

router.post('/add', async (req, res) => {
  const { supplier_name } = req.body;

  // Check if the supplier already exists
  const existingSupplier = await Supplier.findOne({ where: { supplier_name } });

  if (existingSupplier) {
    return res.status(400).json({ error: 'Supplier already exists' });
  }

  try {
    const newSupplier = await Supplier.create({ supplier_name });
    res.status(201).json(newSupplier);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});


  

router.get('/', async (req, res) => {
  const supplier_name = req.params;

  try {
    const supplier = await Supplier.findAll(supplier_name);

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    return res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve supplier' });
  }
});





export default router;
