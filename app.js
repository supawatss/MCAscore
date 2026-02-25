// ===== MCA Expert Scoring — ASI (Avoid-Shift-Improve) Framework v2.0 =====

// ---------- DATA ----------
const SCORE_LABELS = [
    { score: 1, label: 'ต่ำมาก', desc: 'แทบไม่มีผลกระทบ / ไม่เป็นไปได้' },
    { score: 2, label: 'ต่ำ', desc: 'ผลกระทบน้อย / เป็นไปได้ยาก' },
    { score: 3, label: 'ปานกลาง', desc: 'มีผลกระทบพอสมควร / เป็นไปได้ปานกลาง' },
    { score: 4, label: 'สูง', desc: 'มีผลกระทบมาก / เป็นไปได้สูง' },
    { score: 5, label: 'สูงมาก', desc: 'ผลกระทบอย่างมีนัยสำคัญ / เป็นไปได้อย่างยิ่ง' },
];

const CRITERIA = [
    {
        code: 'C1', weight: 0.30,
        name: 'ความเป็นไปได้ในการขับเคลื่อนนโยบาย',
        shortName: 'การขับเคลื่อน',
        desc: 'ความสอดคล้องกับยุทธศาสตร์ชาติ แรงสนับสนุนจากภาครัฐ/เอกชน และความเป็นไปได้ในทางปฏิบัติ',
        objective: 'เพื่อประเมินว่านโยบายนี้มีโอกาสถูกนำไปปฏิบัติจริงมากน้อยเพียงใด'
    },
    {
        code: 'C2', weight: 0.20,
        name: 'ความคุ้มค่าและต้นทุน',
        shortName: 'ต้นทุน',
        desc: 'ต้นทุนที่ต้องจ่ายเพื่อลดก๊าซเรือนกระจก (Marginal Abatement Cost)',
        objective: 'เพื่อเปรียบเทียบต้นทุนกับผลประโยชน์ด้านสิ่งแวดล้อมที่ได้รับ'
    },
    {
        code: 'C3', weight: 0.15,
        name: 'ความเป็นไปได้ทางเทคนิค',
        shortName: 'เทคนิค',
        desc: 'ความพร้อมของเทคโนโลยีและความยากง่ายในการปรับโครงสร้างพื้นฐาน',
        objective: 'เพื่อประเมินว่าเทคโนโลยีที่จำเป็นพร้อมใช้งานในบริบทประเทศไทยหรือไม่'
    },
    {
        code: 'C4', weight: 0.15,
        name: 'ผลกระทบต่อเศรษฐกิจและสังคม',
        shortName: 'เศรษฐกิจ/สังคม',
        desc: 'เศรษฐกิจ: การลงทุน การจ้างงาน และผลิตภาพ | สังคม: ความยุติธรรม (Justice), การกระจายรายได้ และความครอบคลุม (Inclusive)',
        objective: 'เพื่อประเมินผลกระทบเชิงบวก/ลบต่อเศรษฐกิจและความเป็นธรรมทางสังคม'
    },
    {
        code: 'C5', weight: 0.10,
        name: 'ความสอดคล้องกับกฎหมาย',
        shortName: 'กฎหมาย',
        desc: 'ความยากง่ายในการออกข้อบังคับหรือปรับปรุงกฎหมายรองรับ',
        objective: 'เพื่อวัดความยากง่ายในการออกหรือปรับปรุงกฎหมายรองรับนโยบาย'
    },
    {
        code: 'C6', weight: 0.10,
        name: 'ระยะเวลาในการเห็นผลลัพธ์',
        shortName: 'ระยะเวลา',
        desc: 'ความรวดเร็วในการเห็นผลลัพธ์จากนโยบาย',
        objective: 'เพื่อวัดศักยภาพของนโยบายในการสร้างผลลัพธ์ที่เห็นได้ภายในระยะเวลาที่กำหนด'
    }
];

