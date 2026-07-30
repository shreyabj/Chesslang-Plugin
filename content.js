// TrainerDB Enhanced Experience - Content Script
// Fixes bugs, adds features, and improves UX

class TrainerDBEnhancer {
  constructor() {
    this.trainers = [];
    this.stats = { brokenLinks: 0, fixedButtons: 0 };
    this.init();
  }

  init() {
    console.log('🚀 TrainerDB Enhanced Experience activated');
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.enhance());
    } else {
      this.enhance();
    }
    
    // Monitor for dynamic content
    this.observeChanges();
  }

  enhance() {
    setTimeout(() => {
      this.fixNavigationIssues();
      this.fixBrokenLinks();
      this.fixProfileButtons();
      this.addInstagramLink();
      this.fixPostJobButton();
      this.addCompareButtons();
      this.updateStats();
    }, 1000);
  }

  // FIX #1 & #2: Login and navigation issues
  fixNavigationIssues() {
    const currentUrl = window.location.href;
    
    // Fix: If user lands on signup after login, redirect to home
    if (currentUrl.includes('/auth/register') && document.referrer.includes('/auth/login')) {
      console.log('🔧 Fixing login redirect issue');
      window.location.href = 'https://trainerdb.com/';
      this.showNotification('Redirecting to home...', 'info');
      return;
    }
    
    // Fix: Home button redirecting to signup
    const homeLinks = document.querySelectorAll('a[href="/"], a[href="https://trainerdb.com/"]');
    homeLinks.forEach(link => {
      const originalHref = link.href;
      
      // If home link is mistakenly pointing to register
      if (link.href.includes('/register') || link.href.includes('/auth/register')) {
        link.href = 'https://trainerdb.com/';
        console.log('🔧 Fixed home button redirect');
      }
      
      // Prevent default if it would cause an error
      link.addEventListener('click', (e) => {
        if (link.href === window.location.href) {
          e.preventDefault();
          window.location.reload();
        }
      });
    });
  }

  // FEATURE: Validate footer links (informational only)
  fixBrokenLinks() {
    const footer = document.querySelector('footer');
    if (!footer) return;
    
    const links = footer.querySelectorAll('a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      
      // Detect potentially broken links
      if (!href || href === '#' || href === '' || href === 'javascript:void(0)') {
        this.stats.brokenLinks++;
        
        // Add subtle indicator (not blocking, just informative)
        link.style.opacity = '0.7';
        link.title = 'ℹ️ Page under development';
        
        console.log(`ℹ️ Link under development: ${link.textContent}`);
      }
    });
  }

  // FIX #4 & #7: Profile buttons (Follow, Message, Share)
  fixProfileButtons() {
    const buttonSelectors = [
      'button',
      'a.btn',
      '[role="button"]',
      'a[href="#"]'
    ];
    
    buttonSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(button => {
        const text = button.textContent.trim().toLowerCase();
        
        // Identify buttons that should have functionality
        if (text.includes('follow') || text.includes('message') || text.includes('share')) {
          const href = button.getAttribute('href');
          const hasAction = button.onclick || (href && href !== '#');
          
          if (!hasAction) {
            this.stats.fixedButtons++;
            
            // Add functionality
            button.style.cursor = 'pointer';
            button.addEventListener('click', (e) => {
              e.preventDefault();
              this.handleButtonAction(text, button);
            });
            
            console.log(`🔧 Fixed button: ${text}`);
          }
        }
      });
    });
  }

  handleButtonAction(action, button) {
    if (action.includes('follow')) {
      this.showNotification('Follow feature coming soon! Bookmark this trainer instead.', 'info');
      // Try to extract trainer name
      const card = button.closest('[class*="card"], [class*="profile"], section, article');
      if (card) {
        const trainer = this.extractTrainerFromElement(card);
        if (trainer.name) {
          this.showNotification(`Want to follow ${trainer.name}? Add them to compare!`, 'success');
        }
      }
    } else if (action.includes('message')) {
      this.showNotification('Please login to send messages', 'info');
      setTimeout(() => {
        window.location.href = 'https://trainerdb.com/auth/login';
      }, 1500);
    } else if (action.includes('share')) {
      // Implement share functionality
      const url = window.location.href;
      const title = document.title;
      
      if (navigator.share) {
        navigator.share({ title, url })
          .catch(() => this.copyToClipboard(url));
      } else {
        this.copyToClipboard(url);
      }
    }
  }

  // FIX #5: Post a Job button
  fixPostJobButton() {
    const postJobButtons = Array.from(document.querySelectorAll('a, button')).filter(el => {
      return el.textContent.toLowerCase().includes('post a job') ||
             el.textContent.toLowerCase().includes('post job');
    });
    
    postJobButtons.forEach(button => {
      const href = button.getAttribute('href');
      
      if (!href || href === '#') {
        button.setAttribute('href', 'https://trainerdb.com/recruiter/post-job');
        button.style.cursor = 'pointer';
        
        button.addEventListener('click', (e) => {
          if (!href || href === '#') {
            e.preventDefault();
            window.location.href = 'https://trainerdb.com/recruiter/post-job';
          }
        });
        
        console.log('🔧 Fixed "Post a Job" button');
        this.stats.fixedButtons++;
      }
    });
  }

  // FIX #6: Add Instagram link
  addInstagramLink() {
    const footer = document.querySelector('footer');
    if (!footer) return;
    
    // Check if Instagram already exists
    const hasInstagram = footer.querySelector('a[href*="instagram.com"]');
    if (hasInstagram) return;
    
    // Find social media section
    const socialLinks = footer.querySelectorAll('a[href*="facebook.com"], a[href*="twitter.com"], a[href*="linkedin.com"]');
    
    if (socialLinks.length > 0) {
      const lastSocial = socialLinks[socialLinks.length - 1];
      const instagramLink = document.createElement('a');
      instagramLink.href = 'https://www.instagram.com/trainerdb/';
      instagramLink.target = '_blank';
      instagramLink.rel = 'noopener noreferrer';
      instagramLink.innerHTML = 'Instagram';
      instagramLink.style.cssText = lastSocial.style.cssText;
      
      // Copy classes from other social links
      instagramLink.className = lastSocial.className;
      
      // Insert after last social link
      lastSocial.parentNode.insertBefore(instagramLink, lastSocial.nextSibling);
      
      console.log('🔧 Added Instagram link to footer');
      this.showNotification('Instagram link added! ✨', 'success');
    }
  }

  // Add Compare Buttons to trainer cards
  addCompareButtons() {
    const trainerCards = this.findTrainerCards();
    
    trainerCards.forEach(card => {
      if (card.querySelector('.tdb-compare-btn')) return; // Already added
      
      const trainer = this.extractTrainerFromElement(card);
      if (!trainer.name) return;
      
      const button = this.createCompareButton(trainer);
      this.insertCompareButton(card, button);
    });
  }

  findTrainerCards() {
    const cards = [];
    
    // Find elements that look like trainer cards
    const candidates = document.querySelectorAll(`
      div[class*="trainer"],
      div[class*="coach"],
      div[class*="card"],
      article,
      [class*="profile"]
    `);
    
    candidates.forEach(el => {
      const text = el.textContent;
      // Check if it contains trainer-like info
      if ((text.includes('ELO') || text.includes('Master') || text.includes('students')) &&
          text.length < 800) {
        cards.push(el);
      }
    });
    
    return cards;
  }

  extractTrainerFromElement(element) {
    const text = element.textContent;
    const trainer = {
      name: '',
      title: '',
      rating: '',
      elo: '',
      students: '',
      timestamp: Date.now()
    };
    
    // Extract name
    const nameEl = element.querySelector('h1, h2, h3, h4, strong, [class*="name"]');
    if (nameEl) {
      trainer.name = nameEl.textContent.trim();
    }
    
    // Extract title
    const titleMatch = text.match(/(FIDE Master|International Master|Grandmaster|WGM|WIM|WFM|FM|IM|GM)/i);
    if (titleMatch) trainer.title = titleMatch[1];
    
    // Extract rating
    const ratingMatch = text.match(/(\d+\.?\d*)\s*\(?\d*\s*reviews?\)?|⭐\s*(\d+\.?\d*)/i);
    if (ratingMatch) trainer.rating = ratingMatch[1] || ratingMatch[2];
    
    // Extract ELO
    const eloMatch = text.match(/(\d{4})\s*ELO/i);
    if (eloMatch) trainer.elo = eloMatch[1];
    
    // Extract students
    const studentsMatch = text.match(/(\d+)\s*students?/i);
    if (studentsMatch) trainer.students = studentsMatch[1];
    
    return trainer;
  }

  createCompareButton(trainer) {
    const button = document.createElement('button');
    button.className = 'tdb-compare-btn';
    button.innerHTML = '<span>➕</span> Compare';
    
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      await this.addTrainerToCompare(trainer, button);
    });
    
    return button;
  }

  async addTrainerToCompare(trainer, button) {
    // Get existing trainers
    const result = await chrome.storage.local.get(['trainers']);
    const trainers = result.trainers || [];
    
    // Check if already added
    const exists = trainers.some(t => t.name === trainer.name);
    if (exists) {
      this.showNotification('Trainer already in comparison', 'info');
      return;
    }
    
    // Add trainer
    trainers.push(trainer);
    await chrome.storage.local.set({ trainers });
    
    // Update button
    button.innerHTML = '<span>✓</span> Added';
    button.style.background = '#27ae60';
    
    this.showNotification(`Added ${trainer.name} to comparison!`, 'success');
    
    // Notify popup
    chrome.runtime.sendMessage({ action: 'trainerAdded' });
    
    setTimeout(() => {
      button.innerHTML = '<span>➕</span> Compare';
      button.style.background = '';
    }, 2000);
  }

  insertCompareButton(card, button) {
    // Try to find a good spot
    const actionArea = card.querySelector('[class*="action"], [class*="button"], .footer, [class*="footer"]');
    
    if (actionArea) {
      actionArea.appendChild(button);
    } else {
      // Create container
      const container = document.createElement('div');
      container.className = 'tdb-button-container';
      container.appendChild(button);
      card.appendChild(container);
    }
  }

  // Utility: Show notification
  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `tdb-notification tdb-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Utility: Copy to clipboard
  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showNotification('Link copied to clipboard!', 'success');
    }).catch(() => {
      this.showNotification('Could not copy link', 'warning');
    });
  }

  // Update stats and notify popup
  async updateStats() {
    await chrome.storage.local.set({ stats: this.stats });
    chrome.runtime.sendMessage({ action: 'statsUpdated' });
  }

  // Observe page changes
  observeChanges() {
    const observer = new MutationObserver(() => {
      clearTimeout(this.changeTimeout);
      this.changeTimeout = setTimeout(() => {
        this.addCompareButtons();
      }, 500);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Initialize enhancer
const enhancer = new TrainerDBEnhancer();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showComparison') {
    showComparisonModal(request.trainers);
  }
});

// Show comparison modal
function showComparisonModal(trainers) {
  const modal = document.createElement('div');
  modal.className = 'tdb-comparison-modal';
  modal.innerHTML = `
    <div class="tdb-modal-content">
      <div class="tdb-modal-header">
        <h2>🎯 Trainer Comparison</h2>
        <button class="tdb-modal-close">✕</button>
      </div>
      <div class="tdb-modal-body">
        ${generateComparisonTable(trainers)}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('show'), 10);
  
  modal.querySelector('.tdb-modal-close').addEventListener('click', () => {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    }
  });
}

function generateComparisonTable(trainers) {
  let table = '<table class="tdb-comparison-table"><thead><tr><th>Field</th>';
  trainers.forEach(t => {
    table += `<th>${t.name}</th>`;
  });
  table += '</tr></thead><tbody>';
  
  const fields = ['title', 'rating', 'elo', 'students'];
  fields.forEach(field => {
    table += `<tr><td class="field-label">${field.toUpperCase()}</td>`;
    trainers.forEach(t => {
      table += `<td>${t[field] || '-'}</td>`;
    });
    table += '</tr>';
  });
  
  table += '</tbody></table>';
  return table;
}
