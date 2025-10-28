// ===== FORM VALIDATION AND REQUIRED FIELDS HANDLING =====

function validateRequiredFields() {
  const requiredFields = document.querySelectorAll('input[required], select[required]');
  const textInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="date"]');
  
  let firstErrorField = null;
  let hasErrors = false;

  [...requiredFields, ...textInputs].forEach(field => {
    clearFieldError(field);
  });

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

  textInputs.forEach(field => {
    const value = field.value.trim();
    
    if (!value && !field.hasAttribute('required')) {
      return;
    }
    
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
      case 'city':
      case 'state':
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

  if (firstErrorField) {
    firstErrorField.focus();
    firstErrorField.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
  }

  return !hasErrors;
}

function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  const phoneDigits = phone.replace(/\D/g, '');
  return phoneDigits.length === 10 || phoneDigits.length === 11;
}

function validateName(name) {
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  return nameRegex.test(name) && name.trim().length >= 2;
}

function validateSSN(ssn) {
  const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
  return ssnRegex.test(ssn);
}

function validateZipCode(zip) {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zip);
}

function validateCDL(cdl) {
  return cdl.trim().length >= 8 && /^[a-zA-Z0-9]+$/.test(cdl);
}

function validateFEIN(fein) {
  const feinDigits = fein.replace(/\D/g, '');
  return feinDigits.length >= 9 && /^\d+$/.test(feinDigits);
}

function validateDateOfBirth(date) {
  if (!date) return false;
  
  const birthDate = new Date(date);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  
  return age >= 18 && age <= 100;
}

function showFieldError(field, message) {
  field.classList.add('error');
  
  const existingError = field.parentNode.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
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

function setupStep5Functionality() {
  const today = new Date().toISOString().split('T')[0];
  const dateField = document.getElementById('signatureDate');
  if (dateField) {
    dateField.value = today;
  }
  
  populateStep5Fields();
  setupStep5SubmitValidation();
}

function populateStep5Fields() {
  const step2Data = getStepData(2);
  
  const motorCarrierField = document.getElementById('motorCarrierLocation');
  if (motorCarrierField && step2Data.motorCarrierName) {
    let carrierLocation = step2Data.motorCarrierName;
    
    const city = step2Data.city || '';
    const state = step2Data.state || '';
    
    if (city && state) {
      carrierLocation += ` - ${city}, ${state}`;
    } else if (city) {
      carrierLocation += ` - ${city}`;
    } else if (state) {
      carrierLocation += ` - ${state}`;
    }
    
    motorCarrierField.value = carrierLocation;
  }
  
  const unitNumberField = document.getElementById('unitNumber');
  if (unitNumberField && step2Data.unitNumber) {
    unitNumberField.value = step2Data.unitNumber;
  }
  
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
    }
  }
}

function setupStep5SubmitValidation() {
  const termsCheckbox = document.getElementById('termsAccepted');
  const submitBtn = document.getElementById('finalSubmit');
  
  if (!termsCheckbox || !submitBtn) {
    return;
  }
  
  function checkStep5Completion() {
    if (termsCheckbox.checked) {
      submitBtn.disabled = false;
      submitBtn.classList.add('enabled');
    } else {
      submitBtn.disabled = true;
      submitBtn.classList.remove('enabled');
    }
  }
  
  termsCheckbox.addEventListener('change', checkStep5Completion);
  
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
    
    if (typeof saveCurrentStepData === 'function') {
      saveCurrentStepData(5);
    }
    
    alert('Application submitted successfully! We will contact you within 24-48 hours.');
    
    submitBtn.classList.add('success');
    setTimeout(() => {
      submitBtn.classList.remove('success');
    }, 600);
  });
  
  checkStep5Completion();
}

function getStepData(stepNumber) {
  if (typeof window !== 'undefined' && window.formData) {
    return window.formData[`step${stepNumber}`] || {};
  }
  
  if (typeof formData !== 'undefined') {
    return formData[`step${stepNumber}`] || {};
  }
  
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

document.addEventListener('DOMContentLoaded', function() {
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
  
  setTimeout(() => {
    if (document.getElementById('termsAccepted')) {
      setupStep5Functionality();
    }
  }, 100);
});