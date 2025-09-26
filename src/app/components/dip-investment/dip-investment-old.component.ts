import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { SipCalculatorService } from '../../services/sip-calculator.service';
import { SipResult, DipRule } from '../../models/sip.interface';

@Component({
  selector: 'app-dip-investment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="dip-investment-page">
      <!-- Header -->
      <div class="calculator-header">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-md-8">
              <h1 class="mb-2">
                <i class="bi bi-graph-down me-3"></i>
                Dip Investment Calculator
              </h1>
              <p class="mb-0">Invest additional amounts when NIFTY BEES falls for enhanced returns</p>
            </div>
            <div class="col-md-4 text-md-end">
              <button class="btn btn-outline-light me-2" routerLink="/calculator">
                <i class="bi bi-house me-2"></i>Home
              </button>
              <button class="btn btn-outline-light" (click)="resetForm()">
                <i class="bi bi-arrow-clockwise me-2"></i>Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="container mt-4">
        <div class="row">
          <!-- Input Form -->
          <div class="col-lg-4">
            <div class="card card-custom">
              <div class="card-body">
                <h5 class="card-title text-primary-custom mb-4">
                  <i class="bi bi-sliders me-2"></i>Investment Parameters
                </h5>
                
                <form [formGroup]="dipForm">
                  <!-- Date Range -->
                  <div class="row mb-3">
                    <div class="col-6">
                      <label class="form-label fw-semibold">Start Date</label>
                      <input type="date" class="form-control" formControlName="startDate">
                    </div>
                    <div class="col-6">
                      <label class="form-label fw-semibold">End Date</label>
                      <input type="date" class="form-control" formControlName="endDate">
                    </div>
                  </div>

                  <!-- Base SIP Amount -->
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Base Monthly SIP</label>
                    <div class="input-group">
                      <span class="input-group-text">₹</span>
                      <input type="number" class="form-control" formControlName="baseAmount">
                    </div>
                    <div class="form-text">Regular monthly investment amount</div>
                  </div>

                  <!-- Lookback Period -->
                  <div class="mb-4">
                    <label class="form-label fw-semibold">Lookback Period</label>
                    <div class="input-group">
                      <input type="number" class="form-control" formControlName="lookbackDays">
                      <span class="input-group-text">days</span>
                    </div>
                    <div class="form-text">Compare current price with highest price in last N days</div>
                  </div>

                  <!-- Dip Investment Rules -->
                  <div class="mb-4">
                    <label class="form-label fw-semibold">Dip Investment Rules</label>
                    <div formArrayName="dipRules">
                      <div *ngFor="let rule of dipRules.controls; let i = index" 
                           [formGroupName]="i" 
                           class="dip-rule-item mb-3">
                        <div class="row g-2">
                          <div class="col-5">
                            <label class="form-label">Fall %</label>
                            <div class="input-group input-group-sm">
                              <input type="number" class="form-control" formControlName="percentage">
                              <span class="input-group-text">%</span>
                            </div>
                          </div>
                          <div class="col-5">
                            <label class="form-label">Investment</label>
                            <div class="input-group input-group-sm">
                              <span class="input-group-text">₹</span>
                              <input type="number" class="form-control" formControlName="amount">
                            </div>
                          </div>
                          <div class="col-2 d-flex align-items-end">
                            <button type="button" 
                                    class="btn btn-outline-danger btn-sm"
                                    (click)="removeDipRule(i)"
                                    [disabled]="dipRules.length <= 1">
                              <i class="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button type="button" 
                            class="btn btn-outline-primary btn-sm w-100"
                            (click)="addDipRule()">
                      <i class="bi bi-plus me-2"></i>Add Dip Rule
                    </button>
                  </div>
                </form>

                <!-- Quick Presets -->
                <div class="quick-presets mt-4">
                  <h6 class="fw-semibold mb-3">Quick Presets</h6>
                  <div class="row g-2">
                    <div class="col-6">
                      <button class="btn btn-outline-primary btn-sm w-100" 
                              (click)="applyPreset('conservative')">
                        Conservative<br><small>5%, 10% dips</small>
                      </button>
                    </div>
                    <div class="col-6">
                      <button class="btn btn-outline-primary btn-sm w-100" 
                              (click)="applyPreset('moderate')">
                        Moderate<br><small>5%, 10%, 15%</small>
                      </button>
                    </div>
                    <div class="col-6">
                      <button class="btn btn-outline-primary btn-sm w-100" 
                              (click)="applyPreset('aggressive')">
                        Aggressive<br><small>Multiple levels</small>
                      </button>
                    </div>
                    <div class="col-6">
                      <button class="btn btn-outline-primary btn-sm w-100" 
                              (click)="applyPreset('opportunistic')">
                        Opportunistic<br><small>Small dips too</small>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Results Section -->
          <div class="col-lg-8">
            <div *ngIf="isCalculating" class="text-center py-5">
              <div class="loading-spinner me-2"></div>
              Calculating dip investment returns...
            </div>

            <div *ngIf="!isCalculating && sipResult">
              <!-- Key Metrics -->
              <div class="row g-3 mb-4">
                <div class="col-md-3">
                  <div class="metric-card">
                    <div class="metric-value text-primary">{{formatCurrency(sipResult.totalInvested)}}</div>
                    <div class="metric-label">Total Invested</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="metric-card">
                    <div class="metric-value text-success">{{formatCurrency(sipResult.currentValue)}}</div>
                    <div class="metric-label">Current Value</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="metric-card">
                    <div class="metric-value" [class.text-success]="sipResult.totalReturns > 0">
                      {{formatCurrency(sipResult.totalReturns)}}
                    </div>
                    <div class="metric-label">Total Returns</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="metric-card">
                    <div class="metric-value text-info">{{formatPercentage(sipResult.xirr)}}</div>
                    <div class="metric-label">XIRR</div>
                  </div>
                </div>
              </div>

              <!-- Dip Strategy Stats -->
              <div class="card card-custom mb-4">
                <div class="card-body">
                  <h6 class="card-title">
                    <i class="bi bi-graph-down me-2"></i>
                    Dip Investment Statistics
                  </h6>
                  <div class="row text-center">
                    <div class="col-md-4">
                      <div class="metric-value text-warning">{{dipInvestmentCount}}</div>
                      <div class="metric-label">Dip Opportunities Captured</div>
                    </div>
                    <div class="col-md-4">
                      <div class="metric-value text-info">{{formatCurrency(dipInvestmentAmount)}}</div>
                      <div class="metric-label">Total Dip Investments</div>
                    </div>
                    <div class="col-md-4">
                      <div class="metric-value text-success">
                        {{((dipInvestmentAmount / sipResult.totalInvested) * 100).toFixed(1)}}%
                      </div>
                      <div class="metric-label">% of Total Investment</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Comparison with Regular SIP -->
              <div class="card card-custom mb-4" *ngIf="regularSipComparison">
                <div class="card-body">
                  <h6 class="card-title">
                    <i class="bi bi-bar-chart-steps me-2"></i>
                    Dip Strategy vs Regular SIP Comparison
                  </h6>
                  <div class="row text-center">
                    <div class="col-md-4">
                      <div class="comparison-metric">
                        <div class="metric-value text-success">
                          {{formatCurrency(sipResult.currentValue - regularSipComparison.currentValue)}}
                        </div>
                        <div class="metric-label">Additional Wealth</div>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="comparison-metric">
                        <div class="metric-value text-info">
                          {{((sipResult.xirr - regularSipComparison.xirr) * 100).toFixed(2)}}%
                        </div>
                        <div class="metric-label">XIRR Improvement</div>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="comparison-metric">
                        <div class="metric-value text-warning">
                          {{formatCurrency(sipResult.totalInvested - regularSipComparison.totalInvested)}}
                        </div>
                        <div class="metric-label">Extra Investment</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Transaction History -->
              <div class="card card-custom">
                <div class="card-body">
                  <h6 class="card-title">
                    <i class="bi bi-list-ul me-2"></i>
                    Recent Transactions 
                    <span class="badge bg-primary ms-2">{{sipResult.transactions.length}} total</span>
                  </h6>
                  
                  <div class="table-responsive custom-scrollbar" style="max-height: 400px;">
                    <table class="table table-hover table-sm">
                      <thead class="table-dark sticky-top">
                        <tr>
                          <th>Date</th>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Price</th>
                          <th>Units</th>
                          <th>Total Units</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let transaction of recentTransactions">
                          <td>{{transaction.date | date:'dd/MM/yyyy'}}</td>
                          <td>
                            <span class="badge" 
                                  [class.bg-primary]="transaction.type === 'Regular SIP'"
                                  [class.bg-success]="transaction.type.includes('Dip')">
                              {{transaction.type}}
                            </span>
                          </td>
                          <td>₹{{formatNumber(transaction.amount)}}</td>
                          <td>₹{{transaction.price.toFixed(2)}}</td>
                          <td>{{transaction.units.toFixed(2)}}</td>
                          <td>{{transaction.totalUnits.toFixed(2)}}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calculator-header {
      background: var(--primary-gradient);
      color: white;
      padding: 2rem 0;
    }
    
    .dip-rule-item {
      background: rgba(102, 126, 234, 0.1);
      padding: 1rem;
      border-radius: 10px;
    }
    
    .comparison-metric {
      padding: 1rem;
      border-radius: 8px;
      background: rgba(16, 185, 129, 0.1);
      margin-bottom: 1rem;
    }
  `]
})
export class DipInvestmentComponent implements OnInit, OnDestroy {
  dipForm!: FormGroup;
  sipResult: SipResult | null = null;
  regularSipComparison: SipResult | null = null;
  isCalculating = false;
  
  dipInvestmentCount = 0;
  dipInvestmentAmount = 0;
  recentTransactions: any[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private calculatorService: SipCalculatorService
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.setupFormValidation();
    this.calculateSIP();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get dipRules() {
    return this.dipForm.get('dipRules') as FormArray;
  }

  private initializeForm() {
    this.dipForm = this.fb.group({
      startDate: ['2010-01-01', Validators.required],
      endDate: ['2024-12-17', Validators.required],
      baseAmount: [10000, [Validators.required, Validators.min(500)]],
      lookbackDays: [30, [Validators.required, Validators.min(7), Validators.max(365)]],
      dipRules: this.fb.array([
        this.createDipRule(5, 5000),
        this.createDipRule(10, 10000),
        this.createDipRule(20, 20000)
      ])
    });
  }

  private createDipRule(percentage: number, amount: number) {
    return this.fb.group({
      percentage: [percentage, [Validators.required, Validators.min(1), Validators.max(50)]],
      amount: [amount, [Validators.required, Validators.min(1000)]]
    });
  }

  private setupFormValidation() {
    this.dipForm.valueChanges
      .pipe(debounceTime(800), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.dipForm.valid) {
          this.calculateSIP();
        }
      });
  }

  addDipRule() {
    this.dipRules.push(this.createDipRule(15, 15000));
  }

  removeDipRule(index: number) {
    if (this.dipRules.length > 1) {
      this.dipRules.removeAt(index);
    }
  }

  calculateSIP() {
    if (this.dipForm.invalid) return;

    this.isCalculating = true;
    const formValue = this.dipForm.value;
    
    try {
      // Calculate dip investment strategy
      this.sipResult = this.calculatorService.calculateDipInvestment({
        startDate: new Date(formValue.startDate),
        endDate: new Date(formValue.endDate),
        baseAmount: formValue.baseAmount,
        dipRules: formValue.dipRules as DipRule[],
        lookbackDays: formValue.lookbackDays
      });

      // Calculate regular SIP for comparison
      this.regularSipComparison = this.calculatorService.calculateRegularSip({
        startDate: new Date(formValue.startDate),
        endDate: new Date(formValue.endDate),
        monthlyAmount: formValue.baseAmount,
        sipDate: 1
      });

      // Calculate dip investment statistics
      this.calculateDipStats();
      this.recentTransactions = this.sipResult.transactions.slice(-50).reverse();
      
    } catch (error) {
      console.error('Error calculating dip investment:', error);
    } finally {
      setTimeout(() => {
        this.isCalculating = false;
      }, 1000);
    }
  }

  private calculateDipStats() {
    if (!this.sipResult) return;
    
    const dipTransactions = this.sipResult.transactions.filter(t => t.type.includes('Dip'));
    this.dipInvestmentCount = dipTransactions.length;
    this.dipInvestmentAmount = dipTransactions.reduce((sum, t) => sum + t.amount, 0);
  }

  resetForm() {
    this.dipForm.reset({
      startDate: '2010-01-01',
      endDate: '2024-12-17',
      baseAmount: 10000,
      lookbackDays: 30
    });
    
    // Reset dip rules
    while (this.dipRules.length > 0) {
      this.dipRules.removeAt(0);
    }
    this.dipRules.push(this.createDipRule(5, 5000));
    this.dipRules.push(this.createDipRule(10, 10000));
    this.dipRules.push(this.createDipRule(20, 20000));
  }

  applyPreset(preset: string) {
    const presets = {
      conservative: [
        { percentage: 5, amount: 5000 },
        { percentage: 10, amount: 10000 }
      ],
      moderate: [
        { percentage: 5, amount: 5000 },
        { percentage: 10, amount: 10000 },
        { percentage: 15, amount: 15000 }
      ],
      aggressive: [
        { percentage: 3, amount: 3000 },
        { percentage: 7, amount: 7000 },
        { percentage: 12, amount: 12000 },
        { percentage: 20, amount: 25000 }
      ],
      opportunistic: [
        { percentage: 2, amount: 2000 },
        { percentage: 5, amount: 5000 },
        { percentage: 8, amount: 8000 },
        { percentage: 12, amount: 15000 },
        { percentage: 20, amount: 30000 }
      ]
    };
    
    const rules = presets[preset as keyof typeof presets];
    
    // Clear existing rules
    while (this.dipRules.length > 0) {
      this.dipRules.removeAt(0);
    }
    
    // Add new rules
    rules.forEach(rule => {
      this.dipRules.push(this.createDipRule(rule.percentage, rule.amount));
    });
  }

  formatCurrency(amount: number): string {
    return this.calculatorService.formatCurrency(amount);
  }

  formatNumber(num: number, decimals: number = 0): string {
    return this.calculatorService.formatNumber(num, decimals);
  }

  formatPercentage(num: number): string {
    return this.calculatorService.formatPercentage(num);
  }
}