const POLICIES = [
    {
        code: 'P1',
        asiType: ['avoid'],
        name: 'การวางผังเมืองกะทัดรัดและลดการเดินทาง',
        nameEn: 'Compact City / TOD',
        desc: 'เป้าหมาย: ลดระยะทางและความจำเป็นในการเดินทาง\n'
            + '(1) พัฒนาพื้นที่รอบสถานีขนส่ง (TOD) ให้เป็นศูนย์กลางที่อยู่อาศัย-พาณิชย์\n'
            + '(2) ส่งเสริมผังเมืองแบบ Mixed-Use ลดการกระจายตัวของเมือง\n'
            + '(3) สนับสนุน Remote Work / WFH เพื่อลดการเดินทางเข้าเมือง'
    },
    {
        code: 'P2',
        asiType: ['shift'],
        name: 'การส่งเสริมระบบขนส่งสาธารณะ',
        nameEn: 'Public Transit Promotion',
        desc: 'เป้าหมาย: เปลี่ยนผู้โดยสารจากรถส่วนตัวสู่ขนส่งมวลชน\n'
            + '(1) ขยายเครือข่ายรถไฟฟ้า BTS/MRT และ Feeder Bus\n'
            + '(2) ปรับค่าโดยสารบัตรเดียวเดินทางทุกระบบ (Common Ticketing)\n'
            + '(3) เพิ่มความถี่และคุณภาพบริการรถเมล์ในเขตเมือง'
    },
    {
        code: 'P3',
        asiType: ['shift'],
        name: 'การขนส่งสินค้าทางราง',
        nameEn: 'Rail Freight Modal Shift',
        desc: 'เป้าหมาย: เปลี่ยนสัดส่วนการขนส่งสินค้าจากถนนเป็นราง\n'
            + '(1) พัฒนารถไฟทางคู่และเชื่อมต่อเส้นทางขนส่งสินค้า\n'
            + '(2) สร้าง Inland Container Depot (ICD) รองรับ Intermodal\n'
            + '(3) ให้สิทธิประโยชน์ทางภาษีแก่ผู้ประกอบการที่ใช้ราง'
    },
    {
        code: 'P4',
        asiType: ['improve'],
        name: 'การส่งเสริมยานยนต์ไฟฟ้า',
        nameEn: 'EV Promotion',
        desc: 'เป้าหมาย: ลดการปล่อย GHG จากเครื่องยนต์สันดาป\n'
            + '(1) มาตรการจูงใจภาษีสรรพสามิต-อากรนำเข้า EV\n'
            + '(2) ขยายสถานีชาร์จ EV ทั่วประเทศ (Target: 12,000 จุด)\n'
            + '(3) ส่งเสริม E-Bus / E-Truck สำหรับขนส่งสาธารณะและโลจิสติกส์'
    },
    {
        code: 'P5',
        asiType: ['improve'],
        name: 'การใช้เชื้อเพลิงชีวภาพทดแทน',
        nameEn: 'Biofuels / SAF',
        desc: 'เป้าหมาย: ลดคาร์บอนจากเชื้อเพลิงฟอสซิลในภาคขนส่ง\n'
            + '(1) เพิ่มสัดส่วนไบโอดีเซล B10-B20 และ E20 ในรถยนต์\n'
            + '(2) พัฒนา Sustainable Aviation Fuel (SAF) สำหรับการบิน\n'
            + '(3) วิจัย Green Hydrogen / Ammonia สำหรับเรือและรถบรรทุก'
    },
    {
        code: 'P6',
        asiType: ['avoid', 'shift'],
        name: 'ระบบโลจิสติกส์อัจฉริยะ',
        nameEn: 'Smart Logistics',
        desc: 'เป้าหมาย: ลดเที่ยวเปล่าและปรับโหมดขนส่งในห่วงโซ่อุปทาน\n'
            + '(1) ใช้ระบบ AI/IoT บริหารจัดการเส้นทางและบรรจุสินค้า\n'
            + '(2) จัดตั้ง Consolidation Center ลดจำนวนรถเข้าเขตเมือง\n'
            + '(3) ส่งเสริม Intermodal Transport เชื่อมถนน-ราง-น้ำ'
    },
    {
        code: 'P7',
        asiType: ['avoid', 'shift', 'improve'],
        name: 'มาตรการภาษีคาร์บอนและแผนบูรณาการ',
        nameEn: 'Carbon Tax & Integrated Plan',
        desc: 'เป้าหมาย: สร้างกลไกราคาคาร์บอนเพื่อปรับพฤติกรรมทุกมิติ\n'
            + '(1) จัดเก็บภาษีคาร์บอนตามปริมาณ CO₂ ต่อลิตรเชื้อเพลิง\n'
            + '(2) นำรายได้ภาษีอุดหนุนระบบขนส่งสะอาดและ EV\n'
            + '(3) บูรณาการนโยบาย A-S-I ในแผนแม่บทขนส่งแห่งชาติ'
    }
];

