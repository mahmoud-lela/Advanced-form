const targetEl = document.querySelector('.target');

// Global object to store all form data
const formData = {
  step1: {},
  step2: {},
  step3: {},
  step4: {},
  step5: {}
};

// Enhanced data persistence with session storage and page refresh detection
const STORAGE_KEY = 'advancedFormData';
const SESSION_KEY = 'formSessionActive';

// Track if this is a fresh page load or navigation within the form
let isPageRefresh = false;

// Multi-step form functionality
const steps = document.querySelectorAll('.step');
const lines = document.querySelectorAll('.line');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const submitBtn = document.getElementById('submitBtn');
const progressText = document.getElementById('progress-text');
const progressFill = document.querySelector('.progress-fill');

let currentStep = 1;
const totalSteps = steps.length;

// CORE FUNCTIONS - USED MOST FREQUENTLY

// Enhanced function to save form data with better persistence
function saveCurrentStepData(stepNumber) {
  console.log(`Saving data for step ${stepNumber}...`);
  
  const currentStepData = {};
  
  // Get all input elements in the current step
  const inputs = document.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    if (input.type === 'checkbox') {
      // For checkboxes, save the checked state and value
      if (input.name) {
        if (!currentStepData[input.name]) {
          currentStepData[input.name] = [];
        }
        if (input.checked) {
          currentStepData[input.name].push(input.value);
        }
        // Also save the checkbox state individually by ID if it has one
        if (input.id) {
          currentStepData[input.id] = input.checked;
        }
      } else if (input.id) {
        currentStepData[input.id] = input.checked;
      }
    } else if (input.type === 'radio') {
      // For radio buttons, save the selected value for the group
      if (input.checked && input.name) {
        currentStepData[input.name] = input.value;
      }
      // Also save individual radio state by ID
      if (input.id) {
        currentStepData[input.id] = input.checked;
      }
    } else {
      // For regular inputs, save the value (including empty values)
      if (input.id) {
        currentStepData[input.id] = input.value || '';
      } else if (input.name) {
        currentStepData[input.name] = input.value || '';
      }
    }
  });
  
  // Save to the global formData object
  formData[`step${stepNumber}`] = currentStepData;
  
  // Add timestamp to track when data was saved
  const dataWithTimestamp = {
    ...formData,
    lastSaved: new Date().toISOString(),
    currentStep: stepNumber
  };
  
  console.log(`Step ${stepNumber} data saved:`, currentStepData);
  
  // Save to localStorage for persistence across navigation
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
}

