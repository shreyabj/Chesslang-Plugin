// Popup script for TrainerDB Enhanced Experience
console.log('Popup script loading...');

let trainers = [];

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePopup);
} else {
  initializePopup();
}

function initializePopup() {
  console.log('Initializing popup...');
  
  try {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        const targetTab = document.getElementById(`${tabName}-tab`);
        if (targetTab) targetTab.classList.add('active');
      });
    });

    // Clear all trainers button
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Clear all saved trainers?')) {
          trainers = [];
          saveTrainers();
        }
      });
    }

    // Compare trainers button
    const compareBtn = document.getElementById('compareBtn');
    if (compareBtn) {
      compareBtn.addEventListener('click', handleCompare);
    }

    // Export button listeners
    const exportCSVBtn = document.getElementById('exportCSVBtn');
    const exportCSV = document.getElementById('exportCSV');
    const exportJSON = document.getElementById('exportJSON');
    const exportText = document.getElementById('exportText');

    if (exportCSVBtn) exportCSVBtn.addEventListener('click', exportAsCSV);
    if (exportCSV) exportCSV.addEventListener('click', exportAsCSV);
    if (exportJSON) exportJSON.addEventListener('click', exportAsJSON);
    if (exportText) exportText.addEventListener('click', exportAsText);

    // Clear notes button
    const clearNotesBtn = document.getElementById('clearNotesBtn');
    if (clearNotesBtn) clearNotesBtn.addEventListener('click', clearAllNotes);

    // Refresh summary button
    const refreshSummaryBtn = document.getElementById('refreshSummaryBtn');
    if (refreshSummaryBtn) refreshSummaryBtn.addEventListener('click', () => {
      renderSummary();
      showNotification('Summary refreshed!');
    });

    // Listen for updates from content script
    chrome.runtime.onMessage.addListener((request) => {
      if (request.action === 'trainerAdded') {
        loadTrainers();
      }
    });

    // Initialize
    loadTrainers();
    
    console.log('Popup initialized successfully');
  } catch (error) {
    console.error('Error initializing popup:', error);
  }
}

// Load trainers from storage
async function loadTrainers() {
  try {
    const result = await chrome.storage.local.get(['trainers']);
    trainers = result.trainers || [];
    renderTrainers();
  } catch (error) {
    console.error('Error loading trainers:', error);
  }
}

// Save trainers to storage
async function saveTrainers() {
  try {
    await chrome.storage.local.set({ trainers });
    renderTrainers();
  } catch (error) {
    console.error('Error saving trainers:', error);
  }
}

// Render trainer list
function renderTrainers() {
  const trainerList = document.getElementById('trainerList');
  const emptyState = document.getElementById('emptyState');
  const trainerCount = document.getElementById('trainerCount');
  const compareBtn = document.getElementById('compareBtn');
  const exportCSVBtn = document.getElementById('exportCSVBtn');
  
  if (!trainerList || !emptyState || !trainerCount) {
    console.error('Required DOM elements not found');
    return;
  }
  
  trainerCount.textContent = `${trainers.length} trainer${trainers.length !== 1 ? 's' : ''} saved`;
  
  if (trainers.length === 0) {
    trainerList.style.display = 'none';
    emptyState.classList.add('show');
    if (compareBtn) compareBtn.disabled = true;
    if (exportCSVBtn) exportCSVBtn.disabled = true;
    return;
  }
  
  trainerList.style.display = 'flex';
  emptyState.classList.remove('show');
  if (compareBtn) compareBtn.disabled = false;
  if (exportCSVBtn) exportCSVBtn.disabled = false;
  
  trainerList.innerHTML = trainers.map((trainer, index) => `
    <div class="trainer-card">
      <div class="trainer-header">
        <div>
          <div class="trainer-name">${escapeHtml(trainer.name)}</div>
          <div class="trainer-title">${escapeHtml(trainer.title || 'Chess Coach')}</div>
        </div>
        <button class="btn-remove" data-index="${index}">Remove</button>
      </div>
      <div class="trainer-info">
        ${trainer.elo ? `<span>🎯 ${escapeHtml(trainer.elo)} ELO</span>` : ''}
        ${trainer.rating ? `<span>⭐ ${escapeHtml(trainer.rating)}</span>` : ''}
        ${trainer.students ? `<span>👥 ${escapeHtml(trainer.students)} students</span>` : ''}
      </div>
    </div>
  `).join('');
  
  // Add remove button listeners
  trainerList.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      trainers.splice(index, 1);
      saveTrainers();
    });
  });
  
  // Also render notes
  renderNotes();
  
  // Also render summary
  renderSummary();
}

// Handle compare button click
async function handleCompare() {
  if (trainers.length === 0) return;
  
  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.id) {
      alert('Please open TrainerDB.com in the active tab');
      return;
    }
    
    // Send comparison data to content script
    await chrome.tabs.sendMessage(tab.id, {
      action: 'showComparison',
      trainers
    });
    
    window.close();
  } catch (error) {
    console.error('Error sending comparison:', error);
    alert('Please make sure you are on TrainerDB.com');
  }
}

