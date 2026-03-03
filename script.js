// script.js

// ==================== GLOBAL VARIABLES ====================
let currentDisplay = '0';
let memory = 0;
let history = [];
let currentFormula = null;

// Make functions globally available
window.switchSection = switchSection;
window.insertNumber = insertNumber;
window.insertOperator = insertOperator;
window.insertFunction = insertFunction;
window.clearAll = clearAll;
window.clearEntry = clearEntry;
window.calculate = calculate;
window.memoryAdd = memoryAdd;
window.memorySubtract = memorySubtract;
window.memoryRecall = memoryRecall;
window.memoryClear = memoryClear;
window.clearHistory = clearHistory;
window.executeFormula = executeFormula;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Engineering Tools Pro iniciado!');
    
    // Load history from localStorage
    const saved = localStorage.getItem('calcHistory');
    if (saved) {
        try {
            history = JSON.parse(saved);
            updateHistoryDisplay();
        } catch (e) {
            console.error('Erro ao carregar histórico:', e);
            history = [];
        }
    }

    // Setup formula selector
    const formulaSelect = document.getElementById('formula-select');
    if (formulaSelect) {
        formulaSelect.addEventListener('change', function() {
            const formulaId = this.value;
            if (formulaId) {
                loadFormulaFields(formulaId);
            } else {
                document.getElementById('formula-display').innerHTML = 'Selecione uma fórmula para começar';
                document.getElementById('input-fields').innerHTML = '';
                document.getElementById('formula-result').innerHTML = '';
            }
        });
    }

    // Render MathJax
    if (window.MathJax) {
        MathJax.typeset();
    }
    
    // Initialize display
    const display = document.getElementById('calc-display');
    if (display) {
        display.value = currentDisplay;
    }
});

// ==================== SECTION SWITCHING ====================
function switchSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update button styles
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline-primary');
    });
    
    // Find and update clicked button
    const buttons = document.querySelectorAll('.nav-btn');
    for (let btn of buttons) {
        if (btn.getAttribute('onclick').includes(sectionId)) {
            btn.classList.remove('btn-outline-primary');
            btn.classList.add('btn-primary');
            break;
        }
    }
    
    // Re-render MathJax for formula sections
    if (sectionId.includes('formulas') && window.MathJax) {
        setTimeout(() => MathJax.typeset(), 100);
    }
}

// ==================== CALCULATOR FUNCTIONS ====================
function insertNumber(num) {
    if (currentDisplay === '0' || currentDisplay === 'Error') {
        currentDisplay = num;
    } else {
        currentDisplay += num;
    }
    updateDisplay();
}

function insertOperator(op) {
    const lastChar = currentDisplay[currentDisplay.length - 1];
    if ('+-*/'.includes(lastChar)) {
        currentDisplay = currentDisplay.slice(0, -1) + op;
    } else {
        currentDisplay += op;
    }
    updateDisplay();
}

function insertFunction(func) {
    if (func === '!') {
        currentDisplay += '!';
    } else if (func === '%') {
        try {
            const value = evaluateExpression(currentDisplay);
            currentDisplay = (value / 100).toString();
        } catch (e) {
            currentDisplay = '0';
        }
    } else if (func === 'sqrt(') {
        currentDisplay = '√(' + currentDisplay + ')';
    } else if (func === '^') {
        currentDisplay += '^';
    } else {
        // Para todas as outras funções (sin, cos, tan, log, etc)
        // Se o display atual for um número, aplica a função imediatamente (estilo Casio)
        if (currentDisplay !== '0' && currentDisplay !== 'Error' && !isNaN(parseFloat(currentDisplay))) {
            try {
                const value = parseFloat(currentDisplay);
                let result;
                
                switch(func) {
                    case 'sin(':
                        result = Math.sin(value * Math.PI / 180);
                        break;
                    case 'cos(':
                        result = Math.cos(value * Math.PI / 180);
                        break;
                    case 'tan(':
                        result = Math.tan(value * Math.PI / 180);
                        break;
                    case 'asin(':
                        result = Math.asin(value) * 180 / Math.PI;
                        break;
                    case 'acos(':
                        result = Math.acos(value) * 180 / Math.PI;
                        break;
                    case 'atan(':
                        result = Math.atan(value) * 180 / Math.PI;
                        break;
                    case 'log(':
                        result = Math.log10(value);
                        break;
                    case 'ln(':
                        result = Math.log(value);
                        break;
                    case 'exp(':
                        result = Math.exp(value);
                        break;
                    default:
                        currentDisplay += func;
                        updateDisplay();
                        return;
                }
                
                currentDisplay = result.toString();
                addToHistory(func.replace('(', '') + '(' + value + ') = ' + result);
            } catch (e) {
                currentDisplay += func;
            }
        } else {
            currentDisplay += func;
        }
    }
    updateDisplay();
}

