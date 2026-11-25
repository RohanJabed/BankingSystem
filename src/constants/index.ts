export const ACCOUNT_TYPES = ["SAVINGS", "CURRENT", "BUSINESS"] as const;
export const USER_ROLES = ["ADMIN", "STAFF", "CUSTOMER"] as const;
export const LOAN_TYPES = ["PERSONAL", "BUSINESS", "MORTGAGE", "AUTO", "EDUCATION"] as const;
export const EMPLOYMENT_STATUSES = ["EMPLOYED", "SELF_EMPLOYED", "UNEMPLOYED", "RETIRED", "STUDENT"] as const;

export const DEFAULT_DAILY_TRANSFER_LIMIT = 500000; // in cents = $5000
export const DEFAULT_MAX_SINGLE_TRANSACTION = 200000; // in cents = $2000
export const DEFAULT_MINIMUM_BALANCE = 1000; // in cents = $10
export const DEFAULT_LOAN_INTEREST_RATE = 12; // 12% per annum
export const DEFAULT_TRANSACTION_FEE_PERCENT = 0.5; // 0.5%

export const ITEMS_PER_PAGE = 10;

export const TRANSACTION_TYPES = {
  DEPOSIT: "DEPOSIT",
  WITHDRAWAL: "WITHDRAWAL",
  TRANSFER: "TRANSFER",
  LOAN_DISBURSEMENT: "LOAN_DISBURSEMENT",
  LOAN_REPAYMENT: "LOAN_REPAYMENT",
} as const;

export const STATUS_COLORS = {
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  FROZEN: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  CLOSED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  REVERSED: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  APPROVED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  UNDER_REVIEW: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  BLOCKED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
} as const;
