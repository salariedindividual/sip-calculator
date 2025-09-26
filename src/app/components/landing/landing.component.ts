import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="landing-page">
      <!-- Hero Section -->
      <section class="hero-section gradient-bg text-white py-5">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-lg-6">
              <div class="hero-content fade-in">
                <h1 class="display-4 fw-bold mb-4">
                  <i class="bi bi-graph-up-arrow me-3"></i>
                  NIFTY BEES SIP Calculator
                </h1>
                <p class="lead mb-4">
                  Advanced SIP calculator specifically designed for NIFTY BEES ETF with 
                  multiple investment strategies to maximize your returns.
                </p>
                <div class="hero-stats row text-center">
                  <div class="col-4">
                    <h3 class="fw-bold">20+</h3>
                    <small>Years of Historical Data</small>
                  </div>
                  <div class="col-4">
                    <h3 class="fw-bold">3</h3>
                    <small>Investment Strategies</small>
                  </div>
                  <div class="col-4">
                    <h3 class="fw-bold">100%</h3>
                    <small>Free to Use</small>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-6">
              <div class="hero-image text-center slide-up">
                <i class="bi bi-calculator display-1 mb-4" style="font-size: 8rem; opacity: 0.8;"></i>
                <div class="card card-custom p-4 bg-white text-dark">
                  <h5 class="text-primary-custom">Quick Stats</h5>
                  <div class="row">
                    <div class="col-6">
                      <div class="metric-value text-success">12.5%</div>
                      <div class="metric-label">Avg. NIFTY Returns</div>
                    </div>
                    <div class="col-6">
                      <div class="metric-value text-primary">₹272</div>
                      <div class="metric-label">Current NIFTY BEES Price</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Strategy Cards Section -->
      <section class="strategies-section py-5">
        <div class="container">
          <div class="text-center mb-5">
            <h2 class="fw-bold">Choose Your Investment Strategy</h2>
            <p class="lead text-muted">Select the strategy that best fits your investment goals</p>
          </div>

          <div class="row g-4">
            <!-- Regular SIP Card -->
            <div class="col-lg-4 col-md-6">
              <div class="card card-custom h-100 strategy-card" 
                   routerLink="/regular-sip"
                   [routerLinkActive]="'active'">
                <div class="card-body p-4">
                  <div class="strategy-icon text-center mb-4">
                    <i class="bi bi-arrow-repeat text-primary" style="font-size: 3rem;"></i>
                  </div>
                  <h4 class="card-title text-center mb-3">Regular SIP</h4>
                  <p class="card-text text-muted">
                    Invest a fixed amount every month consistently. Perfect for disciplined, 
                    long-term wealth creation through rupee cost averaging.
                  </p>
                  <ul class="list-unstyled mt-4">
                    <li><i class="bi bi-check-circle text-success me-2"></i>Fixed monthly investment</li>
                    <li><i class="bi bi-check-circle text-success me-2"></i>Rupee cost averaging</li>
                    <li><i class="bi bi-check-circle text-success me-2"></i>Ideal for beginners</li>
                    <li><i class="bi bi-check-circle text-success me-2"></i>Low maintenance</li>
                  </ul>
                  <div class="text-center mt-4">
                    <button class="btn btn-gradient btn-lg">
                      Start Calculator <i class="bi bi-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step-up SIP Card -->
            <div class="col-lg-4 col-md-6">
              <div class="card card-custom h-100 strategy-card" 
                   routerLink="/step-up-sip"
                   [routerLinkActive]="'active'">
                <div class="card-body p-4">
                  <div class="strategy-icon text-center mb-4">
                    <i class="bi bi-graph-up text-warning" style="font-size: 3rem;"></i>
                  </div>
                  <h4 class="card-title text-center mb-3">Step-up SIP</h4>
                  <p class="card-text text-muted">
                    Increase your SIP amount annually to match income growth. 
                    Accelerate wealth creation and beat inflation effectively.
                  </p>
                  <ul class="list-unstyled mt-4">
                    <li><i class="bi bi-check-circle text-success me-2"></i>Annual increment option</li>
                    <li><i class="bi bi-check-circle text-success me-2"></i>Matches income growth</li>
                    <li><i class="bi bi-check-circle text-success me-2"></i>Faster wealth creation</li>
                    <li><i class="bi bi-check-circle text-success me-2"></i>Inflation beating</li>
                  </ul>
                  <div class="text-center mt-4">
                    <button class="btn btn-gradient btn-lg">
                      Start Calculator <i class="bi bi-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Dip Investment Card -->
            <div class="col-lg-4 col-md-6">
              <div class="card card-custom h-100 strategy-card" 
                   routerLink="/dip-investment"
                   [routerLinkActive]="'active'">
                <div class="card-body p-4">
                  <div class="strategy-icon text-center mb-4">
                    <i class="bi bi-graph-down text-danger" style="font-size: 3rem;"></i>
                  </div>
                  <h4 class="card-title text-center mb-3">Dip Investment</h4>
                  <p class="card-text text-muted">
                    Invest additional amounts when NIFTY BEES falls. 
                    Buy more during market corrections for enhanced returns.
                  </p>
                  <ul class="list-unstyled mt-4">
                    <li><i class="bi bi-check-circle text-success me-2"></i>Opportunistic investing</li>
                    <li><i class="bi bi-check-circle text-success me-2"></i>Multiple dip thresholds</li>
                    <li><i class="bi bi-check-circle text-success me-2"></i>Enhanced returns</li>
                    <li><i class="bi bi-check-circle text-success me-2"></i>Smart market timing</li>
                  </ul>
                  <div class="text-center mt-4">
                    <button class="btn btn-gradient btn-lg">
                      Start Calculator <i class="bi bi-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section bg-light py-5">
        <div class="container">
          <div class="text-center mb-5">
            <h2 class="fw-bold">Why Choose Our Calculator?</h2>
            <p class="lead text-muted">Built specifically for NIFTY BEES with advanced features</p>
          </div>

          <div class="row g-4">
            <div class="col-lg-3 col-md-6">
              <div class="feature-card text-center">
                <div class="feature-icon mb-3">
                  <i class="bi bi-database text-primary" style="font-size: 2.5rem;"></i>
                </div>
                <h5>20 Years Historical Data</h5>
                <p class="text-muted">Complete NIFTY BEES price data from 2004-2025 for accurate calculations</p>
              </div>
            </div>

            <div class="col-lg-3 col-md-6">
              <div class="feature-card text-center">
                <div class="feature-icon mb-3">
                  <i class="bi bi-bar-chart text-success" style="font-size: 2.5rem;"></i>
                </div>
                <h5>Interactive Charts</h5>
                <p class="text-muted">Visual representation of your investment growth and performance</p>
              </div>
            </div>

            <div class="col-lg-3 col-md-6">
              <div class="feature-card text-center">
                <div class="feature-icon mb-3">
                  <i class="bi bi-calculator text-warning" style="font-size: 2.5rem;"></i>
                </div>
                <h5>XIRR Calculation</h5>
                <p class="text-muted">Accurate annualized returns calculation considering timing of investments</p>
              </div>
            </div>

            <div class="col-lg-3 col-md-6">
              <div class="feature-card text-center">
                <div class="feature-icon mb-3">
                  <i class="bi bi-list-ul text-info" style="font-size: 2.5rem;"></i>
                </div>
                <h5>Transaction History</h5>
                <p class="text-muted">Detailed breakdown of all your SIP transactions and investments</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- NIFTY BEES Info Section -->
      <section class="info-section py-5">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-lg-6">
              <h2 class="fw-bold mb-4">About NIFTY BEES</h2>
              <p class="lead">
                NIFTY BEES is India's first Exchange Traded Fund (ETF) that tracks the NIFTY 50 index.
              </p>
              <div class="info-points">
                <div class="info-point mb-3">
                  <i class="bi bi-check-circle-fill text-success me-3"></i>
                  <strong>Low Expense Ratio:</strong> One of the lowest cost ways to invest in NIFTY 50
                </div>
                <div class="info-point mb-3">
                  <i class="bi bi-check-circle-fill text-success me-3"></i>
                  <strong>High Liquidity:</strong> Can be bought/sold during market hours like stocks
                </div>
                <div class="info-point mb-3">
                  <i class="bi bi-check-circle-fill text-success me-3"></i>
                  <strong>Transparency:</strong> Real-time NAV and holdings information
                </div>
                <div class="info-point mb-3">
                  <i class="bi bi-check-circle-fill text-success me-3"></i>
                  <strong>Diversification:</strong> Instant exposure to top 50 Indian companies
                </div>
              </div>
            </div>
            <div class="col-lg-6">
              <div class="card card-custom p-4">
                <h5 class="text-primary-custom mb-3">NIFTY BEES Performance Highlights</h5>
                <div class="row text-center">
                  <div class="col-6 mb-3">
                    <div class="metric-value">₹272.22</div>
                    <div class="metric-label">Current Price</div>
                  </div>
                  <div class="col-6 mb-3">
                    <div class="metric-value">1,300%+</div>
                    <div class="metric-label">20-Year Returns</div>
                  </div>
                  <div class="col-6">
                    <div class="metric-value">~12.5%</div>
                    <div class="metric-label">Average Annual Returns</div>
                  </div>
                  <div class="col-6">
                    <div class="metric-value">₹19.10</div>
                    <div class="metric-label">Launch Price (2004)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section gradient-bg text-white py-5">
        <div class="container">
          <div class="text-center">
            <h2 class="fw-bold mb-4">Ready to Plan Your NIFTY BEES Investment?</h2>
            <p class="lead mb-4">Choose your preferred strategy and start calculating your potential returns</p>
            <div class="cta-buttons">
              <button class="btn btn-light btn-lg me-3" routerLink="/regular-sip">
                <i class="bi bi-arrow-repeat me-2"></i>Regular SIP
              </button>
              <button class="btn btn-outline-light btn-lg me-3" routerLink="/step-up-sip">
                <i class="bi bi-graph-up me-2"></i>Step-up SIP
              </button>
              <button class="btn btn-outline-light btn-lg" routerLink="/dip-investment">
                <i class="bi bi-graph-down me-2"></i>Dip Investment
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .hero-section {
      min-height: 70vh;
      display: flex;
      align-items: center;
    }

    .hero-stats h3 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .strategy-card {
      transition: all 0.3s ease;
      cursor: pointer;
      border: 2px solid transparent;
    }

    .strategy-card:hover {
      transform: translateY(-5px);
      border-color: var(--primary-color);
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    }

    .strategy-icon i {
      transition: all 0.3s ease;
    }

    .strategy-card:hover .strategy-icon i {
      transform: scale(1.1);
    }

    .feature-card {
      padding: 2rem 1rem;
    }

    .feature-icon i {
      transition: all 0.3s ease;
    }

    .feature-card:hover .feature-icon i {
      transform: scale(1.1);
    }

    .info-point {
      display: flex;
      align-items: flex-start;
    }

    .cta-buttons .btn {
      margin: 0.5rem;
    }

    @media (max-width: 768px) {
      .hero-section {
        min-height: 60vh;
        text-align: center;
      }
      
      .hero-stats {
        margin-top: 2rem;
      }
      
      .cta-buttons .btn {
        display: block;
        width: 100%;
        margin: 0.5rem 0;
      }
    }
  `]
})
export class LandingComponent {}