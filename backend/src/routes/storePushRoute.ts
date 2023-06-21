import express from 'express';
import Store from '../database/StorePushData'; // adjust the path according to your file structure

const router = express.Router();

// Create or update store data
router.post('/store-data', async (req, res) => {
  console.log(req.body); 
  try {
    const { storeName, style_number, supplierName, poNo, sizeQuantities, total } = req.body;
    let store = await Store.findByPk(storeName);

    if (store) {
      // Update existing store data
      store = await store.update({ style_number, supplierName, poNo, sizeQuantities, total });
    } else {
      // Create new store data
      store = await Store.create({ storeName, style_number, supplierName, poNo, sizeQuantities, total });
    }

    res.json(store);
  } catch (error) {
    console.error(error); // log the error to the console
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
  
}); 

//UPDATE
router.put('/store-data/:storeName', async (req, res) => {
  try {
    const { storeName, style_number, supplierName, poNo, sizeQuantities, total } = req.body;
    let store = await Store.findByPk(req.params.storeName);

    if (!store) {
      return res.status(404).json({ error: 'Store not found.' });
    }
    
    // Update existing store data
    await Store.update({ style_number, supplierName, poNo, sizeQuantities, total }, {
      where: { storeName: req.params.storeName }
    });

    // Retrieve the updated store data
    store = await Store.findByPk(req.params.storeName);

    res.json(store);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});



// Fetch store data by name
router.get('/store-data/:storeName', async (req, res) => {
  try {
    const { storeName } = req.params;
    const store = await Store.findByPk(storeName);

    if (!store) {
      res.status(404).json({ error: 'Store not found.' });
    } else {
      res.json(store);
    }
  } catch (error) {
    console.error(error); // log the error to the console
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});


export default router;