// ASI Colors for charts
const ASI_COLORS = {
    avoid: { main: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: '#d97706' },
    shift: { main: '#0d9488', bg: 'rgba(13, 148, 136, 0.15)', border: '#0f766e' },
    improve: { main: '#7c3aed', bg: 'rgba(124, 58, 237, 0.15)', border: '#6d28d9' },
};

// Per-policy chart colors
const POLICY_CHART_COLORS = [
    { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', point: '#d97706' },   // P1 Avoid
    { bg: 'rgba(13, 148, 136, 0.15)', border: '#0d9488', point: '#0f766e' },    // P2 Shift
    { bg: 'rgba(20, 184, 166, 0.15)', border: '#14b8a6', point: '#0d9488' },    // P3 Shift
    { bg: 'rgba(124, 58, 237, 0.15)', border: '#7c3aed', point: '#6d28d9' },    // P4 Improve
    { bg: 'rgba(139, 92, 246, 0.15)', border: '#8b5cf6', point: '#7c3aed' },    // P5 Improve
    { bg: 'rgba(234, 179, 8, 0.15)', border: '#eab308', point: '#ca8a04' },     // P6 Avoid+Shift
    { bg: 'rgba(79, 70, 229, 0.15)', border: '#4f46e5', point: '#4338ca' },     // P7 A+S+I
];

// Criteria donut chart colors
const CRITERIA_COLORS = [
    '#4f46e5', '#7c3aed', '#0d9488', '#f59e0b', '#ef4444', '#6366f1'
];

// ---------- STATE ----------
let currentWeights = CRITERIA.map(c => c.weight);
let scores = {};
let priorities = {};

const PRIORITY_OPTIONS = [
    { key: 'short', label: 'ระยะสั้น', labelEn: 'Short-term', color: '#dc2626' },
    { key: 'medium', label: 'ระยะกลาง', labelEn: 'Medium-term', color: '#eab308' },
    { key: 'long', label: 'ระยะยาว', labelEn: 'Long-term', color: '#64748b' },
];

// Google Apps Script URL
const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxPRBV1quzSG8ZDKqTBGX-0jlIeaQ02YAxIvtoefSZ-kUGFkrwFOUZgKEJLrcX2-WKk7A/exec';
let SCRIPT_URL = DEFAULT_SCRIPT_URL;

// Chart instances
let weightDonutChart = null;
let comparisonChart = null;
let radarCharts = {};

console.log('MCA App v2.0.0 — ASI Framework initialized');

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
    renderCriteriaTable();
    renderScoringTable();
    updateWeightSummary();
    setDefaultDate();
    initWeightDonut();
    initRadarCharts();
    initComparisonChart();
});

