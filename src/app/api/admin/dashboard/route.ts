import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import Loan from "@/models/Loan";
import Deposit from "@/models/Deposit";
import Withdrawal from "@/models/Withdrawal";
import { requireRole, handleAuthError } from "@/lib/auth/session";

export async function GET() {
  try {
    await requireRole(["ADMIN"]);
    await connectDB();

    const [
      totalCustomers,
      totalAccounts,
      totalTransactions,
      pendingLoans,
      pendingDeposits,
      pendingWithdrawals,
      balanceAgg,
      depositAgg,
      withdrawalAgg,
      monthlyData,
    ] = await Promise.all([
      User.countDocuments({ role: "CUSTOMER" }),
      Account.countDocuments(),
      Transaction.countDocuments(),
      Loan.countDocuments({ status: { $in: ["PENDING", "UNDER_REVIEW"] } }),
      Deposit.countDocuments({ status: "PENDING" }),
      Withdrawal.countDocuments({ status: "PENDING" }),
      Account.aggregate([{ $group: { _id: null, total: { $sum: "$balance" } } }]),
      Transaction.aggregate([{ $match: { type: "DEPOSIT", status: "COMPLETED" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Transaction.aggregate([{ $match: { type: "WITHDRAWAL", status: "COMPLETED" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Transaction.aggregate([
        { $match: { status: "COMPLETED", createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } } },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, type: "$type" },
            total: { $sum: "$amount" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

    // Build monthly chart data
    const monthMap: Record<string, { month: string; deposits: number; withdrawals: number; transfers: number; total: number }> = {};
    for (const item of monthlyData) {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
      if (!monthMap[key]) {
        monthMap[key] = { month: key, deposits: 0, withdrawals: 0, transfers: 0, total: 0 };
      }
      if (item._id.type === "DEPOSIT") monthMap[key].deposits += item.total;
      else if (item._id.type === "WITHDRAWAL") monthMap[key].withdrawals += item.total;
      else if (item._id.type === "TRANSFER") monthMap[key].transfers += item.total;
      monthMap[key].total += item.total;
    }

    return NextResponse.json({
      success: true,
      data: {
        totalCustomers,
        totalAccounts,
        totalBalance: balanceAgg[0]?.total ?? 0,
        totalDeposits: depositAgg[0]?.total ?? 0,
        totalWithdrawals: withdrawalAgg[0]?.total ?? 0,
        totalTransactions,
        pendingLoans,
        pendingDeposits,
        pendingWithdrawals,
        monthlyChart: Object.values(monthMap),
      },
    });
  } catch (e) {
    return handleAuthError(e);
  }
}
