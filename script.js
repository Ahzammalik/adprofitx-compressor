// AdProfitX Compressor - Main JavaScript File
class AdProfitXCompressor {
    constructor() {
        this.currentType = 'image';
        this.files = [];
        this.compressedFiles = [];
        this.supportedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
        this.supportedPdfTypes = ['application/pdf'];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.updateAcceptedTypes();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.type);
            });
        });

        // File input
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(Array.from(e.target.files));
        });

        // Advanced options toggle
        const optionsToggle = document.getElementById('optionsToggle');
        const optionsPanel = document.getElementById('optionsPanel');
        
        optionsToggle.addEventListener('click', () => {
            optionsPanel.classList.toggle('show');
            optionsToggle.classList.toggle('active');
        });

        // Quality slider
        const qualitySlider = document.getElementById('qualitySlider');
        const qualityValue = document.getElementById('qualityValue');
        
        qualitySlider.addEventListener('input', (e) => {
            qualityValue.textContent = e.target.value + '%';
        });

        // Resize toggle
        const resizeToggle = document.getElementById('resizeToggle');
        const resizeOptions = document.getElementById('resizeOptions');
        
        resizeToggle.addEventListener('change', (e) => {
            resizeOptions.style.display = e.target.checked ? 'flex' : 'none';
        });

        // Aspect ratio maintenance
        const aspectRatio = document.getElementById('aspectRatio');
        const widthInput = document.getElementById('widthInput');
        const heightInput = document.getElementById('heightInput');
        
        let aspectRatioValue = 1;
        
        widthInput.addEventListener('input', (e) => {
            if (aspectRatio.checked && e.target.value) {
                heightInput.value = Math.round(e.target.value / aspectRatioValue);
            }
        });
        
        heightInput.addEventListener('input', (e) => {
            if (aspectRatio.checked && e.target.value) {
                widthInput.value = Math.round(e.target.value * aspectRatioValue);
            }
        });

        // Navigation smooth scrolling
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update active nav link
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        });

        // Download all button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'downloadAllBtn') {
                this.downloadAll();
            }
        });
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, this.preventDefaults);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('dragover');
            });
        });

        uploadArea.addEventListener('drop', (e) => {
            const files = Array.from(e.dataTransfer.files);
            this.handleFiles(files);
        });

        // Click to upload
        uploadArea.addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    switchTab(type) {
        this.currentType = type;
        
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-type="${type}"]`).classList.add('active');
        
        // Clear current files
        this.files = [];
        this.compressedFiles = [];
        this.updateFileList();
        this.updateResults();
        
        // Update accepted file types
        this.updateAcceptedTypes();
    }

    updateAcceptedTypes() {
        const fileInput = document.getElementById('fileInput');
        const formatSelect = document.getElementById('formatSelect');
        
        if (this.currentType === 'image') {
            fileInput.accept = '.jpg,.jpeg,.png,.webp';
            // Update format options for images
            formatSelect.innerHTML = `
                <option value="original">Keep Original</option>
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
            `;
        } else {
            fileInput.accept = '.pdf';
            // Update format options for PDFs
            formatSelect.innerHTML = `
                <option value="original">Keep Original (PDF)</option>
            `;
        }
    }

    handleFiles(files) {
        console.log('Handling files:', files);
        
        const validFiles = files.filter(file => {
            const isValid = this.isValidFile(file);
            console.log(`File ${file.name}: ${isValid ? 'valid' : 'invalid'} (type: ${file.type})`);
            return isValid;
        });
        
        if (validFiles.length === 0) {
            this.showError('Please select valid files for the current mode.');
            return;
        }

        if (validFiles.length !== files.length) {
            this.showError(`${files.length - validFiles.length} file(s) were skipped as they are not supported.`);
        }

        this.files = [...this.files, ...validFiles];
        this.updateFileList();
        this.processFiles();
    }

    isValidFile(file) {
        if (this.currentType === 'image') {
            return this.supportedImageTypes.includes(file.type);
        } else {
            return this.supportedPdfTypes.includes(file.type);
        }
    }

    updateFileList() {
        const fileList = document.getElementById('fileList');
        
        if (this.files.length === 0) {
            fileList.style.display = 'none';
            return;
        }

        fileList.style.display = 'block';
        fileList.innerHTML = `
            <h3>Selected Files (${this.files.length})</h3>
            ${this.files.map((file, index) => `
                <div class="file-item">
                    <div class="file-info">
                        <i class="file-icon ${this.getFileIcon(file.type)}"></i>
                        <div class="file-details">
                            <h4>${file.name}</h4>
                            <p>${this.formatFileSize(file.size)} • ${file.type}</p>
                            <div class="progress-bar">
                                <div class="progress-fill" id="progress-${index}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="file-actions">
                        <button class="action-btn danger" onclick="compressor.removeFile(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        `;
    }

    getFileIcon(mimeType) {
        if (mimeType.startsWith('image/')) {
            return 'fas fa-image';
        } else if (mimeType === 'application/pdf') {
            return 'fas fa-file-pdf';
        }
        return 'fas fa-file';
    }

    removeFile(index) {
        this.files.splice(index, 1);
        this.compressedFiles.splice(index, 1);
        this.updateFileList();
        this.updateResults();
    }

    async processFiles() {
        console.log('Starting file processing...');
        this.processingStartTime = performance.now();
        this.showLoading(true);
        
        try {
            this.compressedFiles = [];
            
            for (let i = 0; i < this.files.length; i++) {
                const file = this.files[i];
                console.log(`Processing file ${i + 1}/${this.files.length}: ${file.name}`);
                this.updateProgress(i, 0);
                
                let compressedFile;
                if (this.currentType === 'image') {
                    console.log('Compressing image...');
                    compressedFile = await this.compressImage(file, (progress) => {
                        this.updateProgress(i, progress);
                    });
                } else {
                    console.log('Compressing PDF...');
                    compressedFile = await this.compressPDF(file, (progress) => {
                        this.updateProgress(i, progress);
                    });
                }
                
                if (compressedFile) {
                    const compressionRatio = this.calculateCompressionRatio(file.size, compressedFile.size);
                    console.log(`Compression complete. Original: ${file.size} bytes, Compressed: ${compressedFile.size} bytes, Ratio: ${compressionRatio}%`);
                    
                    this.compressedFiles.push({
                        original: file,
                        compressed: compressedFile,
                        compressionRatio: compressionRatio
                    });

                    // Record compression statistics
                    this.recordCompressionStats(file, compressedFile, compressionRatio);
                } else {
                    console.error('Compression failed for file:', file.name);
                    this.showError(`Failed to compress ${file.name}`);
                }
                
                this.updateProgress(i, 100);
            }
            
            console.log(`Processing complete. ${this.compressedFiles.length} files compressed.`);
            this.updateResults();
        } catch (error) {
            console.error('Processing error:', error);
            this.showError(`An error occurred while processing your files: ${error.message}`);
        } finally {
            this.showLoading(false);
        }
    }

    async compressImage(file, progressCallback) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                try {
                    progressCallback(25);
                    
                    // Get compression settings
                    const quality = document.getElementById('qualitySlider').value / 100;
                    const outputFormat = document.getElementById('formatSelect').value;
                    const shouldResize = document.getElementById('resizeToggle').checked;
                    
                    let { width, height } = img;
                    
                    // Handle resizing
                    if (shouldResize) {
                        const newWidth = parseInt(document.getElementById('widthInput').value);
                        const newHeight = parseInt(document.getElementById('heightInput').value);
                        
                        if (newWidth && newWidth > 0) width = newWidth;
                        if (newHeight && newHeight > 0) height = newHeight;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    progressCallback(50);
                    
                    // Draw and compress
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    progressCallback(75);
                    
                    // Determine output format
                    let mimeType = file.type;
                    let extension = outputFormat;
                    
                    if (outputFormat !== 'original') {
                        if (outputFormat === 'jpeg') {
                            mimeType = 'image/jpeg';
                        } else if (outputFormat === 'png') {
                            mimeType = 'image/png';
                        } else if (outputFormat === 'webp') {
                            mimeType = 'image/webp';
                        }
                    } else {
                        extension = 'original';
                    }
                    
                    // For PNG format, use quality 1.0 since PNG doesn't support quality parameter
                    const finalQuality = mimeType === 'image/png' ? 1.0 : quality;
                    
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], 
                                this.getCompressedFileName(file.name, extension), 
                                { type: mimeType }
                            );
                            progressCallback(100);
                            resolve(compressedFile);
                        } else {
                            console.error('Canvas toBlob failed for:', file.name);
                            reject(new Error('Failed to compress image'));
                        }
                    }, mimeType, finalQuality);
                    
                } catch (error) {
                    console.error('Image compression error:', error);
                    reject(error);
                }
            };
            
            img.onerror = (error) => {
                console.error('Image load error:', error);
                reject(new Error('Failed to load image'));
            };
            
            img.src = URL.createObjectURL(file);
        });
    }

    async compressPDF(file, progressCallback) {
        try {
            progressCallback(25);
            
            const arrayBuffer = await file.arrayBuffer();
            progressCallback(50);
            
            // Check if PDFLib is available
            if (typeof PDFLib === 'undefined') {
                console.warn('PDF-lib not loaded, returning original file');
                progressCallback(100);
                return new File([file], this.getCompressedFileName(file.name, 'original'), { type: file.type });
            }
            
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            progressCallback(75);
            
            // Get quality setting for PDF compression
            const quality = document.getElementById('qualitySlider').value / 100;
            
            // PDF compression options
            const pdfBytes = await pdfDoc.save({
                useObjectStreams: true,
                addDefaultPage: false,
                objectsPerTick: Math.floor(quality * 50) + 10
            });
            
            progressCallback(90);
            
            const compressedBlob = new Blob([pdfBytes], { type: 'application/pdf' });
            const compressedFile = new File([compressedBlob], 
                this.getCompressedFileName(file.name, 'original'), 
                { type: 'application/pdf' }
            );
            
            progressCallback(100);
            return compressedFile;
            
        } catch (error) {
            console.error('PDF compression error:', error);
            progressCallback(100);
            // Return original file if compression fails
            return new File([file], this.getCompressedFileName(file.name, 'original'), { type: file.type });
        }
    }

    getCompressedFileName(originalName, format) {
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
        const originalExt = originalName.substring(originalName.lastIndexOf('.'));
        
        if (format === 'original') {
            return `${nameWithoutExt}_compressed${originalExt}`;
        } else {
            return `${nameWithoutExt}_compressed.${format}`;
        }
    }

    calculateCompressionRatio(originalSize, compressedSize) {
        const ratio = ((originalSize - compressedSize) / originalSize) * 100;
        return Math.max(0, Math.round(ratio));
    }

    updateProgress(fileIndex, progress) {
        const progressBar = document.getElementById(`progress-${fileIndex}`);
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    updateResults() {
        const resultsArea = document.getElementById('resultsArea');
        const resultsGrid = document.getElementById('resultsGrid');
        
        if (this.compressedFiles.length === 0) {
            resultsArea.style.display = 'none';
            return;
        }

        resultsArea.style.display = 'block';
        resultsGrid.innerHTML = this.compressedFiles.map((result, index) => `
            <div class="result-item">
                <div class="result-info">
                    <i class="file-icon ${this.getFileIcon(result.original.type)}"></i>
                    <div class="result-stats">
                        <div class="compression-ratio">
                            ${result.compressionRatio}% reduction
                        </div>
                        <div class="file-sizes">
                            ${this.formatFileSize(result.original.size)} → ${this.formatFileSize(result.compressed.size)}
                        </div>
                        <div style="font-size: 0.9rem; color: #333; margin-top: 0.25rem;">
                            ${result.original.name}
                        </div>
                    </div>
                </div>
                <button class="download-btn" onclick="compressor.downloadFile(${index})">
                    <i class="fas fa-download"></i>
                    Download
                </button>
            </div>
        `).join('');
    }

    downloadFile(index) {
        const result = this.compressedFiles[index];
        if (result && result.compressed) {
            const url = URL.createObjectURL(result.compressed);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.compressed.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    async downloadAll() {
        if (this.compressedFiles.length === 0) return;

        // For multiple files, create a zip if there's a zip library available
        // Otherwise, download files one by one
        for (let i = 0; i < this.compressedFiles.length; i++) {
            setTimeout(() => {
                this.downloadFile(i);
            }, i * 500); // Stagger downloads to avoid browser blocking
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.add('show');
        } else {
            overlay.classList.remove('show');
        }
    }

    showError(message) {
        // Create a temporary error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(220, 53, 69, 0.3);
            z-index: 10001;
            max-width: 300px;
            word-wrap: break-word;
            animation: fadeInUp 0.3s ease;
        `;
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="margin-right: 0.5rem;"></i>
            ${message}
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 300);
        }, 5000);
    }

    async recordCompressionStats(originalFile, compressedFile, compressionRatio) {
        try {
            const startTime = performance.now();
            const processingTime = Math.round(startTime - (this.processingStartTime || startTime));
            
            const compressionData = {
                fileName: originalFile.name,
                fileType: this.currentType,
                originalSize: originalFile.size,
                compressedSize: compressedFile.size,
                compressionRatio: compressionRatio,
                quality: parseInt(document.getElementById('qualitySlider').value),
                outputFormat: document.getElementById('formatSelect').value,
                processingTime: processingTime,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            };

            // Send to API endpoint
            const response = await fetch('/api/record-compression', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(compressionData)
            });

            if (!response.ok) {
                console.warn('Failed to record compression stats:', response.statusText);
            }
        } catch (error) {
            console.warn('Failed to record compression stats:', error);
            // Don't show error to user as this is optional functionality
        }
    }

    async loadStats() {
        try {
            const response = await fetch('/api/stats');
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.updateStatsDisplay(result.data);
                }
            }
        } catch (error) {
            console.warn('Failed to load stats:', error);
        }
    }

    updateStatsDisplay(stats) {
        // Update the stats on the about section
        const statItems = document.querySelectorAll('.stat-item h3');
        if (statItems.length >= 4) {
            statItems[0].textContent = this.formatLargeNumber(stats.totalCompressions || 50000000);
            statItems[1].textContent = '99.9%'; // Keep uptime static
            statItems[2].textContent = '4.9/5'; // Keep rating static
            statItems[3].textContent = '24/7'; // Keep availability static
        }
    }

    formatLargeNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M+';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K+';
        }
        return num.toString();
    }
}

// Initialize the compressor when the page loads
let compressor;

document.addEventListener('DOMContentLoaded', () => {
    compressor = new AdProfitXCompressor();
    
    // Load stats when page loads
    compressor.loadStats();
    
    // Add smooth scrolling animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .stat-item').forEach(el => {
        observer.observe(el);
    });
    
    // Add loading animation to buttons
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.classList.contains('loading')) {
                this.classList.add('pulse');
                setTimeout(() => {
                    this.classList.remove('pulse');
                }, 200);
            }
        });
    });
});

// Handle window resize for responsive adjustments
window.addEventListener('resize', () => {
    // Adjust layout if needed
    const contentGrid = document.querySelector('.content-grid');
    if (window.innerWidth <= 992 && contentGrid) {
        // Mobile adjustments can be added here if needed
    }
});

// Performance optimization: Lazy load heavy operations
const loadHeavyFeatures = () => {
    // Load additional features only when needed
    console.log('Heavy features loaded');
};

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdProfitXCompressor;
}
// AdProfitX Compressor - Complete JavaScript Implementation

class AdProfitXCompressor {
    constructor() {
        this.currentFiles = [];
        this.compressedFiles = [];
        this.currentTab = 'image';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.setupAdvancedOptions();
        this.setupNavigation();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.type);
            });
        });

        // File input
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFiles(e.target.files);
            });
        }

        // Browse button
        const browseBtn = document.querySelector('.browse-btn');
        if (browseBtn) {
            browseBtn.addEventListener('click', () => {
                fileInput?.click();
            });
        }

        // Quality slider
        const qualitySlider = document.getElementById('qualitySlider');
        const qualityValue = document.getElementById('qualityValue');
        if (qualitySlider && qualityValue) {
            qualitySlider.addEventListener('input', (e) => {
                qualityValue.textContent = `${e.target.value}%`;
            });
        }

        // Resize toggle
        const resizeToggle = document.getElementById('resizeToggle');
        const resizeOptions = document.getElementById('resizeOptions');
        if (resizeToggle && resizeOptions) {
            resizeToggle.addEventListener('change', (e) => {
                resizeOptions.style.display = e.target.checked ? 'block' : 'none';
            });
        }

        // Download all button
        const downloadAllBtn = document.getElementById('downloadAllBtn');
        if (downloadAllBtn) {
            downloadAllBtn.addEventListener('click', () => {
                this.downloadAllFiles();
            });
        }
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');
        if (!uploadArea) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('dragover');
            }, false);
        });

        uploadArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleFiles(files);
        }, false);
    }

    setupAdvancedOptions() {
        const optionsToggle = document.getElementById('optionsToggle');
        const optionsPanel = document.getElementById('optionsPanel');
        
        if (optionsToggle && optionsPanel) {
            optionsToggle.addEventListener('click', () => {
                const isOpen = optionsPanel.classList.contains('show');
                optionsPanel.classList.toggle('show');
                optionsToggle.classList.toggle('active');
            });
        }
    }

    setupNavigation() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }

                // Update active nav link
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    switchTab(type) {
        this.currentTab = type;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-type="${type}"]`).classList.add('active');

        // Update file input accept attribute
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            if (type === 'image') {
                fileInput.accept = '.jpg,.jpeg,.png,.webp';
            } else if (type === 'pdf') {
                fileInput.accept = '.pdf';
            }
        }

        // Update supported formats text
        const supportedFormats = document.querySelector('.supported-formats small');
        if (supportedFormats) {
            if (type === 'image') {
                supportedFormats.innerHTML = '✅ Supported formats: JPEG, PNG, WebP • Max size: 50MB per file';
            } else if (type === 'pdf') {
                supportedFormats.innerHTML = '✅ Supported formats: PDF • Max size: 50MB per file';
            }
        }

        // Clear current files when switching tabs
        this.currentFiles = [];
        this.compressedFiles = [];
        this.updateFileList();
        this.updateResults();
    }

    async handleFiles(files) {
        console.log('Handling files:', files);
        
        const validFiles = Array.from(files).filter(file => this.validateFile(file));
        
        if (validFiles.length === 0) {
            this.showNotification('No valid files selected', 'error');
            return;
        }

        this.currentFiles = validFiles;
        this.updateFileList();
        
        console.log('Starting file processing...');
        await this.processFiles();
    }

    validateFile(file) {
        const maxSize = 50 * 1024 * 1024; // 50MB
        
        if (file.size > maxSize) {
            this.showNotification(`File ${file.name} is too large (max 50MB)`, 'error');
            return false;
        }

        if (this.currentTab === 'image') {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                this.showNotification(`File ${file.name} is not a valid image format`, 'error');
                return false;
            }
        } else if (this.currentTab === 'pdf') {
            if (file.type !== 'application/pdf') {
                this.showNotification(`File ${file.name} is not a valid PDF`, 'error');
                return false;
            }
        }

        console.log(`File ${file.name}: valid (type: ${file.type})`);
        return true;
    }

    updateFileList() {
        const fileList = document.getElementById('fileList');
        if (!fileList) return;

        if (this.currentFiles.length === 0) {
            fileList.style.display = 'none';
            return;
        }

        fileList.style.display = 'block';
        fileList.innerHTML = '<h3>Selected Files</h3>';
        
        this.currentFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <i class="fas ${this.getFileIcon(file.type)} file-icon"></i>
                    <div>
                        <div><strong>${file.name}</strong></div>
                        <div class="file-size">${this.formatFileSize(file.size)}</div>
                    </div>
                </div>
                <button class="action-btn danger" onclick="compressor.removeFile(${index})">
                    <i class="fas fa-trash"></i>
                    Remove
                </button>
            `;
            fileList.appendChild(fileItem);
        });
    }

    removeFile(index) {
        this.currentFiles.splice(index, 1);
        this.updateFileList();
        
        if (this.currentFiles.length === 0) {
            this.compressedFiles = [];
            this.updateResults();
        }
    }

    async processFiles() {
        if (this.currentFiles.length === 0) return;

        this.showLoading(true);
        this.compressedFiles = [];

        try {
            for (let i = 0; i < this.currentFiles.length; i++) {
                const file = this.currentFiles[i];
                console.log(`Processing file ${i + 1}/${this.currentFiles.length}: ${file.name}`);
                
                let compressedFile;
                if (this.currentTab === 'image') {
                    compressedFile = await this.compressImage(file);
                } else if (this.currentTab === 'pdf') {
                    compressedFile = await this.compressPDF(file);
                }
                
                if (compressedFile) {
                    this.compressedFiles.push(compressedFile);
                }
            }
            
            console.log(`Processing complete. ${this.compressedFiles.length} files compressed.`);
            this.updateResults();
            
        } catch (error) {
            console.error('Error processing files:', error);
            this.showNotification('Error processing files', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async compressImage(file) {
        const quality = parseInt(document.getElementById('qualitySlider')?.value || 80) / 100;
        const outputFormat = document.getElementById('formatSelect')?.value || 'original';
        
        return new Promise((resolve) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            img.onload = () => {
                // Handle resizing if enabled
                let { width, height } = this.calculateDimensions(img.width, img.height);
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                
                // Determine output format
                let mimeType = file.type;
                let extension = this.getFileExtension(file.name);
                
                if (outputFormat !== 'original') {
                    mimeType = `image/${outputFormat}`;
                    extension = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
                }
                
                canvas.toBlob((blob) => {
                    const compressionRatio = Math.round((1 - blob.size / file.size) * 100);
                    
                    console.log(`Compression complete. Original: ${file.size} bytes, Compressed: ${blob.size} bytes, Ratio: ${compressionRatio}%`);
                    
                    const newFileName = this.changeFileExtension(file.name, extension);
                    const compressedFile = new File([blob], newFileName, { type: mimeType });
                    
                    // Record analytics
                    this.recordCompression({
                        fileName: file.name,
                        fileType: 'image',
                        originalSize: file.size,
                        compressedSize: blob.size,
                        compressionRatio: compressionRatio,
                        quality: quality * 100,
                        outputFormat: outputFormat,
                        processingTime: Date.now()
                    });
                    
                    resolve({
                        original: file,
                        compressed: compressedFile,
                        compressionRatio: compressionRatio,
                        originalSize: file.size,
                        compressedSize: blob.size
                    });
                }, mimeType, quality);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }

    async compressPDF(file) {
        console.log('Compressing PDF...');
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            
            // Basic PDF compression - remove metadata and optimize
            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
            pdfDoc.setSubject('');
            pdfDoc.setKeywords([]);
            pdfDoc.setProducer('AdProfitX Compressor');
            pdfDoc.setCreator('AdProfitX Compressor');
            
            const pdfBytes = await pdfDoc.save({
                useObjectStreams: true,
                addDefaultPage: false,
                objectStreamsThreshold: 1,
                updateFieldAppearances: false
            });
            
            const compressedBlob = new Blob([pdfBytes], { type: 'application/pdf' });
            const compressionRatio = Math.round((1 - compressedBlob.size / file.size) * 100);
            
            console.log(`Compression complete. Original: ${file.size} bytes, Compressed: ${compressedBlob.size} bytes, Ratio: ${compressionRatio}%`);
            
            const compressedFile = new File([compressedBlob], file.name, { type: 'application/pdf' });
            
            // Record analytics
            this.recordCompression({
                fileName: file.name,
                fileType: 'pdf',
                originalSize: file.size,
                compressedSize: compressedBlob.size,
                compressionRatio: compressionRatio,
                quality: 100,
                outputFormat: 'pdf',
                processingTime: Date.now()
            });
            
            return {
                original: file,
                compressed: compressedFile,
                compressionRatio: compressionRatio,
                originalSize: file.size,
                compressedSize: compressedBlob.size
            };
            
        } catch (error) {
            console.error('PDF compression error:', error);
            this.showNotification(`Error compressing PDF: ${file.name}`, 'error');
            return null;
        }
    }

    calculateDimensions(originalWidth, originalHeight) {
        const resizeToggle = document.getElementById('resizeToggle');
        const widthInput = document.getElementById('widthInput');
        const heightInput = document.getElementById('heightInput');
        const aspectRatio = document.getElementById('aspectRatio');
        
        if (!resizeToggle?.checked) {
            return { width: originalWidth, height: originalHeight };
        }
        
        const targetWidth = parseInt(widthInput?.value) || originalWidth;
        const targetHeight = parseInt(heightInput?.value) || originalHeight;
        
        if (aspectRatio?.checked) {
            const ratio = originalWidth / originalHeight;
            if (widthInput?.value && !heightInput?.value) {
                return { width: targetWidth, height: Math.round(targetWidth / ratio) };
            } else if (heightInput?.value && !widthInput?.value) {
                return { width: Math.round(targetHeight * ratio), height: targetHeight };
            }
        }
        
        return { width: targetWidth, height: targetHeight };
    }

    updateResults() {
        const resultsArea = document.getElementById('resultsArea');
        const resultsGrid = document.getElementById('resultsGrid');
        
        if (!resultsArea || !resultsGrid) return;
        
        if (this.compressedFiles.length === 0) {
            resultsArea.style.display = 'none';
            return;
        }
        
        resultsArea.style.display = 'block';
        resultsGrid.innerHTML = '';
        
        this.compressedFiles.forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <div class="result-info">
                    <i class="fas ${this.getFileIcon(result.compressed.type)} file-icon"></i>
                    <div>
                        <div><strong>${result.compressed.name}</strong></div>
                        <div class="compression-stats">
                            ${this.formatFileSize(result.originalSize)} → ${this.formatFileSize(result.compressedSize)}
                            <span class="compression-ratio">${result.compressionRatio}% smaller</span>
                        </div>
                    </div>
                </div>
                <button class="download-btn" onclick="compressor.downloadFile(${index})">
                    <i class="fas fa-download"></i>
                    Download
                </button>
            `;
            resultsGrid.appendChild(resultItem);
        });
    }

    downloadFile(index) {
        const result = this.compressedFiles[index];
        if (!result) return;
        
        const url = URL.createObjectURL(result.compressed);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.compressed.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async downloadAllFiles() {
        if (this.compressedFiles.length === 0) return;
        
        if (this.compressedFiles.length === 1) {
            this.downloadFile(0);
            return;
        }
        
        // Create ZIP file for multiple downloads
        this.showNotification('Preparing download...', 'info');
        
        // For simplicity, download files individually
        for (let i = 0; i < this.compressedFiles.length; i++) {
            setTimeout(() => this.downloadFile(i), i * 500);
        }
    }

    recordCompression(data) {
        // Send analytics data to server if available
        if (typeof fetch !== 'undefined') {
            fetch('/api/record-compression', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            }).catch(error => {
                console.log('Analytics recording failed:', error);
            });
        }
    }

    // Utility functions
    getFileIcon(mimeType) {
        if (mimeType.startsWith('image/')) return 'fa-image';
        if (mimeType === 'application/pdf') return 'fa-file-pdf';
        return 'fa-file';
    }

    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }

    changeFileExtension(filename, newExt) {
        const parts = filename.split('.');
        parts[parts.length - 1] = newExt;
        return parts.join('.');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            if (show) {
                overlay.classList.add('show');
            } else {
                overlay.classList.remove('show');
            }
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#e53e3e' : type === 'success' ? '#38a169' : '#3182ce'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10001;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize the compressor when page loads
let compressor;
document.addEventListener('DOMContentLoaded', () => {
    compressor = new AdProfitXCompressor();
});

// Export for global access
window.compressor = compressor;
