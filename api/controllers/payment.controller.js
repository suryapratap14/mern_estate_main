import Payment from "../models/payment.model.js";

export const savePayment = async (req, res, next) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    res.status(201).json({ success: true, data: payment });
  } catch (error) { next(error); }
};

export const getPaymentsForUser = async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: payments });
  } catch (error) { next(error); }
};

export const adminGetAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: payments });
  } catch (error) { next(error); }
};
