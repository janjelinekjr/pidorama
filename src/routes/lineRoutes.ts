import express from 'express';
import { getLines } from '../controllers/lineController';
import {asyncHandler} from "../utils/generalUtils";

const router = express.Router();

router.route('/').post(asyncHandler(getLines));

export default router;
