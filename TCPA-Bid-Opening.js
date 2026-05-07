/* ============================================
   TCPA Bid Opening – Main JavaScript
   Project: TCPA-2026-JB-001 | 107,000 Jute Sacks
   ============================================ */

// ── Presenter Script Lines (one per slide) ──
const scripts = [
    "<strong>Introduction:</strong> Iakwe everyone. My name is <mark>Clenny Minor</mark>. We are here for the formal bid opening of <mark>TCPA-2026-JB-001</mark>. This session is recorded for transparency under Section 118 of the 2023 Procurement Act.",

    "<strong>The Committee:</strong> Joining me today are our high-level witnesses: <mark>Patrick Langrine (GM)</mark>, <mark>Jonel Marshall (CPO)</mark>, <mark>Lenie Sigman (CFO)</mark>, <mark>Regina Alberttar (Ops)</mark>, and <mark>Mison Levai (HR)</mark>.",

    "<strong>Live Attendees:</strong> Please welcome any additional officials joining the meeting now. We will record their names as they arrive.",

    "<strong>Ground Rules:</strong> As a reminder: <strong>No technical discussions</strong>, <strong>No questions</strong> will be taken live, and <strong>No contact</strong> with staff after this meeting. We will contact you.",

    "<strong>Opening Adachi:</strong> We are opening <mark>Adachi Corporation</mark>. I am requesting the password now. [Click the price box to enter the value]. File decrypted. Statutory form present. Total price is...",

    "<strong>Opening Infinity:</strong> We are now opening <mark>Infinity Supply LLC</mark>. Requesting decryption key. File decrypted. Statutory form present. Total price is...",

    "<strong>Opening AGRIX:</strong> We are opening <mark>AGRIX Asia</mark>. Requesting password. File decrypted. Statutory form present. Total price is...",

    "<strong>Opening Holland:</strong> We are opening <mark>Holland Commodities</mark>. We are using the revised April 24th file. We waive the encryption irregularity from April 20 under Section 118(10). Price is...",

    "<strong>Summary Log:</strong> This is a summary of the prices recorded. Please note these are <mark>preliminary</mark> and subject to full technical evaluation (L2 Weighted Scale) by the committee.",

    "<strong>Conclusion:</strong> This concludes the formal bid opening. Expect a <mark>Notice of Intent to Award</mark> in 10 to 14 days. This meeting is adjourned. Kommol tata."
];

// ── DOM References ──
const slides         = document.querySelectorAll('.slide');
const scriptDisplay  = document.getElementById('scriptDisplay');
const currIdxDisplay = document.getElementById('currIdx');
const prevBtn        = document.getElementById('prevBtn');
const nextBtn        = document.getElementById('nextBtn');
let index = 0;

// ── Slide Navigation ──
function update() {
    slides.forEach((s, i) => s.classList.toggle('active', i === index));
    scriptDisplay.innerHTML = scripts[index] || "End of presentation.";
    currIdxDisplay.innerText = index + 1;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === slides.length - 1;
}

prevBtn.addEventListener('click', () => { if (index > 0) { index--; update(); } });
nextBtn.addEventListener('click', () => { if (index < slides.length - 1) { index++; update(); } });

// ── PDF Unlock Map ──
const pdfUnlockMap = {
    adachi:   { file: "TCPA-2026-JB-001-ADACHI-0421.pdf",   name: "Adachi Corporation",  status: "DECRYPTED LIVE", password: "ADACHI2026"   },
    infinity: { file: "TCPA-2026-JB-001-INFINITY-0422.pdf",  name: "Infinity Supply LLC",  status: "DECRYPTED LIVE", password: "INFINITY2026" },
    agrix:    { file: "TCPA-2026-JB-001-AGRIX-0423.pdf",     name: "AGRIX Asia",           status: "DECRYPTED LIVE", password: "AGRIX2026"    },
    holland:  { file: "TCPA-2026-JB-001-HOLLAND-0424.pdf",   name: "Holland Commodities",  status: "DECRYPTED LIVE", password: "HOLLAND2026"  }
};