// Export functions
async function exportAsCSV() {
  if (trainers.length === 0) {
    alert('No trainers to export');
    return;
  }
  
  const headers = ['Name', 'Title', 'Rating', 'ELO', 'Students', 'Notes'];
  const rows = trainers.map(t => [
    t.name || '',
    t.title || '',
    t.rating || '',
    t.elo || '',
    t.students || '',
    t.notes || ''
  ]);
  
  let csv = headers.join(',') + '\n';
  rows.forEach(row => {
    csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
  });
  
  downloadFile(csv, `trainerdb-comparison-${Date.now()}.csv`, 'text/csv');
  showNotification('CSV exported with notes!');
}

async function exportAsJSON() {
  if (trainers.length === 0) {
    alert('No trainers to export');
    return;
  }
  
  const data = {
    exportDate: new Date().toISOString(),
    trainers: trainers
  };
  
  downloadFile(
    JSON.stringify(data, null, 2),
    `trainerdb-comparison-${Date.now()}.json`,
    'application/json'
  );
  showNotification('JSON exported with notes!');
}

async function exportAsText() {
  if (trainers.length === 0) {
    alert('No trainers to export');
    return;
  }
  
  let text = 'TrainerDB Comparison Report\n';
  text += '='.repeat(50) + '\n\n';
  
  trainers.forEach((trainer, i) => {
    text += `${i + 1}. ${trainer.name}\n`;
    if (trainer.title) text += `   Title: ${trainer.title}\n`;
    if (trainer.rating) text += `   Rating: ${trainer.rating}\n`;
    if (trainer.elo) text += `   ELO: ${trainer.elo}\n`;
    if (trainer.students) text += `   Students: ${trainer.students}\n`;
    if (trainer.notes) text += `   Notes: ${trainer.notes}\n`;
    text += '\n';
  });
  
  downloadFile(text, `trainerdb-comparison-${Date.now()}.txt`, 'text/plain');
  showNotification('Text exported with notes!');
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #27ae60;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 13px;
    z-index: 1000;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 2000);
}

// Utility: Escape HTML to prevent XSS
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Render notes tab
function renderNotes() {
  const notesList = document.getElementById('notesList');
  const emptyNotes = document.getElementById('emptyNotes');
  const clearNotesBtn = document.getElementById('clearNotesBtn');
  
  if (!notesList || !emptyNotes) return;
  
  if (trainers.length === 0) {
    notesList.style.display = 'none';
    emptyNotes.classList.add('show');
    if (clearNotesBtn) clearNotesBtn.disabled = true;
    return;
  }
  
  notesList.style.display = 'block';
  emptyNotes.classList.remove('show');
  if (clearNotesBtn) clearNotesBtn.disabled = false;
  
  notesList.innerHTML = trainers.map((trainer, index) => `
    <div class="note-card">
      <div class="note-header">
        <strong>${escapeHtml(trainer.name)}</strong>
        <span class="note-subtitle">${escapeHtml(trainer.title || 'Chess Coach')}</span>
      </div>
      <textarea 
        class="note-textarea" 
        data-index="${index}"
        placeholder="Add your notes about ${escapeHtml(trainer.name)}..."
        rows="3"
      >${escapeHtml(trainer.notes || '')}</textarea>
      <div class="note-info">
        ${trainer.elo ? `<span>🎯 ${escapeHtml(trainer.elo)} ELO</span>` : ''}
        ${trainer.rating ? `<span>⭐ ${escapeHtml(trainer.rating)}</span>` : ''}
      </div>
    </div>
  `).join('');
  
  // Add note textarea listeners
  notesList.querySelectorAll('.note-textarea').forEach(textarea => {
    let timeout;
    textarea.addEventListener('input', (e) => {
      const index = parseInt(e.target.dataset.index);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        trainers[index].notes = e.target.value;
        saveTrainers();
      }, 500);
    });
  });
}

// Clear all notes
function clearAllNotes() {
  if (confirm('Clear all notes? (Trainers will remain saved)')) {
    trainers.forEach(trainer => trainer.notes = '');
    saveTrainers();
  }
}

