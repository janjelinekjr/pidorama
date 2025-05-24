import express from 'express';
import { getAndFilterLines, getLinesFulltextSearch } from '../controllers/lineController';

const router = express.Router();

router.route('/').post(getAndFilterLines);
router.route('/search').post(getLinesFulltextSearch);

export default router;