function setDefaultDate() {
    const dateInput = document.getElementById('expertDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
}

// ---------- ASI BADGE HELPER ----------
function renderAsiBadges(asiType) {
    return asiType.map(t => {
        const labels = { avoid: 'Avoid', shift: 'Shift', improve: 'Improve' };
        return `<span class="asi-badge ${t}">${labels[t]}</span>`;
    }).join('');
}

function getPrimaryAsiColor(policy) {
    const t = policy.asiType[0];
    return ASI_COLORS[t];
}

function togglePolicyDesc(code) {
    const el = document.getElementById(`desc_${code}`);
    const btn = el.previousElementSibling;
    if (el.style.display === 'none') {
        el.style.display = 'block';
        btn.textContent = 'ซ่อนรายละเอียด ▲';
        btn.classList.add('active');
    } else {
        el.style.display = 'none';
        btn.textContent = 'ดูรายละเอียด ▼';
        btn.classList.remove('active');
    }
}

function setPriority(policyCode, priorityKey, btnEl) {
    const container = document.getElementById(`priority_${policyCode}`);
    const allBtns = container.querySelectorAll('.priority-pill');

    // Toggle off if same pill clicked again
    if (priorities[policyCode] === priorityKey) {
        delete priorities[policyCode];
        allBtns.forEach(b => b.classList.remove('selected'));
        updateComparisonChart();
        updateTimeline();
        return;
    }

    priorities[policyCode] = priorityKey;
    allBtns.forEach(b => b.classList.remove('selected'));
    btnEl.classList.add('selected');
    updateComparisonChart();
    updateTimeline();
}

// ---------- TIMELINE ----------
function updateTimeline() {
    const containers = {
        short: document.getElementById('timelineUrgent'),
        medium: document.getElementById('timelineMedium'),
        long: document.getElementById('timelineLong'),
    };
    if (!containers.short) return;

    // Compute weighted scores
    const policyScores = {};
    let maxScore = 0;
    POLICIES.forEach(p => {
        let wSum = 0;
        let filled = false;
        CRITERIA.forEach((c, i) => {
            const key = `${p.code}_${c.code}`;
            if (scores[key] !== undefined) {
                wSum += scores[key] * currentWeights[i];
                filled = true;
            }
        });
        policyScores[p.code] = filled ? Math.round(wSum * 100) / 100 : 0;
        if (policyScores[p.code] > maxScore) maxScore = policyScores[p.code];
    });
    if (maxScore === 0) maxScore = 10;

    // Group policies by priority
    const groups = { short: [], medium: [], long: [] };
    POLICIES.forEach(p => {
        const pri = priorities[p.code];
        if (pri && groups[pri]) {
            groups[pri].push(p);
        }
    });

    // Sort each group by score descending
    Object.keys(groups).forEach(key => {
        groups[key].sort((a, b) => policyScores[b.code] - policyScores[a.code]);
    });

    const asiColors = {
        avoid: { bg: 'rgba(245,158,11,0.15)', border: '#f59e0b' },
        shift: { bg: 'rgba(20,184,166,0.12)', border: '#14b8a6' },
        improve: { bg: 'rgba(139,92,246,0.12)', border: '#8b5cf6' },
    };

    // Render each group
    Object.entries(containers).forEach(([key, el]) => {
        const policies = groups[key];
        if (policies.length === 0) {
            el.innerHTML = '<div class="phase-empty">ยังไม่มีนโยบาย</div>';
            return;
        }

        el.innerHTML = policies.map(p => {
            const sc = policyScores[p.code];
            const barW = maxScore > 0 ? Math.max(4, (sc / maxScore) * 100) : 4;
            const primaryAsi = p.asiType[0];
            const aColor = asiColors[primaryAsi] || asiColors.avoid;
            const badges = p.asiType.map(t => {
                const labels = { avoid: 'A', shift: 'S', improve: 'I' };
                return `<span class="tl-badge ${t}">${labels[t]}</span>`;
            }).join('');

            return `
                <div class="tl-card" style="border-left: 3px solid ${aColor.border};">
                    <div class="tl-card-top">
                        <span class="tl-code">${p.code}</span>
                        ${badges}
                        <span class="tl-name">${p.name}</span>
                    </div>
                    <div class="tl-bar-row">
                        <div class="tl-bar" style="width:${barW}%; background:${aColor.border};"></div>
                        <span class="tl-score">${sc.toFixed(2)}</span>
                    </div>
                </div>
            `;
        }).join('');
    });
}

// ---------- CRITERIA TABLE ----------
function renderCriteriaTable() {
    const tbody = document.getElementById('criteriaBody');
    tbody.innerHTML = CRITERIA.map((c, i) => `
        <tr>
            <td><span class="criteria-code">${c.code}</span></td>
            <td><span class="weight-display">${Math.round(c.weight * 100)}%</span></td>
            <td><span class="criteria-name">${c.name}</span></td>
            <td><span class="criteria-desc">${c.desc}</span></td>
            <td><span class="criteria-objective">${c.objective}</span></td>
        </tr>
    `).join('');
}

function onWeightChange(index, value) {
    const num = parseFloat(value);
    currentWeights[index] = (!isNaN(num) && num >= 0 && num <= 1) ? num : 0;
    updateWeightSummary();
    updateScoringHeaders();
    recalcAllScores();
    updateWeightDonut();
}

function updateWeightSummary() {
    // Weights are now locked — just update donut if present
    updateWeightDonut();
}

// ---------- WEIGHT DONUT CHART ----------
function initWeightDonut() {
    const ctx = document.getElementById('weightDonutChart').getContext('2d');
    weightDonutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: CRITERIA.map(c => c.shortName),
            datasets: [{
                data: currentWeights.map(w => Math.round(w * 100)),
                backgroundColor: CRITERIA_COLORS,
                borderColor: '#ffffff',
                borderWidth: 3,
                hoverBorderWidth: 0,
                hoverOffset: 8,
            }]
        },
        plugins: [ChartDataLabels],
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '58%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 14,
                        usePointStyle: true,
                        pointStyleWidth: 10,
                        font: {
                            size: 12,
                            family: "'Noto Sans Thai', 'Inter', sans-serif",
                            weight: '600',
                        },
                        color: '#475569',
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.label}: ${ctx.raw}%`
                    }
                },
                datalabels: {
                    color: '#fff',
                    font: {
                        size: 13,
                        weight: '700',
                        family: "'Inter', sans-serif",
                    },
                    formatter: (value) => value > 0 ? value + '%' : '',
                    anchor: 'center',
                    align: 'center',
                    textStrokeColor: 'rgba(0,0,0,0.15)',
                    textStrokeWidth: 1,
                }
            },
            animation: {
                animateRotate: true,
                duration: 600,
                easing: 'easeOutQuart',
            }
        }
    });
}

function updateWeightDonut() {
    if (!weightDonutChart) return;
    weightDonutChart.data.datasets[0].data = currentWeights.map(w => Math.round(w * 100));
    weightDonutChart.update();
}

// ---------- SCORING TABLE ----------
function renderScoringTable() {
    updateScoringHeaders();

    const tbody = document.getElementById('scoringBody');
    tbody.innerHTML = POLICIES.map((p, pi) => {
        const scoreCells = CRITERIA.map((c, ci) => {
            const key = `${p.code}_${c.code}`;
            return `
                <td>
                    <input type="number" class="score-input" id="score_${key}"
                           min="1" max="5" placeholder="–"
                           oninput="onScoreChange('${p.code}', '${c.code}', ${ci}, this)">
                </td>
            `;
        }).join('');

        return `
            <tr id="row_${p.code}">
                <td>
                    <div class="policy-info">
                        <div style="display:flex; align-items:center; gap:0.5rem;">
                            <span class="policy-code">${p.code}</span>
                            <div class="asi-badges-row">${renderAsiBadges(p.asiType)}</div>
                        </div>
                        <span class="policy-name">${p.name}</span>
                        <span class="policy-desc-text">${p.nameEn}</span>
                        <button type="button" class="policy-toggle-btn" onclick="togglePolicyDesc('${p.code}')">ดูรายละเอียด ▼</button>
                        <div class="policy-desc-detail" id="desc_${p.code}" style="display:none;">${p.desc.replace(/\n/g, '<br>')}</div>
                        <div class="raw-score-counter" id="rawSum_${p.code}">เหลือ: 25</div>
                    </div>
                </td>
                ${scoreCells}
                <!-- Total Score Hidden as per request -->
                <!-- <td>
                    <span class="weighted-score" id="ws_${p.code}">–</span>
                </td> -->
                <td>
                    <div class="priority-pills" id="priority_${p.code}">
                        ${PRIORITY_OPTIONS.map(opt => `
                            <button type="button" class="priority-pill ${opt.key}"
                                    data-policy="${p.code}" data-priority="${opt.key}"
                                    onclick="setPriority('${p.code}', '${opt.key}', this)">
                                ${opt.label}
                            </button>
                        `).join('')}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function updateScoringHeaders() {
    const headerRow = document.getElementById('scoringHeader');
    headerRow.innerHTML = `
        <th>นโยบาย (Policy)</th>
        ${CRITERIA.map(c => `
            <th class="criteria-header">
                ${c.code}
                <span class="th-weight">${c.shortName}</span>
            </th>
        `).join('')}
        <!-- <th>คะแนนรวม</th> -->
        <th>ลำดับระยะเวลา (Timeframe)</th>
    `;
}

