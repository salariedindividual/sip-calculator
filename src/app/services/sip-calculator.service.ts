import { Injectable } from '@angular/core';
import { NiftyBeesDataService } from './nifty-bees-data.service';
import { 
  Transaction, 
  SipResult, 
  RegularSipInput, 
  StepUpSipInput, 
  DipInvestmentInput 
} from '../models/sip.interface';

@Injectable({
  providedIn: 'root'
})
export class SipCalculatorService {

  constructor(private niftyBeesService: NiftyBeesDataService) {}

  /**
   * Calculate Regular SIP
   */
  calculateRegularSip(input: RegularSipInput): SipResult {
    const transactions: Transaction[] = [];
    let totalInvested = 0;
    let totalUnits = 0;

    const currentDate = new Date(input.startDate);
    currentDate.setDate(input.sipDate);

    while (currentDate <= input.endDate) {
      if (currentDate >= input.startDate) {
        const price = this.niftyBeesService.getPrice(currentDate);
        const units = input.monthlyAmount / price;

        transactions.push({
          date: new Date(currentDate),
          type: 'Regular SIP',
          amount: input.monthlyAmount,
          price: price,
          units: units,
          totalUnits: totalUnits + units,
          value: (totalUnits + units) * price
        });

        totalInvested += input.monthlyAmount;
        totalUnits += units;
      }

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return this.buildSipResult(totalInvested, totalUnits, transactions);
  }

  /**
   * Calculate Step-up SIP
   */
  calculateStepUpSip(input: StepUpSipInput): SipResult {
    const transactions: Transaction[] = [];
    let totalInvested = 0;
    let totalUnits = 0;
    let currentAmount = input.initialAmount;

    const currentDate = new Date(input.startDate);
    currentDate.setDate(input.sipDate);
    let lastYear = input.startDate.getFullYear();

    while (currentDate <= input.endDate) {
      if (currentDate >= input.startDate) {
        // Check if we need to step up the amount (new year)
        if (currentDate.getFullYear() > lastYear) {
          currentAmount = currentAmount * (1 + input.stepUpPercentage / 100);
          lastYear = currentDate.getFullYear();
        }

        const price = this.niftyBeesService.getPrice(currentDate);
        const units = currentAmount / price;

        transactions.push({
          date: new Date(currentDate),
          type: `Step-up SIP (₹${Math.round(currentAmount)})`,
          amount: currentAmount,
          price: price,
          units: units,
          totalUnits: totalUnits + units,
          value: (totalUnits + units) * price
        });

        totalInvested += currentAmount;
        totalUnits += units;
      }

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return this.buildSipResult(totalInvested, totalUnits, transactions);
  }

  /**
   * Calculate Dip Investment Strategy
   */
  calculateDipInvestment(input: DipInvestmentInput): SipResult {
    const transactions: Transaction[] = [];
    let totalInvested = 0;
    let totalUnits = 0;
    const processedDates = new Set<string>();

    // Sort dip rules by percentage (ascending)
    const sortedDipRules = [...input.dipRules].sort((a, b) => a.percentage - b.percentage);

    // First, add regular SIP investments (monthly on 1st)
    const currentDate = new Date(input.startDate);
    currentDate.setDate(1);

    while (currentDate <= input.endDate) {
      if (currentDate >= input.startDate) {
        const price = this.niftyBeesService.getPrice(currentDate);
        const units = input.baseAmount / price;
        const dateKey = this.formatDate(currentDate);

        transactions.push({
          date: new Date(currentDate),
          type: 'Regular SIP',
          amount: input.baseAmount,
          price: price,
          units: units,
          totalUnits: totalUnits + units,
          value: (totalUnits + units) * price
        });

        totalInvested += input.baseAmount;
        totalUnits += units;
        processedDates.add(dateKey);
      }

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Now check for dip investment opportunities
    const allPriceData = this.niftyBeesService.getPricesInRange(input.startDate, input.endDate);

    for (let i = 0; i < allPriceData.length; i++) {
      const priceData = allPriceData[i];
      const currentDate = priceData.date;
      const currentPrice = priceData.price;
      const dateKey = this.formatDate(currentDate);

      // Skip if we already made a regular SIP on this date
      if (processedDates.has(dateKey)) {
        continue;
      }

      // Find highest price in lookback period
      const highestPrice = this.niftyBeesService.getHighestPrice(currentDate, input.lookbackDays);

      // Calculate fall percentage
      const fallPercentage = ((highestPrice - currentPrice) / highestPrice) * 100;

      // Find applicable dip investment (use highest applicable percentage)
      let dipInvestment = 0;
      for (const rule of sortedDipRules) {
        if (fallPercentage >= rule.percentage) {
          dipInvestment = rule.amount;
        }
      }

      // Make dip investment if applicable
      if (dipInvestment > 0) {
        const units = dipInvestment / currentPrice;

        // Update total units for existing transactions
        totalUnits += units;

        transactions.push({
          date: new Date(currentDate),
          type: `Dip Investment (${fallPercentage.toFixed(1)}% fall)`,
          amount: dipInvestment,
          price: currentPrice,
          units: units,
          totalUnits: totalUnits,
          value: totalUnits * currentPrice
        });

        totalInvested += dipInvestment;
        processedDates.add(dateKey);
      }
    }

    // Sort transactions by date
    transactions.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Recalculate totalUnits correctly
    let runningUnits = 0;
    transactions.forEach(transaction => {
      runningUnits += transaction.units;
      transaction.totalUnits = runningUnits;
      transaction.value = runningUnits * transaction.price;
    });

    return this.buildSipResult(totalInvested, runningUnits, transactions);
  }

  /**
   * Build SIP Result
   */
  private buildSipResult(totalInvested: number, totalUnits: number, transactions: Transaction[]): SipResult {
    const currentPrice = this.niftyBeesService.getCurrentPrice();
    const currentValue = totalUnits * currentPrice;
    const totalReturns = currentValue - totalInvested;
    const averagePrice = totalInvested / totalUnits;
    const xirr = this.calculateXIRR(transactions, currentValue);

    return {
      totalInvested,
      currentValue,
      totalReturns,
      totalUnits,
      averagePrice,
      xirr,
      transactions
    };
  }

  /**
   * Calculate XIRR (simplified approximation)
   */
  private calculateXIRR(transactions: Transaction[], currentValue: number): number {
    if (transactions.length === 0) return 0;

    const startDate = transactions[0].date;
    const endDate = transactions[transactions.length - 1].date;
    const years = (endDate.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

    if (years === 0) return 0;

    const totalInvested = transactions.reduce((sum, t) => sum + t.amount, 0);

    return Math.pow(currentValue / totalInvested, 1 / years) - 1;
  }

  /**
   * Format date to YYYY-MM-DD string
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Format number for display
   */
  formatNumber(num: number, decimals: number = 0): string {
    if (num >= 10000000) {
      return (num / 10000000).toFixed(1) + ' Cr';
    } else if (num >= 100000) {
      return (num / 100000).toFixed(1) + ' L';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    } else {
      return num.toFixed(decimals);
    }
  }

  /**
   * Format currency
   */
  formatCurrency(num: number): string {
    return '₹' + this.formatNumber(num);
  }

  /**
   * Format percentage
   */
  formatPercentage(num: number): string {
    return (num * 100).toFixed(2) + '%';
  }
}