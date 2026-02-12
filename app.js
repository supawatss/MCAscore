// ===== MCA Expert Scoring Application — Main Logic =====

// ---------- DATA ----------
const CRITERIA = [
    {
        code: 'C1', weight: 0.30,
        name: 'ประสิทธิภาพการลด GHG',
        shortName: 'ลด GHG',
        desc: 'ปริมาณการลดก๊าซเรือนกระจกที่คาดว่าจะได้จริงต่อหน่วย (เช่น ต่อกิโลเมตร หรือต่อตันสินค้า)'
    },
    {
        code: 'C2', weight: 0.20,
        name: 'ความคุ้มค่าและต้นทุน',
        shortName: 'ต้นทุน',
        desc: 'การวิเคราะห์ Marginal Abatement Cost หรือต้นทุนที่ต้องจ่ายเพื่อลดก๊าซเรือนกระจก 1 ตัน'
    },
    {
        code: 'C3', weight: 0.15,
        name: 'ความเป็นไปได้ทางเทคนิค',
        shortName: 'เทคนิค',
        desc: 'ความพร้อมของเทคโนโลยีในปัจจุบัน และความยากง่ายในการปรับเปลี่ยนโครงสร้างพื้นฐาน'
    },
    {
        code: 'C4', weight: 0.15,
        name: 'ผลกระทบต่อเศรษฐกิจและสังคม',
        shortName: 'เศรษฐกิจ/สังคม',
        desc: 'การยอมรับของประชาชน ผลกระทบต่อค่าครองชีพ และการสร้างงานในท้องถิ่น'
    },
    {
        code: 'C5', weight: 0.10,
        name: 'ความสอดคล้องกับกฎหมาย',
        shortName: 'กฎหมาย',
        desc: 'ความยากง่ายในการออกข้อบังคับ หรือการปรับปรุงกฎหมายในปัจจุบันเพื่อรองรับนโยบาย'
    },
    {
        code: 'C6', weight: 0.10,
        name: 'ระยะเวลาในการเห็นผลลัพธ์',
        shortName: 'ระยะเวลา',
        desc: 'ความรวดเร็วในการเห็นผลลัพธ์ เทียบกับ Long-term Strategy'
    }
];

const POLICIES = [
    {
        code: 'P1',
        cluster: 'กลุ่มที่ 1: การขนส่งทางบก (Road)',
        name: 'การส่งเสริมยานยนต์ไฟฟ้า EV',
        desc: 'การเปลี่ยนผ่านระบบขนส่งทางถนนโดยส่งเสริม EV และการเปลี่ยนเชื้อเพลิงที่ใช้ทรัพยากรเชื้อเพลิงที่ลดมลพิษ',
    },
    {
        code: 'P2',
        cluster: 'กลุ่มที่ 2: ระบบราง (Rail)',
        name: 'การขนส่งทางรางไฟฟ้า / Modal Shift',
        desc: 'การขนส่งทางรางไฟฟ้าพลังพื้นที่เพื่อสร้างความสามารถทางขนส่งสินค้า (Modal Shift) แทนการใช้รถบรรทุก',
    },
    {
        code: 'P3',
        cluster: 'กลุ่มที่ 3: การขนส่งทางน้ำ (Maritime)',
        name: 'การพัฒนาการเดินเรือสีเขียว (Green Port)',
        desc: 'การใช้เชื้อเพลิงทางเลือกในเรือ และการปรับปรุงท่าเรือเพื่อเปลี่ยนเป็นพลังงานสะอาด',
    },
    {
        code: 'P4',
        cluster: 'กลุ่มที่ 4: การขนส่งทางอากาศ (Aviation)',
        name: 'การลดการปล่อยก๊าซเรือนกระจก SAF',
        desc: 'การนำเชื้อเพลิงชีวภาพทดแทนน้ำมันอากาศยาน (SAF) เพื่อลดคาร์บอนจากอากาศในขณะที่รักษาพลังงานชุดจรีย์',
    },
    {
        code: 'P5',
        cluster: 'กลุ่มที่ 5: นโยบายเชิงบูรณาการ (Crosscutting)',
        name: 'มาตรการภาษีคาร์บอน (Carbon Tax)',
        desc: 'การจัดเก็บภาษีคาร์บอน และมาตรการทางการเงินที่จะช่วยปรับพฤติกรรมผู้ใช้และองค์กรอุตสาหกรรมขนส่ง',
    }
];

