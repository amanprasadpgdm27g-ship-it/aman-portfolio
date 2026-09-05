/**
 * Interactive Cryptographic Blockchain Simulation
 * Built for Aman Prasad Laheri Portfolio
 * Demonstrates hash-linked, tamper-detectable ledger technology
 */

// Native Web Crypto SHA-256 helper
async function calculateSHA256(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = '';
    this.isTampered = false;
  }

  async computeHash() {
    const raw = `${this.index}${this.previousHash}${this.timestamp}${this.data}${this.nonce}`;
    return await calculateSHA256(raw);
  }

  async mine(difficulty = 2, onProgress) {
    const target = '0'.repeat(difficulty);
    this.nonce = 0;
    while (true) {
      this.hash = await this.computeHash();
      if (this.hash.startsWith(target)) {
        break;
      }
      this.nonce++;
      if (this.nonce % 100 === 0 && onProgress) {
        onProgress(this.nonce);
      }
    }
    this.isTampered = false;
    return this.hash;
  }
}

class BlockchainSimulator {
  constructor(containerId, statusIndicatorId) {
    this.container = document.getElementById(containerId);
    this.statusIndicator = document.getElementById(statusIndicatorId);
    this.difficulty = 2; // Fast proof-of-work demonstration
    this.chain = [];
  }

  async init() {
    this.chain = [];
    // Genesis Block
    const genesis = new Block(0, '01/01/2026, 09:00:00', 'Genesis Block: Aman Ledger Initialized', '0000000000000000000000000000000000000000000000000000000000000000');
    await genesis.mine(this.difficulty);
    this.chain.push(genesis);

    // Block 1: Times of India Audit
    const b1 = new Block(1, '15/04/2026, 11:30:15', 'Tx: Audit MAS -> TOI Ad Revenue Cleared (₹ 45,00,000)', genesis.hash);
    await b1.mine(this.difficulty);
    this.chain.push(b1);

    // Block 2: Lending App Prototype Disbursal
    const b2 = new Block(2, '22/05/2026, 16:45:10', 'Tx: Retail Lending Core -> Disbursed to Borrower #GLIM-902 (₹ 2,50,000)', b1.hash);
    await b2.mine(this.difficulty);
    this.chain.push(b2);

    this.render();
  }

  async addBlock(customData) {
    const prevBlock = this.chain[this.chain.length - 1];
    const newIndex = this.chain.length;
    const now = new Date().toLocaleString('en-IN');
    const newBlock = new Block(newIndex, now, customData || `Tx: Settlement Batch #${newIndex} (₹ ${(Math.random() * 50000 + 10000).toFixed(0)})`, prevBlock.hash);
    
    await newBlock.mine(this.difficulty);
    this.chain.push(newBlock);
    await this.validateAndRender();
  }

  async handleDataEdit(index, newData) {
    if (this.chain[index]) {
      this.chain[index].data = newData;
      // Recompute raw hash without mining proof of work
      this.chain[index].hash = await this.chain[index].computeHash();
      await this.validateAndRender();
    }
  }

  async mineSingleBlock(index, btnElement) {
    if (!this.chain[index]) return;
    const block = this.chain[index];
    const originalText = btnElement ? btnElement.innerHTML : '';
    if (btnElement) {
      btnElement.innerHTML = `⏳ Mining...`;
      btnElement.disabled = true;
    }

    // Ensure previous hash aligns with previous block
    if (index > 0) {
      block.previousHash = this.chain[index - 1].hash;
    }

    await block.mine(this.difficulty);

    if (btnElement) {
      btnElement.innerHTML = `✅ Mined!`;
      setTimeout(() => {
        btnElement.innerHTML = originalText;
        btnElement.disabled = false;
      }, 1200);
    }

    await this.validateAndRender();
  }

  async validateChain() {
    let isValid = true;
    const target = '0'.repeat(this.difficulty);

    for (let i = 0; i < this.chain.length; i++) {
      const current = this.chain[i];
      const recalculated = await current.computeHash();

      // Check if hash matches data
      const hashMatches = (current.hash === recalculated);
      // Check proof of work
      const powValid = current.hash.startsWith(target);
      // Check chain link
      let prevValid = true;
      if (i > 0) {
        prevValid = (current.previousHash === this.chain[i - 1].hash);
      }

      if (!hashMatches || !powValid || !prevValid) {
        current.isTampered = true;
        isValid = false;
      } else {
        current.isTampered = false;
      }
    }

    return isValid;
  }

  async validateAndRender() {
    const isValid = await this.validateChain();
    this.render(isValid);
  }

  render(isValid = true) {
    if (!this.container) return;

    // Update Status Indicator
    if (this.statusIndicator) {
      if (isValid) {
        this.statusIndicator.innerHTML = `
          <span class="status-dot"></span>
          <span style="color: var(--accent-emerald);">Chain Valid & Cryptographically Secure (PoW Active)</span>
        `;
      } else {
        this.statusIndicator.innerHTML = `
          <span class="status-dot tampered"></span>
          <span style="color: var(--accent-rose);">Tamper Detected! Hash Linkage Broken Downstream</span>
        `;
      }
    }

    // Render Blocks
    this.container.innerHTML = '';
    this.chain.forEach((block, idx) => {
      const card = document.createElement('div');
      card.className = `blockchain-block-card ${block.isTampered ? 'tampered' : 'mined'}`;
      
      card.innerHTML = `
        <div class="block-header">
          <span class="block-num-title">Block #${block.index}</span>
          <span style="font-size: 0.76rem; font-weight: 700; color: ${block.isTampered ? 'var(--accent-rose)' : 'var(--accent-emerald)'};">
            ${block.isTampered ? '⚠️ TAMPERED' : '✓ VERIFIED'}
          </span>
        </div>

        <div class="block-field-group">
          <span class="block-field-label">Timestamp</span>
          <span style="font-size: 0.8rem; color: var(--text-secondary);">${block.timestamp}</span>
        </div>

        <div class="block-field-group">
          <span class="block-field-label">Transaction Data (Editable to test tampering)</span>
          <textarea class="block-data-input" data-index="${block.index}" title="Edit this text to simulate tampering">${block.data}</textarea>
        </div>

        <div class="block-field-group">
          <span class="block-field-label">Previous Hash</span>
          <span class="block-hash-value" title="${block.previousHash}">${block.previousHash.substring(0, 16)}...</span>
        </div>

        <div class="block-field-group">
          <span class="block-field-label">Current Block Hash (SHA-256)</span>
          <span class="block-hash-value" style="color: ${block.isTampered ? 'var(--accent-rose)' : 'var(--text-accent)'};" title="${block.hash}">
            ${block.hash.substring(0, 16)}...
          </span>
        </div>

        <div class="block-field-group" style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
          <span class="block-field-label">Nonce (PoW)</span>
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; font-weight: 700; color: var(--text-primary);">${block.nonce}</span>
        </div>

        <button class="btn-mine-block" data-mine-index="${block.index}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
          ${block.isTampered ? 'Re-Mine Block' : 'Mine Block'}
        </button>
      `;

      // Event listeners
      const textarea = card.querySelector('textarea');
      textarea.addEventListener('input', (e) => {
        this.handleDataEdit(block.index, e.target.value);
      });

      const mineBtn = card.querySelector('button[data-mine-index]');
      mineBtn.addEventListener('click', () => {
        this.mineSingleBlock(block.index, mineBtn);
      });

      this.container.appendChild(card);
    });
  }
}

// Export for application consumption
window.BlockchainSimulator = BlockchainSimulator;
