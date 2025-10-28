// ===== FORM VALIDATION AND REQUIRED FIELDS HANDLING =====

// VALIDATION FUNCTIONS - USED FREQUENTLY

function validateRequiredFields() {
  // Get all required fields and text inputs that need validation
  const requiredFields = document.querySelectorAll('input[required], select[required]');
  const textInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="date"]');
  
  let firstErrorField = null;
  let hasErrors = false;

  // Clear existing error classes and messages
  [...requiredFields, ...textInputs].forEach(field => {
    clearFieldError(field);
  });

  // Validate required fields first
  requiredFields.forEach(field => {
    const value = field.value.trim();
    
    if (!value) {
      showFieldError(field, 'This field is required');
      hasErrors = true;
      
      if (!firstErrorField) {
        firstErrorField = field;
      }
    }
  });

  // Validate specific field formats
  textInputs.forEach(field => {
    const value = field.value.trim();
    
    // Skip validation if field is empty and not required
    if (!value && !field.hasAttribute('required')) {
      return;
    }
    
    // Skip if field is already marked as having an error (empty required field)
    if (field.classList.contains('error')) {
      return;
    }
    
    let isValid = true;
    let errorMessage = '';
    
    switch (field.id) {
      case 'email':
        if (value && !validateEmail(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid email address (e.g., user@gmail.com)';
        }
        break;
        
      case 'phone1':
      case 'phone2':
        if (value && !validatePhone(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid phone number (10 digits)';
        }
        break;
        
      case 'firstName':
      case 'lastName':
      case 'middleName':
        if (value && !validateName(value)) {
          isValid = false;
          errorMessage = 'Name must contain only letters and be at least 2 characters';
        }
        break;
        
      case 'ssn':
        if (value && !validateSSN(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid SSN (XXX-XX-XXXX format)';
        }
        break;
        
      case 'zip':
        if (value && !validateZipCode(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid zip code (5 digits or 5+4 format)';
        }
        break;
        
      case 'cdlNumber':
        if (value && !validateCDL(value)) {
          isValid = false;
          errorMessage = 'CDL number must be at least 8 alphanumeric characters';
        }
        break;
        
      case 'fein':
        if (value && !validateFEIN(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid FEIN (9 digits)';
        }
        break;
        
      case 'birthday':
        if (value && !validateDateOfBirth(value)) {
          isValid = false;
          errorMessage = 'You must be at least 18 years old';
        }
        break;
        
      case 'city':
      case 'state':
        if (value && !validateName(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid city/state name';
        }
        break;
        
      case 'address':
        if (value && value.length < 5) {
          isValid = false;
          errorMessage = 'Please enter a complete address';
        }
        break;
        
      case 'motorCarrierName':
        if (value && value.length < 2) {
          isValid = false;
          errorMessage = 'Motor Carrier Name must be at least 2 characters';
        }
        break;
    }
    
    if (!isValid) {
      showFieldError(field, errorMessage);
      hasErrors = true;
      
      if (!firstErrorField) {
        firstErrorField = field;
      }
    }
  });

  // Focus on the first error field and scroll to it
  if (firstErrorField) {
    firstErrorField.focus();
    firstErrorField.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
  }

  return !hasErrors;
}

// FIELD VALIDATION HELPERS

function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  // Remove all non-digit characters for validation
  const phoneDigits = phone.replace(/\D/g, '');
  // Accept 10 or 11 digit phone numbers
  return phoneDigits.length === 10 || phoneDigits.length === 11;
}

function validateName(name) {
  // Names should contain only letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  return nameRegex.test(name) && name.trim().length >= 2;
}

function validateSSN(ssn) {
  // SSN format: XXX-XX-XXXX or XXXXXXXXX
  const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
  return ssnRegex.test(ssn);
}

function validateZipCode(zip) {
  // US Zip code: 5 digits or 5+4 format
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zip);
}

function validateCDL(cdl) {
  // CDL should be alphanumeric and at least 8 characters
  return cdl.trim().length >= 8 && /^[a-zA-Z0-9]+$/.test(cdl);
}

function validateFEIN(fein) {
  // FEIN or State Tax ID: Accept only numbers (9 digits)
  const feinDigits = fein.replace(/\D/g, '');
  return feinDigits.length >= 9 && /^\d+$/.test(feinDigits);
}

function validateDateOfBirth(date) {
  if (!date) return false;
  
  const birthDate = new Date(date);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  
  // Must be at least 18 years old and not more than 100 years old
  return age >= 18 && age <= 100;
}

// ERROR DISPLAY FUNCTIONS

function showFieldError(field, message) {
  field.classList.add('error');
  
  // Remove existing error message
  const existingError = field.parentNode.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
  // Add new error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
  field.classList.remove('error');
  const errorMessage = field.parentNode.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.remove();
  }
}

// STEP 5 FUNCTIONALITY

function setupStep5Functionality() {
  console.log('Setting up Step 5 functionality...');
  
  // Set today's date automatically
  const today = new Date().toISOString().split('T')[0];
  const dateField = document.getElementById('signatureDate');
  if (dateField) {
    dateField.value = today;
  }
  
  // Auto-populate fields from stored data
  populateStep5Fields();
  
  // Setup submit button validation
  setupStep5SubmitValidation();
}

function populateStep5Fields() {
  console.log('Populating Step 5 fields with data from previous steps...');
  
  // Get stored data from Step 2
  const step2Data = getStepData(2);
  
  // Populate Motor Carrier Location from Step 2 data
  const motorCarrierField = document.getElementById('motorCarrierLocation');
  if (motorCarrierField) {
    let carrierLocation = '';
    
    if (step2Data.motorCarrierName) {
      carrierLocation = step2Data.motorCarrierName;
      
      const city = step2Data.city || '';
      const state = step2Data.state || '';
      
      if (city && state) {
        carrierLocation += ` - ${city}, ${state}`;
      } else if (city) {
        carrierLocation += ` - ${city}`;
      } else if (state) {
        carrierLocation += ` - ${state}`;
      }
    }
    
    if (carrierLocation) {
      motorCarrierField.value = carrierLocation;
      console.log('Auto-populated Motor Carrier Location:', carrierLocation);
    }
  }
  
  // Populate Unit Number from Step 2 data
  const unitNumberField = document.getElementById('unitNumber');
  if (unitNumberField && step2Data.unitNumber) {
    unitNumberField.value = step2Data.unitNumber;
    console.log('Auto-populated Unit Number:', step2Data.unitNumber);
  }
  
  // Populate signature field with first and last name
  const signatureField = document.getElementById('signature');
  if (signatureField && !signatureField.value) {
    const firstName = step2Data.firstName || '';
    const lastName = step2Data.lastName || '';
    const middleName = step2Data.middleName || '';
    
    let fullName = '';
    if (firstName && lastName) {
      fullName = middleName ? `${firstName} ${middleName} ${lastName}` : `${firstName} ${lastName}`;
    } else if (firstName) {
      fullName = firstName;
    } else if (lastName) {
      fullName = lastName;
    }
    
    if (fullName) {
      signatureField.value = fullName;
      console.log('Auto-populated signature field with:', fullName);
    }
  }
}

function setupStep5SubmitValidation() {
  const termsCheckbox = document.getElementById('termsAccepted');
  const submitBtn = document.getElementById('finalSubmit');
  
  if (!termsCheckbox || !submitBtn) {
    console.log('Step 5 elements not found');
    return;
  }
  
  // Function to check if submit should be enabled
  function checkStep5Completion() {
    const termsAccepted = termsCheckbox.checked;
    
    if (termsAccepted) {
      submitBtn.disabled = false;
      submitBtn.classList.add('enabled');
    } else {
      submitBtn.disabled = true;
      submitBtn.classList.remove('enabled');
    }
  }
  
  // Add event listener for terms checkbox
  termsCheckbox.addEventListener('change', checkStep5Completion);
  
  // Handle form submission
  submitBtn.addEventListener('click', function() {
    const termsAccepted = termsCheckbox.checked;
    const signature = document.getElementById('signature');
    const signatureValue = signature ? signature.value.trim() : '';
    
    if (!termsAccepted) {
      alert('Please accept the Terms and Conditions to proceed.');
      return;
    }
    
    if (!signatureValue) {
      alert('Please provide your signature to proceed.');
      if (signature) signature.focus();
      return;
    }
    
    // Save the Step 5 data
    if (typeof saveCurrentStepData === 'function') {
      saveCurrentStepData(5);
    }
    
    // Show success message
    alert('Application submitted successfully! We will contact you within 24-48 hours.');
    console.log('Application submitted with signature:', signatureValue);
    
    // Add success animation to button
    submitBtn.classList.add('success');
    setTimeout(() => {
      submitBtn.classList.remove('success');
    }, 600);
  });
  
  // Initial check
  checkStep5Completion();
}

// UTILITY FUNCTIONS

// Function to get step data (if available from snapping.js)
function getStepData(stepNumber) {
  // First try to get data from the global formData object from snapping.js
  if (typeof window !== 'undefined' && window.formData) {
    return window.formData[`step${stepNumber}`] || {};
  }
  
  // If global formData doesn't exist, try to access it directly
  if (typeof formData !== 'undefined') {
    return formData[`step${stepNumber}`] || {};
  }
  
  // Fallback: try to get from localStorage
  try {
    const savedData = localStorage.getItem('advancedFormData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return parsedData[`step${stepNumber}`] || {};
    }
  } catch (error) {
    console.error('Error getting step data:', error);
  }
  
  return {};
}

// INITIALIZATION

// Initialize validation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Required fields validation system initialized');
  
  // Add real-time validation - remove error class when user starts typing
  const requiredFields = document.querySelectorAll('input[required], select[required]');
  
  requiredFields.forEach(field => {
    field.addEventListener('input', function() {
      if (this.value.trim()) {
        clearFieldError(this);
      }
    });

    field.addEventListener('change', function() {
      if (this.value.trim()) {
        clearFieldError(this);
      }
    });
  });
  
  // Setup Step 5 functionality if we're on Step 5
  setTimeout(() => {
    if (document.getElementById('termsAccepted')) {
      setupStep5Functionality();
    }
  }, 100);
});