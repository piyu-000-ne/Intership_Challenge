const axios = require("axios");
const Transaction = require("../models/Transaction");

// Initialize Database
const initializeDatabase = async (req, res) => {
  try {
    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    await Transaction.deleteMany(); // Clear old data
    await Transaction.insertMany(response.data); // Insert new data
    res.status(200).json({ message: "Database initialized successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to initialize database" });
  }
};

// List Transactions with Search & Pagination
const listTransactions = async (req, res) => {
  try {
    const { search = "", page = 1, perPage = 10, month } = req.query;

    const query = {
      ...(month && {
        dateOfSale: {
          $gte: new Date(`2022-${month}-01`),
          $lt: new Date(`2022-${month}-31`),
        },
      }),
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { price: { $regex: search, $options: "i" } },
      ],
    };

    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(Number(perPage));

    const total = await Transaction.countDocuments(query);

    res.status(200).json({ transactions, total });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

module.exports = { initializeDatabase, listTransactions };
