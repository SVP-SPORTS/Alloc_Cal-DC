import express, { Request, Response } from 'express';
import sequelize from '../sequelize'; 
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


export default router;
    