document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('resume-form');
    const resumeUpload = document.getElementById('resume-upload');
    const jobUrlInput = document.getElementById('job-url');
    const analyzeButton = document.getElementById('analyze-button');
    const buttonText = document.getElementById('button-text');
    const progressBarContainer = document.getElementById('progress-bar-container');
    const progressBar = document.getElementById('progress-bar');
    const modal = document.getElementById('modal');
    const overallSummaryDiv = document.getElementById('overall-summary');
    const recommendationsGrid = document.getElementById('recommendations-grid');
    const closeModal = document.getElementById('close-modal');

    // Validate file input on change
    resumeUpload.addEventListener('change', () => {
        if (resumeUpload.files.length) {
            const file = resumeUpload.files[0];
            const validExtensions = ['pdf', 'docx'];
            const fileExt = file.name.split('.').pop().toLowerCase();
            if (validExtensions.includes(fileExt)) {
                resumeUpload.classList.add('valid-input');
            } else {
                resumeUpload.classList.remove('valid-input');
                alert('Invalid file type. Please upload a PDF or DOCX file.');
            }
        }
    });

    // Validate job URL input on blur
    jobUrlInput.addEventListener('blur', () => {
        const url = jobUrlInput.value.trim();
        if (url && isValidURL(url)) {
            jobUrlInput.classList.add('valid-input');
        } else {
            jobUrlInput.classList.remove('valid-input');
        }
    });

    // Helper function to validate URL
    function isValidURL(str) {
        try {
            new URL(str);
            return true;
        } catch (_) {
            return false;
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!resumeUpload.files.length) {
            alert('Please upload a resume file.');
            return;
        }
        if (!jobUrlInput.value.trim() || !isValidURL(jobUrlInput.value.trim())) {
            alert('Please enter a valid job posting URL.');
            return;
        }
        
        // Disable button and show progress bar
        analyzeButton.disabled = true;
        buttonText.textContent = 'Analyzing...';
        progressBarContainer.style.display = 'block';
        progressBar.style.width = '0%';
        overallSummaryDiv.innerHTML = '';
        recommendationsGrid.innerHTML = '';

        // Start a simulated progress bar
        let progress = 0;
        const progressInterval = setInterval(() => {
            if (progress < 90) { // animate until 90%
                progress += 10;
                progressBar.style.width = progress + '%';
            }
        }, 300);

        const formData = new FormData();
        formData.append('resume', resumeUpload.files[0]);
        formData.append('job_description', jobUrlInput.value.trim());

        try {
            const response = await fetch('https://3dd7901c-7006-4633-9c7e-c873d880c3fe-00-xlklbm5dqcm2.spock.replit.dev/analyze', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            clearInterval(progressInterval);
            progressBar.style.width = '100%';
            displayRecommendations(data.recommendations);
        } catch (error) {
            clearInterval(progressInterval);
            displayError('Failed to analyze resume. Please try again.');
        } finally {
            analyzeButton.disabled = false;
            buttonText.textContent = 'Analyze Resume';
            setTimeout(() => { progressBarContainer.style.display = 'none'; }, 500);
        }
    });

    function displayRecommendations(recommendationsText) {
        // Expected output format:
        // Overall Summary: <summary text>
        //
        // Key Missing Skills:
        // - bullet point 1
        // - bullet point 2
        // - bullet point 3
        //
        // Keyword Optimization:
        // - bullet point 1
        // - bullet point 2
        // - bullet point 3
        //
        // Suggested Improvements:
        // - bullet point 1
        // - bullet point 2
        // - bullet point 3

        let sections = recommendationsText.split('\n\n').filter(sec => sec.trim() !== "");
        let overallSummary = "";
        let keyMissingSkills = "";
        let keywordOptimization = "";
        let suggestedImprovements = "";

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

        overallSummaryDiv.innerHTML = `<p>${overallSummary}</p>`;

        const gridHtml = `
            <div class="recommendation-column">
                <h3>Key Missing Skills</h3>
                ${formatBulletPoints(keyMissingSkills)}
            </div>
            <div class="recommendation-column">
                <h3>Keyword Optimization</h3>
                ${formatBulletPoints(keywordOptimization)}
            </div>
            <div class="recommendation-column">
                <h3>Suggested Improvements</h3>
                ${formatBulletPoints(suggestedImprovements)}
            </div>
        `;
        recommendationsGrid.innerHTML = gridHtml;
        modal.style.display = 'block';
    }

    function formatBulletPoints(text) {
        let lines = text.split('\n').filter(line => line.trim() !== "");
        if (lines.length === 0) {
            return `<div class="recommendation-item">Everything looks great!</div>`;
        }
        return lines.map(line => `<div class="recommendation-item">${line.replace(/^-/, "").trim()}</div>`).join('');
    }

    function displayError(message) {
        overallSummaryDiv.innerHTML = '';
        recommendationsGrid.innerHTML = `<div class='error-message'>${message}</div>`;
        modal.style.display = 'block';
    }

    // Close modal when clicking on the close button
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Also close modal when clicking outside the modal content
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});
