import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkWithHref  } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkWithHref],
  template: `
    <div class="app-container">
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
          <a class="navbar-brand" routerLink="/calculator">
            <img class="image-main" src="/assets/image.png" alt="image">
            NIFTY BEES SIP Calculator
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
              <li class="nav-item">
                <a class="nav-link" routerLink="/calculator">Home</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/regular-sip">Regular SIP</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/step-up-sip">Step-up SIP</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/dip-investment">Dip Investment</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      
      <footer class="bg-dark text-light py-4">
        <div class="container">
          <div class="row">
            <div class="col-md-6">
              <h6>SalariedIndividual NiftyBees SIP Calculator</h6>
              <p class="mb-0">Advanced investment strategy calculator for NIFTY BEES ETF</p>
            </div>
            <div class="col-md-6 text-md-end">
              <p class="mb-0">
                <small>
                  <i class="bi bi-exclamation-triangle me-1"></i>
                  Past performance does not guarantee future results. Please invest wisely.
                </small>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .main-content {
      flex: 1;
      padding: 0;
    }
    
    .navbar-brand {
      font-weight: 600;
      font-size: 1.25rem;
    }
    
    .nav-link {
      transition: all 0.3s ease;
    }
    
    .nav-link:hover {
      color: #667eea !important;
    }

    .image-main {
      height: 50px;
      width: 50px;
      background: white;
    }
  `]
})
export class AppComponent {
  title = 'NIFTY BEES SIP Calculator';
}