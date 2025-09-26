// NIFTY BEES Price Data Interface
export interface PriceData {
  date: string;
  close: number;
}

// Transaction Interface
export interface Transaction {
  date: Date;
  type: string;
  amount: number;
  price: number;
  units: number;
  totalUnits: number;
  value: number;
}

// SIP Result Interface
export interface SipResult {
  totalInvested: number;
  currentValue: number;
  totalReturns: number;
  totalUnits: number;
  averagePrice: number;
  xirr: number;
  transactions: Transaction[];
}

// Dip Investment Rule
export interface DipRule {
  percentage: number;
  amount: number;
}

// Regular SIP Input
export interface RegularSipInput {
  startDate: Date;
  endDate: Date;
  monthlyAmount: number;
  sipDate: number;
}

// Step-up SIP Input
export interface StepUpSipInput {
  startDate: Date;
  endDate: Date;
  initialAmount: number;
  stepUpPercentage: number;
  sipDate: number;
}

// Dip Investment Input
export interface DipInvestmentInput {
  startDate: Date;
  endDate: Date;
  baseAmount: number;
  dipRules: DipRule[];
  lookbackDays: number;
}