// Enhanced function to load form data with better error handling
function loadStepData(stepNumber) {
  console.log(`Loading data for step ${stepNumber}...`);
  
  // Small delay to ensure DOM is ready
  setTimeout(() => {
    const stepData = formData[`step${stepNumber}`];
    
    if (stepData && Object.keys(stepData).length > 0) {
      // Populate form fields with saved data
      Object.keys(stepData).forEach(fieldKey => {
        const element = document.getElementById(fieldKey) || document.querySelector(`[name="${fieldKey}"]`);
        
        if (element) {
          if (element.type === 'checkbox') {
            // Handle checkbox state
            if (typeof stepData[fieldKey] === 'boolean') {
              element.checked = stepData[fieldKey];
            } else if (Array.isArray(stepData[fieldKey])) {
              element.checked = stepData[fieldKey].includes(element.value);
            }
          } else if (element.type === 'radio') {
            // Handle radio button state
            if (typeof stepData[fieldKey] === 'boolean') {
              element.checked = stepData[fieldKey];
            } else if (element.name && stepData[element.name] === element.value) {
              element.checked = true;
            }
          } else {
            // Handle regular inputs
            element.value = stepData[fieldKey] || '';
            // Trigger floating label behavior for styled inputs
            if (element.value) {
              element.classList.add('has-value');
              // Trigger change event to update label position
              element.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }
        } else if (fieldKey.includes('role') || fieldKey.includes('company')) {
          // Handle grouped checkboxes/radios by name
          const elements = document.querySelectorAll(`[name="${fieldKey}"]`);
          if (elements.length > 0) {
            elements.forEach(el => {
              if (el.type === 'checkbox' && Array.isArray(stepData[fieldKey])) {
                el.checked = stepData[fieldKey].includes(el.value);
              } else if (el.type === 'radio') {
                el.checked = el.value === stepData[fieldKey];
              }
            });
          }
        }
      });
      
      // Trigger any conditional field displays based on loaded data
      triggerConditionalFields();
      
      console.log(`Step ${stepNumber} data loaded successfully`);
    }
  }, 100);
}

function loadSnippet(number) {
    fetch(`./steps/step-${number}.html`)
        .then(res => {
            if (res.ok) {
                return res.text();
            } else {
                throw new Error(`Failed to load step ${number}`);
            }
        })
        .then(htmlSnippet => {
            targetEl.innerHTML = htmlSnippet;
            
            setupCheckboxGroups();
            setupStep2Functionality();
            
            if (number === 5) {
                setTimeout(() => {
                    if (typeof setupStep5Functionality === 'function') {
                        setupStep5Functionality();
                    } else {
                        populateStep5FieldsDirect();
                        setupStep5SubmitValidationDirect();
                    }
                }, 300);
            }
            
            loadStepData(number);
        })
        .catch(error => {
            console.error('Error loading snippet:', error);
            targetEl.innerHTML = `<p>Error loading step ${number}</p>`;
        });
}

function updateUI() {
  loadSnippet(currentStep);
  
  steps.forEach((step, index) => {
    step.classList.remove('active', 'completed');
    if (index < currentStep - 1) step.classList.add('completed');
    if (index === currentStep - 1) step.classList.add('active');
  });

  lines.forEach((line, index) => {
    line.classList.toggle('active', index < currentStep - 1);
  });

  // Update progress bar
  if (progressFill) {
    progressFill.style.width = `${(currentStep / totalSteps) * 100}%`;
  }
  if (progressText) {
    progressText.textContent = `${currentStep} of ${totalSteps} complete`;
  }

  // Button behavior - Hide back and next buttons on step 5
  if (currentStep === 5) {
    // Step 5: Hide both back and next buttons
    if (nextBtn) nextBtn.style.display = 'none';
    if (submitBtn) submitBtn.style.display = 'inline-block';
  } else {
    // Other steps: Show back and next buttons as normal
    if (prevBtn) {
      prevBtn.style.display = 'inline-block';
      prevBtn.disabled = currentStep === 1;
    }
    
    if (currentStep === totalSteps) {
      if (nextBtn) nextBtn.style.display = 'none';
      if (submitBtn) submitBtn.style.display = 'inline-block';
    } else {
      if (nextBtn) nextBtn.style.display = 'inline-block';
      if (submitBtn) submitBtn.style.display = 'none';
    }
  }
}

// STEP-SPECIFIC FUNCTIONS

function setupCheckboxGroups() {
  document.querySelectorAll('.checkbox-group').forEach(group => {
    const checkboxes = group.querySelectorAll('input[type="checkbox"]');
    const otherInput = group.querySelector('.other-input');

    checkboxes.forEach(box => {
      box.addEventListener('change', () => {
        if (box.checked) {
          // uncheck all others
          checkboxes.forEach(other => {
            if (other !== box) other.checked = false;
          });
        }

        // show/hide the "Other" text field
        if (box.value === 'other' && box.checked) {
          if (otherInput) {
            otherInput.style.display = 'inline-block';
            otherInput.focus();
          }
        } else {
          // Hide other input when any non-other option is selected or other is unchecked
          if (otherInput) {
            otherInput.style.display = 'none';
            otherInput.value = '';
          }
        }
        
        // Save data after checkbox group changes
        saveCurrentStepData(currentStep);
      });
    });
  });
}

function setupStep2Functionality() {
  console.log('Setting up Step 2 functionality...');
  
  // Handle role checkboxes (Owner Operator, Fleet Owner, Fleet Driver)
  const roleCheckboxes = document.querySelectorAll('input[name="role"]');
  const fleetDriverCheckbox = document.getElementById('fleetDriverCheckbox');
  const fleetDriverDetails = document.getElementById('fleetDriverDetails');

  // FIRST: Ensure Owner Operator is auto-checked (do this immediately)
  const ownerOperatorCheckbox = document.querySelector('input[name="role"][value="Owner Operator"]');
  if (ownerOperatorCheckbox) {
    // Always ensure Owner Operator is checked by default
    const anyCheckedRole = document.querySelector('input[name="role"]:checked');
    if (!anyCheckedRole) {
      ownerOperatorCheckbox.checked = true;
      console.log('Auto-checked Owner Operator checkbox - no role was selected');
    }
  }

  // Setup role checkbox behavior (mutually exclusive)
  roleCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      if (this.checked) {
        // Uncheck all other role checkboxes
        roleCheckboxes.forEach(other => {
          if (other !== this) {
            other.checked = false;
          }
        });
        
        // Show Fleet Driver details only if Fleet Driver is selected
        if (this.value === 'Fleet Driver' && fleetDriverDetails) {
          fleetDriverDetails.classList.add('show');
        } else if (fleetDriverDetails) {
          // Hide Fleet Driver details for any other selection
          fleetDriverDetails.classList.remove('show');
          const fleetDriverInfo = document.getElementById('fleetDriverInfo');
          if (fleetDriverInfo) {
            fleetDriverInfo.value = '';
          }
        }
      } else {
        // If unchecking any role, ensure Owner Operator gets checked as default
        setTimeout(() => {
          const stillCheckedRole = document.querySelector('input[name="role"]:checked');
          if (!stillCheckedRole && ownerOperatorCheckbox) {
            ownerOperatorCheckbox.checked = true;
          }
        }, 10);
        
        // If unchecking Fleet Driver, hide the details
        if (this.value === 'Fleet Driver' && fleetDriverDetails) {
          fleetDriverDetails.classList.remove('show');
          const fleetDriverInfo = document.getElementById('fleetDriverInfo');
          if (fleetDriverInfo) {
            fleetDriverInfo.value = '';
          }
        }
      }
      
      // Save data after role change
      saveCurrentStepData(currentStep);
    });
  });

  // Handle company ownership radio buttons
  const companyYes = document.getElementById('companyYes');
  const companyNo = document.getElementById('companyNo');
  const companyNameDetails = document.getElementById('companyNameDetails');

  if (companyYes && companyNameDetails) {
    companyYes.addEventListener('change', function() {
      if (this.checked) {
        companyNameDetails.classList.add('show');
      }
      saveCurrentStepData(currentStep);
    });
  }

  if (companyNo && companyNameDetails) {
    companyNo.addEventListener('change', function() {
      if (this.checked) {
        companyNameDetails.classList.remove('show');
        const companyName = document.getElementById('companyName');
        if (companyName) {
          companyName.value = '';
        }
      }
      saveCurrentStepData(currentStep);
    });
  }
}

