const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// @desc    Get all transactions for logged in user with optional filters
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const { category, type, startDate, endDate, search, sortBy, order, page = 1, limit = 50 } = req.query;

    const query = { user: req.user._id };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (type && type !== 'All') {
      query.type = type.toLowerCase();
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions = {};
    const sortField = sortBy || 'date';
    const sortOrder = order === 'asc' ? 1 : -1;
    sortOptions[sortField] = sortOrder;

    const skip = (Number(page) - 1) * Number(limit);

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)) || 1,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this transaction' });
    }

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, category, date, paymentMethod, notes } = req.body;

    if (!title || amount === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, amount, and category',
      });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      amount: Number(amount),
      type: type ? type.toLowerCase() : 'expense',
      category,
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || 'Credit Card',
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this transaction' });
    }

    const { title, amount, type, category, date, paymentMethod, notes } = req.body;

    if (title) transaction.title = title;
    if (amount !== undefined) transaction.amount = Number(amount);
    if (type) transaction.type = type.toLowerCase();
    if (category) transaction.category = category;
    if (date) transaction.date = new Date(date);
    if (paymentMethod) transaction.paymentMethod = paymentMethod;
    if (notes !== undefined) transaction.notes = notes;

    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this transaction' });
    }

    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard metrics, category breakdown, monthly trends & budget stats
// @route   GET /api/transactions/summary
// @access  Private
const getSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // 1. Overall Income vs Expense
    const totals = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    let transactionCount = 0;

    totals.forEach((item) => {
      if (item._id === 'income') {
        totalIncome = item.totalAmount;
      } else if (item._id === 'expense') {
        totalExpense = item.totalAmount;
      }
      transactionCount += item.count;
    });

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

    // 2. Current Month Spending vs Budget
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthTotals = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    let currentMonthExpense = 0;
    let currentMonthIncome = 0;
    monthTotals.forEach((item) => {
      if (item._id === 'expense') currentMonthExpense = item.totalAmount;
      if (item._id === 'income') currentMonthIncome = item.totalAmount;
    });

    const monthlyBudget = user.monthlyBudget || 2000;
    const budgetUsedPercentage = monthlyBudget > 0 ? Math.min(100, Math.round((currentMonthExpense / monthlyBudget) * 100)) : 0;
    const isOverBudget = currentMonthExpense > monthlyBudget;

    // 3. Category Breakdown (Expenses)
    const categoryAgg = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const categoryBreakdown = categoryAgg.map((c) => ({
      category: c._id,
      total: c.total,
      count: c.count,
      percentage: totalExpense > 0 ? Math.round((c.total / totalExpense) * 100) : 0,
    }));

    // 4. Monthly Trend (Past 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyTrendsAgg = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyDataMap = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthlyDataMap[key] = { label: key, income: 0, expense: 0 };
    }

    monthlyTrendsAgg.forEach((item) => {
      const monthIdx = item._id.month - 1;
      const yearShort = item._id.year.toString().slice(-2);
      const key = `${monthNames[monthIdx]} ${yearShort}`;
      if (monthlyDataMap[key]) {
        if (item._id.type === 'income') {
          monthlyDataMap[key].income = item.total;
        } else if (item._id.type === 'expense') {
          monthlyDataMap[key].expense = item.total;
        }
      }
    });

    const monthlyTrends = Object.values(monthlyDataMap);

    // 5. Recent Transactions
    const recentTransactions = await Transaction.find({ user: userId })
      .sort({ date: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      summary: {
        totalIncome,
        totalExpense,
        netBalance,
        savingsRate,
        transactionCount,
        currency: user.currency || '$',
      },
      budget: {
        monthlyBudget,
        currentMonthExpense,
        currentMonthIncome,
        budgetUsedPercentage,
        isOverBudget,
        remainingBudget: Math.max(0, monthlyBudget - currentMonthExpense),
      },
      categoryBreakdown,
      monthlyTrends,
      recentTransactions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
};
