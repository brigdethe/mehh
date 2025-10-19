// Initialize EmailJS when Tilda form is loaded
function initializeEmailJS() {
    // Check if Tilda form is loaded
    const checkForm = setInterval(function() {
        const tildaForm = document.querySelector('form.t-form');
        if (tildaForm) {
            clearInterval(checkForm);
            
            // Initialize EmailJS with your public key
            emailjs.init("PQ_MhrbxostbovrAP");
            
            // Prevent Tilda's default form submission
            tildaForm.setAttribute('onsubmit', 'return false;');
            
            // Get the submit button
            const submitBtn = tildaForm.querySelector('.t-submit');
            const formContainer = tildaForm.closest('.t396__elem');
            
            if (submitBtn && formContainer) {
                // Remove any existing click handlers
                const newSubmit = submitBtn.cloneNode(true);
                submitBtn.parentNode.replaceChild(newSubmit, submitBtn);
                
                // Store original button styles
                const originalText = newSubmit.textContent;
                const originalStyles = {
                    width: newSubmit.style.width,
                    height: newSubmit.style.height,
                    backgroundColor: newSubmit.style.backgroundColor,
                    color: newSubmit.style.color,
                    border: newSubmit.style.border,
                    borderRadius: newSubmit.style.borderRadius
                };
                
                // Add our own click handler
                newSubmit.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Form validation
                    let isValid = true;
                    const inputs = tildaForm.querySelectorAll('input[required], textarea[required]');
                    inputs.forEach(input => {
                        if (!input.value.trim()) {
                            isValid = false;
                            input.style.borderColor = 'red';
                            // Remove red border when user starts typing
                            input.addEventListener('input', function() {
                                this.style.borderColor = '';
                            }, { once: true });
                        }
                    });
                    
                    if (!isValid) {
                        // Flash button red to indicate error
                        newSubmit.style.backgroundColor = '#ff4444';
                        setTimeout(() => {
                            newSubmit.style.backgroundColor = originalStyles.backgroundColor;
                        }, 500);
                        return;
                    }
                    
                    // Show loading state
                    newSubmit.disabled = true;
                    newSubmit.style.cursor = 'wait';
                    newSubmit.textContent = 'Sending...';
                    
                    // Get form data
                    const formData = {};
                    inputs.forEach(input => {
                        formData[input.name] = input.value;
                    });
                    
                    // Map Tilda form fields to EmailJS template
                    const emailData = {
                        from_name: formData.Name || '',
                        phone: formData.Phone || '',
                        message: formData.Input || ''
                    };

                    // Send email using EmailJS
                    emailjs.send('service_g0vou2k', 'template_vedd83x', emailData)
                        .then(function(response) {
                            console.log('SUCCESS!', response.status, response.text);
                            
                            // Clear the form
                            tildaForm.reset();
                            
                            // Show success on button
                            newSubmit.style.backgroundColor = '#4CAF50';
                            newSubmit.textContent = '✓ Sent!';
                            
                            // Reset button after 3 seconds
                            setTimeout(() => {
                                // Restore original button styles
                                Object.entries(originalStyles).forEach(([prop, value]) => {
                                    newSubmit.style[prop] = value;
                                });
                                newSubmit.textContent = originalText;
                                newSubmit.disabled = false;
                                newSubmit.style.cursor = 'pointer';
                            }, 3000);
                            
                        }).catch(function(error) {
                            console.error('FAILED...', error);
                            // Show error on button
                            newSubmit.style.backgroundColor = '#ff4444';
                            newSubmit.textContent = 'Error! Try Again';
                            
                            // Reset button after 3 seconds
                            setTimeout(() => {
                                newSubmit.style.backgroundColor = originalStyles.backgroundColor;
                                newSubmit.textContent = originalText;
                                newSubmit.disabled = false;
                                newSubmit.style.cursor = 'pointer';
                            }, 3000);
                        });
                });
            }
        }
    }, 500);
}

// Start initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeEmailJS);

// Also try to initialize if Tilda's scripts load after DOMContentLoaded
if (window.tilda && window.tilda.onReady) {
    window.tilda.onReady(initializeEmailJS);
}