// Function to trigger conditional field displays after data load
function triggerConditionalFields() {
  // Trigger Fleet Driver conditional field
  const fleetDriverCheckbox = document.getElementById('fleetDriverCheckbox');
  const fleetDriverDetails = document.getElementById('fleetDriverDetails');
  
  if (fleetDriverCheckbox && fleetDriverDetails && fleetDriverCheckbox.checked) {
    fleetDriverDetails.classList.add('show');
  }
  
  // Trigger Company ownership conditional field
  const companyYes = document.getElementById('companyYes');
  const companyNameDetails = document.getElementById('companyNameDetails');
  
  if (companyYes && companyNameDetails && companyYes.checked) {
    companyNameDetails.classList.add('show');
  }
  
  // Trigger "Other" input fields for phone checkboxes
  document.querySelectorAll('input[value="other"]:checked').forEach(checkbox => {
    const group = checkbox.closest('.checkbox-group');
    if (group) {
      const otherInput = group.querySelector('.other-input');
      if (otherInput) {
        otherInput.style.display = 'inline-block';
      }
    }
  });
}

// STEP 5 FALLBACK FUNCTIONS

function populateStep5FieldsDirect() {
    console.log('Populating Step 5 fields directly...');
    
    // Set today's date automatically
    const today = new Date().toISOString().split('T')[0];
    const dateField = document.getElementById('signatureDate');
    if (dateField) {
        dateField.value = today;
    }
    
    // Get Step 2 data and populate fields
    const step2Data = getStepData(2);
    
    // Populate Motor Carrier Location
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
    
    // Populate Unit Number
    const unitNumberField = document.getElementById('unitNumber');
    if (unitNumberField && step2Data.unitNumber) {
        unitNumberField.value = step2Data.unitNumber;
    }
    
    // Populate signature field
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

function setupStep5SubmitValidationDirect() {
    const termsCheckbox = document.getElementById('termsAccepted');
    const submitBtn = document.getElementById('finalSubmit');
    
    if (!termsCheckbox || !submitBtn) {
        return;
    }
    
    function checkCompletion() {
        submitBtn.disabled = !termsCheckbox.checked;
    }
    
    termsCheckbox.addEventListener('change', checkCompletion);
    
    submitBtn.addEventListener('click', function() {
        if (!termsCheckbox.checked) {
            alert('Please accept the Terms and Conditions to proceed.');
            return;
        }
        
        const signature = document.getElementById('signature');
        if (!signature || !signature.value.trim()) {
            alert('Please provide your signature to proceed.');
            if (signature) signature.focus();
            return;
        }
        
        saveCurrentStepData(5);
        alert('Application submitted successfully! We will contact you within 24-48 hours.');
    });
    
    checkCompletion();
}

// DATA MANAGEMENT FUNCTIONS

// Check if this is a page refresh or new session
function checkSessionState() {
  const sessionActive = sessionStorage.getItem(SESSION_KEY);
  const hasLocalData = localStorage.getItem(STORAGE_KEY);
  
  if (!sessionActive && hasLocalData) {
    // This is a page refresh - clear old data and start fresh
    isPageRefresh = true;
    clearAllFormData();
    console.log('Page refreshed - cleared old form data');
  }
  
  // Mark session as active
  sessionStorage.setItem(SESSION_KEY, 'true');
}

// Enhanced function to initialize form data with session check
function initializeFormData() {
  // First check session state
  checkSessionState();
  
  if (!isPageRefresh) {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        
        // Remove metadata before loading
        const { lastSaved, currentStep, ...cleanData } = parsedData;
        Object.assign(formData, cleanData);
        
        console.log('Form data loaded from localStorage:', formData);
        
        // Restore current step if available
        if (currentStep && typeof currentStep === 'number') {
          window.restoredStep = currentStep;
        }
        
      } catch (error) {
        console.error('Error loading form data from localStorage:', error);
      }
    }
  }
}

