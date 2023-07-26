import express, { Request, Response } from 'express';
import { ColorService } from '../../../services/db/psql/color';

const router = express.Router();
router.get('/api/v1/product/colors/', async (req: Request, res: Response) => {
	const colorService = await ColorService.getInstance();
	const result = await colorService.findAll();
	res.status(200).send({ result });
});

export { router as getColorRouter };
