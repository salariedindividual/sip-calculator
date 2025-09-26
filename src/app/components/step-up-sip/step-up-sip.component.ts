import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { SipCalculatorService } from '../../services/sip-calculator.service';
import { SipResult } from '../../models/sip.interface';

@Component({
  selector: 'app-step-up-sip',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="step-up-sip-page">
      <!-- Header -->
      <div class="calculator-header">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-md-8">
              <h1 class="mb-2">
                <i class="bi bi-graph-up me-3"></i>
                Step-up SIP Calculator
              </h1>
              <p class="mb-0">Increase your SIP amount annually for accelerated wealth creation</p>
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
                
                <form [formGroup]="sipForm">
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

                  <!-- Initial Amount -->
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Initial Monthly SIP</label>
                    <div class="input-group">
                      <span class="input-group-text">₹</span>
                      <input type="number" class="form-control" formControlName="initialAmount">
                    </div>
                  </div>

                  <!-- Step-up Percentage -->
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Annual Increase</label>
                    <div class="input-group">
                      <input type="number" class="form-control" formControlName="stepUpPercentage">
                      <span class="input-group-text">%</span>
                    </div>
                    <div class="form-text">Percentage increase in SIP amount every year</div>
                  </div>

                  <!-- SIP Date -->
                  <div class="mb-4">
                    <label class="form-label fw-semibold">SIP Date</label>
                    <select class="form-select" formControlName="sipDate">
                      <option *ngFor="let day of sipDates" [value]="day">{{day}}</option>
                    </select>
                  </div>

                  <!-- Step-up Preview -->
                  <div class="alert alert-info" *ngIf="stepUpPreview.length > 0">
                    <h6><i class="bi bi-info-circle me-2"></i>Step-up Preview</h6>
                    <div class="step-up-preview">
                      <div *ngFor="let year of stepUpPreview.slice(0, 5)" class="mb-1">
                        <small>Year {{year.year}}: <strong>₹{{formatNumber(year.amount)}}</strong></small>
                      </div>
                      <small class="text-muted" *ngIf="stepUpPreview.length > 5">
                        ...and {{stepUpPreview.length - 5}} more years
                      </small>
                    </div>
                  </div>
                </form>

                <!-- Quick Presets -->
                <div class="quick-presets mt-4">
                  <h6 class="fw-semibold mb-3">Quick Presets</h6>
                  <div class="row g-2">
                    <div class="col-6">
                      <button class="btn btn-outline-primary btn-sm w-100" 
                              (click)="applyPreset('conservative')">
                        Conservative<br><small>₹5K + 5%</small>
                      </button>
                    </div>
                    <div class="col-6">
                      <button class="btn btn-outline-primary btn-sm w-100" 
                              (click)="applyPreset('moderate')">
                        Moderate<br><small>₹10K + 10%</small>
                      </button>
                    </div>
                    <div class="col-6">
                      <button class="btn btn-outline-primary btn-sm w-100" 
                              (click)="applyPreset('aggressive')">
                        Aggressive<br><small>₹15K + 15%</small>
                      </button>
                    </div>
                    <div class="col-6">
                      <button class="btn btn-outline-primary btn-sm w-100" 
                              (click)="applyPreset('premium')">
                        Premium<br><small>₹25K + 20%</small>
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
              Calculating step-up returns...
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

              <!-- Comparison with Regular SIP -->
              <div class="card card-custom mb-4" *ngIf="regularSipComparison">
                <div class="card-body">
                  <h6 class="card-title">
                    <i class="bi bi-bar-chart-steps me-2"></i>
                    Step-up vs Regular SIP Comparison
                  </h6>
                  <div class="row text-center">
                    <div class="col-md-4">
                      <div class="comparison-metric">
                        <div class="metric-value text-success">{{formatCurrency(sipResult.currentValue - regularSipComparison.currentValue)}}</div>
                        <div class="metric-label">Additional Wealth Created</div>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="comparison-metric">
                        <div class="metric-value text-info">
                          {{((sipResult.currentValue / regularSipComparison.currentValue - 1) * 100).toFixed(1)}}%
                        </div>
                        <div class="metric-label">Better Performance</div>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="comparison-metric">
                        <div class="metric-value text-warning">
                          {{formatCurrency(sipResult.totalInvested - regularSipComparison.totalInvested)}}
                        </div>
                        <div class="metric-label">Additional Investment</div>
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
                            <span class="badge bg-info">{{transaction.type}}</span>
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
    
    .step-up-preview {
      font-size: 0.875rem;
    }
    
    .comparison-metric {
      padding: 1rem;
      border-radius: 8px;
      background: rgba(102, 126, 234, 0.1);
      margin-bottom: 1rem;
    }
  `]
})
export class StepUpSipComponent implements OnInit, OnDestroy {
  sipForm!: FormGroup;
  sipResult: SipResult | null = null;
  regularSipComparison: SipResult | null = null;
  isCalculating = false;
  stepUpPreview: any[] = [];
  
  sipDates = Array.from({length: 28}, (_, i) => i + 1);
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

  private initializeForm() {
    this.sipForm = this.fb.group({
      startDate: ['2010-01-01', Validators.required],
      endDate: ['2024-12-17', Validators.required],
      initialAmount: [10000, [Validators.required, Validators.min(500)]],
      stepUpPercentage: [10, [Validators.required, Validators.min(0), Validators.max(50)]],
      sipDate: [1, Validators.required]
    });
  }

  private setupFormValidation() {
    this.sipForm.valueChanges
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.sipForm.valid) {
          this.generateStepUpPreview();
          this.calculateSIP();
        }
      });
  }

  private generateStepUpPreview() {
    const { startDate, endDate, initialAmount, stepUpPercentage } = this.sipForm.value;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const years = end.getFullYear() - start.getFullYear();
    
    this.stepUpPreview = [];
    let currentAmount = initialAmount;
    
    for (let i = 0; i <= years; i++) {
      this.stepUpPreview.push({
        year: i + 1,
        amount: currentAmount
      });
      currentAmount *= (1 + stepUpPercentage / 100);
    }
  }

  calculateSIP() {
    if (this.sipForm.invalid) return;

    this.isCalculating = true;
    const formValue = this.sipForm.value;
    
    try {
      // Calculate step-up SIP
      this.sipResult = this.calculatorService.calculateStepUpSip({
        startDate: new Date(formValue.startDate),
        endDate: new Date(formValue.endDate),
        initialAmount: formValue.initialAmount,
        stepUpPercentage: formValue.stepUpPercentage,
        sipDate: formValue.sipDate
      });

      // Calculate regular SIP for comparison
      this.regularSipComparison = this.calculatorService.calculateRegularSip({
        startDate: new Date(formValue.startDate),
        endDate: new Date(formValue.endDate),
        monthlyAmount: formValue.initialAmount,
        sipDate: formValue.sipDate
      });

      this.recentTransactions = this.sipResult.transactions.slice(-50).reverse();
      
    } catch (error) {
      console.error('Error calculating step-up SIP:', error);
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
      initialAmount: 10000,
      stepUpPercentage: 10,
      sipDate: 1
    });
  }

  applyPreset(preset: string) {
    const presets = {
      conservative: { amount: 5000, increase: 5 },
      moderate: { amount: 10000, increase: 10 },
      aggressive: { amount: 15000, increase: 15 },
      premium: { amount: 25000, increase: 20 }
    };
    
    const config = presets[preset as keyof typeof presets];
    this.sipForm.patchValue({
      initialAmount: config.amount,
      stepUpPercentage: config.increase
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