// ── Apply PDF unlock to the DOM (shared by unlock + restore) ──
function applyPdfUnlock(key) {
    const record = pdfUnlockMap[key];
    if (!record) return;

    const panel = document.querySelector(`[data-unlock="${key}"]`);
    if (!panel) return;

    const unlockBtn = panel.querySelector('.unlock-btn');
    if (unlockBtn) unlockBtn.style.display = 'none';

    const link = panel.querySelector('.pdf-link');
    if (link) {
        link.href = record.file;
        link.style.display = 'inline-flex';
    }

    const status = panel.closest('.slide').querySelector('.status-note');
    if (status) {
        status.innerHTML = `<i class="fa-solid fa-lock-open"></i> STATUS: ${record.status}`;
    }
}

// ── Unlock PDF Bid Packet (persists to localStorage) ──
function unlockPdf(key) {
    const record = pdfUnlockMap[key];
    if (!record) return;

    const password = prompt(`Enter password for ${record.name} bid packet`);
    if (password === null) return;
    if (!password.trim()) return alert("Password is required to unlock the bid packet.");
    if (password !== record.password) return alert("Incorrect password. Access denied.");

    applyPdfUnlock(key);

    // Save unlock state permanently
    const unlocked = JSON.parse(localStorage.getItem('tcpa_unlocked_pdfs') || '[]');
    if (!unlocked.includes(key)) {
        unlocked.push(key);
        localStorage.setItem('tcpa_unlocked_pdfs', JSON.stringify(unlocked));
    }
}

// ── Restore unlocked PDFs from localStorage on page load ──
function restoreUnlockedPdfs() {
    const unlocked = JSON.parse(localStorage.getItem('tcpa_unlocked_pdfs') || '[]');
    unlocked.forEach(key => applyPdfUnlock(key));
}

// ── Lock Price (persists to localStorage) ──
function lockPrice(button) {
    const container = button.closest('.price-container') || button.closest('tr');
    const input = container.querySelector('.price-input') || container.querySelector('.summary-input');
    const bidder = input.dataset.bidder;
    const value = input.value;

    input.disabled = true;
    button.remove();

    // Save to localStorage so it survives browser restarts
    if (bidder) {
        const locked = JSON.parse(localStorage.getItem('tcpa_locked_prices') || '{}');
        locked[bidder] = value;
        localStorage.setItem('tcpa_locked_prices', JSON.stringify(locked));
    }
}

// ── Restore locked prices from localStorage on page load ──
function restoreLockedPrices() {
    const locked = JSON.parse(localStorage.getItem('tcpa_locked_prices') || '{}');

    for (const [bidder, value] of Object.entries(locked)) {
        // Restore on bidder slide (price-input)
        const priceInput = document.querySelector(`.price-input[data-bidder="${bidder}"]`);
        if (priceInput) {
            priceInput.value = value;
            priceInput.disabled = true;
            const lockBtn = priceInput.closest('.price-container')?.querySelector('.lock-btn');
            if (lockBtn) lockBtn.remove();
        }

        // Restore on summary table (summary-input)
        const summaryInput = document.querySelector(`.summary-input[data-bidder="${bidder}"]`);
        if (summaryInput) {
            summaryInput.value = value;
            summaryInput.disabled = true;
            const lockBtn = summaryInput.closest('tr')?.querySelector('.lock-btn');
            if (lockBtn) lockBtn.remove();
        }
    }
}

// ── Sync bidder-slide prices → summary table ──
const priceInputs = document.querySelectorAll('.price-input');
priceInputs.forEach(input => {
    input.addEventListener('input', () => {
        const bidder = input.dataset.bidder;
        const summaryInput = document.querySelector(`.summary-input[data-bidder="${bidder}"]`);
        if (summaryInput) {
            summaryInput.value = input.value;
        }
    });
});

// ── Keyboard Navigation (skip when typing in inputs) ──
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { nextBtn.click(); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { prevBtn.click(); }
});

// ── Init ──
restoreLockedPrices();
restoreUnlockedPdfs();
update();