// Function to get all form data
function getAllFormData() {
  return formData;
}

// Enhanced function to clear form data
function clearAllFormData() {
  Object.keys(formData).forEach(step => {
    formData[step] = {};
  });
  localStorage.removeItem(STORAGE_KEY);
  console.log('All form data cleared');
}

// Function to get specific step data
function getStepData(stepNumber) {
  return formData[`step${stepNumber}`] || {};
}

// REAL-TIME SAVING FUNCTIONS

// Enhanced real-time data saving with debouncing
let saveTimeout;
function setupRealTimeDataSaving() {
  // Add event listeners for all input types with debouncing
  document.addEventListener('input', function(e) {
    if (e.target.matches('input, select, textarea')) {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        if (typeof currentStep !== 'undefined') {
          saveCurrentStepData(currentStep);
        }
      }, 500); // Wait 500ms after user stops typing
    }
  });
  
  document.addEventListener('change', function(e) {
    if (e.target.matches('input[type="checkbox"], input[type="radio"], select')) {
      if (typeof currentStep !== 'undefined') {
        saveCurrentStepData(currentStep);
      }
    }
  });
}

// Function to auto-save data periodically (backup mechanism)
function setupAutoSave() {
  setInterval(() => {
    if (typeof currentStep !== 'undefined') {
      saveCurrentStepData(currentStep);
    }
  }, 30000); // Auto-save every 30 seconds
}

// Function to handle page unload (save data before leaving)
function setupBeforeUnloadSave() {
  window.addEventListener('beforeunload', function() {
    if (typeof currentStep !== 'undefined') {
      saveCurrentStepData(currentStep);
    }
  });
  
  // Handle visibility change (when user switches tabs)
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden' && typeof currentStep !== 'undefined') {
      saveCurrentStepData(currentStep);
    }
  });
}

// EVENT LISTENERS - NAVIGATION

if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    // Validate required fields before moving to next step
    if (typeof validateRequiredFields === 'function' && !validateRequiredFields()) {
      return; // Don't proceed if validation fails
    }
    
    // Save current step data before moving to next step
    saveCurrentStepData(currentStep);
    
    if (currentStep < totalSteps) {
      currentStep++;
      updateUI();
    }
  });
}

if (prevBtn) {
  prevBtn.addEventListener('click', () => {
    saveCurrentStepData(currentStep);
    
    if (currentStep > 1) {
      currentStep--;
      updateUI();
    }
  });
}

if (submitBtn) {
  submitBtn.addEventListener('click', () => {
    // Save final step data before submitting
    saveCurrentStepData(currentStep);
    
    console.log('Final form data:', getAllFormData());
    alert('Form submitted successfully!');
  });
}

// INITIALIZATION

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing JavaScript...');
  
  // Initialize form data from localStorage with session checking
  initializeFormData();
  
  // Setup enhanced real-time data saving with debouncing
  setupRealTimeDataSaving();
  
  // Setup auto-save every 30 seconds
  setupAutoSave();
  
  // Setup save on page unload/tab switch
  setupBeforeUnloadSave();
  
  // Setup step 2 functionality if we're on step 2
  setupStep2Functionality();
  
  // Setup checkbox groups for all steps
  setupCheckboxGroups();
});

if (steps.length > 0) {
  updateUI();
}


