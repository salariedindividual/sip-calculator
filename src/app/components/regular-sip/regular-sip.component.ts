import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { SipCalculatorService } from '../../services/sip-calculator.service';
import { NiftyBeesDataService } from '../../services/nifty-bees-data.service';
import { SipResult } from '../../models/sip.interface';

@Component({
  selector: 'app-regular-sip',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="regular-sip-page">
      <!-- Header -->
      <div class="calculator-header">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-md-8">
              <h1 class="mb-2">
                <i class="bi bi-arrow-repeat me-3"></i>
                Regular SIP Calculator
              </h1>
              <p class="mb-0">Calculate returns for regular monthly investments in NIFTY BEES</p>
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
                
                <form [formGroup]="sipForm" class="needs-validation">
                  <!-- Date Range -->
                  <div class="row mb-3">
                    <div class="col-6">
                      <label class="form-label fw-semibold">Start Date</label>
                      <input 
                        type="date" 
                        class="form-control" 
                        formControlName="startDate"
                        [min]="minDate"
                        [max]="maxDate">
                      <div class="invalid-feedback" 
                           *ngIf="sipForm.get('startDate')?.invalid && sipForm.get('startDate')?.touched">
                        Please select a valid start date
                      </div>
                    </div>
                    <div class="col-6">
                      <label class="form-label fw-semibold">End Date</label>
                      <input 
                        type="date" 
                        class="form-control" 
                        formControlName="endDate"
                        [min]="minDate"
                        [max]="maxDate">
                      <div class="invalid-feedback" 
                           *ngIf="sipForm.get('endDate')?.invalid && sipForm.get('endDate')?.touched">
                        Please select a valid end date
                      </div>
                    </div>
                  </div>

                  <!-- SIP Amount -->
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Monthly SIP Amount</label>
                    <div class="input-group">
                      <span class="input-group-text">₹</span>
                      <input 
                        type="number" 
                        class="form-control" 
                        formControlName="monthlyAmount"
                        placeholder="10,000"
                        min="500"
                        step="500">
                    </div>
                    <div class="invalid-feedback" 
                         *ngIf="sipForm.get('monthlyAmount')?.invalid && sipForm.get('monthlyAmount')?.touched">
                      Please enter amount between ₹500 - ₹10,00,000
                    </div>
                  </div>

                  <!-- SIP Date -->
                  <div class="mb-4">
                    <label class="form-label fw-semibold">SIP Date (Day of Month)</label>
                    <select class="form-select" formControlName="sipDate">
                      <option *ngFor="let day of sipDates" [value]="day">{{day}}</option>
                    </select>
                    <div class="form-text">Day of the month when SIP will be executed</div>
                  </div>

                  <!-- Investment Duration Display -->
                  <div class="alert alert-info" *ngIf="investmentDuration">
                    <i class="bi bi-info-circle me-2"></i>
                    <strong>Investment Duration:</strong> {{investmentDuration}} years
                  </div>
                </form>

                <!-- Quick Presets -->
                <div class="quick-presets mt-4">
                  <h6 class="fw-semibold mb-3">Quick Presets</h6>
                  <div class="row g-2">
                    <div class="col-6">
                      <button class="btn btn-outline-primary btn-sm w-100" 
                              (click)="applyPreset('conservative')">
                        Conservative<br><small>₹5,000/month</small>
                      </button>
                    </div>
                    <div class="col-6">
                      <button class="btn btn-outline-primary btn-sm w-100" 
                              (click)="applyPreset('moderate')">
                        Moderate<br><small>₹10,000/month</small>
                      </button>
                    </div>
                    <div class="col-6">
                      <button class="btn btn-outline-primary btn-sm w-100" 
                              (click)="applyPreset('aggressive')">
                        Aggressive<br><small>₹25,000/month</small>
                      </button>
                    </div>
                    <div class="col-6">
                      <button class="btn btn-outline-primary btn-sm w-100" 
                              (click)="applyPreset('premium')">
                        Premium<br><small>₹50,000/month</small>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Results Section -->
          <div class="col-lg-8">
            <!-- Loading State -->
            <div *ngIf="isCalculating" class="text-center py-5">
              <div class="loading-spinner me-2"></div>
              Calculating your returns...
            </div>

            <!-- Results Display -->
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
                    <div class="metric-value" 
                         [class.text-success]="sipResult.totalReturns > 0"
                         [class.text-danger]="sipResult.totalReturns < 0">
                      {{formatCurrency(sipResult.totalReturns)}}
                    </div>
                    <div class="metric-label">Total Returns</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="metric-card">
                    <div class="metric-value text-info">{{formatPercentage(sipResult.xirr)}}</div>
                    <div class="metric-label">XIRR (Annual Returns)</div>
                  </div>
                </div>
              </div>

              <!-- Additional Metrics -->
              <div class="row g-3 mb-4">
                <div class="col-md-4">
                  <div class="metric-card">
                    <div class="metric-value">{{formatNumber(sipResult.totalUnits, 2)}}</div>
                    <div class="metric-label">Total Units</div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="metric-card">
                    <div class="metric-value">₹{{sipResult.averagePrice.toFixed(2)}}</div>
                    <div class="metric-label">Average Buy Price</div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="metric-card">
                    <div class="metric-value">₹{{currentPrice.toFixed(2)}}</div>
                    <div class="metric-label">Current Price</div>
                  </div>
                </div>
              </div>

              <!-- Investment Chart Placeholder -->
              <div class="card card-custom mb-4">
                <div class="card-body">
                  <h6 class="card-title">
                    <i class="bi bi-graph-up me-2"></i>Investment Growth
                  </h6>
                  <div class="chart-placeholder text-center py-5">
                    <i class="bi bi-bar-chart display-4 text-muted mb-3"></i>
                    <p class="text-muted">Chart integration coming soon...</p>
                    <div class="row text-center">
                      <div class="col-6">
                        <div class="text-primary fw-bold">Invested Amount Growth</div>
                        <div class="text-muted">Linear progression over time</div>
                      </div>
                      <div class="col-6">
                        <div class="text-success fw-bold">Portfolio Value Growth</div>
                        <div class="text-muted">Actual value with market movements</div>
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
                          <th>Amount</th>
                          <th>Price</th>
                          <th>Units</th>
                          <th>Total Units</th>
                          <th>Portfolio Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let transaction of recentTransactions; trackBy: trackByDate">
                          <td>{{transaction.date | date:'dd/MM/yyyy'}}</td>
                          <td>₹{{formatNumber(transaction.amount)}}</td>
                          <td>₹{{transaction.price.toFixed(2)}}</td>
                          <td>{{transaction.units.toFixed(2)}}</td>
                          <td>{{transaction.totalUnits.toFixed(2)}}</td>
                          <td>₹{{formatNumber(transaction.value)}}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div class="text-center mt-3" *ngIf="sipResult.transactions.length > 50">
                    <small class="text-muted">
                      Showing last 50 transactions. Total: {{sipResult.transactions.length}} transactions
                    </small>
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

    .metric-card {
      transition: all 0.3s ease;
    }

    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 15px rgba(0,0,0,0.15);
    }

    .chart-placeholder {
      background: linear-gradient(45deg, #f8f9fa 25%, transparent 25%), 
                  linear-gradient(-45deg, #f8f9fa 25%, transparent 25%), 
                  linear-gradient(45deg, transparent 75%, #f8f9fa 75%), 
                  linear-gradient(-45deg, transparent 75%, #f8f9fa 75%);
      background-size: 20px 20px;
      background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
      border-radius: 10px;
      border: 2px dashed #dee2e6;
    }

    .quick-presets .btn {
      font-size: 0.875rem;
      padding: 0.75rem 0.5rem;
    }

    .table th {
      font-size: 0.875rem;
      font-weight: 600;
    }

    .table td {
      font-size: 0.875rem;
      vertical-align: middle;
    }

    .alert {
      border: none;
      border-radius: 10px;
    }

    @media (max-width: 768px) {
      .calculator-header {
        text-align: center;
        padding: 1.5rem 0;
      }
      
      .metric-card {
        margin-bottom: 1rem;
      }
      
      .table-responsive {
        font-size: 0.8rem;
      }
    }
  `]
})
export class RegularSipComponent implements OnInit, OnDestroy {
  sipForm!: FormGroup;
  sipResult: SipResult | null = null;
  isCalculating = false;
  currentPrice = 272.22;
  investmentDuration: number | null = null;
  
  minDate = '2004-01-01';
  maxDate = '2025-09-25';
  sipDates = Array.from({length: 28}, (_, i) => i + 1);
  
  recentTransactions: any[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private calculatorService: SipCalculatorService,
    private dataService: NiftyBeesDataService
  ) {
    this.currentPrice = this.dataService.getCurrentPrice();
  }

  ngOnInit() {
    this.initializeForm();
    this.setupFormValidation();
    this.calculateSIP();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm() {
    this.sipForm = this.fb.group({
      startDate: ['2010-01-01', Validators.required],
      endDate: ['2024-12-17', Validators.required],
      monthlyAmount: [10000, [Validators.required, Validators.min(500), Validators.max(1000000)]],
      sipDate: [1, [Validators.required, Validators.min(1), Validators.max(28)]]
    });
  }

  private setupFormValidation() {
    this.sipForm.valueChanges
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.sipForm.valid) {
          this.calculateInvestmentDuration();
          this.calculateSIP();
        }
      });
  }

  private calculateInvestmentDuration() {
    const startDate = new Date(this.sipForm.get('startDate')?.value);
    const endDate = new Date(this.sipForm.get('endDate')?.value);
    
    if (startDate && endDate && startDate < endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365.25));
      this.investmentDuration = diffYears;
    } else {
      this.investmentDuration = null;
    }
  }

  calculateSIP() {
    if (this.sipForm.invalid) return;

    this.isCalculating = true;
    
    const formValue = this.sipForm.value;
    
    try {
      const result = this.calculatorService.calculateRegularSip({
        startDate: new Date(formValue.startDate),
        endDate: new Date(formValue.endDate),
        monthlyAmount: formValue.monthlyAmount,
        sipDate: formValue.sipDate
      });

      this.sipResult = result;
      this.recentTransactions = result.transactions.slice(-50).reverse();
      
    } catch (error) {
      console.error('Error calculating SIP:', error);
    } finally {
      setTimeout(() => {
        this.isCalculating = false;
      }, 800);
    }
  }

  resetForm() {
    this.sipForm.reset({
      startDate: '2010-01-01',
      endDate: '2024-12-17',
      monthlyAmount: 10000,
      sipDate: 1
    });
  }

  applyPreset(preset: string) {
    const presets = {
      conservative: 5000,
      moderate: 10000,
      aggressive: 25000,
      premium: 50000
    };
    
    this.sipForm.patchValue({
      monthlyAmount: presets[preset as keyof typeof presets] || 10000
    });
  }

  trackByDate(index: number, transaction: any): string {
    console.log(index);
    return transaction.date.getTime().toString();
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