function clearAll() {
    currentDisplay = '0';
    updateDisplay();
}

function clearEntry() {
    currentDisplay = '0';
    updateDisplay();
}

function updateDisplay() {
    const display = document.getElementById('calc-display');
    if (display) {
        display.value = currentDisplay;
    }
}

// Memory functions
function memoryAdd() {
    try {
        const value = evaluateExpression(currentDisplay);
        memory += value;
        updateMemoryIndicator();
        addToHistory('M+ ' + currentDisplay + ' = ' + value);
    } catch (e) {
        alert('Erro ao adicionar à memória');
    }
}

function memorySubtract() {
    try {
        const value = evaluateExpression(currentDisplay);
        memory -= value;
        updateMemoryIndicator();
        addToHistory('M- ' + currentDisplay + ' = ' + value);
    } catch (e) {
        alert('Erro ao subtrair da memória');
    }
}

function memoryRecall() {
    currentDisplay = memory.toString();
    updateDisplay();
}

function memoryClear() {
    memory = 0;
    updateMemoryIndicator();
}

function updateMemoryIndicator() {
    const indicator = document.getElementById('memory-indicator');
    if (indicator) {
        indicator.innerHTML = '<i class="fas fa-memory me-1"></i>' + memory;
    }
}

// ==================== CALCULATE FUNCTION CORRIGIDA ====================
function calculate() {
    try {
        const result = evaluateExpression(currentDisplay);
        addToHistory(currentDisplay + ' = ' + result);
        currentDisplay = result.toString();
        updateDisplay();
    } catch (e) {
        console.error('Erro no cálculo:', e);
        currentDisplay = 'Error';
        updateDisplay();
        setTimeout(() => {
            currentDisplay = '0';
            updateDisplay();
        }, 1500);
    }
}

function evaluateExpression(expr) {
    if (!expr || expr === '') return 0;
    
    // Primeiro, vamos tratar as funções especiais
    let processed = expr;
    
    // Substituir notações visuais
    processed = processed
        .replace(/÷/g, '/')
        .replace(/×/g, '*')
        .replace(/−/g, '-')
        .replace(/\^/g, '**');
    
    // Função auxiliar para avaliar subexpressões com segurança
    function safeEval(exp) {
        try {
            return Function('"use strict";return (' + exp + ')')();
        } catch {
            return 0;
        }
    }
    
    // Processar funções matemáticas uma a uma (ordem correta)
    
    // 1. Primeiro, √ (raiz quadrada) - formato √(expressão)
    while (processed.includes('√(')) {
        processed = processed.replace(/√\(([^)]+)\)/g, function(match, p1) {
            const val = safeEval(p1);
            return Math.sqrt(val);
        });
    }
    
    // 2. Funções trigonométricas e logarítmicas
    const functions = [
        { pattern: /sin\(([^)]+)\)/g, handler: (val) => Math.sin(val * Math.PI / 180) },
        { pattern: /cos\(([^)]+)\)/g, handler: (val) => Math.cos(val * Math.PI / 180) },
        { pattern: /tan\(([^)]+)\)/g, handler: (val) => Math.tan(val * Math.PI / 180) },
        { pattern: /asin\(([^)]+)\)/g, handler: (val) => Math.asin(val) * 180 / Math.PI },
        { pattern: /acos\(([^)]+)\)/g, handler: (val) => Math.acos(val) * 180 / Math.PI },
        { pattern: /atan\(([^)]+)\)/g, handler: (val) => Math.atan(val) * 180 / Math.PI },
        { pattern: /log\(([^)]+)\)/g, handler: (val) => Math.log10(val) },
        { pattern: /ln\(([^)]+)\)/g, handler: (val) => Math.log(val) },
        { pattern: /exp\(([^)]+)\)/g, handler: (val) => Math.exp(val) },
        { pattern: /sqrt\(([^)]+)\)/g, handler: (val) => Math.sqrt(val) }
    ];
    
    // Aplicar cada função repetidamente até não haver mais
    for (const func of functions) {
        while (func.pattern.test(processed)) {
            processed = processed.replace(func.pattern, function(match, p1) {
                const val = safeEval(p1);
                return func.handler(val);
            });
        }
    }
    
    // 3. Processar fatorial
    if (processed.includes('!')) {
        processed = processed.replace(/(\d+)!/g, function(match, num) {
            return factorial(parseFloat(num));
        });
    }
    
    // 4. Avaliar expressão final
    try {
        return Function('"use strict";return (' + processed + ')')();
    } catch (e) {
        throw new Error('Expressão inválida');
    }
}

// Função fatorial
function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// Statistical functions
function calculateMean(expr) {
    const numbers = extractNumbers(expr);
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((a, b) => a + b, 0);
    return sum / numbers.length;
}

