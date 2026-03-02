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
    } else {
        currentDisplay += func;
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

// Calculate function
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
    
    let processed = expr
        .replace(/÷/g, '/')
        .replace(/×/g, '*')
        .replace(/−/g, '-')
        .replace(/\^/g, '**')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/asin\(/g, 'Math.asin(')
        .replace(/acos\(/g, 'Math.acos(')
        .replace(/atan\(/g, 'Math.atan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/exp\(/g, 'Math.exp(');
    
    // Handle factorial
    if (processed.includes('!')) {
        processed = processed.replace(/(\d+)!/g, function(match, num) {
            return 'factorial(' + num + ')';
        });
    }
    
    // Define factorial function
    window.factorial = function(n) {
        n = Number(n);
        if (n === 0 || n === 1) return 1;
        if (n < 0) return NaN;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    };
    
    // Handle statistical functions
    if (processed.includes('mean(')) {
        return calculateMean(processed);
    }
    if (processed.includes('variance(')) {
        return calculateVariance(processed);
    }
    if (processed.includes('std(')) {
        return calculateStd(processed);
    }
    
    try {
        // Use Function constructor for safer evaluation
        const result = new Function('return ' + processed)();
        if (isNaN(result) || !isFinite(result)) {
            throw new Error('Resultado inválido');
        }
        return result;
    } catch (e) {
        throw new Error('Expressão inválida');
    }
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