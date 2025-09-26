import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, BehaviorSubject } from 'rxjs';
import { debounceTime, takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { SipCalculatorService } from '../../services/sip-calculator.service';
import { SipResult, DipRule } from '../../models/sip.interface';

interface DipStats {
  count: number;
  amount: number;
  percentage: number;
}

interface ComparisonMetrics {
  additionalWealth: number;
  xirrImprovement: number;
  extraInvestment: number;
}

@Component({
  selector: 'app-dip-investment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
                
                <form [formGroup]="dipForm" (ngSubmit)="onFormSubmit()">
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
                    <label class="form-label fw-semibold">Lookback Period (Min 7)</label>
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
                      <div *ngFor="let rule of dipRulesArray; let i = index; trackBy: trackByIndex" 
                           [formGroupName]="i" 
                           class="dip-rule-item mb-3">
                        <div class="row g-2">
                          <div class="col-5">
                            <label class="form-label">Fall %</label>
                            <div class="input-group input-group-sm">
                              <input type="number" class="form-control" formControlName="percentage" min="1" max="50">
                              <span class="input-group-text">%</span>
                            </div>
                          </div>
                          <div class="col-5">
                            <label class="form-label">Investment</label>
                            <div class="input-group input-group-sm">
                              <span class="input-group-text">₹</span>
                              <input type="number" class="form-control" formControlName="amount" min="1000">
                            </div>
                          </div>
                          <div class="col-2 d-flex align-items-end">
                            <button type="button" 
                                    class="btn btn-outline-danger btn-sm"
                                    (click)="removeDipRule(i)"
                                    [disabled]="dipRulesArray.length <= 1">
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
                    <div class="col-6" *ngFor="let preset of presetOptions; trackBy: trackByPreset">
                      <button class="btn btn-outline-primary btn-sm w-100" 
                              (click)="applyPreset(preset.key)">
                        {{preset.name}}<br><small>{{preset.description}}</small>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Results Section -->
          <div class="col-lg-8">
            <div *ngIf="isCalculating$ | async" class="text-center py-5">
              <div class="loading-spinner me-2"></div>
              Calculating dip investment returns...
            </div>

            <ng-container *ngIf="!(isCalculating$ | async) && (sipResult$ | async) as sipResult">
              <!-- Key Metrics -->
              <div class="row g-3 mb-4">
                <div class="col-md-3" *ngFor="let metric of keyMetrics; trackBy: trackByMetric">
                  <div class="metric-card">
                    <div class="metric-value" [ngClass]="metric.colorClass">{{metric.value}}</div>
                    <div class="metric-label">{{metric.label}}</div>
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
                    <div class="col-md-4" *ngFor="let stat of dipStats; trackBy: trackByStat">
                      <div class="metric-value" [ngClass]="stat.colorClass">{{stat.value}}</div>
                      <div class="metric-label">{{stat.label}}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Comparison with Regular SIP -->
              <div class="card card-custom mb-4" *ngIf="comparisonMetrics$ | async as comparison">
                <div class="card-body">
                  <h6 class="card-title">
                    <i class="bi bi-bar-chart-steps me-2"></i>
                    Dip Strategy vs Regular SIP Comparison
                  </h6>
                  <div class="row text-center">
                    <div class="col-md-4" *ngFor="let metric of comparisonMetricsArray; trackBy: trackByComparison">
                      <div class="comparison-metric">
                        <div class="metric-value" [ngClass]="metric.colorClass">{{metric.value}}</div>
                        <div class="metric-label">{{metric.label}}</div>
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
                        <tr *ngFor="let transaction of recentTransactions$ | async; trackBy: trackByTransaction">
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
            </ng-container>
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

    .loading-spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      display: inline-block;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class DipInvestmentComponent implements OnInit, OnDestroy {
  dipForm!: FormGroup;
  
  // Reactive state management
  private _sipResult$ = new BehaviorSubject<SipResult | null>(null);
  private regularSipComparison$ = new BehaviorSubject<SipResult | null>(null);
  private _isCalculating$ = new BehaviorSubject<boolean>(false);
  private dipStatsSubject$ = new BehaviorSubject<DipStats>({ count: 0, amount: 0, percentage: 0 });
  private _recentTransactions$ = new BehaviorSubject<any[]>([]);
  private _comparisonMetrics$ = new BehaviorSubject<ComparisonMetrics | null>(null);
  
  private destroy$ = new Subject<void>();

  // Cached arrays for template
  dipRulesArray: any[] = [];
  keyMetrics: any[] = [];
  dipStats: any[] = [];
  comparisonMetricsArray: any[] = [];

  // Static data
  readonly presetOptions = [
    { key: 'conservative', name: 'Conservative', description: '5%, 10% dips' },
    { key: 'moderate', name: 'Moderate', description: '5%, 10%, 15%' },
    { key: 'aggressive', name: 'Aggressive', description: 'Multiple levels' },
    { key: 'opportunistic', name: 'Opportunistic', description: 'Small dips too' }
  ];

  constructor(
    private fb: FormBuilder,
    private calculatorService: SipCalculatorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.setupFormValidation();
    this.subscribeToStateChanges();
    this.calculateSIP();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // TrackBy functions for performance optimization
  trackByIndex: TrackByFunction<any> = (index: number) => index;
  
  trackByPreset: TrackByFunction<any> = (_: number, preset: any) => preset.key;
  
  trackByMetric: TrackByFunction<any> = (_: number, metric: any) => metric.label;
  
  trackByStat: TrackByFunction<any> = (_: number, stat: any) => stat.label;
  
  trackByComparison: TrackByFunction<any> = (_: number, metric: any) => metric.label;
  
  trackByTransaction: TrackByFunction<any> = (_: number, transaction: any) => 
    `${transaction.date.getTime()}-${transaction.type}`;

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

    this.updateDipRulesArray();
  }

  private createDipRule(percentage: number, amount: number) {
    return this.fb.group({
      percentage: [percentage, [Validators.required, Validators.min(1), Validators.max(50)]],
      amount: [amount, [Validators.required, Validators.min(1000)]]
    });
  }

  private setupFormValidation() {
    this.dipForm.valueChanges
      .pipe(
        debounceTime(800),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.dipForm.valid) {
          this.calculateSIP();
        }
      });
  }

  private subscribeToStateChanges() {
    // Subscribe to SIP result changes and update metrics
    this.sipResult$.pipe(takeUntil(this.destroy$)).subscribe((sipResult) => {
      if (sipResult) {
        this.updateKeyMetrics(sipResult);
        this.updateRecentTransactions(sipResult);
      }
    });

    // Subscribe to comparison changes
    this.regularSipComparison$.pipe(takeUntil(this.destroy$)).subscribe(comparison => {
      if (comparison && this._sipResult$.value) {
        this.updateComparisonMetrics(this._sipResult$.value, comparison);
      }
    });

    // Subscribe to dip stats changes
    this.dipStatsSubject$.pipe(takeUntil(this.destroy$)).subscribe(stats => {
      this.updateDipStatsArray(stats);
    });
  }

  private updateKeyMetrics(sipResult: SipResult) {
    this.keyMetrics = [
      {
        label: 'Total Invested',
        value: this.formatCurrency(sipResult.totalInvested),
        colorClass: 'text-primary'
      },
      {
        label: 'Current Value',
        value: this.formatCurrency(sipResult.currentValue),
        colorClass: 'text-success'
      },
      {
        label: 'Total Returns',
        value: this.formatCurrency(sipResult.totalReturns),
        colorClass: sipResult.totalReturns > 0 ? 'text-success' : 'text-danger'
      },
      {
        label: 'XIRR',
        value: this.formatPercentage(sipResult.xirr),
        colorClass: 'text-info'
      }
    ];
  }

  private updateDipStatsArray(stats: DipStats) {
    this.dipStats = [
      {
        label: 'Dip Opportunities Captured',
        value: stats.count.toString(),
        colorClass: 'text-warning'
      },
      {
        label: 'Total Dip Investments',
        value: this.formatCurrency(stats.amount),
        colorClass: 'text-info'
      },
      {
        label: '% of Total Investment',
        value: `${stats.percentage.toFixed(1)}%`,
        colorClass: 'text-success'
      }
    ];
  }

  private updateComparisonMetrics(sipResult: SipResult, comparison: SipResult) {
    const metrics: ComparisonMetrics = {
      additionalWealth: sipResult.currentValue - comparison.currentValue,
      xirrImprovement: (sipResult.xirr - comparison.xirr) * 100,
      extraInvestment: sipResult.totalInvested - comparison.totalInvested
    };

    this._comparisonMetrics$.next(metrics);
    
    this.comparisonMetricsArray = [
      {
        label: 'Additional Wealth',
        value: this.formatCurrency(metrics.additionalWealth),
        colorClass: 'text-success'
      },
      {
        label: 'XIRR Improvement',
        value: `${metrics.xirrImprovement.toFixed(2)}%`,
        colorClass: 'text-info'
      },
      {
        label: 'Extra Investment',
        value: this.formatCurrency(metrics.extraInvestment),
        colorClass: 'text-warning'
      }
    ];
  }

  private updateRecentTransactions(sipResult: SipResult) {
    const recent = sipResult.transactions.slice(-50).reverse();
    this._recentTransactions$.next(recent);
  }

  private updateDipRulesArray() {
    this.dipRulesArray = this.dipRules.controls;
  }

  onFormSubmit() {
    if (this.dipForm.valid) {
      this.calculateSIP();
    }
  }

  addDipRule() {
    this.dipRules.push(this.createDipRule(15, 15000));
    this.updateDipRulesArray();
  }

  removeDipRule(index: number) {
    if (this.dipRules.length > 1) {
      this.dipRules.removeAt(index);
      this.updateDipRulesArray();
    }
  }

  calculateSIP() {
    if (this.dipForm.invalid) return;

    this._isCalculating$.next(true);
    const formValue = this.dipForm.value;
    
    // Use setTimeout to allow UI to update before heavy computation
    setTimeout(() => {
      try {
        // Calculate dip investment strategy
        const sipResult = this.calculatorService.calculateDipInvestment({
          startDate: new Date(formValue.startDate),
          endDate: new Date(formValue.endDate),
          baseAmount: formValue.baseAmount,
          dipRules: formValue.dipRules as DipRule[],
          lookbackDays: formValue.lookbackDays
        });

        // Calculate regular SIP for comparison
        const regularSipComparison = this.calculatorService.calculateRegularSip({
          startDate: new Date(formValue.startDate),
          endDate: new Date(formValue.endDate),
          monthlyAmount: formValue.baseAmount,
          sipDate: 1
        });

        // Update state
        this._sipResult$.next(sipResult);
        this.regularSipComparison$.next(regularSipComparison);
        
        // Calculate dip investment statistics
        this.calculateDipStats(sipResult);
        
      } catch (error) {
        console.error('Error calculating dip investment:', error);
      } finally {
        this._isCalculating$.next(false);
        this.cdr.markForCheck();
      }
    }, 100);
  }

  private calculateDipStats(sipResult: SipResult) {
    const dipTransactions = sipResult.transactions.filter(t => t.type.includes('Dip'));
    const dipInvestmentCount = dipTransactions.length;
    const dipInvestmentAmount = dipTransactions.reduce((sum, t) => sum + t.amount, 0);
    const percentage = (dipInvestmentAmount / sipResult.totalInvested) * 100;
    
    this.dipStatsSubject$.next({
      count: dipInvestmentCount,
      amount: dipInvestmentAmount,
      percentage: percentage
    });
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
    
    this.updateDipRulesArray();
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
      const fg = this.createDipRule(rule.percentage, rule.amount);
      this.dipRules.push(fg);
    });
    
    this.updateDipRulesArray();
  }

  // Expose observables for template
  get sipResult$() { return this._sipResult$.asObservable(); }
  get isCalculating$() { return this._isCalculating$.asObservable(); }
  get recentTransactions$() { return this._recentTransactions$.asObservable(); }
  get comparisonMetrics$() { return this._comparisonMetrics$.asObservable(); }

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