// routes/store.ts

import express from 'express';
import Store from '../database/store'; // adjust the path according to your file structure

const router = express.Router();

// Create a new store
router.post('/', async (req, res) => {
  const { storeName } = req.body;
  
  // Check if the store already exists
  const existingStore = await Store.findOne({ where: { storeName } });
  
  if (existingStore) {
    return res.status(409).json({ error: 'Store with this name already exists' });
  }

  try {
    const newStore = await Store.findOrCreate({  where: { storeName } });
    res.status(201).json(newStore);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create store' });
  }
});

export default router;
 
 

   