function onScoreChange(policyCode, criteriaCode, criteriaIndex, inputEl) {
    const key = `${policyCode}_${criteriaCode}`;
    let val = parseInt(inputEl.value);

    inputEl.classList.remove('error', 'filled');

    if (inputEl.value === '') {
        delete scores[key];
        updateRawScoreCounter(policyCode); // Update counter when cleared
    } else if (isNaN(val) || val < 1 || val > 5) {
        inputEl.classList.add('error');
        showToast('คะแนนต้องอยู่ระหว่าง 1-5', 'error');
        inputEl.value = scores[key] || '';
        return;
    } else {
        // Validation: Sum <= 30
        const currentScore = scores[key] || 0;
        const totalRaw = getPolicyRawSum(policyCode);
        const newTotal = totalRaw - currentScore + val;

        if (newTotal > 25) {
            inputEl.classList.add('error');
            showToast(`คะแนนรวมเกิน 25 (เหลือ: ${25 - (totalRaw - currentScore)})`, 'error');
            inputEl.value = currentScore || ''; // Revert
            return;
        }

        scores[key] = val;
        inputEl.classList.add('filled');
        updateRawScoreCounter(policyCode);
    }

    recalcScore(policyCode);
    updateRadarChart(policyCode);
    updateComparisonChart();
    updateTimeline();
}