// Generate smart summary
function generateSmartSummary() {
  if (trainers.length === 0) return null;
  
  const summary = {
    totalTrainers: trainers.length,
    avgRating: 0,
    avgElo: 0,
    totalStudents: 0,
    topRated: null,
    highestElo: null,
    mostExperienced: null,
    insights: []
  };
  
  // Calculate averages
  let ratingCount = 0;
  let eloCount = 0;
  let studentCount = 0;
  
  trainers.forEach(trainer => {
    if (trainer.rating) {
      summary.avgRating += parseFloat(trainer.rating);
      ratingCount++;
    }
    if (trainer.elo) {
      const elo = parseInt(trainer.elo);
      summary.avgElo += elo;
      eloCount++;
      if (!summary.highestElo || elo > parseInt(summary.highestElo.elo)) {
        summary.highestElo = trainer;
      }
    }
    if (trainer.students) {
      const students = parseInt(trainer.students);
      studentCount += students;
      if (!summary.mostExperienced || students > parseInt(summary.mostExperienced.students)) {
        summary.mostExperienced = trainer;
      }
    }
    if (trainer.rating && (!summary.topRated || parseFloat(trainer.rating) > parseFloat(summary.topRated.rating))) {
      summary.topRated = trainer;
    }
  });
  
  if (ratingCount > 0) summary.avgRating = (summary.avgRating / ratingCount).toFixed(1);
  if (eloCount > 0) summary.avgElo = Math.round(summary.avgElo / eloCount);
  summary.totalStudents = studentCount;
  
  // Generate insights
  if (summary.topRated) {
    summary.insights.push(`🌟 Best rated: ${summary.topRated.name} (${summary.topRated.rating}★)`);
  }
  if (summary.highestElo) {
    summary.insights.push(`🎯 Highest ELO: ${summary.highestElo.name} (${summary.highestElo.elo})`);
  }
  if (summary.mostExperienced) {
    summary.insights.push(`👥 Most students: ${summary.mostExperienced.name} (${summary.mostExperienced.students} students)`);
  }
  
  // Title analysis
  const titles = {};
  trainers.forEach(t => {
    if (t.title) {
      titles[t.title] = (titles[t.title] || 0) + 1;
    }
  });
  const mostCommonTitle = Object.keys(titles).reduce((a, b) => titles[a] > titles[b] ? a : b, null);
  if (mostCommonTitle) {
    summary.insights.push(`🏆 Most common title: ${mostCommonTitle}`);
  }
  
  // Notes analysis
  const withNotes = trainers.filter(t => t.notes && t.notes.trim()).length;
  if (withNotes > 0) {
    summary.insights.push(`📝 ${withNotes} trainer${withNotes > 1 ? 's have' : ' has'} your notes`);
  }
  
  return summary;
}

// Render summary tab
function renderSummary() {
  const summaryContent = document.getElementById('summaryContent');
  const emptySummary = document.getElementById('emptySummary');
  
  if (!summaryContent || !emptySummary) return;
  
  if (trainers.length === 0) {
    summaryContent.style.display = 'none';
    emptySummary.classList.add('show');
    return;
  }
  
  const summary = generateSmartSummary();
  if (!summary) return;
  
  summaryContent.style.display = 'block';
  emptySummary.classList.remove('show');
  
  summaryContent.innerHTML = `
    <div class="summary-overview">
      <h3>📊 Quick Overview</h3>
      <div class="summary-stats">
        <div class="summary-stat">
          <span class="stat-number">${summary.totalTrainers}</span>
          <span class="stat-label">Trainers</span>
        </div>
        ${summary.avgRating > 0 ? `
          <div class="summary-stat">
            <span class="stat-number">${summary.avgRating}★</span>
            <span class="stat-label">Avg Rating</span>
          </div>
        ` : ''}
        ${summary.avgElo > 0 ? `
          <div class="summary-stat">
            <span class="stat-number">${summary.avgElo}</span>
            <span class="stat-label">Avg ELO</span>
          </div>
        ` : ''}
        ${summary.totalStudents > 0 ? `
          <div class="summary-stat">
            <span class="stat-number">${summary.totalStudents}</span>
            <span class="stat-label">Total Students</span>
          </div>
        ` : ''}
      </div>
    </div>
    
    <div class="summary-insights">
      <h3>💡 Key Insights</h3>
      ${summary.insights.map(insight => `
        <div class="insight-item">${insight}</div>
      `).join('')}
    </div>
    
    <div class="summary-recommendation">
      <h3>🎯 Quick Recommendation</h3>
      <p>${generateRecommendation(summary)}</p>
    </div>
  `;
}

// Generate recommendation text
function generateRecommendation(summary) {
  if (!summary.topRated && !summary.highestElo) {
    return "Compare the trainers' specializations and availability to make your choice.";
  }
  
  if (summary.topRated && summary.highestElo && summary.topRated.name === summary.highestElo.name) {
    return `<strong>${summary.topRated.name}</strong> stands out with the best rating and highest ELO - a clear winner!`;
  }
  
  if (summary.topRated && summary.highestElo) {
    return `Consider <strong>${summary.topRated.name}</strong> for best reviews or <strong>${summary.highestElo.name}</strong> for highest skill level.`;
  }
  
  if (summary.topRated) {
    return `<strong>${summary.topRated.name}</strong> has the best user ratings - a safe choice.`;
  }
  
  if (summary.highestElo) {
    return `<strong>${summary.highestElo.name}</strong> has the highest ELO rating - technical excellence.`;
  }
  
  return "All trainers have similar profiles. Check your personal notes to decide.";
}
