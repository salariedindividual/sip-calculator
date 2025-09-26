# NIFTY BEES SIP Calculator - Angular Application

A comprehensive Angular application for calculating SIP returns for NIFTY BEES ETF with three advanced investment strategies.

## 🚀 Features

### **Three Investment Strategies:**
1. **Regular SIP** - Consistent monthly investments
2. **Step-up SIP** - Annual increment in SIP amount  
3. **Dip Investment** - Additional investments during market falls

### **Advanced Analytics:**
- 20 years of NIFTY BEES historical data (2004-2024)
- XIRR calculation for accurate returns
- Interactive transaction history
- Strategy comparison analysis
- Real-time form validation

### **Technical Features:**
- Angular 17 with standalone components
- Reactive forms with debounced calculations
- Responsive Bootstrap 5 UI
- TypeScript for type safety
- Modular service architecture

## 📁 Project Structure

```
nifty-bees-calculator/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── landing/              # Landing page
│   │   │   ├── regular-sip/          # Regular SIP calculator
│   │   │   ├── step-up-sip/          # Step-up SIP calculator
│   │   │   └── dip-investment/       # Dip investment calculator
│   │   ├── services/
│   │   │   ├── nifty-bees-data.service.ts    # Historical data service
│   │   │   └── sip-calculator.service.ts     # Calculation logic
│   │   ├── models/
│   │   │   └── sip.interface.ts      # TypeScript interfaces
│   │   ├── app.component.ts          # Root component
│   │   └── app.routes.ts             # Routing configuration
│   ├── styles.scss                   # Global styles
│   └── index.html                    # Main HTML
├── angular.json                      # Angular configuration
├── package.json                      # Dependencies
└── tsconfig.json                     # TypeScript configuration
```

## 🛠️ Installation & Setup

### **Prerequisites:**
- Node.js (v18 or higher)
- npm or yarn
- Angular CLI (v17 or higher)

### **Installation Steps:**

1. **Install Angular CLI globally:**
   ```bash
   npm install -g @angular/cli@latest
   ```

2. **Clone or create the project:**
   ```bash
   ng new nifty-bees-calculator --routing --style=scss --standalone
   cd nifty-bees-calculator
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Copy all the provided files** to their respective locations in the project structure.

5. **Install additional dependencies:**
   ```bash
   npm install bootstrap@5.3.0 chart.js@4.4.0 ng2-charts@5.0.4
   ```

6. **Start the development server:**
   ```bash
   ng serve
   ```

7. **Open your browser:**
   ```
   http://localhost:4200
   ```

## 🏗️ Build & Deployment

### **Development Build:**
```bash
ng build
```

### **Production Build:**
```bash
ng build --configuration production
```

### **Deploy to GitHub Pages:**
```bash
ng add angular-cli-ghpages
ng deploy --base-href=/nifty-bees-calculator/
```

### **Deploy to Netlify/Vercel:**
1. Build the project: `ng build --configuration production`
2. Upload the `dist/nifty-bees-calculator` folder
3. Set the redirect rules for SPA routing

## 🎯 Usage Guide

### **Landing Page (/calculator):**
- Overview of all three strategies
- Quick access to each calculator
- NIFTY BEES information and performance stats

### **Regular SIP (/regular-sip):**
- Set monthly SIP amount
- Choose investment date range
- View total returns and XIRR
- Transaction history

### **Step-up SIP (/step-up-sip):**
- Set initial amount and annual increase %
- Preview step-up amounts year by year
- Compare with regular SIP performance
- Enhanced wealth creation analysis

### **Dip Investment (/dip-investment):**
- Configure base monthly SIP
- Set multiple dip investment rules
- Adjust lookback period for fall calculation
- View dip opportunity statistics

## 🔧 Configuration

### **Customizing Date Range:**
Update the min/max dates in components:
```typescript
minDate = '2004-01-01';
  maxDate = '2025-09-25';
```

### **Adding More Historical Data:**
Update the `NIFTY_BEES_DATA` array in `nifty-bees-data.service.ts`

### **Styling Customization:**
Modify CSS variables in `src/styles.scss`:
```scss
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --primary-color: #667eea;
  --secondary-color: #764ba2;
}
```

## 📊 Data Source

The application uses 20 years of NIFTY BEES historical data (2004-2024) stored in-memory for:
- Fast calculations without API calls
- Offline functionality
- Consistent performance
- Complete historical analysis

## 🚀 Performance Features

- **Lazy loading** for route-based code splitting
- **Debounced calculations** to prevent excessive processing
- **OnPush change detection** for optimal performance
- **Reactive forms** with efficient validation
- **Memory-efficient** data structures

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## ⚠️ Disclaimer

This calculator is for educational purposes only. Past performance does not guarantee future results. Please consult financial advisors before making investment decisions.

---

**Built with ❤️ for Indian investors interested in NIFTY BEES ETF**