// ---------- STATE ----------
let currentWeights = CRITERIA.map(c => c.weight);
let scores = {}; // e.g. { 'P1_C1': 8, 'P1_C2': 7, ... }

// Google Apps Script Web App URL
let SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxPRBV1quzSG8ZDKqTBGX-0jlIeaQ02YAxIvtoefSZ-kUGFkrwFOUZgKEJLrcX2-WKk7A/exec';

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
    renderCriteriaTable();
    renderScoringTable();
    updateWeightSummary();
    loadSavedConfig();
    setDefaultDate();
    initRadarCharts();
});

function setDefaultDate() {
    const dateInput = document.getElementById('expertDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
}

function loadSavedConfig() {
    const saved = localStorage.getItem('mca_script_url');
    if (saved) {
        SCRIPT_URL = saved;
        const urlInput = document.getElementById('scriptUrl');
        if (urlInput) urlInput.value = saved;
    }
}

function saveConfig() {
    const urlInput = document.getElementById('scriptUrl');
    if (urlInput) {
        SCRIPT_URL = urlInput.value.trim();
        localStorage.setItem('mca_script_url', SCRIPT_URL);
        showToast('บันทึก URL สำเร็จ', 'success');
    }
}

// ---------- CRITERIA TABLE ----------
function renderCriteriaTable() {
    const tbody = document.getElementById('criteriaBody');
    tbody.innerHTML = CRITERIA.map((c, i) => `
        <tr>
            <td><span class="criteria-code">${c.code}</span></td>
            <td>
                <div class="weight-input-wrapper">
                    <input type="number" class="weight-input" id="weight_${i}"
                           value="${c.weight}" step="0.01" min="0" max="1"
                           oninput="onWeightChange(${i}, this.value)">
                </div>
            </td>
            <td><span class="criteria-name">${c.name}</span></td>
            <td><span class="criteria-desc">${c.desc}</span></td>
        </tr>
    `).join('');
}

function onWeightChange(index, value) {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= 1) {
        currentWeights[index] = num;
    } else {
        currentWeights[index] = 0;
    }
    updateWeightSummary();
    updateScoringHeaders();
    recalcAllScores();
}

function updateWeightSummary() {
    const total = currentWeights.reduce((a, b) => a + b, 0);
    const rounded = Math.round(total * 1000) / 1000;

    const valueEl = document.getElementById('weightTotalValue');
    const barEl = document.getElementById('weightProgressBar');

    valueEl.textContent = rounded.toFixed(3);

    const isValid = Math.abs(rounded - 1.0) < 0.001;
    valueEl.className = 'weight-total-value ' + (isValid ? 'valid' : 'invalid');

    const pct = Math.min(rounded * 100, 110);
    barEl.style.width = pct + '%';
    barEl.className = 'weight-progress-bar' + (rounded > 1.001 ? ' over' : '');
}

// ---------- SCORING TABLE ----------
function renderScoringTable() {
    // Headers
    updateScoringHeaders();

    // Body
    const tbody = document.getElementById('scoringBody');
    tbody.innerHTML = POLICIES.map(p => {
        const scoreCells = CRITERIA.map((c, ci) => {
            const key = `${p.code}_${c.code}`;
            return `
                <td>
                    <input type="number" class="score-input" id="score_${key}"
                           min="1" max="10" placeholder="–"
                           oninput="onScoreChange('${p.code}', '${c.code}', ${ci}, this)">
                </td>
            `;
        }).join('');

        return `
            <tr id="row_${p.code}">
                <td>
                    <div class="policy-info">
                        <span class="policy-code">${p.code}</span>
                        <span class="policy-name">${p.name}</span>
                        <span class="policy-cluster">${p.cluster}</span>
                    </div>
                </td>
                ${scoreCells}
                <td>
                    <span class="weighted-score" id="ws_${p.code}">–</span>
                </td>
            </tr>
        `;
    }).join('');
}

