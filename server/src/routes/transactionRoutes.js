const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

// All transaction routes require JWT authentication
router.use(protect);

router.get('/summary', getSummary);

router.route('/')
  .get(getTransactions)
  .post(createTransaction);

router.route('/:id')
  .get(getTransactionById)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
