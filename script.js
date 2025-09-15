/**
 * 4× Expert Startup Analyzer
 * Premium single-page web application for startup idea analysis
 */

class StartupAnalyzer {
    constructor() {
        this.apiUrl = 'https://n8n.generalovai.ru/webhook-test/lovable';
        this.maxCharacters = 1000;
        this.requestTimeout = 30000; // 30 seconds
        this.rateLimitDelay = 5000; // 5 seconds between requests
        this.lastRequestTime = 0;
        this.currentAnalysis = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupCharacterCounter();
        this.checkForStoredAnalysis();
        this.setupAccessibility();
    }

    bindEvents() {
        // Form submission
        const form = document.getElementById('analysis-form');
        form.addEventListener('submit', this.handleFormSubmit.bind(this));

        // Character counter
        const ideaInput = document.getElementById('idea-input');
        ideaInput.addEventListener('input', this.updateCharacterCounter.bind(this));

        // Tab navigation
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', this.handleTabClick.bind(this));
            btn.addEventListener('keydown', this.handleTabKeydown.bind(this));
        });

        // Action buttons
        document.getElementById('copy-btn').addEventListener('click', this.handleCopy.bind(this));
        document.getElementById('download-md-btn').addEventListener('click', this.handleDownloadMarkdown.bind(this));
        document.getElementById('download-pdf-btn').addEventListener('click', this.handleDownloadPDF.bind(this));
        document.getElementById('share-btn').addEventListener('click', this.handleShare.bind(this));
        document.getElementById('new-analysis-btn').addEventListener('click', this.handleNewAnalysis.bind(this));
        document.getElementById('retry-btn').addEventListener('click', this.handleRetry.bind(this));

        // Restore banner
        document.getElementById('restore-btn').addEventListener('click', this.handleRestore.bind(this));
        document.getElementById('dismiss-btn').addEventListener('click', this.handleDismissBanner.bind(this));
    }

    setupCharacterCounter() {
        this.updateCharacterCounter();
    }

    updateCharacterCounter() {
        const ideaInput = document.getElementById('idea-input');
        const charCount = document.getElementById('char-count');
        const charCounter = document.getElementById('char-counter');
        
        const currentLength = ideaInput.value.length;
        charCount.textContent = currentLength;
        
        // Update styling based on character count
        charCounter.classList.remove('warning', 'error');
        if (currentLength > this.maxCharacters * 0.9) {
            charCounter.classList.add('error');
        } else if (currentLength > this.maxCharacters * 0.8) {
            charCounter.classList.add('warning');
        }
    }

    setupAccessibility() {
        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Escape key handling
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    this.closeModal(activeModal);
                }
            }
        });

        // Focus management for dynamic content
        this.setupFocusTrap();
    }

    setupFocusTrap() {
        // Implementation for focus trapping in modals if needed
        // This would be expanded based on specific modal implementations
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const ideaInput = document.getElementById('idea-input');
        const emailInput = document.getElementById('email-input');
        const idea = this.sanitizeInput(ideaInput.value.trim());
        const email = emailInput.value.trim();

        // Validation
        if (!this.validateInput(idea)) {
            return;
        }

        // Rate limiting
        if (!this.checkRateLimit()) {
            this.showToast('Please wait before submitting another request', 'error');
            return;
        }

        try {
            this.showLoadingState();
            const response = await this.submitAnalysisRequest(idea, email);
            this.handleAnalysisResponse(response);
        } catch (error) {
            this.handleAnalysisError(error);
        }
    }

    sanitizeInput(input) {
        // Remove HTML tags and potentially dangerous content
        return input.replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').trim();
    }

    validateInput(idea) {
        if (!idea) {
            this.showToast('Please enter your startup idea', 'error');
            document.getElementById('idea-input').focus();
            return false;
        }

        if (idea.length > this.maxCharacters) {
            this.showToast(`Idea must be ${this.maxCharacters} characters or less`, 'error');
            document.getElementById('idea-input').focus();
            return false;
        }

        if (idea.length < 10) {
            this.showToast('Please provide more details about your idea', 'error');
            document.getElementById('idea-input').focus();
            return false;
        }

        return true;
    }

    checkRateLimit() {
        const now = Date.now();
        if (now - this.lastRequestTime < this.rateLimitDelay) {
            return false;
        }
        this.lastRequestTime = now;
        return true;
    }

    async submitAnalysisRequest(idea, email) {
        const requestBody = { idea };
        if (email) {
            requestBody.email = email;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.status === 'error') {
                throw new Error(data.message || 'Analysis failed');
            }

            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - please try again');
            }
            
            // Retry once with exponential backoff
            if (!error.retried) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                error.retried = true;
                return this.submitAnalysisRequest(idea, email);
            }
            
            throw error;
        }
    }

    handleAnalysisResponse(data) {
        this.currentAnalysis = {
            idea: data.idea,
            product_manager: data.product_manager,
            marketer: data.marketer,
            tech: data.tech,
            analyst: data.analyst,
            timestamp: data.timestamp || new Date().toISOString()
        };

        this.saveAnalysisToStorage(this.currentAnalysis);
        this.displayResults(this.currentAnalysis);
        this.hideLoadingState();
        this.showToast('Analysis completed successfully!', 'success');
    }

    handleAnalysisError(error) {
        console.error('Analysis error:', error);
        this.hideLoadingState();
        this.showErrorState(error.message);
    }

    showLoadingState() {
        const form = document.getElementById('analysis-form');
        const loading = document.getElementById('loading-state');
        const submitBtn = document.getElementById('submit-btn');
        
        form.style.display = 'none';
        loading.classList.remove('hidden');
        submitBtn.disabled = true;
        
        // Disable form inputs
        const inputs = form.querySelectorAll('input, textarea, button');
        inputs.forEach(input => input.disabled = true);
    }

    hideLoadingState() {
        const form = document.getElementById('analysis-form');
        const loading = document.getElementById('loading-state');
        const submitBtn = document.getElementById('submit-btn');
        
        form.style.display = 'flex';
        loading.classList.add('hidden');
        submitBtn.disabled = false;
        
        // Re-enable form inputs
        const inputs = form.querySelectorAll('input, textarea, button');
        inputs.forEach(input => input.disabled = false);
    }

    showErrorState(message) {
        const form = document.getElementById('analysis-form');
        const error = document.getElementById('error-state');
        const errorMessage = document.getElementById('error-message');
        
        form.style.display = 'none';
        error.classList.remove('hidden');
        errorMessage.textContent = message;
    }

    hideErrorState() {
        const form = document.getElementById('analysis-form');
        const error = document.getElementById('error-state');
        
        form.style.display = 'flex';
        error.classList.add('hidden');
    }

    displayResults(analysis) {
        const resultsSection = document.getElementById('results-section');
        const analyzedIdea = document.getElementById('analyzed-idea');
        
        // Display the original idea
        analyzedIdea.textContent = analysis.idea;
        
        // Render markdown content for each expert report
        this.renderMarkdownContent('product-content', analysis.product_manager);
        this.renderMarkdownContent('marketing-content', analysis.marketer);
        this.renderMarkdownContent('tech-content', analysis.tech);
        this.renderMarkdownContent('analyst-content', analysis.analyst);
        
        // Show results section
        resultsSection.classList.remove('hidden');
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Focus on results for screen readers
        setTimeout(() => {
            document.getElementById('results-title').focus();
        }, 500);
    }

    renderMarkdownContent(containerId, markdown) {
        const container = document.getElementById(containerId);
        if (!markdown) {
            container.innerHTML = '<p>No analysis available.</p>';
            return;
        }

        // Simple markdown renderer
        let html = markdown
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.*?)__/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            // Code
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            // Line breaks
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');

        // Handle lists
        html = html.replace(/^\* (.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
        html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/gs, (match) => {
            if (!match.includes('<ul>')) {
                return '<ol>' + match + '</ol>';
            }
            return match;
        });

        // Wrap in paragraphs
        if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<ol')) {
            html = '<p>' + html + '</p>';
        }

        container.innerHTML = html;
    }

    handleTabClick(e) {
        const clickedTab = e.currentTarget;
        const tabName = clickedTab.dataset.tab;
        this.switchTab(tabName);
    }

    handleTabKeydown(e) {
        const tabs = Array.from(document.querySelectorAll('.tab-btn'));
        const currentIndex = tabs.indexOf(e.target);
        
        let newIndex;
        
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                tabs[newIndex].focus();
                break;
            case 'ArrowRight':
                e.preventDefault();
                newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                tabs[newIndex].focus();
                break;
            case 'Home':
                e.preventDefault();
                tabs[0].focus();
                break;
            case 'End':
                e.preventDefault();
                tabs[tabs.length - 1].focus();
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                this.switchTab(e.target.dataset.tab);
                break;
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            const isActive = tab.dataset.tab === tabName;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive);
        });

        // Update tab panels
        const panels = document.querySelectorAll('.tab-panel');
        panels.forEach(panel => {
            const isActive = panel.id === `${tabName}-panel`;
            panel.classList.toggle('active', isActive);
        });
    }

    async handleCopy() {
        if (!this.currentAnalysis) return;

        const activeTab = document.querySelector('.tab-btn.active');
        const tabName = activeTab.dataset.tab;
        const content = this.getTabContent(tabName);
        
        try {
            await this.copyToClipboard(content);
            this.showToast('Content copied to clipboard!', 'success');
        } catch (error) {
            this.showToast('Failed to copy content', 'error');
        }
    }

    async copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }

    getTabContent(tabName) {
        if (!this.currentAnalysis) return '';
        
        const contentMap = {
            'product': this.currentAnalysis.product_manager,
            'marketing': this.currentAnalysis.marketer,
            'tech': this.currentAnalysis.tech,
            'analyst': this.currentAnalysis.analyst
        };
        
        return contentMap[tabName] || '';
    }

    handleDownloadMarkdown() {
        if (!this.currentAnalysis) return;

        const activeTab = document.querySelector('.tab-btn.active');
        const tabName = activeTab.dataset.tab;
        const content = this.getTabContent(tabName);
        const fileName = `startup-analysis-${tabName}-${Date.now()}.md`;
        
        this.downloadText(fileName, content);
        this.showToast('Markdown file downloaded!', 'success');
    }

    downloadText(filename, text) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    async handleDownloadPDF() {
        if (!this.currentAnalysis) return;

        try {
            const activeTab = document.querySelector('.tab-btn.active');
            const tabName = activeTab.dataset.tab;
            const content = this.getTabContent(tabName);
            const title = `Startup Analysis - ${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`;
            
            await this.generatePDF(title, content);
            this.showToast('PDF generated successfully!', 'success');
        } catch (error) {
            this.showToast('PDF generation failed', 'error');
        }
    }

    async generatePDF(title, markdownContent) {
        // Simple PDF generation using browser's print functionality
        // In a production app, you might want to use a library like jsPDF or Puppeteer
        
        const printWindow = window.open('', '_blank');
        const htmlContent = this.markdownToHTML(markdownContent);
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        line-height: 1.6;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                        color: #333;
                    }
                    h1, h2, h3 { color: #2c3e50; margin-top: 1.5em; }
                    h1 { border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
                    pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
                    code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; }
                    blockquote { border-left: 4px solid #d4af37; padding-left: 20px; margin: 20px 0; font-style: italic; }
                    ul, ol { padding-left: 30px; }
                    @media print {
                        body { margin: 0; }
                        @page { margin: 1in; }
                    }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                <div>${htmlContent}</div>
                <script>
                    window.onload = function() {
                        window.print();
                        window.close();
                    };
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    }

    markdownToHTML(markdown) {
        // Enhanced markdown to HTML conversion
        return markdown
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
            .replace(/^\* (.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^(?!<[hul])/gm, '<p>')
            .replace(/$(?![<\/])/gm, '</p>');
    }

    handleShare() {
        if (!this.currentAnalysis) return;

        // Generate a shareable URL with the analysis ID
        const url = `${window.location.origin}${window.location.pathname}#analysis=${Date.now()}`;
        
        this.copyToClipboard(url).then(() => {
            this.showToast('Share link copied to clipboard!', 'success');
        }).catch(() => {
            this.showToast('Failed to copy share link', 'error');
        });
    }

    handleNewAnalysis() {
        // Reset the form and hide results
        document.getElementById('analysis-form').reset();
        document.getElementById('results-section').classList.add('hidden');
        this.hideErrorState();
        this.updateCharacterCounter();
        
        // Focus on the idea input
        document.getElementById('idea-input').focus();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    handleRetry() {
        this.hideErrorState();
        const ideaInput = document.getElementById('idea-input');
        if (ideaInput.value.trim()) {
            document.getElementById('analysis-form').dispatchEvent(new Event('submit'));
        }
    }

    saveAnalysisToStorage(analysis) {
        try {
            localStorage.setItem('latestAnalysis', JSON.stringify(analysis));
        } catch (error) {
            console.warn('Failed to save analysis to localStorage:', error);
        }
    }

    checkForStoredAnalysis() {
        try {
            const stored = localStorage.getItem('latestAnalysis');
            if (stored) {
                const analysis = JSON.parse(stored);
                // Check if the analysis is recent (within 24 hours)
                const analysisTime = new Date(analysis.timestamp);
                const now = new Date();
                const hoursDiff = (now - analysisTime) / (1000 * 60 * 60);
                
                if (hoursDiff < 24) {
                    this.showRestoreBanner();
                }
            }
        } catch (error) {
            console.warn('Failed to check stored analysis:', error);
        }
    }

    showRestoreBanner() {
        const banner = document.getElementById('restore-banner');
        banner.classList.remove('hidden');
    }

    handleRestore() {
        try {
            const stored = localStorage.getItem('latestAnalysis');
            if (stored) {
                const analysis = JSON.parse(stored);
                this.currentAnalysis = analysis;
                this.displayResults(analysis);
                this.handleDismissBanner();
                
                // Fill the form with the restored idea
                document.getElementById('idea-input').value = analysis.idea;
                this.updateCharacterCounter();
            }
        } catch (error) {
            console.error('Failed to restore analysis:', error);
            this.showToast('Failed to restore previous analysis', 'error');
        }
    }

    handleDismissBanner() {
        const banner = document.getElementById('restore-banner');
        banner.classList.add('hidden');
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        
        container.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    container.removeChild(toast);
                }, 300);
            }
        }, 5000);
        
        // Allow manual dismissal
        toast.addEventListener('click', () => {
            if (toast.parentNode) {
                container.removeChild(toast);
            }
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StartupAnalyzer();
});

// Handle browser back/forward navigation
window.addEventListener('popstate', (e) => {
    // Handle URL hash changes for deep linking if needed
    const hash = window.location.hash;
    if (hash.startsWith('#analysis=')) {
        // Could implement deep linking to specific analyses
    }
});

// Service worker registration for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment if you want to add a service worker
        // navigator.serviceWorker.register('/sw.js');
    });
}