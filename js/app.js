/**
 * Solecito - Conversor CSV a Excel
 * Aplicación accesible para convertir archivos CSV a formato Excel
 */

// ============================================
// ESTADO DE LA APLICACIÓN
// ============================================
const state = {
    currentFile: null,
    parsedData: null,
    delimiter: ',',
    hasHeaders: true
};

// ============================================
// ELEMENTOS DEL DOM
// ============================================
const elements = {
    dropZone: document.getElementById('dropZone'),
    fileInput: document.getElementById('fileInput'),
    selectFileBtn: document.getElementById('selectFileBtn'),
    fileInfo: document.getElementById('fileInfo'),
    previewSection: document.getElementById('previewSection'),
    previewTable: document.getElementById('previewTable'),
    actionsSection: document.getElementById('actionsSection'),
    convertBtn: document.getElementById('convertBtn'),
    resetBtn: document.getElementById('resetBtn'),
    delimiter: document.getElementById('delimiter'),
    hasHeaders: document.getElementById('hasHeaders'),
    messageArea: document.getElementById('messageArea'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    loadingText: document.getElementById('loadingText')
};

// ============================================
// INICIALIZACIÓN
// ============================================
function init() {
    setupEventListeners();
    setupKeyboardNavigation();
    announceToScreenReader('Aplicación Solecito cargada. Lista para convertir archivos CSV a Excel.');
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Click en el botón de seleccionar archivo
    elements.selectFileBtn.addEventListener('click', () => {
        elements.fileInput.click();
    });

    // Click en la zona de drop
    elements.dropZone.addEventListener('click', (e) => {
        if (e.target !== elements.selectFileBtn) {
            elements.fileInput.click();
        }
    });

    // Cambio en el input de archivo
    elements.fileInput.addEventListener('change', handleFileSelect);

    // Drag & Drop
    elements.dropZone.addEventListener('dragover', handleDragOver);
    elements.dropZone.addEventListener('dragleave', handleDragLeave);
    elements.dropZone.addEventListener('drop', handleDrop);

    // Prevenir comportamiento por defecto de arrastre en toda la página
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Cambios en las opciones de parsing
    elements.delimiter.addEventListener('change', (e) => {
        state.delimiter = e.target.value;
        if (state.currentFile) {
            parseAndPreviewFile(state.currentFile);
        }
    });

    elements.hasHeaders.addEventListener('change', (e) => {
        state.hasHeaders = e.target.checked;
        if (state.parsedData) {
            renderPreview(state.parsedData);
        }
    });

    // Botones de acción
    elements.convertBtn.addEventListener('click', convertToExcel);
    elements.resetBtn.addEventListener('click', resetApplication);
}

// ============================================
// NAVEGACIÓN CON TECLADO
// ============================================
function setupKeyboardNavigation() {
    // Enter o Espacio en la zona de drop
    elements.dropZone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            elements.fileInput.click();
        }
    });

    // Cerrar mensajes con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const messages = elements.messageArea.querySelectorAll('.message');
            messages.forEach(msg => msg.remove());
        }
    });
}

// ============================================
// DRAG & DROP HANDLERS
// ============================================
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDragOver(e) {
    preventDefaults(e);
    elements.dropZone.classList.add('drag-over');
}

function handleDragLeave(e) {
    preventDefaults(e);
    elements.dropZone.classList.remove('drag-over');
}

function handleDrop(e) {
    preventDefaults(e);
    elements.dropZone.classList.remove('drag-over');

    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
        handleFile(files[0]);
    }
}

// ============================================
// FILE HANDLING
// ============================================
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    // Validar tipo de archivo
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
        showMessage('error', 'Error: Por favor selecciona un archivo CSV válido.');
        announceToScreenReader('Error: Archivo no válido. Por favor selecciona un archivo CSV.');
        return;
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        showMessage('error', 'Error: El archivo es demasiado grande. Máximo 10MB.');
        announceToScreenReader('Error: El archivo excede el tamaño máximo de 10 megabytes.');
        return;
    }

    state.currentFile = file;
    showFileInfo(file);
    parseAndPreviewFile(file);
}

