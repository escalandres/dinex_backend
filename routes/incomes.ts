import express from 'express';
import { validateBody, validateParams, validateQuery, validateHeader } from '@src/middlewares/requests.js';
import { incomesValidators } from '@validators/incomes.js';
import { getUserIncomes, registerIncome, updateIncome, deleteIncome } from '@controllers/incomes.js';

const router = express.Router();

router.get('/', validateHeader(incomesValidators.headers), getUserIncomes);
router.post('/', validateBody(incomesValidators.incomes), registerIncome);
router.put('/', validateBody(incomesValidators.incomes), updateIncome);
router.delete('/', validateBody(incomesValidators.delete), deleteIncome);

export default router;