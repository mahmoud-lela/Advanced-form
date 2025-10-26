const targetEl = document.querySelector('.target');

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
      });
    });
  });
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
            // Setup checkbox groups after loading the content
            setupCheckboxGroups();
        })
        .catch(error => {
            console.error('Error loading snippet:', error);
            targetEl.innerHTML = `<p>Error loading step ${number}</p>`;
        });
}

const steps = document.querySelectorAll('.step');
const lines = document.querySelectorAll('.line');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const submitBtn = document.getElementById('submitBtn');
const progressText = document.getElementById('progress-text');
const progressFill = document.querySelector('.progress-fill');

let currentStep = 1;
const totalSteps = steps.length;

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
  progressFill.style.width = `${(currentStep / totalSteps) * 100}%`;
  progressText.textContent = `${currentStep} of ${totalSteps} complete`;

  // Button behavior
  prevBtn.disabled = currentStep === 1;
  if (currentStep === totalSteps) {
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'inline-block';
  } else {
    nextBtn.style.display = 'inline-block';
    submitBtn.style.display = 'none';
  }
}

nextBtn.addEventListener('click', () => {
  if (currentStep < totalSteps) {
    currentStep++;
    updateUI();
  }
});

prevBtn.addEventListener('click', () => {
  if (currentStep > 1) {
    currentStep--;
    updateUI();
  }
});

submitBtn.addEventListener('click', () => {
  alert('Form submitted successfully!');
});

updateUI();