function showFileInfo(file) {
    const sizeKB = (file.size / 1024).toFixed(2);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const sizeText = file.size < 1024 * 1024 ? `${sizeKB} KB` : `${sizeMB} MB`;

    elements.fileInfo.innerHTML = `
        <div class="file-info-icon" aria-hidden="true">📄</div>
        <div class="file-info-text">
            <strong>${escapeHtml(file.name)}</strong>
            <small>Tamaño: ${sizeText}</small>
        </div>
    `;

    announceToScreenReader(`Archivo cargado: ${file.name}, tamaño: ${sizeText}`);
}

// ============================================
// PARSING CSV
// ============================================
function parseAndPreviewFile(file) {
    showLoading('Analizando archivo...');

    const reader = new FileReader();

    reader.onload = function(e) {
        const csvContent = e.target.result;
        const parsedData = parseCSV(csvContent, state.delimiter);

        if (parsedData.length === 0) {
            hideLoading();
            showMessage('error', 'Error: El archivo CSV está vacío o no se pudo analizar.');
            announceToScreenReader('Error: No se pudo analizar el archivo CSV.');
            return;
        }

        state.parsedData = parsedData;
        renderPreview(parsedData);
        showPreviewSection();
        hideLoading();

        const rowCount = parsedData.length;
        const colCount = parsedData[0].length;
        announceToScreenReader(`Archivo analizado exitosamente. ${rowCount} filas y ${colCount} columnas encontradas.`);
        showMessage('success', `✓ Archivo cargado: ${rowCount} filas, ${colCount} columnas`);
    };

    reader.onerror = function() {
        hideLoading();
        showMessage('error', 'Error: No se pudo leer el archivo.');
        announceToScreenReader('Error al leer el archivo.');
    };

    reader.readAsText(file);
}

function parseCSV(csvText, delimiter) {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim());
    const result = [];

    for (let line of lines) {
        const row = parseCSVLine(line, delimiter);
        result.push(row);
    }

    return result;
}

function parseCSVLine(line, delimiter) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === delimiter && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

