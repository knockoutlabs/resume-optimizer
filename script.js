document.addEventListener('DOMContentLoaded', () => {
    // Main elements
    const form = document.getElementById('resume-form');
    const resumeUpload = document.getElementById('resume-upload');
    const jobUrlInput = document.getElementById('job-url');
    const analyzeButton = document.getElementById('analyze-button');
    const buttonText = document.getElementById('button-text');
    const progressBarContainer = document.getElementById('progress-bar-container');
    const progressBar = document.getElementById('progress-bar');

    // Modal elements
    const modal = document.getElementById('modal');
    const overallSummaryDiv = document.getElementById('overall-summary');
    const recommendationsGrid = document.getElementById('recommendations-grid');
    const closeModal = document.getElementById('close-modal');
    const successAnimation = document.getElementById('success-animation');

    // File upload elements
    const fileDropArea = document.getElementById('file-drop-area');
    const filePreview = document.getElementById('file-preview');
    const fileName = document.getElementById('file-name');
    const fileInfo = document.getElementById('file-info');
    const removeFileBtn = document.getElementById('remove-file');

    // File upload enhancements
    const validFileTypes = ['pdf', 'docx'];

    // Handle drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileDropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Add visual feedback when file is dragged over
    ['dragenter', 'dragover'].forEach(eventName => {
        fileDropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        fileDropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        fileDropArea.classList.add('drag-over');
    }

    function unhighlight() {
        fileDropArea.classList.remove('drag-over');
    }

    // Handle file drop
    fileDropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        if (e.dataTransfer.files.length) {
            resumeUpload.files = e.dataTransfer.files;
            validateFile(resumeUpload.files[0]);
        }
    }

    // Handle file input change
    resumeUpload.addEventListener('change', () => {
        if (resumeUpload.files.length) {
            validateFile(resumeUpload.files[0]);
        }
    });

    // Remove file button
    removeFileBtn.addEventListener('click', () => {
        resetFileInput();
    });

    // Function to reset file input
    function resetFileInput() {
        resumeUpload.value = '';
        filePreview.style.display = 'none';
        fileDropArea.style.display = 'block';
        resumeUpload.classList.remove('valid-input');
    }

    // Validate file and show preview
    function validateFile(file) {
        const fileExt = file.name.split('.').pop().toLowerCase();

        if (validFileTypes.includes(fileExt)) {
            // Show file preview
            fileName.textContent = file.name;

            // Format file size
            const fileSize = (file.size / 1024).toFixed(2);
            let formattedSize = fileSize + ' KB';
            if (fileSize > 1024) {
                formattedSize = (fileSize / 1024).toFixed(2) + ' MB';
            }

            fileInfo.textContent = `${fileExt.toUpperCase()} • ${formattedSize}`;
            filePreview.style.display = 'block';
            fileDropArea.style.display = 'none';
            resumeUpload.classList.add('valid-input');
        } else {
            showToast('Invalid file type. Please upload a PDF or DOCX file.', 'error');
            resetFileInput();
        }
    }

    // Validate job URL input on blur
    jobUrlInput.addEventListener('blur', validateJobUrl);
    jobUrlInput.addEventListener('input', validateJobUrl);

    function validateJobUrl() {
        const url = jobUrlInput.value.trim();
        if (url && isValidURL(url)) {
            jobUrlInput.classList.add('valid-input');
            return true;
        } else {
            jobUrlInput.classList.remove('valid-input');
            return false;
        }
    }

    // Helper function to validate URL
    function isValidURL(str) {
        try {
            new URL(str);
            return true;
        } catch (_) {
            return false;
        }
    }

    // Toast notification system
    function showToast(message, type = 'info') {
        // Create toast element if it doesn't exist
        let toast = document.getElementById('toast-notification');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-notification';
            toast.style.position = 'fixed';
            toast.style.bottom = '20px';
            toast.style.right = '20px';
            toast.style.padding = '1rem 1.5rem';
            toast.style.borderRadius = '8px';
            toast.style.color = 'white';
            toast.style.fontWeight = '500';
            toast.style.zIndex = '1000';
            toast.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease-in-out';
            document.body.appendChild(toast);
        }

        // Set toast style based on type
        if (type === 'error') {
            toast.style.backgroundColor = 'var(--error)';
        } else if (type === 'success') {
            toast.style.backgroundColor = 'var(--success)';
        } else {
            toast.style.backgroundColor = 'var(--primary)';
        }

        // Set message and show toast
        toast.textContent = message;
        toast.style.opacity = '1';

        // Hide after 3 seconds
        clearTimeout(toast.timeout);
        toast.timeout = setTimeout(() => {
            toast.style.opacity = '0';
        }, 3000);
    }

    // Form submission logic
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate inputs
        if (!resumeUpload.files.length) {
            showToast('Please upload a resume file.', 'error');
            return;
        }

        if (!validateJobUrl()) {
            showToast('Please enter a valid job posting URL.', 'error');
            return;
        }

        // Disable button and show progress
        analyzeButton.disabled = true;
        buttonText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...';
        progressBarContainer.style.display = 'block';
        progressBar.style.width = '0%';
        overallSummaryDiv.innerHTML = '';
        recommendationsGrid.innerHTML = '';

        // Start simulated progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            if (progress < 90) {
                progress += Math.random() * 5 + 5;
                progress = Math.min(progress, 90);
                progressBar.style.width = progress + '%';
            }
        }, 300);

        // Prepare form data
        const formData = new FormData();
        formData.append('resume', resumeUpload.files[0]);
        formData.append('job_description', jobUrlInput.value.trim());

        try {
            const response = await fetch('https://3dd7901c-7006-4633-9c7e-c873d880c3fe-00-xlklbm5dqcm2.spock.replit.dev/analyze', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Server returned an error: ' + response.status);
            }

            const data = await response.json();

            // Complete progress animation
            clearInterval(progressInterval);
            progressBar.style.width = '100%';

            // Show success and display recommendations
            setTimeout(() => {
                displayRecommendations(data.recommendations);
                showToast('Resume analysis completed successfully!', 'success');
            }, 500);
        } catch (error) {
            clearInterval(progressInterval);
            console.error('Error:', error);
            displayError(`Failed to analyze resume. ${error.message || 'Please try again.'}`);
            showToast('Failed to analyze resume. Please try again.', 'error');
        } finally {
            // Reset button state
            setTimeout(() => {
                analyzeButton.disabled = false;
                buttonText.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Optimize My Resume';
                progressBarContainer.style.display = 'none';
            }, 500);
        }
    });

    function displayRecommendations(recommendationsText) {
        // Parse recommendations text into sections
        let sections = recommendationsText.split('\n\n').filter(sec => sec.trim() !== "");
        let overallSummary = "";
        let keyMissingSkills = "";
        let keywordOptimization = "";
        let suggestedImprovements = "";

        // Extract each section
        sections.forEach(sec => {
            if (sec.startsWith("Overall Summary:")) {
                overallSummary = sec.replace("Overall Summary:", "").trim();
            } else if (sec.startsWith("Key Missing Skills:")) {
                keyMissingSkills = sec.replace("Key Missing Skills:", "").trim();
            } else if (sec.startsWith("Keyword Optimization:")) {
                keywordOptimization = sec.replace("Keyword Optimization:", "").trim();
            } else if (sec.startsWith("Suggested Improvements:")) {
                suggestedImprovements = sec.replace("Suggested Improvements:", "").trim();
            }
        });

        // Update UI with results
        overallSummaryDiv.innerHTML = `<p>${overallSummary}</p>`;

        const gridHtml = `
            <div class="recommendation-column">
                <h3><i class="fa-solid fa-clipboard-check"></i> Key Missing Skills</h3>
                ${formatBulletPoints(keyMissingSkills)}
            </div>
            <div class="recommendation-column">
                <h3><i class="fa-solid fa-magnifying-glass"></i> Keyword Optimization</h3>
                ${formatBulletPoints(keywordOptimization)}
            </div>
            <div class="recommendation-column">
                <h3><i class="fa-solid fa-lightbulb"></i> Suggested Improvements</h3>
                ${formatBulletPoints(suggestedImprovements)}
            </div>
        `;
        recommendationsGrid.innerHTML = gridHtml;

        // Show success animation
        successAnimation.style.display = 'block';

        // Show modal with slight delay for animation to be noticed
        setTimeout(() => {
            modal.style.display = 'block';
        }, 300);
    }

    function formatBulletPoints(text) {
        let lines = text.split('\n').filter(line => line.trim() !== "");
        if (lines.length === 0 || text.includes("Everything looks great!")) {
            return `<div class="recommendation-item">Everything looks great!</div>`;
        }
        return lines.map(line => `<div class="recommendation-item">${line.replace(/^-/, "").trim()}</div>`).join('');
    }

    function displayError(message) {
        overallSummaryDiv.innerHTML = '';
        successAnimation.style.display = 'none';
        recommendationsGrid.innerHTML = `<div class='error-message'><i class="fa-solid fa-triangle-exclamation"></i> ${message}</div>`;
        modal.style.display = 'block';
    }

    // Close modal when clicking the close button
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        successAnimation.style.display = 'none';
    });

    // Close modal when clicking outside the modal content
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            successAnimation.style.display = 'none';
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            successAnimation.style.display = 'none';
        }
    });
});
