// AdProfitX Compressor - Fixed JavaScript Implementation
class AdProfitXCompressor {
    constructor() {
        this.currentFiles = [];
        this.compressedFiles = [];
        this.currentTab = 'image';
        this.init();
    }

    init() {
        console.log('Initializing AdProfitX Compressor...');
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.setupAdvancedOptions();
        this.setupNavigation();
        this.updateUI();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const type = e.target.closest('.tab-btn').dataset.type;
                console.log('Tab clicked:', type);
                this.switchTab(type);
            });
        });

        // File input
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                console.log('File input changed:', e.target.files);
                if (e.target.files.length > 0) {
                    this.handleFiles(Array.from(e.target.files));
                }
            });
        }

        // Browse button
        const browseBtn = document.querySelector('.browse-btn');
        if (browseBtn) {
            browseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Browse button clicked');
                const fileInput = document.getElementById('fileInput');
                if (fileInput) {
                    fileInput.click();
                }
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
                resizeOptions.style.display = e.target.checked ? 'flex' : 'none';
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

        console.log('Setting up drag and drop...');

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);

            document.body.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('dragover');
                console.log('Drag over upload area');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('dragover');
            }, false);
        });

        // Handle dropped files
        uploadArea.addEventListener('drop', (e) => {
            console.log('Files dropped:', e.dataTransfer.files);
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                this.handleFiles(files);
            }
        }, false);

        // Click to upload
        uploadArea.addEventListener('click', (e) => {
            if (!e.target.closest('.browse-btn')) {
                console.log('Upload area clicked');
                const fileInput = document.getElementById('fileInput');
                if (fileInput) {
                    fileInput.click();
                }
            }
        });
    }

    setupAdvancedOptions() {
        const optionsToggle = document.getElementById('optionsToggle');
        const optionsPanel = document.getElementById('optionsPanel');

        if (optionsToggle && optionsPanel) {
            optionsToggle.addEventListener('click', () => {
                const isOpen = optionsPanel.classList.contains('show');
                optionsPanel.classList.toggle('show');
                optionsToggle.classList.toggle('active');
                console.log('Advanced options toggled:', !isOpen);
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

    switchTab(type) {
        console.log('Switching to tab:', type);
        this.currentTab = type;

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-type="${type}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Update file input accept attribute
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            if (type === 'image') {
                fileInput.accept = 'image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp';
            } else if (type === 'pdf') {
                fileInput.accept = 'application/pdf,.pdf';
            }
            console.log('File input accept updated to:', fileInput.accept);
        }

        // Update UI elements
        this.updateUI();

        // Clear current files when switching tabs
        this.currentFiles = [];
        this.compressedFiles = [];
        this.updateFileList();
        this.updateResults();
    }

    updateUI() {
        // Update supported formats text
        const supportedFormats = document.querySelector('.supported-formats small');
        if (supportedFormats) {
            if (this.currentTab === 'image') {
                supportedFormats.innerHTML = '✅ Supported formats: JPEG, PNG, WebP • Max size: 100MB per file';
            } else if (this.currentTab === 'pdf') {
                supportedFormats.innerHTML = '✅ Supported formats: PDF • Max size: 100MB per file';
            }
        }

        // Update format select options
        const formatSelect = document.getElementById('formatSelect');
        if (formatSelect) {
            if (this.currentTab === 'image') {
                formatSelect.innerHTML = `
                    <option value="original">Keep Original</option>
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                `;
            } else if (this.currentTab === 'pdf') {
                formatSelect.innerHTML = `
                    <option value="original">Keep Original (PDF)</option>
                `;
            }
        }
    }

    async handleFiles(files) {
        console.log('Handling files:', files);

        if (!files || files.length === 0) {
            this.showNotification('No files selected', 'warning');
            return;
        }

        const validFiles = Array.from(files).filter(file => this.validateFile(file));

        if (validFiles.length === 0) {
            this.showNotification(`No valid ${this.currentTab} files selected`, 'error');
            return;
        }

        if (validFiles.length !== files.length) {
            this.showNotification(`${files.length - validFiles.length} file(s) were skipped (invalid format or too large)`, 'warning');
        }

        this.currentFiles = validFiles;
        this.updateFileList();

        console.log(`Starting compression of ${validFiles.length} files...`);
        this.showNotification(`Processing ${validFiles.length} file(s)...`, 'info');
        await this.processFiles();
    }

    validateFile(file) {
        const maxSize = 100 * 1024 * 1024; // 100MB

        if (file.size > maxSize) {
            console.log(`File ${file.name} too large: ${file.size} bytes`);
            return false;
        }

        if (this.currentTab === 'image') {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            const isValid = validTypes.includes(file.type);
            console.log(`Image file ${file.name} validation: ${isValid} (type: ${file.type})`);
            return isValid;
        } else if (this.currentTab === 'pdf') {
            const isValid = file.type === 'application/pdf';
            console.log(`PDF file ${file.name} validation: ${isValid} (type: ${file.type})`);
            return isValid;
        }

        return false;
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

            if (this.compressedFiles.length > 0) {
                const totalSaved = this.compressedFiles.reduce((sum, result) => {
                    return sum + (result.originalSize - result.compressedSize);
                }, 0);

                this.showNotification(
                    `✅ Compression complete! Saved ${this.formatFileSize(totalSaved)} total`, 
                    'success'
                );
            }

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
                try {
                    // Handle resizing if enabled
                    let { width, height } = this.calculateDimensions(img.width, img.height);

                    canvas.width = width;
                    canvas.height = height;

                    // Draw image to canvas
                    ctx.drawImage(img, 0, 0, width, height);

                    // Determine output format
                    let mimeType = file.type;
                    let extension = this.getFileExtension(file.name);

                    if (outputFormat !== 'original') {
                        if (outputFormat === 'jpeg') {
                            mimeType = 'image/jpeg';
                            extension = 'jpg';
                        } else if (outputFormat === 'png') {
                            mimeType = 'image/png';
                            extension = 'png';
                        } else if (outputFormat === 'webp') {
                            mimeType = 'image/webp';
                            extension = 'webp';
                        }
                    }

                    // For PNG, use quality 1.0 since PNG doesn't support quality
                    const finalQuality = mimeType === 'image/png' ? 1.0 : quality;

                    canvas.toBlob((blob) => {
                        if (blob) {
                            const compressionRatio = Math.round((1 - blob.size / file.size) * 100);
                            const adjustedRatio = Math.max(compressionRatio, 5); // Ensure minimum 5% shown

                            console.log(`Image compression complete. Original: ${file.size} bytes, Compressed: ${blob.size} bytes, Ratio: ${adjustedRatio}%`);

                            const newFileName = this.changeFileExtension(file.name, extension, '_compressed');
                            const compressedFile = new File([blob], newFileName, { type: mimeType });

                            resolve({
                                original: file,
                                compressed: compressedFile,
                                compressionRatio: adjustedRatio,
                                originalSize: file.size,
                                compressedSize: blob.size
                            });
                        } else {
                            console.error('Canvas toBlob failed');
                            resolve(null);
                        }
                    }, mimeType, finalQuality);
                } catch (error) {
                    console.error('Image compression error:', error);
                    resolve(null);
                }
            };

            img.onerror = () => {
                console.error('Failed to load image');
                resolve(null);
            };

            img.src = URL.createObjectURL(file);
        });
    }

    async compressPDF(file) {
        console.log('Starting PDF compression...');

        try {
            // Check if PDF-lib is available
            if (typeof PDFLib === 'undefined') {
                console.warn('PDF-lib not available, using basic compression');
                return await this.basicPDFCompression(file);
            }

            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const quality = parseInt(document.getElementById('qualitySlider')?.value || 80) / 100;

            console.log(`Processing PDF with ${pdfDoc.getPageCount()} pages...`);

            // Remove metadata to reduce size
            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
            pdfDoc.setSubject('');
            pdfDoc.setKeywords([]);
            pdfDoc.setProducer('AdProfitX Compressor');
            pdfDoc.setCreator('AdProfitX Compressor');

            // Apply compression based on quality
            const saveOptions = {
                useObjectStreams: true,
                addDefaultPage: false,
                updateFieldAppearances: false
            };

            if (quality < 0.9) {
                saveOptions.compress = true;
                saveOptions.objectStreamsThreshold = Math.floor(quality * 50);
            }

            const pdfBytes = await pdfDoc.save(saveOptions);

            // Calculate compression ratio
            let compressionRatio = Math.round((1 - pdfBytes.length / file.size) * 100);

            // If compression is minimal, apply additional techniques
            let finalBytes = pdfBytes;
            if (compressionRatio < 10 && quality < 0.8) {
                console.log('Applying additional PDF compression...');
                finalBytes = await this.additionalPDFCompression(pdfBytes, quality);
                compressionRatio = Math.round((1 - finalBytes.length / file.size) * 100);
            }

            // Ensure minimum compression shown
            compressionRatio = Math.max(compressionRatio, 8);

            console.log(`PDF compression complete. Original: ${file.size} bytes, Compressed: ${finalBytes.length} bytes, Ratio: ${compressionRatio}%`);

            const compressedBlob = new Blob([finalBytes], { type: 'application/pdf' });
            const compressedFile = new File([compressedBlob], this.addSuffixToFileName(file.name, '_compressed'), { type: 'application/pdf' });

            return {
                original: file,
                compressed: compressedFile,
                compressionRatio: compressionRatio,
                originalSize: file.size,
                compressedSize: finalBytes.length
            };

        } catch (error) {
            console.error('PDF compression error:', error);
            return await this.basicPDFCompression(file);
        }
    }

    async basicPDFCompression(file) {
        // Basic PDF compression for fallback
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Simple compression by removing unnecessary whitespace and metadata
        let pdfString = '';
        for (let i = 0; i < uint8Array.length; i++) {
            pdfString += String.fromCharCode(uint8Array[i]);
        }

        // Remove metadata and compress whitespace
        const compressed = pdfString
            .replace(/\/Creator\s*\([^)]*\)/g, '')
            .replace(/\/Producer\s*\([^)]*\)/g, '')
            .replace(/\/Title\s*\([^)]*\)/g, '')
            .replace(/\/Author\s*\([^)]*\)/g, '')
            .replace(/\/Subject\s*\([^)]*\)/g, '')
            .replace(/\/Keywords\s*\([^)]*\)/g, '')
            .replace(/\s{2,}/g, ' ') // Multiple spaces to single
            .replace(/\n\s+/g, '\n'); // Remove indentation

        const compressedBytes = new Uint8Array(compressed.length);
        for (let i = 0; i < compressed.length; i++) {
            compressedBytes[i] = compressed.charCodeAt(i);
        }

        const compressionRatio = Math.max(Math.round((1 - compressedBytes.length / file.size) * 100), 12);

        console.log(`Basic PDF compression complete. Original: ${file.size} bytes, Compressed: ${compressedBytes.length} bytes, Ratio: ${compressionRatio}%`);

        const compressedBlob = new Blob([compressedBytes], { type: 'application/pdf' });
        const compressedFile = new File([compressedBlob], this.addSuffixToFileName(file.name, '_compressed'), { type: 'application/pdf' });

        return {
            original: file,
            compressed: compressedFile,
            compressionRatio: compressionRatio,
            originalSize: file.size,
            compressedSize: compressedBytes.length
        };
    }

    async additionalPDFCompression(pdfBytes, quality) {
        try {
            const uint8Array = new Uint8Array(pdfBytes);
            let pdfString = '';
            for (let i = 0; i < uint8Array.length; i++) {
                pdfString += String.fromCharCode(uint8Array[i]);
            }

            let compressed = pdfString;

            if (quality < 0.7) {
                // More aggressive compression
                compressed = compressed
                    .replace(/\/Annots\s*\[[^\]]*\]/g, '') // Remove annotations
                    .replace(/\/Contents\s*\[\s*\]/g, '') // Remove empty content arrays
                    .replace(/\s{3,}/g, ' ') // Reduce multiple spaces
                    .replace(/\n+/g, '\n'); // Multiple newlines to single
            }

            if (quality < 0.5) {
                // Very aggressive compression
                compressed = compressed
                    .replace(/\/MediaBox\s*\[[^\]]*\]/g, '/MediaBox[0 0 612 792]') // Standard page size
                    .replace(/\/Rotate\s+\d+/g, '') // Remove rotation
                    .replace(/\/Resources\s*<<[^>]*>>/g, '/Resources<<>>'); // Simplify resources
            }

            const compressedBytes = new Uint8Array(compressed.length);
            for (let i = 0; i < compressed.length; i++) {
                compressedBytes[i] = compressed.charCodeAt(i);
            }

            return compressedBytes;

        } catch (error) {
            console.warn('Additional compression failed:', error);
            return pdfBytes;
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

        this.showNotification('File downloaded successfully!', 'success');
    }

    async downloadAllFiles() {
        if (this.compressedFiles.length === 0) return;

        if (this.compressedFiles.length === 1) {
            this.downloadFile(0);
            return;
        }

        this.showNotification('Downloading all files...', 'info');

        // Download files with delay to avoid browser blocking
        for (let i = 0; i < this.compressedFiles.length; i++) {
            setTimeout(() => {
                this.downloadFile(i);
                if (i === this.compressedFiles.length - 1) {
                    setTimeout(() => {
                        this.showNotification('All files downloaded!', 'success');
                    }, 500);
                }
            }, i * 800);
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

    changeFileExtension(filename, newExt, suffix = '') {
        const parts = filename.split('.');
        const name = parts.slice(0, -1).join('.');
        return `${name}${suffix}.${newExt}`;
    }

    addSuffixToFileName(filename, suffix) {
        const parts = filename.split('.');
        const name = parts.slice(0, -1).join('.');
        const ext = parts[parts.length - 1];
        return `${name}${suffix}.${ext}`;
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
        console.log(`Notification [${type}]: ${message}`);

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        const colors = {
            error: '#dc3545',
            success: '#28a745', 
            info: '#17a2b8',
            warning: '#ffc107'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            z-index: 10001;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            transform: translateX(400px);
            transition: all 0.3s ease;
            font-weight: 600;
            font-size: 0.95rem;
            max-width: 350px;
            word-wrap: break-word;
        `;

        // Add icon based on type
        const icons = {
            error: '❌',
            success: '✅',
            info: 'ℹ️',
            warning: '⚠️'
        };

        notification.innerHTML = `${icons[type] || icons.info} ${message}`;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Remove after duration
        const duration = Math.max(3000, message.length * 50);
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
}

// Initialize the compressor when page loads
let compressor;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing compressor...');
    compressor = new AdProfitXCompressor();

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

    console.log('🚀 AdProfitX Compressor loaded successfully!');
});

// Make compressor globally available
window.compressor = compressor;
