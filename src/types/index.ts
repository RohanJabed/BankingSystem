export type UserRole = "ADMIN" | "STAFF" | "CUSTOMER";
export type AccountType = "SAVINGS" | "CURRENT" | "BUSINESS";
export type AccountStatus = "ACTIVE" | "FROZEN" | "CLOSED";
export type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "LOAN_DISBURSEMENT" | "LOAN_REPAYMENT";
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "REVERSED";
export type LoanStatus = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "ACTIVE" | "COMPLETED";
export type LoanType = "PERSONAL" | "BUSINESS" | "MORTGAGE" | "AUTO" | "EDUCATION";
export type EmploymentStatus = "EMPLOYED" | "SELF_EMPLOYED" | "UNEMPLOYED" | "RETIRED" | "STUDENT";
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  role: UserRole;
  isActive: boolean;
  isBlocked: boolean;
  transactionPin?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAccount {
  _id: string;
  accountNumber: string;
  accountType: AccountType;
  status: AccountStatus;
  balance: number;
  userId: string | IUser;
  dailyTransferLimit: number;
  maxSingleTransactionAmount: number;
  minimumBalance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITransaction {
  _id: string;
  transactionRef: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  fee: number;
  senderAccountId?: string | IAccount;
  receiverAccountId?: string | IAccount;
  description: string;
  idempotencyKey?: string;
  isFlagged: boolean;
  flagReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ILoan {
  _id: string;
  userId: string | IUser;
  accountId: string | IAccount;
  loanType: LoanType;
  requestedAmount: number;
  approvedAmount?: number;
  interestRate: number;
  durationMonths: number;
  monthlyIncome: number;
  employmentStatus: EmploymentStatus;
  description: string;
  status: LoanStatus;
  reviewedBy?: string | IUser;
  approvedBy?: string | IUser;
  disbursedAt?: string;
  notes?: string;
  repaymentSchedule?: IRepaymentSchedule[];
  outstandingBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface IRepaymentSchedule {
  dueDate: string;
  amount: number;
  isPaid: boolean;
  paidAt?: string;
  transactionId?: string;
}

export interface IDepositRequest {
  _id: string;
  userId: string | IUser;
  accountId: string | IAccount;
  amount: number;
  description: string;
  status: RequestStatus;
  reviewedBy?: string | IUser;
  reviewNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IWithdrawalRequest {
  _id: string;
  userId: string | IUser;
  accountId: string | IAccount;
  amount: number;
  description: string;
  status: RequestStatus;
  reviewedBy?: string | IUser;
  reviewNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: "TRANSFER" | "DEPOSIT" | "WITHDRAWAL" | "LOAN" | "SYSTEM";
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

export interface IAuditLog {
  _id: string;
  performedBy: string | IUser;
  action: string;
  targetModel: string;
  targetId: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface IBankingSettings {
  _id: string;
  defaultDailyTransferLimit: number;
  defaultMaxSingleTransaction: number;
  defaultMinimumBalance: number;
  loanInterestRate: number;
  transactionFeePercent: number;
  updatedBy?: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalAccounts: number;
  totalBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalTransactions: number;
  pendingLoans: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
}

export interface ChartDataPoint {
  month: string;
  deposits: number;
  withdrawals: number;
  transfers: number;
  total: number;
}