function recalcScore(policyCode) {
    let weightedSum = 0;
    let hasAnyScore = false;
    // let allFilled = true; // Not strictly needed for display loop

    CRITERIA.forEach((c, i) => {
        const key = `${policyCode}_${c.code}`;
        if (scores[key] !== undefined) {
            weightedSum += scores[key] * currentWeights[i];
            hasAnyScore = true;
        }
    });

    const el = document.getElementById(`ws_${policyCode}`);
    if (el) {
        if (!hasAnyScore) {
            el.textContent = '–';
            el.className = 'weighted-score';
            return;
        }

        // Weighted sum (Input 1-5 * Weight) -> Max 5
        const finalScore = weightedSum;
        const rounded = Math.round(finalScore * 100) / 100;
        el.textContent = rounded.toFixed(2);

        el.className = 'weighted-score filled';
        if (finalScore >= 3.5) el.classList.add('high');
        else if (finalScore >= 2) el.classList.add('medium');
        else el.classList.add('low');
    }
}



function getPolicyRawSum(policyCode) {
    let sum = 0;
    CRITERIA.forEach(c => {
        const key = `${policyCode}_${c.code}`;
        if (scores[key] !== undefined) sum += scores[key];
    });
    return sum;
}

function updateRawScoreCounter(policyCode) {
    const el = document.getElementById(`rawSum_${policyCode}`);
    if (!el) return;
    const sum = getPolicyRawSum(policyCode);
    const remaining = 25 - sum;
    el.textContent = `เหลือ: ${remaining}`;
    el.className = `raw-score-counter ${remaining < 2 ? 'low' : ''}`;
    el.style.color = remaining < 0 ? '#ef4444' : (remaining < 4 ? '#f59e0b' : 'var(--text-secondary)');
}