// ============================================
// PREVIEW
// ============================================
function renderPreview(data) {
    if (!data || data.length === 0) return;

    const maxPreviewRows = 10;
    const previewData = data.slice(0, maxPreviewRows + (state.hasHeaders ? 1 : 0));

    let html = '<thead><tr>';

    // Headers
    if (state.hasHeaders && data.length > 0) {
        data[0].forEach(header => {
            html += `<th scope="col">${escapeHtml(header)}</th>`;
        });
        html += '</tr></thead><tbody>';

        // Rows
        for (let i = 1; i < previewData.length; i++) {
            html += '<tr>';
            previewData[i].forEach(cell => {
                html += `<td>${escapeHtml(cell)}</td>`;
            });
            html += '</tr>';
        }
    } else {
        // Sin headers
        const firstRow = data[0];
        firstRow.forEach((_, index) => {
            html += `<th scope="col">Columna ${index + 1}</th>`;
        });
        html += '</tr></thead><tbody>';

        previewData.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td>${escapeHtml(cell)}</td>`;
            });
            html += '</tr>';
        });
    }

    html += '</tbody>';
    elements.previewTable.innerHTML = html;
}

function showPreviewSection() {
    elements.previewSection.style.display = 'block';
    elements.actionsSection.style.display = 'flex';

    // Scroll suave a la preview
    setTimeout(() => {
        elements.previewSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// ============================================
// CONVERSIÓN A EXCEL
// ============================================
function convertToExcel() {
    if (!state.parsedData || state.parsedData.length === 0) {
        showMessage('error', 'Error: No hay datos para convertir.');
        return;
    }

    showLoading('Convirtiendo a Excel...');

    // Usar setTimeout para dar tiempo al navegador a mostrar el overlay
    setTimeout(() => {
        try {
            // Crear un nuevo workbook
            const wb = XLSX.utils.book_new();

            // Convertir datos a worksheet
            const ws = XLSX.utils.aoa_to_sheet(state.parsedData);

            // Ajustar ancho de columnas automáticamente
            const colWidths = calculateColumnWidths(state.parsedData);
            ws['!cols'] = colWidths;

            // Agregar la worksheet al workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Datos');

            // Generar el archivo
            const fileName = state.currentFile.name.replace(/\.csv$/i, '') + '.xlsx';
            XLSX.writeFile(wb, fileName);

            hideLoading();
            showMessage('success', `✓ Archivo convertido exitosamente: ${fileName}`);
            announceToScreenReader(`Conversión exitosa. El archivo ${fileName} ha sido descargado.`);

            // Analítica (opcional)
            logConversion(state.parsedData.length, state.parsedData[0].length);

        } catch (error) {
            hideLoading();
            console.error('Error al convertir:', error);
            showMessage('error', 'Error: No se pudo convertir el archivo. Por favor intenta nuevamente.');
            announceToScreenReader('Error durante la conversión. Por favor intenta nuevamente.');
        }
    }, 100);
}

function calculateColumnWidths(data) {
    if (!data || data.length === 0) return [];

    const colWidths = [];
    const maxCols = Math.max(...data.map(row => row.length));

    for (let col = 0; col < maxCols; col++) {
        let maxWidth = 10; // Ancho mínimo

        for (let row = 0; row < Math.min(data.length, 100); row++) {
            if (data[row][col]) {
                const cellLength = data[row][col].toString().length;
                maxWidth = Math.max(maxWidth, cellLength);
            }
        }

        // Limitar el ancho máximo
        maxWidth = Math.min(maxWidth, 50);
        colWidths.push({ wch: maxWidth });
    }

    return colWidths;
}

// ============================================
// RESET
// ============================================
function resetApplication() {
    state.currentFile = null;
    state.parsedData = null;
    state.delimiter = ',';
    state.hasHeaders = true;

    elements.fileInput.value = '';
    elements.fileInfo.innerHTML = '';
    elements.previewSection.style.display = 'none';
    elements.actionsSection.style.display = 'none';
    elements.previewTable.innerHTML = '';
    elements.delimiter.value = ',';
    elements.hasHeaders.checked = true;

    // Limpiar mensajes
    elements.messageArea.innerHTML = '';

    announceToScreenReader('Aplicación reiniciada. Lista para cargar un nuevo archivo.');

    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// MENSAJES Y NOTIFICACIONES
// ============================================
function showMessage(type, text) {
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠'
    };

    const message = document.createElement('div');
    message.className = `message message-${type}`;
    message.innerHTML = `
        <span class="message-icon" aria-hidden="true">${icons[type]}</span>
        <div class="message-content">${escapeHtml(text)}</div>
        <button class="message-close" aria-label="Cerrar mensaje">×</button>
    `;

    const closeBtn = message.querySelector('.message-close');
    closeBtn.addEventListener('click', () => {
        message.remove();
    });

    elements.messageArea.appendChild(message);

    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
        if (message.parentElement) {
            message.remove();
        }
    }, 5000);
}

function showLoading(text = 'Procesando...') {
    elements.loadingText.textContent = text;
    elements.loadingOverlay.style.display = 'flex';
    announceToScreenReader(text);
}

function hideLoading() {
    elements.loadingOverlay.style.display = 'none';
}

function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'visually-hidden';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
        announcement.remove();
    }, 1000);
}

// ============================================
// UTILIDADES
// ============================================
function escapeHtml(text) {
    if (text === null || text === undefined) return '';

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function logConversion(rows, cols) {
    // Esta función podría enviar analíticas si fuera necesario
    console.log(`Conversión exitosa: ${rows} filas, ${cols} columnas`);
}

// ============================================
// DETECCIÓN DE CARACTERÍSTICAS
// ============================================
function checkBrowserSupport() {
    const features = {
        fileReader: typeof FileReader !== 'undefined',
        localStorage: typeof Storage !== 'undefined',
        dragAndDrop: 'draggable' in document.createElement('div')
    };

    if (!features.fileReader) {
        showMessage('error', 'Tu navegador no soporta la lectura de archivos. Por favor actualiza tu navegador.');
        return false;
    }

    return true;
}

// ============================================
// INICIAR APLICACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    if (checkBrowserSupport()) {
        init();
    }
});

// ============================================
// SERVICE WORKER (para PWA - opcional)
// ============================================
if ('serviceWorker' in navigator) {
    // Descomentar si quieres implementar PWA
    // navigator.serviceWorker.register('/sw.js');
}
