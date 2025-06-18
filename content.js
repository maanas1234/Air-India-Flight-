console.log('Flight Filter Extension: Universal DOM Removal Mode');

class UniversalFlightFilter {
  constructor() {
    this.airlineKeywords = [
      'air india', 'airindia', 'air india express', 
      'air india regional', 'alliance air', 'vistara'
    ];
    
    this.aircraftKeywords = [
      'boeing 787', 'b787', '787', 'boeing787', 'b-787',
      '787-800', '787-900', '787 max', '787max','Dreamliner'
    ];
    
    this.processedElements = new WeakSet();
    this.init();
  }

  init() {
    console.log('Universal Flight Filter: Starting complete DOM removal');
    
    // Continuous scanning for all websites
    setInterval(() => this.scanAndRemoveFlights(), 2000);
    
    // Enhanced mutation observer for dynamic content
    this.setupUniversalMutationObserver();
    
    // Scan on page interactions
    ['click', 'scroll', 'keyup'].forEach(event => {
      document.addEventListener(event, () => {
        setTimeout(() => this.scanAndRemoveFlights(), 800);
      });
    });
  }

  scanAndRemoveFlights() {
    // Universal selectors that work across most flight booking sites
    const universalSelectors = [
      // Generic flight containers
      '[class*="flight"]', '[id*="flight"]',
      '[class*="result"]', '[id*="result"]',
      '[class*="card"]', '[class*="item"]',
      '[class*="listing"]', '[class*="offer"]',
      
      // Common list structures
      '[role="listitem"]', 'li', 'article',
      
      // Specific flight booking patterns
      '[data-testid*="flight"]', '[data-test-id*="flight"]',
      '.flight-card', '.trip-card', '.result-card',
      '.search-result', '.flight-option', '.flight-item'
    ];

    universalSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (!this.processedElements.has(element)) {
            this.processElement(element);
            this.processedElements.add(element);
          }
        });
      } catch (e) {
        // Ignore invalid selectors
      }
    });
  }

  processElement(element) {
    // Skip if element is too small or too large (likely not a flight result)
    const rect = element.getBoundingClientRect();
    if (rect.height < 30 || rect.height > 800 || rect.width < 200) {
      return;
    }

    const textContent = this.extractAllText(element);
    
    // Check for flight-specific indicators
    const hasFlightIndicators = this.hasFlightContent(textContent);
    if (!hasFlightIndicators) return;

    // Check for Air India or Boeing 737
    const hasAirIndia = this.containsKeywords(textContent, this.airlineKeywords);
    const hasBoeing737 = this.containsKeywords(textContent, this.aircraftKeywords);

    if (hasAirIndia || hasBoeing737) {
      this.completelyRemoveElement(element, hasAirIndia ? 'Air India' : 'Boeing 737');
    }
  }

  extractAllText(element) {
    // Extract text from element and all attributes
    let text = element.textContent?.toLowerCase() || '';
    text += ' ' + (element.innerHTML?.toLowerCase() || '');
    
    // Include common attributes that might contain airline info
    ['title', 'alt', 'aria-label', 'data-airline', 'data-carrier'].forEach(attr => {
      const attrValue = element.getAttribute(attr);
      if (attrValue) text += ' ' + attrValue.toLowerCase();
    });
    
    return text;
  }

  hasFlightContent(text) {
    const flightIndicators = [
      '₹', '$', '€', '£', // Currency symbols
      'hr', 'min', 'hours', 'minutes', // Duration
      'stop', 'nonstop', 'direct', 'layover', // Flight type
      'departure', 'arrival', 'depart', 'arrive', // Times
      'economy', 'business', 'first', 'premium', // Class
      'kg', 'baggage', 'checked', // Baggage
      'book', 'select', 'choose' // Actions
    ];
    
    return flightIndicators.some(indicator => text.includes(indicator));
  }

  containsKeywords(text, keywords) {
    return keywords.some(keyword => {
      // Use word boundary matching for precise detection
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(text);
    });
  }

  completelyRemoveElement(element, reason) {
    // Find the appropriate container to remove
    let targetElement = this.findFlightContainer(element);
    
    if (targetElement && targetElement !== document.body) {
      // Completely remove from DOM - no CSS hiding
      targetElement.remove();
      console.log(`Universal Filter: Completely removed ${reason} flight from DOM`);
    }
  }

  findFlightContainer(element) {
    let current = element;
    let attempts = 0;
    
    while (current && current !== document.body && attempts < 8) {
      const classList = current.className?.toLowerCase() || '';
      const tagName = current.tagName?.toLowerCase() || '';
      
      // Look for flight container patterns
      const isFlightContainer = 
        classList.includes('flight') || classList.includes('result') ||
        classList.includes('card') || classList.includes('item') ||
        classList.includes('listing') || tagName === 'li' ||
        current.getAttribute('role') === 'listitem';
      
      if (isFlightContainer) {
        return current;
      }
      
      current = current.parentElement;
      attempts++;
    }
    
    return element;
  }

  setupUniversalMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      let shouldScan = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              shouldScan = true;
            }
          });
        }
      });
      
      if (shouldScan) {
        setTimeout(() => this.scanAndRemoveFlights(), 500);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Initialize immediately and on all page events
new UniversalFlightFilter();
document.addEventListener('DOMContentLoaded', () => new UniversalFlightFilter());
window.addEventListener('load', () => new UniversalFlightFilter());
