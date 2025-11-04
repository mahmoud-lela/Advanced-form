# TransGuard QuickApp - Advanced Multi-Step Form

A responsive, interactive multi-step form application designed for insurance applications with comprehensive validation, data persistence, and user-friendly navigation.

## 📋 Project Overview

TransGuard QuickApp is a sophisticated form application built for collecting insurance application data through a streamlined 5-step process. The application features real-time validation, data persistence, progress tracking, and responsive design for optimal user experience across all devices.

## ✨ Features

### Core Functionality
- **5-Step Form Process**: Intuitive step-by-step data collection
- **Progress Tracking**: Visual progress bar and step indicators
- **Data Persistence**: Automatic saving to localStorage with recovery
- **Real-time Validation**: Instant field validation with custom error messages
- **Responsive Design**: Mobile-first design that works on all devices
- **Smart Navigation**: Context-aware next/previous button states

### Step-by-Step Features

#### Step 1: Personal Information
- Email validation with proper format checking
- CDL number and state selection
- Phone number validation (10-11 digits)
- Date of birth validation (minimum age 18)
- SSN format validation (XXX-XX-XXXX)
- FEIN/Tax ID validation

#### Step 2: Professional Details
- Role selection (Owner Operator, Fleet Driver, etc.)
- Conditional company information fields
- Dynamic form fields based on selections
- Motor carrier information

#### Step 3: Coverage Selection
- Single-select coverage options
- Coverage type validation
- Selection persistence across steps

#### Step 4: Coverage Summary
- Dynamic display of selected coverage details
- Review of previous selections
- Coverage-specific information display

#### Step 5: Final Submission
- Terms and conditions acceptance
- Digital signature field
- Auto-populated fields from previous steps
- Final validation and submission

### Technical Features
- **Floating Labels**: Modern UI with animated floating labels
- **Error Handling**: Comprehensive validation with user-friendly messages
- **State Management**: Advanced form state management with localStorage
- **Dynamic Loading**: Async loading of step content
- **Cross-Step Data Flow**: Seamless data sharing between steps

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (recommended for full functionality)

### Installation

1. **Clone or Download the Project**
   ```bash
   git clone <repository-url>
   # or download and extract the ZIP file
   ```

2. **Navigate to Project Directory**
   ```bash
   cd advanced-form
   ```

3. **Set Up Local Server** (Recommended)
   
   **Option A: Using Python**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```
   
   **Option B: Using Node.js**
   ```bash
   npx serve .
   # or
   npx http-server
   ```
   
   **Option C: Using Live Server (VS Code)**
   - Install Live Server extension
   - Right-click on `index.html`
   - Select "Open with Live Server"

4. **Access the Application**
   - Open your browser and navigate to:
   - `http://localhost:8000` (or the port your server is using)

### Direct File Opening
While you can open `index.html` directly in a browser, using a local server is recommended to avoid CORS issues when loading step files.

## 📁 Project Structure

```
advanced-form/
├── index.html              # Main application file
├── README.md              # Project documentation
├── js/
│   ├── required.js        # Form validation and required fields handling
│   └── snapping.js        # Step navigation and state management
├── steps/
│   ├── step-1.html        # Personal information step
│   ├── step-2.html        # Professional details step
│   ├── step-3.html        # Coverage selection step
│   ├── step-4.html        # Coverage summary step
│   └── step-5.html        # Final submission step
└── styles/
    ├── main.css           # Main application styles
    ├── step1.css          # Step 1 specific styles
    ├── step2.css          # Step 2 specific styles
    ├── step3.css          # Step 3 specific styles
    ├── step4.css          # Step 4 specific styles
    └── step5.css          # Step 5 specific styles
```

## 🎯 Usage Guide

### Starting the Application
1. Open the application in your browser
2. Begin with Step 1: "Let's Get Started"
3. Fill in the required personal information
4. Use the "Next" button to proceed to subsequent steps

### Navigation
- **Next Button**: Proceeds to the next step (validates current step)
- **Back Button**: Returns to the previous step (saves current data)
- **Step Indicators**: Visual representation of progress
- **Progress Bar**: Shows completion percentage

### Data Entry Tips
- **Required Fields**: Marked with validation that triggers on submission attempt
- **Email Format**: Must be a valid email address (user@domain.com)
- **Phone Numbers**: Enter 10-digit US phone numbers
- **SSN Format**: Use XXX-XX-XXXX format or enter digits only
- **Date of Birth**: Must indicate age 18 or older
- **CDL Information**: Alphanumeric characters, minimum 8 characters

### Data Persistence
- Form data is automatically saved to browser localStorage
- Data persists across browser sessions
- Refresh the page to resume where you left off
- Clear browser data to reset the form

## 🔧 Customization

### Adding New Validation Rules
Edit `js/required.js` and add new cases to the validation switch statement:

```javascript
case 'yourFieldId':
  if (value && !yourValidationFunction(value)) {
    isValid = false;
    errorMessage = 'Your custom error message';
  }
  break;
```

### Modifying Steps
1. Edit the corresponding HTML file in the `steps/` directory
2. Update the associated CSS file in `styles/`
3. Add any step-specific JavaScript to `js/snapping.js`

### Styling Changes
- **Global Styles**: Edit `styles/main.css`
- **Step-Specific Styles**: Edit corresponding `styles/stepX.css` files
- **Responsive Design**: Media queries are included for mobile optimization

## 🌐 Browser Compatibility

- **Chrome**: 70+
- **Firefox**: 65+
- **Safari**: 12+
- **Edge**: 79+
- **Mobile Browsers**: iOS Safari 12+, Chrome Mobile 70+

## 🔍 Troubleshooting

### Common Issues

**Form Steps Not Loading**
- Ensure you're using a local server
- Check browser console for CORS errors
- Verify all step files exist in the `steps/` directory

**Validation Not Working**
- Check that required.js is loaded
- Verify field IDs match validation cases
- Ensure proper HTML5 input types are used

**Data Not Persisting**
- Check if localStorage is available in your browser
- Verify browser privacy settings allow localStorage
- Clear browser cache if experiencing issues

**Styling Issues**
- Ensure all CSS files are properly linked
- Check for CSS syntax errors in browser console
- Verify file paths are correct

### Development Mode
For development and debugging:
1. Open browser Developer Tools (F12)
2. Check Console tab for JavaScript errors
3. Use Network tab to verify file loading
4. Inspect localStorage in Application/Storage tab

## 📝 License

This project is for educational/demonstration purposes. Please ensure proper licensing for production use.

## 🤝 Contributing

1. Fork the project
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions or issues:
- Check the troubleshooting section above
- Review browser console for error messages
- Ensure all files are properly served via HTTP(S)

---

**Last Updated**: November 2025
**Version**: 1.0.0