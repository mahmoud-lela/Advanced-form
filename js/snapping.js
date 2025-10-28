const targetEl = document.querySelector('.target');

const formData = {
  step1: {},
  step2: {},
  step3: {},
  step4: {},
  step5: {}
};

const STORAGE_KEY = 'advancedFormData';

const steps = document.querySelectorAll('.step');
const lines = document.querySelectorAll('.line');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const submitBtn = document.getElementById('submitBtn');
const progressText = document.getElementById('progress-text');
const progressFill = document.querySelector('.progress-fill');

let currentStep = 1;
const totalSteps = steps.length;

function saveCurrentStepData(stepNumber) {
  const currentStepData = {};
  const inputs = document.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    if (input.type === 'checkbox') {
      if (input.name === 'coverage' && input.id) {
        currentStepData[input.id] = input.checked;
        
        if (!currentStepData.coverage) {
          currentStepData.coverage = [];
        }
        if (input.checked) {
          currentStepData.coverage.push(input.value);
        }
        
        const fieldName = input.value.replace(/\s+/g, '');
        currentStepData[fieldName] = input.checked;
      } else {
        if (input.name) {
          if (!currentStepData[input.name]) {
            currentStepData[input.name] = [];
          }
          if (input.checked) {
            currentStepData[input.name].push(input.value);
          }
          if (input.id) {
            currentStepData[input.id] = input.checked;
          }
        } else if (input.id) {
          currentStepData[input.id] = input.checked;
        }
      }
    } else if (input.type === 'radio') {
      if (input.checked && input.name) {
        currentStepData[input.name] = input.value;
      }
      if (input.id) {
        currentStepData[input.id] = input.checked;
      }
    } else {
      if (input.id) {
        currentStepData[input.id] = input.value || '';
      } else if (input.name) {
        currentStepData[input.name] = input.value || '';
      }
    }
  });
  
  if (stepNumber === 3) {
    const coverageIds = [
      'occupationalAccident',
      'physicalDamage',
      'nonTruckingLiability',
      'workersCompensation',
      'occupationalCompensation'
    ];
    const selectedIds = coverageIds.filter(id => currentStepData[id] === true);
    if (selectedIds.length === 1) {
      currentStepData.selectedCoverageId = selectedIds[0];
      try { localStorage.setItem('selectedCoverage', selectedIds[0]); } catch (_) {}
      window.selectedCoverageId = selectedIds[0];
    } else {
      delete currentStepData.selectedCoverageId;
      try { localStorage.removeItem('selectedCoverage'); } catch (_) {}
      window.selectedCoverageId = null;
    }
  }
  
  formData[`step${stepNumber}`] = currentStepData;
  
  const dataWithTimestamp = {
    ...formData,
    lastSaved: new Date().toISOString(),
    currentStep: stepNumber
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
  window.formData = formData;
}

function loadStepData(stepNumber) {
  setTimeout(() => {
    const stepData = formData[`step${stepNumber}`];
    
    if (stepData && Object.keys(stepData).length > 0) {
      Object.keys(stepData).forEach(fieldKey => {
        const element = document.getElementById(fieldKey) || document.querySelector(`[name="${fieldKey}"]`);
        
        if (element) {
          if (element.type === 'checkbox') {
            if (typeof stepData[fieldKey] === 'boolean') {
              element.checked = stepData[fieldKey];
            } else if (Array.isArray(stepData[fieldKey])) {
              element.checked = stepData[fieldKey].includes(element.value);
            }
          } else if (element.type === 'radio') {
            if (typeof stepData[fieldKey] === 'boolean') {
              element.checked = stepData[fieldKey];
            } else if (element.name && stepData[element.name] === element.value) {
              element.checked = true;
            }
          } else {
            element.value = stepData[fieldKey] || '';
            if (element.value) {
              element.classList.add('has-value');
              element.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }
        } else if (fieldKey.includes('role') || fieldKey.includes('company')) {
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
      
      triggerConditionalFields();
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
                    }
                }, 300);
            }
            
            if (number === 4) {
              setTimeout(() => {
                try { showStep4Coverage(); } catch (e) { console.warn('showStep4Coverage failed:', e); }
              }, 150);
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

  if (progressFill) {
    progressFill.style.width = `${(currentStep / totalSteps) * 100}%`;
  }
  if (progressText) {
    progressText.textContent = `${currentStep} of ${totalSteps} complete`;
  }

  if (currentStep === 5) {
    if (nextBtn) nextBtn.style.display = 'none';
    if (submitBtn) submitBtn.style.display = 'inline-block';
  } else {
    if (prevBtn) {
      prevBtn.style.display = 'inline-block';
      prevBtn.disabled = currentStep === 1;
    }
    
    if (currentStep === totalSteps) {
      if (nextBtn) nextBtn.style.display = 'none';
      if (submitBtn) submitBtn.style.display = 'inline-block';
    } else {
      if (nextBtn) nextBtn.style.display = 'inline-block';
      if (submitBtn) nextBtn.style.display = 'none';
    }
  }
}

function setupCheckboxGroups() {
  document.querySelectorAll('.checkbox-group').forEach(group => {
    const checkboxes = group.querySelectorAll('input[type="checkbox"]');
    const otherInput = group.querySelector('.other-input');

    checkboxes.forEach(box => {
      box.addEventListener('change', () => {
        if (box.checked) {
          checkboxes.forEach(other => {
            if (other !== box) other.checked = false;
          });
        }

        if (box.value === 'other' && box.checked) {
          if (otherInput) {
            otherInput.style.display = 'inline-block';
            otherInput.focus();
          }
        } else {
          if (otherInput) {
            otherInput.style.display = 'none';
            otherInput.value = '';
          }
        }
        
        saveCurrentStepData(currentStep);
      });
    });
  });
  
  setupStep3CoverageCheckboxes();
}

function setupStep3CoverageCheckboxes() {
  const coverageCheckboxes = document.querySelectorAll('input[name="coverage"]');
  
  if (coverageCheckboxes.length > 0) {
    coverageCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        saveCurrentStepData(3);
      });
    });
  }
}