function updateScoringHeaders() {
    const headerRow = document.getElementById('scoringHeader');
    headerRow.innerHTML = `
        <th>นโยบาย (Policy)</th>
        ${CRITERIA.map((c, i) => `
            <th class="criteria-header">
                ${c.code}
                <span class="th-weight">${c.shortName}</span>
            </th>
        `).join('')}
        <th>คะแนนถ่วงน้ำหนัก</th>
    `;
}

function onScoreChange(policyCode, criteriaCode, criteriaIndex, inputEl) {
    const key = `${policyCode}_${criteriaCode}`;
    let val = parseInt(inputEl.value);

    // Clear error/filled classes
    inputEl.classList.remove('error', 'filled');

    if (inputEl.value === '') {
        delete scores[key];
    } else if (isNaN(val) || val < 1 || val > 10) {
        inputEl.classList.add('error');
        delete scores[key];
    } else {
        scores[key] = val;
        inputEl.classList.add('filled');
    }

    recalcScore(policyCode);
    updateRadarChart(policyCode);
}

function recalcScore(policyCode) {
    let weightedSum = 0;
    let hasAnyScore = false;
    let allFilled = true;

    CRITERIA.forEach((c, i) => {
        const key = `${policyCode}_${c.code}`;
        if (scores[key] !== undefined) {
            weightedSum += scores[key] * currentWeights[i];
            hasAnyScore = true;
        } else {
            allFilled = false;
        }
    });

    const el = document.getElementById(`ws_${policyCode}`);
    if (!hasAnyScore) {
        el.textContent = '–';
        el.className = 'weighted-score';
        return;
    }

    const rounded = Math.round(weightedSum * 100) / 100;
    el.textContent = rounded.toFixed(2);

    // Color code
    el.className = 'weighted-score';
    if (rounded >= 7) el.classList.add('high');
    else if (rounded >= 4) el.classList.add('medium');
    else el.classList.add('low');
}

function recalcAllScores() {
    POLICIES.forEach(p => {
        recalcScore(p.code);
        updateRadarChart(p.code);
    });
}