function recalcAllScores() {
    POLICIES.forEach(p => {
        recalcScore(p.code);
        updateRadarChart(p.code);
    });
    updateComparisonChart();
}

// ---------- RADAR CHARTS ----------
function initRadarCharts() {
    const grid = document.getElementById('radarGrid');
    grid.innerHTML = POLICIES.map((p, i) => `
        <div class="radar-card" id="radarCard_${p.code}">
            <div class="radar-card-header">
                <span class="radar-card-title">${p.code}: ${p.name}</span>
            </div>
            <div class="radar-card-subtitle">${renderAsiBadges(p.asiType)} ${p.nameEn}</div>
            <canvas id="radarCanvas_${p.code}"></canvas>
        </div>
    `).join('');

    POLICIES.forEach((p, i) => {
        const ctx = document.getElementById(`radarCanvas_${p.code}`).getContext('2d');
        const color = POLICY_CHART_COLORS[i % POLICY_CHART_COLORS.length];

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
                        max: 5,
                        ticks: {
                            stepSize: 1,
                            font: { size: 10 },
                            backdropColor: 'transparent',
                            color: '#94a3b8',
                        },
                        grid: { color: 'rgba(99, 102, 241, 0.08)' },
                        angleLines: { color: 'rgba(99, 102, 241, 0.1)' },
                        pointLabels: {
                            font: {
                                size: 12,
                                weight: '600',
                                family: "'Noto Sans Thai', 'Inter', sans-serif",
                            },
                            color: '#475569',
                        },
                    }
                },
                plugins: {
                    legend: { display: false },
                    datalabels: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.label}: ${ctx.raw} คะแนน`
                        }
                    }
                },
                animation: { duration: 400, easing: 'easeOutQuart' },
            }
        });
    });
}

function updateRadarChart(policyCode) {
    const chart = radarCharts[policyCode];
    if (!chart) return;
    chart.data.datasets[0].data = CRITERIA.map(c => {
        const key = `${policyCode}_${c.code}`;
        return scores[key] !== undefined ? scores[key] : 0;
    });
    chart.update();
}

// ---------- COMPARISON CHART (Stacked by Criteria) ----------
// Custom plugin to draw total score at end of each stacked bar
const totalLabelPlugin = {
    id: 'totalLabelPlugin',
    afterDatasetsDraw(chart) {
        const { ctx, scales } = chart;
        const yScale = scales.y;
        const xScale = scales.x;

        const totals = [];
        const numPolicies = chart.data.labels.length;
        for (let pi = 0; pi < numPolicies; pi++) {
            let sum = 0;
            chart.data.datasets.forEach(ds => {
                sum += (ds.data[pi] || 0);
            });
            totals.push(sum);
        }

        ctx.save();
        ctx.font = "bold 13px 'Inter', sans-serif";
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        totals.forEach((total, i) => {
            if (total <= 0) return;
            const yPos = yScale.getPixelForValue(i);
            const xPos = xScale.getPixelForValue(total);
            ctx.fillText(total.toFixed(2), xPos + 8, yPos);
        });
        ctx.restore();
    }
};

// Custom plugin to draw dashed lines between priority groups
const groupSeparatorPlugin = {
    id: 'groupSeparatorPlugin',
    afterDraw(chart) {
        const separators = chart._prioritySeparators;
        if (!separators || separators.length === 0) return;

        const { ctx, scales, chartArea } = chart;
        const yScale = scales.y;

        ctx.save();
        ctx.setLineDash([6, 4]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#94a3b8';

        separators.forEach(({ afterIndex, label, color }) => {
            // Draw line between afterIndex and afterIndex+1
            const y1 = yScale.getPixelForValue(afterIndex);
            const y2 = yScale.getPixelForValue(afterIndex + 1);
            const yMid = (y1 + y2) / 2;

            ctx.beginPath();
            ctx.moveTo(chartArea.left, yMid);
            ctx.lineTo(chartArea.right, yMid);
            ctx.stroke();

            // Draw group label on the left
            ctx.setLineDash([]);
            ctx.font = "bold 11px 'Noto Sans Thai', 'Inter', sans-serif";
            ctx.fillStyle = color;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, chartArea.left - 8, yMid);
            ctx.setLineDash([6, 4]);
        });

        ctx.restore();
    }
};

function initComparisonChart() {
    return;
}

// function updateComparisonChart() { Disabled }
function updateComparisonChart() {
    return;
}



// ---------- SUBMIT ----------
async function submitForm() {
    const expertName = document.getElementById('expertName').value.trim();
    const expertOrg = document.getElementById('expertOrg').value.trim();
    const expertDate = document.getElementById('expertDate').value;

    if (!expertName) {
        showToast('กรุณากรอกชื่อผู้เชี่ยวชาญ', 'error');
        document.getElementById('expertName').focus();
        return;
    }

    const weightTotal = currentWeights.reduce((a, b) => a + b, 0);
    if (Math.abs(weightTotal - 1.0) > 0.01) {
        showToast('ผลรวมน้ำหนักต้องเท่ากับ 1.000', 'error');
        return;
    }

    const filledScores = Object.keys(scores).length;
    if (filledScores === 0) {
        showToast('กรุณากรอกคะแนนอย่างน้อย 1 นโยบาย', 'error');
        return;
    }

    if (!SCRIPT_URL) {
        SCRIPT_URL = DEFAULT_SCRIPT_URL;
    }

    // Validation: Ensure all filled policies have a priority selected
    for (const p of POLICIES) {
        const hasScores = CRITERIA.some(c => scores[`${p.code}_${c.code}`] !== undefined);
        if (hasScores && !priorities[p.code]) {
            showToast(`กรุณาเลือกระยะเวลาสำหรับนโยบาย ${p.code}`, 'error');
            document.getElementById(`row_${p.code}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
    }

    // Build payload
    const payload = {
        timestamp: new Date().toISOString(),
        expertName,
        expertOrg,
        expertDate,
        framework: 'ASI (Avoid-Shift-Improve)',
        weights: {},
        scores: {},
        weightedScores: {},
        policyASI: {},
        policyPriority: {}
    };

    CRITERIA.forEach((c, i) => {
        payload.weights[c.code] = currentWeights[i];
    });

    POLICIES.forEach(p => {
        payload.scores[p.code] = {};
        payload.policyASI[p.code] = p.asiType.join('+');
        payload.policyPriority[p.code] = priorities[p.code] || null;
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

    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.classList.add('loading');

    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

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

    scores = {};
    POLICIES.forEach(p => {
        CRITERIA.forEach(c => {
            const input = document.getElementById(`score_${p.code}_${c.code}`);
            if (input) {
                input.value = '';
                input.classList.remove('filled', 'error');
            }
        });
        updateRawScoreCounter(p.code);
    });

    document.getElementById('expertName').value = '';
    document.getElementById('expertOrg').value = '';
    setDefaultDate();

    recalcAllScores();

    POLICIES.forEach(p => updateRadarChart(p.code));
    updateComparisonChart();

    showToast('ล้างข้อมูลเรียบร้อย', 'info');
}