function setupStep2Functionality() {
  const roleCheckboxes = document.querySelectorAll('input[name="role"]');
  const fleetDriverCheckbox = document.getElementById('fleetDriverCheckbox');
  const fleetDriverDetails = document.getElementById('fleetDriverDetails');

  const ownerOperatorCheckbox = document.querySelector('input[name="role"][value="Owner Operator"]');
  if (ownerOperatorCheckbox) {
    const anyCheckedRole = document.querySelector('input[name="role"]:checked');
    if (!anyCheckedRole) {
      ownerOperatorCheckbox.checked = true;
    }
  }

  roleCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      if (this.checked) {
        roleCheckboxes.forEach(other => {
          if (other !== this) {
            other.checked = false;
          }
        });
        
        if (this.value === 'Fleet Driver' && fleetDriverDetails) {
          fleetDriverDetails.classList.add('show');
        } else if (fleetDriverDetails) {
          fleetDriverDetails.classList.remove('show');
          const fleetDriverInfo = document.getElementById('fleetDriverInfo');
          if (fleetDriverInfo) {
            fleetDriverInfo.value = '';
          }
        }
      } else {
        setTimeout(() => {
          const stillCheckedRole = document.querySelector('input[name="role"]:checked');
          if (!stillCheckedRole && ownerOperatorCheckbox) {
            ownerOperatorCheckbox.checked = true;
          }
        }, 10);
        
        if (this.value === 'Fleet Driver' && fleetDriverDetails) {
          fleetDriverDetails.classList.remove('show');
          const fleetDriverInfo = document.getElementById('fleetDriverInfo');
          if (fleetDriverInfo) {
            fleetDriverInfo.value = '';
          }
        }
      }
      
      saveCurrentStepData(currentStep);
    });
  });

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

function triggerConditionalFields() {
  const fleetDriverCheckbox = document.getElementById('fleetDriverCheckbox');
  const fleetDriverDetails = document.getElementById('fleetDriverDetails');
  
  if (fleetDriverCheckbox && fleetDriverDetails && fleetDriverCheckbox.checked) {
    fleetDriverDetails.classList.add('show');
  }
  
  const companyYes = document.getElementById('companyYes');
  const companyNameDetails = document.getElementById('companyNameDetails');
  
  if (companyYes && companyNameDetails && companyYes.checked) {
    companyNameDetails.classList.add('show');
  }
  
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

function showStep4Coverage() {
  const sections = document.querySelectorAll('[id$="-data"]');
  sections.forEach(el => {
    el.classList.remove('selected-coverage');
    el.setAttribute('hidden', '');
    el.style.display = '';
  });

  const step3 = getStepData(3) || {};
  const ids = [
    'occupationalAccident',
    'physicalDamage',
    'nonTruckingLiability',
    'workersCompensation',
    'occupationalCompensation'
  ];

  let toShow = [];
  if (step3.selectedCoverageId) {
    toShow = [step3.selectedCoverageId];
  } else {
    ids.forEach(id => { if (step3[id] === true) toShow.push(id); });
  }
  if (toShow.length === 0) {
    try {
      const localSelected = localStorage.getItem('selectedCoverage');
      if (localSelected) toShow = [localSelected];
    } catch (_) {}
  }

  if (toShow.length > 0) {
    toShow.forEach(id => {
      const el = document.getElementById(id + '-data');
      if (el) {
        el.removeAttribute('hidden');
        el.style.display = '';
        el.classList.add('selected-coverage');
      }
    });
  } else {
    const summaryNote = document.querySelector('.summary-note');
    if (summaryNote) {
      summaryNote.innerHTML = 'No coverage selection found. Please go back to Step 3 to select a coverage type.';
      summaryNote.style.color = '#ff6b6b';
    }
  }
}

function initializeFormData() {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      const { lastSaved, currentStep, ...cleanData } = parsedData;
      Object.assign(formData, cleanData);
      
      if (currentStep && typeof currentStep === 'number') {
        window.restoredStep = currentStep;
      }
      
    } catch (error) {
      console.error('Error loading form data from localStorage:', error);
    }
  }
}

function getAllFormData() {
  return formData;
}

function getStepData(stepNumber) {
  return formData[`step${stepNumber}`] || {};
}

let saveTimeout;
function setupRealTimeDataSaving() {
  document.addEventListener('input', function(e) {
    if (e.target.matches('input, select, textarea')) {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        if (typeof currentStep !== 'undefined') {
          saveCurrentStepData(currentStep);
        }
      }, 500);
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

if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    let canProceed = true;
    
    if (currentStep === 3) {
      if (typeof window.validateStep3 === 'function') {
        canProceed = window.validateStep3();
      } else {
        const selected = document.querySelector('input[name="coverage"]:checked');
        if (!selected) {
          alert('Please select one coverage option before continuing!');
          canProceed = false;
        }
      }
    } else if (typeof validateRequiredFields === 'function' && !validateRequiredFields()) {
      canProceed = false;
    }
    
    if (!canProceed) {
      return;
    }
    
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
    saveCurrentStepData(currentStep);
    
    console.log('Final form data:', getAllFormData());
    alert('Form submitted successfully!');
  });
}

document.addEventListener('DOMContentLoaded', function() {
  initializeFormData();
  setupRealTimeDataSaving();
  setupStep2Functionality();
  setupCheckboxGroups();
});

if (steps.length > 0) {
  updateUI();
}