// ---------- RADAR CHARTS ----------
const POLICY_COLORS = [
    { bg: 'rgba(79, 70, 229, 0.15)', border: '#4f46e5', point: '#4f46e5' },
    { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', point: '#10b981' },
    { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', point: '#f59e0b' },
    { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', point: '#ef4444' },
    { bg: 'rgba(139, 92, 246, 0.15)', border: '#8b5cf6', point: '#8b5cf6' },
];

let radarCharts = {};

function initRadarCharts() {
    const grid = document.getElementById('radarGrid');
    grid.innerHTML = POLICIES.map((p, i) => `
        <div class="radar-card" id="radarCard_${p.code}">
            <div class="radar-card-title">${p.code}: ${p.name}</div>
            <div class="radar-card-subtitle">${p.cluster}</div>
            <canvas id="radarCanvas_${p.code}"></canvas>
        </div>
    `).join('');

    POLICIES.forEach((p, i) => {
        const ctx = document.getElementById(`radarCanvas_${p.code}`).getContext('2d');
        const color = POLICY_COLORS[i % POLICY_COLORS.length];

        radarCharts[p.code] = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: CRITERIA.map(c => c.shortName),
                datasets: [{
                    label: p.code,
                    data: CRITERIA.map(() => 0),
                    backgroundColor: color.bg,
                    borderColor: color.border,
                    borderWidth: 2.5,
                    pointBackgroundColor: color.point,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    r: {
                        min: 0,
                        max: 10,
                        ticks: {
                            stepSize: 2,
                            font: { size: 11 },
                            backdropColor: 'transparent',
                            color: '#94a3b8',
                        },
                        grid: {
                            color: 'rgba(99, 102, 241, 0.1)',
                        },
                        angleLines: {
                            color: 'rgba(99, 102, 241, 0.12)',
                        },
                        pointLabels: {
                            font: {
                                size: 13,
                                weight: '600',
                                family: "'Noto Sans Thai', 'Inter', sans-serif",
                            },
                            color: '#475569',
                        },
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.label}: ${ctx.raw} คะแนน`
                        }
                    }
                },
                animation: {
                    duration: 400,
                    easing: 'easeOutQuart',
                },
            }
        });
    });
}

function updateRadarChart(policyCode) {
    const chart = radarCharts[policyCode];
    if (!chart) return;

    const data = CRITERIA.map(c => {
        const key = `${policyCode}_${c.code}`;
        return scores[key] !== undefined ? scores[key] : 0;
    });

    chart.data.datasets[0].data = data;
    chart.update();
}

// ---------- SUBMIT ----------
async function submitForm() {
    // Validate expert info
    const expertName = document.getElementById('expertName').value.trim();
    const expertOrg = document.getElementById('expertOrg').value.trim();
    const expertDate = document.getElementById('expertDate').value;

    if (!expertName) {
        showToast('กรุณากรอกชื่อผู้เชี่ยวชาญ', 'error');
        document.getElementById('expertName').focus();
        return;
    }

    // Validate weight sum
    const weightTotal = currentWeights.reduce((a, b) => a + b, 0);
    if (Math.abs(weightTotal - 1.0) > 0.01) {
        showToast('ผลรวมน้ำหนักต้องเท่ากับ 1.000', 'error');
        return;
    }

    // Check that at least some scores are filled
    const filledScores = Object.keys(scores).length;
    if (filledScores === 0) {
        showToast('กรุณากรอกคะแนนอย่างน้อย 1 นโยบาย', 'error');
        return;
    }

    // Check Google Apps Script URL
    const urlInput = document.getElementById('scriptUrl');
    const inputUrl = urlInput ? urlInput.value.trim() : '';
    if (inputUrl) {
        SCRIPT_URL = inputUrl;
    }

    if (!SCRIPT_URL) {
        showToast('กรุณาใส่ Google Apps Script URL ก่อน', 'error');
        document.getElementById('scriptUrl')?.focus();
        return;
    }

    // Save URL
    localStorage.setItem('mca_script_url', SCRIPT_URL);

    // Build payload
    const payload = {
        timestamp: new Date().toISOString(),
        expertName,
        expertOrg,
        expertDate,
        weights: {},
        scores: {},
        weightedScores: {}
    };

    CRITERIA.forEach((c, i) => {
        payload.weights[c.code] = currentWeights[i];
    });

    POLICIES.forEach(p => {
        payload.scores[p.code] = {};
        let weightedSum = 0;
        let allFilled = true;

        CRITERIA.forEach((c, i) => {
            const key = `${p.code}_${c.code}`;
            if (scores[key] !== undefined) {
                payload.scores[p.code][c.code] = scores[key];
                weightedSum += scores[key] * currentWeights[i];
            } else {
                payload.scores[p.code][c.code] = null;
                allFilled = false;
            }
        });

        payload.weightedScores[p.code] = allFilled ? Math.round(weightedSum * 100) / 100 : null;
    });

    // Send
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.classList.add('loading');

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // no-cors means we won't get a readable response, but data will be sent
        showToast('✅ ส่งข้อมูลสำเร็จ! ข้อมูลถูกบันทึกลง Google Sheet แล้ว', 'success');
    } catch (err) {
        console.error('Submit error:', err);
        showToast('❌ เกิดข้อผิดพลาด: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.classList.remove('loading');
    }
}

// ---------- TOAST ----------
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ---------- RESET ----------
function resetForm() {
    if (!confirm('ต้องการล้างข้อมูลทั้งหมดหรือไม่?')) return;

    // Reset weights to defaults
    CRITERIA.forEach((c, i) => {
        currentWeights[i] = c.weight;
        const input = document.getElementById(`weight_${i}`);
        if (input) input.value = c.weight;
    });

    // Reset scores
    scores = {};
    POLICIES.forEach(p => {
        CRITERIA.forEach(c => {
            const input = document.getElementById(`score_${p.code}_${c.code}`);
            if (input) {
                input.value = '';
                input.classList.remove('filled', 'error');
            }
        });
    });

    // Reset expert info
    document.getElementById('expertName').value = '';
    document.getElementById('expertOrg').value = '';
    setDefaultDate();

    updateWeightSummary();
    updateScoringHeaders();
    recalcAllScores();

    // Reset radar charts
    POLICIES.forEach(p => updateRadarChart(p.code));

    showToast('ล้างข้อมูลเรียบร้อย', 'info');
}