function calculateVariance(expr) {
    const numbers = extractNumbers(expr);
    if (numbers.length < 2) return 0;
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / (numbers.length - 1);
}

function calculateStd(expr) {
    return Math.sqrt(calculateVariance(expr));
}

function extractNumbers(expr) {
    const matches = expr.match(/\d+\.?\d*/g);
    return matches ? matches.map(Number) : [];
}

// History functions
function addToHistory(entry) {
    const timestamp = new Date().toLocaleTimeString();
    history.unshift({ text: entry, time: timestamp });
    
    // Keep only last 20 entries
    if (history.length > 20) {
        history.pop();
    }
    
    updateHistoryDisplay();
    localStorage.setItem('calcHistory', JSON.stringify(history));
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    if (history.length === 0) {
        historyList.innerHTML = '<div class="text-center text-muted py-3">Nenhum cálculo no histórico</div>';
        return;
    }
    
    historyList.innerHTML = '';
    history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <span class="history-text">${item.text}</span>
            <span class="timestamp">${item.time}</span>
        `;
        historyList.appendChild(historyItem);
    });
}

function clearHistory() {
    history = [];
    updateHistoryDisplay();
    localStorage.setItem('calcHistory', JSON.stringify(history));
}

// ==================== FORMULA EXECUTOR FUNCTIONS ====================
function loadFormulaFields(formulaId) {
    const formulaDisplay = document.getElementById('formula-display');
    const inputFields = document.getElementById('input-fields');
    
    if (!formulaDisplay || !inputFields) return;
    
    currentFormula = formulaId;
    
    const formulas = {
        'retangulo': {
            latex: 'A = b \\times h',
            inputs: [
                { name: 'b', label: 'Base (b)', unit: 'm' },
                { name: 'h', label: 'Altura (h)', unit: 'm' }
            ],
            calculate: (vals) => vals.b * vals.h
        },
        'triangulo': {
            latex: 'A = \\frac{b \\times h}{2}',
            inputs: [
                { name: 'b', label: 'Base (b)', unit: 'm' },
                { name: 'h', label: 'Altura (h)', unit: 'm' }
            ],
            calculate: (vals) => (vals.b * vals.h) / 2
        },
        'circulo': {
            latex: 'A = \\pi r^2',
            inputs: [
                { name: 'r', label: 'Raio (r)', unit: 'm' }
            ],
            calculate: (vals) => Math.PI * Math.pow(vals.r, 2)
        },
        'cilindro': {
            latex: 'V = \\pi r^2 h',
            inputs: [
                { name: 'r', label: 'Raio (r)', unit: 'm' },
                { name: 'h', label: 'Altura (h)', unit: 'm' }
            ],
            calculate: (vals) => Math.PI * Math.pow(vals.r, 2) * vals.h
        },
        'cone': {
            latex: 'V = \\frac{1}{3}\\pi r^2 h',
            inputs: [
                { name: 'r', label: 'Raio (r)', unit: 'm' },
                { name: 'h', label: 'Altura (h)', unit: 'm' }
            ],
            calculate: (vals) => (Math.PI * Math.pow(vals.r, 2) * vals.h) / 3
        },
        'esfera': {
            latex: 'V = \\frac{4}{3}\\pi r^3',
            inputs: [
                { name: 'r', label: 'Raio (r)', unit: 'm' }
            ],
            calculate: (vals) => (4/3) * Math.PI * Math.pow(vals.r, 3)
        },
        'tensao': {
            latex: '\\sigma = \\frac{F}{A}',
            inputs: [
                { name: 'F', label: 'Força (F)', unit: 'N' },
                { name: 'A', label: 'Área (A)', unit: 'm²' }
            ],
            calculate: (vals) => vals.F / vals.A
        },
        'elasticidade': {
            latex: 'E = \\frac{\\sigma}{\\epsilon}',
            inputs: [
                { name: 'sigma', label: 'Tensão (σ)', unit: 'Pa' },
                { name: 'epsilon', label: 'Deformação (ε)', unit: '' }
            ],
            calculate: (vals) => vals.sigma / vals.epsilon
        },
        'momento': {
            latex: 'M = F \\times d',
            inputs: [
                { name: 'F', label: 'Força (F)', unit: 'N' },
                { name: 'd', label: 'Distância (d)', unit: 'm' }
            ],
            calculate: (vals) => vals.F * vals.d
        },
        'energia_cinetica': {
            latex: 'E_c = \\frac{1}{2} m v^2',
            inputs: [
                { name: 'm', label: 'Massa (m)', unit: 'kg' },
                { name: 'v', label: 'Velocidade (v)', unit: 'm/s' }
            ],
            calculate: (vals) => 0.5 * vals.m * Math.pow(vals.v, 2)
        },
        'energia_potencial': {
            latex: 'E_p = m g h',
            inputs: [
                { name: 'm', label: 'Massa (m)', unit: 'kg' },
                { name: 'g', label: 'Gravidade (g)', unit: 'm/s²', value: 9.81 },
                { name: 'h', label: 'Altura (h)', unit: 'm' }
            ],
            calculate: (vals) => vals.m * vals.g * vals.h
        },
        'densidade': {
            latex: '\\rho = \\frac{m}{V}',
            inputs: [
                { name: 'm', label: 'Massa (m)', unit: 'kg' },
                { name: 'V', label: 'Volume (V)', unit: 'm³' }
            ],
            calculate: (vals) => vals.m / vals.V
        },
        'pressao': {
            latex: 'P = \\frac{F}{A}',
            inputs: [
                { name: 'F', label: 'Força (F)', unit: 'N' },
                { name: 'A', label: 'Área (A)', unit: 'm²' }
            ],
            calculate: (vals) => vals.F / vals.A
        },
        'vazao': {
            latex: 'Q = A \\times v',
            inputs: [
                { name: 'A', label: 'Área (A)', unit: 'm²' },
                { name: 'v', label: 'Velocidade (v)', unit: 'm/s' }
            ],
            calculate: (vals) => vals.A * vals.v
        },
        'ohm': {
            latex: 'V = R \\times I',
            inputs: [
                { name: 'R', label: 'Resistência (R)', unit: 'Ω' },
                { name: 'I', label: 'Corrente (I)', unit: 'A' }
            ],
            calculate: (vals) => vals.R * vals.I
        },
        'potencia': {
            latex: 'P = V \\times I',
            inputs: [
                { name: 'V', label: 'Tensão (V)', unit: 'V' },
                { name: 'I', label: 'Corrente (I)', unit: 'A' }
            ],
            calculate: (vals) => vals.V * vals.I
        }
    };
    
    const formula = formulas[formulaId];
    if (!formula) return;
    
    // Display formula
    formulaDisplay.innerHTML = '\\[' + formula.latex + '\\]';
    if (window.MathJax) {
        MathJax.typeset();
    }
    
    // Create input fields
    let html = '';
    formula.inputs.forEach(input => {
        const defaultValue = input.value !== undefined ? input.value : '';
        html += `
            <div class="mb-3">
                <label class="form-label fw-bold">${input.label} (${input.unit}):</label>
                <input type="number" class="form-control" id="input-${input.name}" 
                       value="${defaultValue}" step="any" placeholder="Digite o valor">
            </div>
        `;
    });
    
    inputFields.innerHTML = html;
    document.getElementById('formula-result').innerHTML = '';
}

function executeFormula() {
    if (!currentFormula) {
        alert('Por favor, selecione uma fórmula primeiro!');
        return;
    }
    
    const formulas = {
        'retangulo': (vals) => vals.b * vals.h,
        'triangulo': (vals) => (vals.b * vals.h) / 2,
        'circulo': (vals) => Math.PI * Math.pow(vals.r, 2),
        'cilindro': (vals) => Math.PI * Math.pow(vals.r, 2) * vals.h,
        'cone': (vals) => (Math.PI * Math.pow(vals.r, 2) * vals.h) / 3,
        'esfera': (vals) => (4/3) * Math.PI * Math.pow(vals.r, 3),
        'tensao': (vals) => vals.F / vals.A,
        'elasticidade': (vals) => vals.sigma / vals.epsilon,
        'momento': (vals) => vals.F * vals.d,
        'energia_cinetica': (vals) => 0.5 * vals.m * Math.pow(vals.v, 2),
        'energia_potencial': (vals) => vals.m * vals.g * vals.h,
        'densidade': (vals) => vals.m / vals.V,
        'pressao': (vals) => vals.F / vals.A,
        'vazao': (vals) => vals.A * vals.v,
        'ohm': (vals) => vals.R * vals.I,
        'potencia': (vals) => vals.V * vals.I
    };
    
    const formula = formulas[currentFormula];
    if (!formula) return;
    
    // Get input values
    const inputs = {};
    const inputElements = document.querySelectorAll('#input-fields input');
    let hasError = false;
    
    inputElements.forEach(input => {
        const id = input.id.replace('input-', '');
        const value = parseFloat(input.value);
        
        if (isNaN(value)) {
            alert(`Por favor, preencha todos os campos com números válidos.`);
            hasError = true;
            return;
        }
        
        inputs[id] = value;
    });
    
    if (hasError) return;
    
    // Calculate result
    try {
        const result = formula(inputs);
        
        // Display result
        const resultDiv = document.getElementById('formula-result');
        resultDiv.innerHTML = `
            <h4 class="mb-3">Resultado:</h4>
            <div class="result-value">${result.toFixed(4)}</div>
            <p class="text-muted mt-2">unidades consistentes com os valores de entrada</p>
        `;
        
        // Add to calculator history
        addToHistory(currentFormula + ': ' + result.toFixed(4));
        
    } catch (e) {
        alert('Erro ao calcular: ' + e.message);
    }
}

// Keyboard support
document.addEventListener('keydown', function(event) {
    const activeSection = document.querySelector('.content-section.active');
    if (!activeSection || activeSection.id !== 'calculator-section') return;
    
    const key = event.key;
    
    if (/[0-9.]/.test(key)) {
        event.preventDefault();
        insertNumber(key);
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        event.preventDefault();
        insertOperator(key);
    } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    } else if (key === 'Escape') {
        event.preventDefault();
        clearAll();
    } else if (key === 'Backspace') {
        event.preventDefault();
        if (currentDisplay.length > 1) {
            currentDisplay = currentDisplay.slice(0, -1);
        } else {
            currentDisplay = '0';
        }
        updateDisplay();
    }
});

// ==================== DRAWING SECTION ====================

// Elementos do desenho
const drawingCanvas = document.getElementById('drawing-canvas');
const drawingCtx = drawingCanvas?.getContext('2d');
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let startX = 0;
let startY = 0;

// Estado das ferramentas
let currentTool = 'pencil'; // pencil, brush, marker, calligraphy, eraser, line, rect, circle, triangle, arrow, star
let currentColor = '#000000';
let currentSize = 5;
let currentOpacity = 100;
let fillShape = false;
let strokeStyle = 'solid'; // solid, dashed, dotted

// Histórico para desfazer/refazer
let historyStack = [];
let redoStack = [];
const MAX_HISTORY = 50;
let isHistorySaving = true;

// Zoom e pan
let zoomLevel = 1;
let panX = 0;
let panY = 0;
let isPanning = false;

// Preview de formas
let previewShape = null;

// Inicializar desenho
if (drawingCanvas && drawingCtx) {
    initDrawingTurbo();
}

function initDrawingTurbo() {
    // Configurações iniciais
    updateDrawingStyle();
    
    // Salvar estado inicial
    saveToHistory();
    
    // Event listeners do mouse
    drawingCanvas.addEventListener('mousedown', startDrawingTurbo);
    drawingCanvas.addEventListener('mousemove', drawTurbo);
    drawingCanvas.addEventListener('mouseup', stopDrawingTurbo);
    drawingCanvas.addEventListener('mouseout', stopDrawingTurbo);
    drawingCanvas.addEventListener('mousemove', updateCoordinates);
    
    // Suporte a touch
    drawingCanvas.addEventListener('touchstart', handleTouchStartTurbo);
    drawingCanvas.addEventListener('touchmove', handleTouchMoveTurbo);
    drawingCanvas.addEventListener('touchend', stopDrawingTurbo);
    
    // Botão direito do mouse para pan rápido
    drawingCanvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        startPanMode(e);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Controles da UI
    setupUIControls();
    
    // Atualizar subtoolbar inicial
    updateSubToolbar();
}

function setupUIControls() {
    // Cores e tamanhos
    document.getElementById('drawing-color')?.addEventListener('input', (e) => {
        currentColor = e.target.value;
        updateDrawingStyle();
    });
    
    document.getElementById('drawing-size')?.addEventListener('input', (e) => {
        currentSize = parseInt(e.target.value);
        document.getElementById('size-value').textContent = currentSize;
        updateDrawingStyle();
    });
    
    document.getElementById('drawing-opacity')?.addEventListener('input', (e) => {
        currentOpacity = parseInt(e.target.value);
        document.getElementById('opacity-value').textContent = currentOpacity + '%';
        updateDrawingStyle();
    });
    
    // Ferramentas de desenho
    document.getElementById('tool-pencil')?.addEventListener('click', () => setActiveTool('pencil'));
    document.getElementById('tool-brush')?.addEventListener('click', () => setActiveTool('brush'));
    document.getElementById('tool-marker')?.addEventListener('click', () => setActiveTool('marker'));
    document.getElementById('tool-calligraphy')?.addEventListener('click', () => setActiveTool('calligraphy'));
    document.getElementById('tool-eraser')?.addEventListener('click', () => setActiveTool('eraser'));
    
    // Formas
    document.getElementById('shape-line')?.addEventListener('click', () => setActiveTool('line'));
    document.getElementById('shape-rect')?.addEventListener('click', () => setActiveTool('rect'));
    document.getElementById('shape-circle')?.addEventListener('click', () => setActiveTool('circle'));
    document.getElementById('shape-triangle')?.addEventListener('click', () => setActiveTool('triangle'));
    document.getElementById('shape-arrow')?.addEventListener('click', () => setActiveTool('arrow'));
    document.getElementById('shape-star')?.addEventListener('click', () => setActiveTool('star'));
    
    // Ações
    document.getElementById('drawing-undo')?.addEventListener('click', undo);
    document.getElementById('drawing-redo')?.addEventListener('click', redo);
    document.getElementById('drawing-clear')?.addEventListener('click', clearCanvas);
    document.getElementById('drawing-save')?.addEventListener('click', saveDrawing);
}

function setActiveTool(tool) {
    currentTool = tool;
    
    // Remover active de todos os botões
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Adicionar active ao botão correto
    const toolMap = {
        'pencil': 'tool-pencil',
        'brush': 'tool-brush',
        'marker': 'tool-marker',
        'calligraphy': 'tool-calligraphy',
        'eraser': 'tool-eraser',
        'line': 'shape-line',
        'rect': 'shape-rect',
        'circle': 'shape-circle',
        'triangle': 'shape-triangle',
        'arrow': 'shape-arrow',
        'star': 'shape-star'
    };
    
    const btnId = toolMap[tool];
    if (btnId) {
        document.getElementById(btnId)?.classList.add('active');
    }
    
    // Atualizar estilo
    updateDrawingStyle();
    
    // Atualizar subtoolbar
    updateSubToolbar();
    
    // Atualizar status
    const toolNames = {
        'pencil': 'Lápis',
        'brush': 'Pincel',
        'marker': 'Marcador',
        'calligraphy': 'Caneta Caligrafia',
        'eraser': 'Borracha',
        'line': 'Linha',
        'rect': 'Retângulo',
        'circle': 'Círculo',
        'triangle': 'Triângulo',
        'arrow': 'Seta',
        'star': 'Estrela'
    };
    document.getElementById('tool-status').textContent = `Ferramenta: ${toolNames[tool] || tool}`;
}

function updateDrawingStyle() {
    if (!drawingCtx) return;
    
    if (currentTool === 'eraser') {
        drawingCtx.globalCompositeOperation = 'destination-out';
        drawingCtx.strokeStyle = '#ffffff';
    } else {
        drawingCtx.globalCompositeOperation = 'source-over';
        drawingCtx.strokeStyle = currentColor;
    }
    
    // Ajustes específicos por ferramenta
    switch(currentTool) {
        case 'pencil':
            drawingCtx.lineWidth = currentSize;
            drawingCtx.lineCap = 'round';
            drawingCtx.lineJoin = 'round';
            break;
        case 'brush':
            drawingCtx.lineWidth = currentSize * 1.5;
            drawingCtx.lineCap = 'round';
            drawingCtx.lineJoin = 'round';
            break;
        case 'marker':
            drawingCtx.lineWidth = currentSize * 2;
            drawingCtx.lineCap = 'square';
            drawingCtx.lineJoin = 'bevel';
            drawingCtx.globalAlpha = currentOpacity / 100 * 0.5;
            break;
        case 'calligraphy':
            drawingCtx.lineWidth = currentSize;
            drawingCtx.lineCap = 'square';
            // Efeito caligráfico varia com a direção
            break;
        default:
            drawingCtx.lineWidth = currentSize;
            drawingCtx.lineCap = 'round';
            drawingCtx.lineJoin = 'round';
    }
    
    // Opacidade global (exceto marcador que já tem opacidade própria)
    if (currentTool !== 'marker') {
        drawingCtx.globalAlpha = currentOpacity / 100;
    }
    
    // Estilo de linha
    if (strokeStyle === 'dashed') {
        drawingCtx.setLineDash([10, 5]);
    } else if (strokeStyle === 'dotted') {
        drawingCtx.setLineDash([2, 5]);
    } else {
        drawingCtx.setLineDash([]);
    }
}

function updateSubToolbar() {
    const subtoolbar = document.getElementById('subtoolbar');
    if (!subtoolbar) return;
    
    let html = '';
    
    // Opções específicas por ferramenta
    if (['rect', 'circle', 'triangle', 'arrow', 'star'].includes(currentTool)) {
        html += `
            <div class="subtool-option">
                <label>Preenchimento:</label>
                <input type="checkbox" id="fill-shape" ${fillShape ? 'checked' : ''}>
                <label>Cor de Preenchimento:</label>
                <input type="color" id="fill-color" value="${currentColor}">
            </div>
        `;
    }
    
    if (['line', 'rect', 'circle'].includes(currentTool)) {
        html += `
            <div class="subtool-option">
                <label>Estilo da Linha:</label>
                <select id="stroke-style">
                    <option value="solid" ${strokeStyle === 'solid' ? 'selected' : ''}>Sólida</option>
                    <option value="dashed" ${strokeStyle === 'dashed' ? 'selected' : ''}>Tracejada</option>
                    <option value="dotted" ${strokeStyle === 'dotted' ? 'selected' : ''}>Pontilhada</option>
                </select>
            </div>
        `;
    }
    
    subtoolbar.innerHTML = html;
    
    // Adicionar event listeners para os novos controles
    document.getElementById('fill-shape')?.addEventListener('change', (e) => {
        fillShape = e.target.checked;
    });
    
    document.getElementById('fill-color')?.addEventListener('input', (e) => {
        // Cor de preenchimento
    });
    
    document.getElementById('stroke-style')?.addEventListener('change', (e) => {
        strokeStyle = e.target.value;
        updateDrawingStyle();
    });
}

// Funções de desenho
function startDrawingTurbo(e) {
    e.preventDefault();
    isDrawing = true;
    
    const pos = getCanvasCoordinates(e);
    startX = pos.x;
    startY = pos.y;
    lastX = startX;
    lastY = startY;
    
    if (currentTool === 'pencil' || currentTool === 'brush' || currentTool === 'marker' || currentTool === 'calligraphy' || currentTool === 'eraser') {
        drawingCtx.beginPath();
        drawingCtx.moveTo(lastX, lastY);
    }
}

function drawTurbo(e) {
    if (!isDrawing) return;
    e.preventDefault();
    
    const pos = getCanvasCoordinates(e);
    const currentX = pos.x;
    const currentY = pos.y;
    
    // Atualizar coordenadas no status
    updateCoordinates(e);
    
    if (['pencil', 'brush', 'marker', 'calligraphy', 'eraser'].includes(currentTool)) {
        // Desenho livre
        drawingCtx.lineTo(currentX, currentY);
        drawingCtx.stroke();
        drawingCtx.beginPath();
        drawingCtx.moveTo(currentX, currentY);
        
        lastX = currentX;
        lastY = currentY;
    } else {
        // Preview de formas
        previewShape = { startX, startY, currentX, currentY };
        redrawCanvas();
        drawShapePreview();
    }
}

function stopDrawingTurbo() {
    if (isDrawing) {
        if (['line', 'rect', 'circle', 'triangle', 'arrow', 'star'].includes(currentTool) && previewShape) {
            // Desenhar a forma final
            drawShape(previewShape.startX, previewShape.startY, previewShape.currentX, previewShape.currentY);
        }
        
        isDrawing = false;
        previewShape = null;
        saveToHistory();
        updateFileSize();
    }
}

function drawShapePreview() {
    if (!previewShape || !drawingCtx) return;
    
    const { startX, startY, currentX, currentY } = previewShape;
    
    // Salvar estado atual
    drawingCtx.save();
    
    // Configurar estilo de preview (semi-transparente)
    drawingCtx.globalAlpha = 0.5;
    drawingCtx.strokeStyle = currentColor;
    drawingCtx.lineWidth = currentSize;
    
    // Desenhar forma de preview
    drawShape(startX, startY, currentX, currentY);
    
    // Restaurar estado
    drawingCtx.restore();
}

function drawShape(x1, y1, x2, y2) {
    if (!drawingCtx) return;
    
    drawingCtx.save();
    updateDrawingStyle();
    
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    
    drawingCtx.beginPath();
    
    switch(currentTool) {
        case 'line':
            drawingCtx.moveTo(x1, y1);
            drawingCtx.lineTo(x2, y2);
            drawingCtx.stroke();
            break;
            
        case 'rect':
            if (fillShape) {
                drawingCtx.fillStyle = currentColor;
                drawingCtx.fillRect(left, top, width, height);
            }
            drawingCtx.strokeRect(left, top, width, height);
            break;
            
        case 'circle':
            const radiusX = width / 2;
            const radiusY = height / 2;
            const centerX = left + radiusX;
            const centerY = top + radiusY;
            
            drawingCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
            
            if (fillShape) {
                drawingCtx.fillStyle = currentColor;
                drawingCtx.fill();
            }
            drawingCtx.stroke();
            break;
            
        case 'triangle':
            const tipX = left + width / 2;
            
            drawingCtx.moveTo(tipX, top);
            drawingCtx.lineTo(left, top + height);
            drawingCtx.lineTo(left + width, top + height);
            drawingCtx.closePath();
            
            if (fillShape) {
                drawingCtx.fillStyle = currentColor;
                drawingCtx.fill();
            }
            drawingCtx.stroke();
            break;
            
        case 'arrow':
            // Linha principal
            drawingCtx.moveTo(x1, y1);
            drawingCtx.lineTo(x2, y2);
            
            // Cabeça da seta
            const angle = Math.atan2(y2 - y1, x2 - x1);
            const arrowSize = 20;
            
            const arrowX1 = x2 - arrowSize * Math.cos(angle - 0.3);
            const arrowY1 = y2 - arrowSize * Math.sin(angle - 0.3);
            const arrowX2 = x2 - arrowSize * Math.cos(angle + 0.3);
            const arrowY2 = y2 - arrowSize * Math.sin(angle + 0.3);
            
            drawingCtx.moveTo(x2, y2);
            drawingCtx.lineTo(arrowX1, arrowY1);
            drawingCtx.moveTo(x2, y2);
            drawingCtx.lineTo(arrowX2, arrowY2);
            
            drawingCtx.stroke();
            break;
            
        case 'star':
            const spikes = 5;
            const outerRadius = width / 2;
            const innerRadius = outerRadius * 0.4;
            let rot = Math.PI / 2 * 3;
            const cx = left + width / 2;
            const cy = top + height / 2;
            const step = Math.PI / spikes;
            
            drawingCtx.moveTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
            
            for (let i = 0; i < spikes; i++) {
                rot += step;
                drawingCtx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
                rot += step;
                drawingCtx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
            }
            
            drawingCtx.closePath();
            
            if (fillShape) {
                drawingCtx.fillStyle = currentColor;
                drawingCtx.fill();
            }
            drawingCtx.stroke();
            break;
    }
    
    drawingCtx.restore();
}

function redrawCanvas() {
    if (historyStack.length > 0) {
        const lastState = historyStack[historyStack.length - 1];
        drawingCtx.putImageData(lastState, 0, 0);
    } else {
        drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    }
}

// Handlers de toque
function handleTouchStartTurbo(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY,
    });
    drawingCanvas.dispatchEvent(mouseEvent);
}

function handleTouchMoveTurbo(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY,
    });
    drawingCanvas.dispatchEvent(mouseEvent);
}

// Coordenadas
function updateCoordinates(e) {
    const pos = getCanvasCoordinates(e);
    document.getElementById('coord-status').textContent = `X: ${Math.round(pos.x)}, Y: ${Math.round(pos.y)}`;
}

function getCanvasCoordinates(e) {
    const rect = drawingCanvas.getBoundingClientRect();
    const scaleX = drawingCanvas.width / rect.width;
    const scaleY = drawingCanvas.height / rect.height;
    
    let clientX, clientY;
    
    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

// Histórico
function saveToHistory() {
    if (!isHistorySaving) return;
    
    const imageData = drawingCtx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
    historyStack.push(imageData);
    
    if (historyStack.length > MAX_HISTORY) {
        historyStack.shift();
    }
    
    redoStack = [];
}

function undo() {
    if (historyStack.length > 1) {
        isHistorySaving = false;
        
        const currentState = historyStack.pop();
        redoStack.push(currentState);
        
        const previousState = historyStack[historyStack.length - 1];
        drawingCtx.putImageData(previousState, 0, 0);
        
        isHistorySaving = true;
        updateFileSize();
    }
}

function redo() {
    if (redoStack.length > 0) {
        isHistorySaving = false;
        
        const nextState = redoStack.pop();
        historyStack.push(nextState);
        drawingCtx.putImageData(nextState, 0, 0);
        
        isHistorySaving = true;
        updateFileSize();
    }
}

function clearCanvas() {
    if (confirm('Limpar todo o desenho?')) {
        drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        saveToHistory();
        updateFileSize();
    }
}

// Salvar
function saveDrawing() {
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0,19).replace(/:/g, '-');
    link.download = `desenho-${timestamp}.png`;
    link.href = drawingCanvas.toDataURL('image/png');
    link.click();
}

// File size
function updateFileSize() {
    const dataUrl = drawingCanvas.toDataURL('image/png');
    const base64 = dataUrl.split(',')[1];
    const size = Math.round((base64.length * 3) / 4 / 1024);
    document.getElementById('file-size').textContent = size + ' KB';
}

// Keyboard shortcuts
function handleKeyboardShortcuts(e) {
    const activeSection = document.querySelector('.content-section.active');
    if (!activeSection || activeSection.id !== 'drawing-section') return;
    
    // Ctrl+Z
    if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
    }
    
    // Ctrl+Y
    if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
    }
    
    // Atalhos de ferramentas
    const keyMap = {
        'p': 'pencil',
        'b': 'brush',
        'm': 'marker',
        'c': 'calligraphy',
        'e': 'eraser',
        'l': 'line',
        'r': 'rect',
        'o': 'circle',
        't': 'triangle'
    };
    
    if (keyMap[e.key.toLowerCase()]) {
        e.preventDefault();
        setActiveTool(keyMap[e.key.toLowerCase()]);
    }
}

// Pan mode
function startPanMode(e) {
    isPanning = true;
    const startPanX = e.clientX;
    const startPanY = e.clientY;
    
    function pan(e) {
        if (!isPanning) return;
        
        const dx = (e.clientX - startPanX) / zoomLevel;
        const dy = (e.clientY - startPanY) / zoomLevel;
        
        // Implementar pan
    }
    
    function stopPan() {
        isPanning = false;
        document.removeEventListener('mousemove', pan);
        document.removeEventListener('mouseup', stopPan);
    }
    
    document.addEventListener('mousemove', pan);
    document.addEventListener('mouseup', stopPan);
}
