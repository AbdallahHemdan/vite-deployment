(function () {
  'use strict';

  /**
   * Utility helper functions for Optima SDK
   */

  /**
   * Generate a random UUID v4 format
   * @returns {string} UUID string
   */
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Determine device type based on user agent
   * @returns {string} 'desktop', 'tablet', or 'mobile'
   */
  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * Get the connection type using Network Information API
   * @returns {string} Connection type or 'unknown'
   */
  function getConnectionType() {
    if (!navigator.connection) {
      return 'unknown';
    }
    return navigator.connection.effectiveType || 'unknown';
  }

  /**
   * Web Vitals module for Optima SDK
   */

  /**
   * Set up Core Web Vitals tracking
   * @param {Object} sdk - Reference to the Optima SDK instance
   */
  function setupCoreWebVitals(sdk) {
    try {
      if ('PerformanceObserver' in window) {
        // LCP - Largest Contentful Paint
        setupLCP(sdk);
        
        // FID - First Input Delay
        setupFID(sdk);
        
        // CLS - Cumulative Layout Shift
        setupCLS(sdk);
        
        // INP - Interaction to Next Paint (newer metric)
        setupINP(sdk);
        
        // Add page visibility handler to ensure vitals are sent when page is unloaded/hidden
        setupPageVisibilityHandler(sdk);
        
        // Long tasks monitoring
        setupLongTasksMonitoring(sdk);
      }
    } catch (e) {
      // Error setting up core web vitals
    }
  }

  /**
   * Setup handler for page visibility changes to ensure vitals are sent
   * @param {Object} sdk - Reference to the Optima SDK instance
   */
  function setupPageVisibilityHandler(sdk) {
    // Send final web vitals metrics when page is hidden/unloaded
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'hidden') {
        // Force flush any pending web vitals when page is hidden
        if (sdk.buffer.webVitals.length > 0) {
          // Use sendBeacon to ensure data is sent even during page unload
          sdk._prepareFinalDataAndSend(true);
        }
      }
    });
    
    // Add beforeunload event listener as a fallback
    window.addEventListener('beforeunload', function() {
      if (sdk.buffer.webVitals.length > 0) {
        // Use sendBeacon to ensure data is sent even during page unload
        sdk._prepareFinalDataAndSend(true);
      }
    });
  }

  /**
   * Set up long tasks monitoring
   * @param {Object} sdk - Reference to the Optima SDK instance
   */
  function setupLongTasksMonitoring(sdk) {
    // Skip if PerformanceObserver or longTask is not supported
    if (!window.PerformanceObserver || 
        !window.PerformanceObserver.supportedEntryTypes ||
        !window.PerformanceObserver.supportedEntryTypes.includes('longtask')) {
      return;
    }
    
    let longTasks = [];
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      // Store long tasks
      entries.forEach(entry => {
        longTasks.push({
          startTime: entry.startTime,
          duration: entry.duration,
          attribution: entry.attribution?.length ? {
            name: entry.attribution[0].name,
            containerType: entry.attribution[0].containerType,
            containerName: entry.attribution[0].containerName,
            containerId: entry.attribution[0].containerId,
          } : null,
        });
      });
      
      // Periodically report long tasks
      if (longTasks.length >= 5) {
        sdk.unifiedDataModel.metrics.longTasks = longTasks;
        longTasks = [];
      }
    });
    
    try {
      observer.observe({ type: 'longtask', buffered: true });
    } catch (e) {
      // Error observing long tasks
    }
  }

  /**
   * Set up Largest Contentful Paint tracking
   * @param {Object} sdk - Reference to the Optima SDK instance
   */
  function setupLCP(sdk) {
    let lastLCPValue = 0;
    
    const lcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      window.performance.mark('optima_lcp');
      window.performance.measure('optima_lcp_time', 'navigationStart', 'optima_lcp');
      
      // Only send event if it's a new, larger value
      if (lastEntry.startTime > lastLCPValue) {
        lastLCPValue = lastEntry.startTime;
        
        // Get element details for better LCP tracking
        const elementInfo = lastEntry.element ? {
          tagName: lastEntry.element.tagName,
          id: lastEntry.element.id || null,
          className: lastEntry.element.className || null, 
          size: lastEntry.size,
          // Add more relevant metrics that help identify the LCP element
          dimensions: lastEntry.element.getBoundingClientRect ? {
            width: Math.round(lastEntry.element.getBoundingClientRect().width),
            height: Math.round(lastEntry.element.getBoundingClientRect().height)
          } : null
        } : 'unknown';
        
        // Record LCP with detailed information
        sdk.sendEvent('core_web_vital', {
          name: 'LCP',
          value: lastEntry.startTime,
          element: elementInfo
        });
        
        // Directly update the unified data model
        sdk.unifiedDataModel.web_vitals.LCP = {
          value: lastEntry.startTime,
          timestamp: performance.timeOrigin + lastEntry.startTime,
          element: elementInfo
        };
        
        // Force immediate processing for the initial LCP
        if (entries.length <= 1) {
          // Immediate flag for the first/main LCP only
          setTimeout(() => {
            if (sdk.buffer.webVitals.length > 0) {
              sdk._updateWebVitalsInUnifiedModel();
            }
          }, 1000);
        }
      }
    });
    
    // Set buffered flag to true to include measurements that happened before the observer was created
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  }

  /**
   * Set up First Input Delay tracking
   * @param {Object} sdk - Reference to the Optima SDK instance
   */
  function setupFID(sdk) {
    const fidObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const firstInput = entries[0];
      window.performance.mark('optima_fid');
      
      // Record more details about the input
      const inputDetails = {
        type: firstInput.name,
        targetElement: firstInput.target ? {
          tagName: firstInput.target.tagName,
          id: firstInput.target.id || null,
          className: firstInput.target.className || null
        } : null,
        timing: {
          processingStart: firstInput.processingStart,
          processingEnd: firstInput.processingEnd,
          startTime: firstInput.startTime
        }
      };
      
      // Calculate the actual FID value
      const fidValue = firstInput.processingStart - firstInput.startTime;
      
      // Record FID with immediate flag and additional details
      sdk.sendEvent('core_web_vital', {
        name: 'FID',
        value: fidValue,
        inputType: firstInput.name,
        details: inputDetails
      }, { immediate: true });
      
      // Update unified data model directly
      sdk.unifiedDataModel.web_vitals.FID = {
        value: fidValue,
        timestamp: performance.timeOrigin + firstInput.startTime,
        inputType: firstInput.name,
        details: inputDetails
      };
    });
    
    fidObserver.observe({ type: 'first-input', buffered: true });
  }

  /**
   * Set up Cumulative Layout Shift tracking
   * @param {Object} sdk - Reference to the Optima SDK instance
   */
  function setupCLS(sdk) {
    let clsValue = 0;
    let clsEntries = [];
    let sessionEntries = [];
    let lastCLSReport = 0;
    let sessionStartTime = performance.now();
    let sessionClsValue = 0;
    
    // Define session boundaries based on visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        // End the session and report final CLS
        if (sessionClsValue > 0) {
          // Log the final CLS value when the page is hidden
          sdk.unifiedDataModel.web_vitals.CLS = {
            value: sessionClsValue,
            timestamp: Date.now(),
            entries: sessionEntries.length
          };
        }
      } else if (document.visibilityState === 'visible') {
        // Reset session values on becoming visible if it's been more than 1 second
        if (performance.now() - sessionStartTime > 1000) {
          sessionStartTime = performance.now();
          sessionClsValue = 0;
          sessionEntries = [];
        }
      }
    });
    
    const clsObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      
      entries.forEach(entry => {
        // Only count layout shifts without recent user input
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          clsEntries.push(entry);
          
          // Also add to session CLS
          sessionClsValue += entry.value;
          sessionEntries.push({
            value: entry.value,
            startTime: entry.startTime
          });
        }
      });
      
      const now = Date.now();
      
      // Report CLS value with a lower frequency - avoid excessive reports
      // Only report if enough time has passed or value changed significantly
      if ((now - lastCLSReport > 5000 || clsEntries.length % 10 === 0) && clsEntries.length > 0) {
        lastCLSReport = now;
        
        // Send the latest CLS value
        sdk.sendEvent('core_web_vital', {
          name: 'CLS',
          value: clsValue,
          entries: clsEntries.length,
          sessionValue: sessionClsValue, // Track per-session CLS
          sessionEntries: sessionEntries.length
        });
        
        // Update the unified data model
        sdk.unifiedDataModel.web_vitals.CLS = {
          value: clsValue,
          timestamp: now,
          entries: clsEntries.length,
          sessionValue: sessionClsValue,
          sessionEntries: sessionEntries.length
        };
        
        // Ensure a periodic flush for CLS metrics
        if (clsEntries.length % 30 === 0) {
          setTimeout(() => {
            if (sdk.buffer.webVitals.length > 0) {
              sdk._updateWebVitalsInUnifiedModel();
            }
          }, 1000);
        }
      }
    });
    
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  }

  /**
   * Set up Interaction to Next Paint (INP) tracking
   * @param {Object} sdk - Reference to the Optima SDK instance
   */
  function setupINP(sdk) {
    // Skip if PerformanceObserver or event-timing is not supported
    if (!window.PerformanceObserver || 
        !window.PerformanceObserver.supportedEntryTypes ||
        !window.PerformanceObserver.supportedEntryTypes.includes('event')) {
      return;
    }
    let maxDelay = 0;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach(entry => {
        // Skip non-user interactions
        if (!['pointerdown', 'keydown', 'click', 'mousedown', 'touchstart'].includes(entry.name)) {
          return;
        }
        
        // Calculate interaction duration
        const duration = entry.processingEnd - entry.startTime;
        
        // Store interaction data
        const interaction = {
          name: entry.name,
          startTime: entry.startTime,
          processingStart: entry.processingStart,
          processingEnd: entry.processingEnd,
          duration: duration,
          renderTime: entry.renderTime || null,
          interactionId: entry.interactionId || null,
          targetElement: entry.target ? {
            tagName: entry.target.tagName,
            id: entry.target.id || null,
            className: entry.target.className || null
          } : null
        };
        
        // Track worst interaction (highest delay)
        if (duration > maxDelay) {
          maxDelay = duration;
          
          // Send the INP update
          sdk.sendEvent('core_web_vital', {
            name: 'INP',
            value: duration,
            interaction: interaction
          });
          
          // Update unified data model
          sdk.unifiedDataModel.web_vitals.INP = {
            value: duration,
            timestamp: performance.timeOrigin + entry.startTime,
            interaction: interaction
          };
        }
      });
    });
    
    // Start observing interactions
    try {
      observer.observe({ type: 'event', buffered: true, durationThreshold: 16 }); // 16ms = 1 frame at 60fps
    } catch (e) {
      // Error observing interactions for INP
    }
  }

  /**
   * Event collection module for Optima SDK
   */

  /**
   * Set up event listeners for page interactions
   * @param {Object} sdk - Reference to the Optima SDK instance
   */
  function setupEventListeners(sdk) {
    if (!sdk.sessionId) {
      return;
    }
    
    // Track page load to collect initial resources
    if (document.readyState === 'complete') {
      if (!sdk.collectionState.pageLoaded) {
        sdk.collectionState.pageLoaded = true;
        setTimeout(() => {
          sdk.captureResourceData('load');
          // Send pageview event
          sdk.sendEvent('page_view', {
            url: window.location.href,
            title: document.title,
            referrer: document.referrer
          });
        }, 1000);
      }
    } else {
      window.addEventListener('load', () => {
        if (!sdk.collectionState.pageLoaded) {
          sdk.collectionState.pageLoaded = true;
          setTimeout(() => {
            sdk.captureResourceData('load');
            // Send pageview event
            sdk.sendEvent('page_view', {
              url: window.location.href,
              title: document.title,
              referrer: document.referrer
            });
          }, 1000);
        }
      });
    }
    
    // Use a throttled interaction tracker
    let interactionTimeout = null;
    
    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      // Determine what was clicked
      let targetElement = event.target;
      let elementType = '';
      
      // Check for common clickable elements
      if (targetElement.tagName === 'A' || targetElement.closest('a')) {
        const link = targetElement.tagName === 'A' ? targetElement : targetElement.closest('a');
        elementType = 'link';
        
        // Track link clicks
        sdk.sendEvent('user_interaction', {
          type: 'click',
          element_type: elementType,
          element_id: link.id || null,
          element_class: link.className || null,
          element_text: link.textContent?.trim() || null,
          element_href: link.href || null
        });
      } else if (targetElement.tagName === 'BUTTON' || targetElement.closest('button')) {
        const button = targetElement.tagName === 'BUTTON' ? targetElement : targetElement.closest('button');
        elementType = 'button';
        
        // Track button clicks
        sdk.sendEvent('user_interaction', {
          type: 'click',
          element_type: elementType,
          element_id: button.id || null,
          element_class: button.className || null,
          element_text: button.textContent?.trim() || null
        });
      }
      
      // Clear any pending interaction capture for resources
      if (interactionTimeout) {
        clearTimeout(interactionTimeout);
      }
      
      // Schedule new one with a delay
      interactionTimeout = setTimeout(() => {
        sdk.captureResourceData('interaction');
        interactionTimeout = null;
      }, 2000);
    });
    
    // Track when the page becomes idle, but only once
    if ('requestIdleCallback' in window) {
      let idleCallbackFired = false;
      window.requestIdleCallback(() => {
        if (!idleCallbackFired) {
          idleCallbackFired = true;
          sdk.captureResourceData('idle');
          
          // Send page ready event
          sdk.sendEvent('page_ready', {
            url: window.location.href,
            title: document.title,
            time_to_idle: performance.now()
          });
        }
      }, { timeout: 3000 });
    }
    
    // Add event listeners for page visibility changes to track engagement
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        sdk.sendEvent('visibility_change', {
          state: 'visible',
          timestamp: Date.now()
        });
      } else if (document.visibilityState === 'hidden') {
        sdk.sendEvent('visibility_change', {
          state: 'hidden',
          timestamp: Date.now()
        }, { immediate: true }); // Send immediately when page is hidden
      }
    });
  }

  /**
   * AJAX calls collection module for Optima SDK
   */

  /**
   * Set up AJAX call monitoring
   * @param {Object} sdk - Reference to the Optima SDK instance
   */
  function setupAjaxMonitoring(sdk) {
    // Initialize buffer for AJAX calls if not already present
    if (!sdk.buffer.ajaxCalls) {
      sdk.buffer.ajaxCalls = [];
    }
    
    // Initialize pre-session buffer if needed
    if (!sdk.buffer.preSessionAjaxCalls) {
      sdk.buffer.preSessionAjaxCalls = [];
    }
    
    // Set up XMLHttpRequest monitoring
    monitorXMLHttpRequests(sdk);
    
    // Set up fetch API monitoring
    monitorFetchAPI(sdk);
  }

  /**
   * Handle storing AJAX call data (works with or without session)
   * @param {Object} sdk - Reference to the Optima SDK instance
   * @param {Object} ajaxCallData - AJAX call data to store
   */
  function storeAjaxCallData(sdk, ajaxCallData) {
    if (sdk.sessionId) {
      // Normal operation - session exists
      sdk.buffer.ajaxCalls.push(ajaxCallData);
      
      // If buffer is getting large, flush it
      if (sdk.buffer.ajaxCalls.length >= sdk.batchConfig.maxAjaxCallsPerBatch) {
        sdk._flushAjaxCalls();
      }
    } else {
      // Pre-session storage - will be merged once session is created
      sdk.buffer.preSessionAjaxCalls.push(ajaxCallData);
    }
  }

  /**
   * Merge any pre-session AJAX calls into the main buffer
   * Call this when session is created
   * @param {Object} sdk - Reference to the Optima SDK instance
   */
  function mergePreSessionAjaxCalls(sdk) {
    if (!sdk.buffer.preSessionAjaxCalls || !sdk.buffer.preSessionAjaxCalls.length) {
      return;
    }
    
    // Move pre-session AJAX calls to the main buffer
    sdk.buffer.ajaxCalls.push(...sdk.buffer.preSessionAjaxCalls);
    
    // Clear the pre-session buffer
    sdk.buffer.preSessionAjaxCalls = [];
  }

  /**
   * Monitor XMLHttpRequest calls
   * @param {Object} sdk - Reference to the Optima SDK instance
   */
  function monitorXMLHttpRequests(sdk) {
    // Store original XMLHttpRequest methods
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    
    // Override open method to capture the URL and method
    XMLHttpRequest.prototype.open = function(method, url, async, username, password) {
      // Store request data on the XHR object for later use
      this._optimaData = {
        method: method,
        url: url,
        startTime: Date.now(),
        async: async !== false, // async is true by default
        status: 0,
        statusText: '',
        sentHeaders: {},
        responseHeaders: {},
        responseSize: 0,
        duration: 0,
        aborted: false,
        errored: false
      };
      
      // Call the original open method
      return originalOpen.apply(this, arguments);
    };
    
    // Override send method to capture timing and other details
    XMLHttpRequest.prototype.send = function(body) {
      if (!this._optimaData) {
        // If somehow open wasn't called first, initialize _optimaData
        this._optimaData = {
          method: 'unknown',
          url: 'unknown',
          startTime: Date.now(),
          async: true,
          status: 0,
          statusText: '',
          sentHeaders: {},
          responseHeaders: {},
          responseSize: 0,
          duration: 0,
          aborted: false,
          errored: false
        };
      }
      
      // Capture request payload size if available
      if (body) {
        try {
          this._optimaData.requestPayloadSize = 
            typeof body === 'string' ? body.length :
            body instanceof FormData ? -1 : // FormData size can't be determined easily
            body instanceof Blob ? body.size :
            body instanceof ArrayBuffer ? body.byteLength :
            JSON.stringify(body).length;
        } catch (e) {
          this._optimaData.requestPayloadSize = -1;
        }
      } else {
        this._optimaData.requestPayloadSize = 0;
      }
      
      // Store sent headers if possible
      try {
        if (this.getAllRequestHeaders) {
          const headerString = this.getAllRequestHeaders();
          if (headerString) {
            const headers = headerString.trim().split(/[\r\n]+/);
            headers.forEach(line => {
              const parts = line.split(': ');
              const header = parts.shift();
              const value = parts.join(': ');
              this._optimaData.sentHeaders[header.toLowerCase()] = value;
            });
          }
        }
      } catch (e) {
        // Ignore errors when trying to get headers
      }
      
      // Set up event listeners to capture response data
      const xhr = this;
      
      // Load event - successful completion
      xhr.addEventListener('load', function() {
        completeXhrCapture(xhr, sdk);
      });
      
      // Error event - network error
      xhr.addEventListener('error', function() {
        xhr._optimaData.errored = true;
        xhr._optimaData.status = 0;
        xhr._optimaData.statusText = 'Network Error';
        completeXhrCapture(xhr, sdk);
      });
      
      // Abort event - request was aborted
      xhr.addEventListener('abort', function() {
        xhr._optimaData.aborted = true;
        completeXhrCapture(xhr, sdk);
      });
      
      // Timeout event - request timed out
      xhr.addEventListener('timeout', function() {
        xhr._optimaData.timedOut = true;
        completeXhrCapture(xhr, sdk);
      });
      
      // Call the original send method
      return originalSend.apply(this, arguments);
    };
    
    // Helper function to complete XHR capture
    function completeXhrCapture(xhr, sdk) {
      // Skip if we don't have _optimaData (shouldn't happen)
      if (!xhr._optimaData) return;
      
      // Skip SDK's own API calls
      if (xhr._optimaData.url.includes('/api/sessions') || 
          xhr._optimaData.url.includes('/api/events') ||
          xhr._optimaData.url.includes('/api/resources') ||
          xhr._optimaData.url.includes('/api/web-vitals') ||
          xhr._optimaData.url.includes('/api/ajax-calls')) {
        return;
      }
      
      // Calculate duration
      xhr._optimaData.duration = Date.now() - xhr._optimaData.startTime;
      
      // Capture status and statusText
      if (!xhr._optimaData.errored && !xhr._optimaData.aborted) {
        xhr._optimaData.status = xhr.status;
        xhr._optimaData.statusText = xhr.statusText;
      }
      
      // Capture response headers
      try {
        const headerString = xhr.getAllResponseHeaders();
        if (headerString) {
          const headers = headerString.trim().split(/[\r\n]+/);
          headers.forEach(line => {
            const parts = line.split(': ');
            const header = parts.shift();
            const value = parts.join(': ');
            xhr._optimaData.responseHeaders[header.toLowerCase()] = value;
          });
        }
      } catch (e) {
        // Ignore errors when trying to get headers
      }
      
      // Capture response size
      if (xhr.responseType === '' || xhr.responseType === 'text') {
        xhr._optimaData.responseSize = xhr.responseText ? xhr.responseText.length : 0;
      } else if (xhr.responseType === 'blob') {
        xhr._optimaData.responseSize = xhr.response ? xhr.response.size : 0;
      } else if (xhr.responseType === 'arraybuffer') {
        xhr._optimaData.responseSize = xhr.response ? xhr.response.byteLength : 0;
      } else if (xhr.responseType === 'json') {
        try {
          xhr._optimaData.responseSize = xhr.response ? JSON.stringify(xhr.response).length : 0;
        } catch (e) {
          xhr._optimaData.responseSize = -1;
        }
      } else {
        xhr._optimaData.responseSize = -1; // Can't determine size for other response types
      }
      
      // Check for timing information from Resource Timing API
      if (window.performance && window.performance.getEntriesByType) {
        const entries = window.performance.getEntriesByType('resource');
        const url = xhr._optimaData.url.split('?')[0]; // Remove query params for matching
        
        // Find matching resource timing entry
        const entry = entries.find(e => e.name.indexOf(url) >= 0 && 
                                    (e.initiatorType === 'xmlhttprequest' || e.initiatorType === 'fetch'));
        
        if (entry) {
          xhr._optimaData.resourceTiming = {
            startTime: Math.round(entry.startTime),
            duration: Math.round(entry.duration),
            domainLookupTime: Math.round(entry.domainLookupEnd - entry.domainLookupStart),
            connectTime: Math.round(entry.connectEnd - entry.connectStart),
            tlsTime: entry.secureConnectionStart ? Math.round(entry.connectEnd - entry.secureConnectionStart) : 0,
            requestStartTime: Math.round(entry.requestStart),
            ttfb: Math.round(entry.responseStart - entry.requestStart),
            downloadTime: Math.round(entry.responseEnd - entry.responseStart)
          };
        }
      }
      
      // Create the final AJAX call data
      const ajaxCallData = {
        type: 'xhr',
        method: xhr._optimaData.method,
        url: xhr._optimaData.url,
        status: xhr._optimaData.status,
        statusText: xhr._optimaData.statusText,
        startTime: xhr._optimaData.startTime,
        duration: xhr._optimaData.duration,
        async: xhr._optimaData.async,
        requestPayloadSize: xhr._optimaData.requestPayloadSize,
        responseSize: xhr._optimaData.responseSize,
        aborted: xhr._optimaData.aborted,
        errored: xhr._optimaData.errored,
        timedOut: xhr._optimaData.timedOut,
        timestamp: Date.now(),
        resourceTiming: xhr._optimaData.resourceTiming || null,
        // Include only essential headers to avoid sensitive data
        requestHeaders: {
          'content-type': xhr._optimaData.sentHeaders['content-type'] || 'unknown',
          'content-length': xhr._optimaData.sentHeaders['content-length'] || 'unknown'
        },
        responseHeaders: {
          'content-type': xhr._optimaData.responseHeaders['content-type'] || 'unknown',
          'content-length': xhr._optimaData.responseHeaders['content-length'] || 'unknown',
          'cache-control': xhr._optimaData.responseHeaders['cache-control'] || 'unknown'
        }
      };
      
      // Add to the AJAX buffer
      storeAjaxCallData(sdk, ajaxCallData);
    }
  }

  /**
   * Monitor fetch API calls
   * @param {Object} sdk - Reference to the Optima SDK instance
   */
  function monitorFetchAPI(sdk) {
    // Skip if fetch is not available
    if (typeof window.fetch !== 'function') {
      return;
    }
    
    // Store original fetch function
    const originalFetch = window.fetch;
    
    // Override fetch function
    window.fetch = function(input, init) {
      // Create a unique ID for this fetch call
      const fetchId = Date.now() + Math.random().toString(36).substring(2, 9);
      
      // Parse the URL and method
      let url, method, requestHeaders = {};
      
      if (typeof input === 'string') {
        url = input;
      } else if (input instanceof Request) {
        url = input.url;
        method = input.method;
        // We can't read headers from a Request object directly
        // due to security restrictions
      }
      
      if (init) {
        method = init.method || 'GET';
        if (init.headers) {
          if (init.headers instanceof Headers) {
            // Can't easily iterate Headers in all browsers
            try {
              for (let pair of init.headers.entries()) {
                requestHeaders[pair[0].toLowerCase()] = pair[1];
              }
            } catch (e) {
              // Some browsers don't support entries() on Headers
            }
          } else if (typeof init.headers === 'object') {
            // Plain object headers
            Object.keys(init.headers).forEach(key => {
              requestHeaders[key.toLowerCase()] = init.headers[key];
            });
          }
        }
      }
      
      // Default method is GET
      method = method || 'GET';
      
      // Skip SDK's own API calls
      if (url.includes('/api/sessions') || 
          url.includes('/api/events') ||
          url.includes('/api/resources') ||
          url.includes('/api/web-vitals') ||
          url.includes('/api/ajax-calls')) {
        return originalFetch.apply(this, arguments);
      }
      
      // Record start time
      const startTime = Date.now();
      
      // Create AJAX call data
      const ajaxCallData = {
        type: 'fetch',
        id: fetchId,
        method: method,
        url: url,
        status: 0,
        statusText: '',
        startTime: startTime,
        duration: 0,
        requestPayloadSize: -1, // Hard to determine for fetch
        responseSize: -1,
        aborted: false,
        errored: false,
        timestamp: startTime,
        resourceTiming: null,
        // Include only essential headers to avoid sensitive data
        requestHeaders: {
          'content-type': requestHeaders['content-type'] || 'unknown',
          'content-length': requestHeaders['content-length'] || 'unknown'
        },
        responseHeaders: {}
      };
      
      // Process request body size if available
      if (init && init.body) {
        try {
          ajaxCallData.requestPayloadSize = 
            typeof init.body === 'string' ? init.body.length :
            init.body instanceof FormData ? -1 : // FormData size can't be determined easily
            init.body instanceof Blob ? init.body.size :
            init.body instanceof ArrayBuffer ? init.body.byteLength :
            JSON.stringify(init.body).length;
        } catch (e) {
          ajaxCallData.requestPayloadSize = -1;
        }
      }
      
      // Call the original fetch
      const fetchPromise = originalFetch.apply(this, arguments);
      
      // Process the response
      fetchPromise.then(response => {
        const responseTime = Date.now();
        ajaxCallData.duration = responseTime - startTime;
        ajaxCallData.status = response.status;
        ajaxCallData.statusText = response.statusText;
        
        // Capture response headers
        try {
          if (response.headers) {
            ajaxCallData.responseHeaders = {
              'content-type': response.headers.get('content-type') || 'unknown',
              'content-length': response.headers.get('content-length') || 'unknown',
              'cache-control': response.headers.get('cache-control') || 'unknown'
            };
          }
        } catch (e) {
          // Ignore errors when trying to get headers
        }
        
        // Get content length if available
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
          ajaxCallData.responseSize = parseInt(contentLength, 10);
        }
        
        // Clone the response to avoid consuming it
        return response.clone().text().then(text => {
          if (ajaxCallData.responseSize < 0) {
            ajaxCallData.responseSize = text.length;
          }
          
          // Check for timing information from Resource Timing API
          if (window.performance && window.performance.getEntriesByType) {
            const entries = window.performance.getEntriesByType('resource');
            const url = ajaxCallData.url.split('?')[0]; // Remove query params for matching
            
            // Find matching resource timing entry
            const entry = entries.find(e => e.name.indexOf(url) >= 0 && 
                                        (e.initiatorType === 'fetch' || e.initiatorType === 'xmlhttprequest'));
            
            if (entry) {
              ajaxCallData.resourceTiming = {
                startTime: Math.round(entry.startTime),
                duration: Math.round(entry.duration),
                domainLookupTime: Math.round(entry.domainLookupEnd - entry.domainLookupStart),
                connectTime: Math.round(entry.connectEnd - entry.connectStart),
                tlsTime: entry.secureConnectionStart ? Math.round(entry.connectEnd - entry.secureConnectionStart) : 0,
                requestStartTime: Math.round(entry.requestStart),
                ttfb: Math.round(entry.responseStart - entry.requestStart),
                downloadTime: Math.round(entry.responseEnd - entry.responseStart)
              };
            }
          }
          
          // Add to the AJAX buffer
          storeAjaxCallData(sdk, ajaxCallData);
        }).catch(err => {
          // Error reading the response
        });
      }).catch(error => {
        // Network error or other fetch error
        const errorTime = Date.now();
        ajaxCallData.duration = errorTime - startTime;
        ajaxCallData.errored = true;
        ajaxCallData.errorMessage = error.message || 'Network error';
        
        // Add to the AJAX buffer
        storeAjaxCallData(sdk, ajaxCallData);
      });
      
      // Return the original promise
      return fetchPromise;
    };
  }

  /**
   * Data management module for Optima SDK
   */

  /**
   * Create buffer management functions
   * @param {Object} config - Buffer configuration
   * @returns {Object} Buffer management functions
   */
  function createBufferManagement(sdk) {
    return {
      /**
       * Set up buffer management
       */
      setupBufferManagement: function() {
        // Set up periodic buffer management
        setInterval(() => {
          this.trimBuffers();
        }, 30000);
      },
      
      /**
       * Trim buffers to prevent memory bloat
       */
      trimBuffers: function() {
        const maxSize = sdk.batchConfig.maxBufferSize;
        
        if (sdk.buffer.events.length > maxSize) {
          sdk.buffer.events = sdk.buffer.events.slice(-maxSize);
        }
        
        if (sdk.buffer.resources.length > maxSize) {
          sdk.buffer.resources = sdk.buffer.resources.slice(-maxSize);
        }
        
        if (sdk.buffer.webVitals.length > maxSize) {
          sdk.buffer.webVitals = sdk.buffer.webVitals.slice(-maxSize);
        }
      },
      
      /**
       * Create a simple hash for a resource to dedupe similar resources
       * @param {Object} resource - Resource data
       * @returns {string} Resource hash
       */
      hashResource: function(resource) {
        return `${resource.type}|${resource.name.split('?')[0]}|${resource.duration < 50 ? 'fast' : 'slow'}`;
      },
      
      /**
       * Determine if a resource should be collected
       * @param {Object} resource - Resource data
       * @returns {boolean} True if the resource should be collected
       */
      shouldCollectResource: function(resource) {
        // Dedupe resources if enabled
        if (sdk.batchConfig.resourceDedupingEnabled) {
          const hash = this.hashResource(resource);
          
          // If we've seen this pattern recently, skip it
          if (sdk.collectionState.resourceHashMap[hash]) {
            return false;
          }
          
          // Otherwise mark it as seen for future reference
          sdk.collectionState.resourceHashMap[hash] = Date.now();
        }
        
        return true;
      },
      
      /**
       * Start batch processing
       */
      startBatchProcessing: function() {

        
        // Send buffered data more frequently for testing purposes
        setInterval(() => {

          
          if (sdk.buffer.events.length > 0) {

            sdk._flushEvents();
          }
          
          if (sdk.buffer.webVitals.length > 0) {

            sdk._flushWebVitals();
          }
          
          if (sdk.buffer.resources.length > 0) {

            sdk._flushResources();
          }
          
        }, Math.min(sdk.batchConfig.flushInterval, 10000)); // Force interval to be max 10 seconds
        
        // Set up visibility change listener (primary flush trigger)
        if (sdk.batchConfig.visibilityFlushEnabled) {

          
          // Define the handler as a named function for better debugging
          const handleVisibilityChange = () => {
            const now = Date.now();
            sdk.collectionState.visibilityState;
            const currentState = document.visibilityState;
            

            
            // Store visibility state
            sdk.collectionState.visibilityState = currentState;
            
            // Only trigger if it's been at least 1 second since last change
            if (now - sdk.collectionState.lastVisibilityChange > 1000) {
              sdk.collectionState.lastVisibilityChange = now;
              
              if (currentState === 'hidden') {

                // Page is being hidden, flush all data with beacon
                sdk._flushBuffers('visibilityHidden', true);
              } else if (currentState === 'visible') {

                // Wait a moment to collect new resources when page becomes visible
                setTimeout(() => {
                  sdk.captureResourceData('visibilityVisible');
                }, 1000);
              }
            }
          };
          
          // Add the event listener
          document.addEventListener('visibilitychange', handleVisibilityChange);
          
          // Log the current state

        }
        
        // Set up before unload (backup flush method)
        window.addEventListener('beforeunload', () => {
          sdk._flushBuffers('unload', true);
        });
        
        // Set up idle callback flushing (for less critical times)
        if (sdk.batchConfig.flushAtIdle && 'requestIdleCallback' in window) {
          const scheduleIdle = () => {
            window.requestIdleCallback(() => {
              // Only flush if we have enough data or it's been a while
              const shouldFlush = sdk.buffer.events.length >= 10 || 
                                 sdk.buffer.resources.length >= 10 ||
                                 Date.now() - sdk.collectionState.lastResourceFlush > 30000;
              
              if (shouldFlush) {
                sdk._flushBuffers('idle');
              }
              
              // Reschedule idle callback
              setTimeout(() => {
                scheduleIdle();
              }, 20000);
            }, { timeout: 10000 });
          };
          
          // Start idle callback chain
          scheduleIdle();
        }
        
        // Set up buffer management
        this.setupBufferManagement();
      }
    };
  }

  /**
   * Data flushing module for Optima SDK
   */

  /**
   * Create data flushing functions
   * @param {Object} sdk - Reference to the Optima SDK instance
   * @returns {Object} Data flushing functions
   */
  function createFlushFunctions(sdk) {
    return {
      /**
       * Flush all buffered data
       * @param {string} trigger - What triggered the flush
       * @param {boolean} useBeacon - Whether to use navigator.sendBeacon
       */
      flushBuffers: function(trigger, useBeacon = false) {
        // Flush events if we have any (even just a few)
        if (sdk.buffer.events.length > 0) {
          this.flushEvents(useBeacon);
        }
        
        // Flush resources if we have any
        if (sdk.buffer.resources.length > 0) {
          this.flushResources(useBeacon);
        }
        
        // Flush web vitals if we have any
        if (sdk.buffer.webVitals.length > 0) {
          this.flushWebVitals(useBeacon);
        }
        
        // Flush AJAX calls if we have any
        if (sdk.buffer.ajaxCalls && sdk.buffer.ajaxCalls.length > 0) {
          this.flushAjaxCalls(useBeacon);
        }
      },
      
      /**
       * Flush events to the server
       * @param {boolean} useBeacon - Whether to use navigator.sendBeacon
       */
      flushEvents: function(useBeacon = false) {
        if (sdk.buffer.events.length === 0) {
          return;
        }
        
        // Limit number of events per batch
        const eventsToSend = sdk.buffer.events.slice(0, sdk.batchConfig.maxEventsPerBatch);
        sdk.buffer.events = sdk.buffer.events.slice(sdk.batchConfig.maxEventsPerBatch);
        
        const batchData = {
          session_id: sdk.sessionId,
          events: eventsToSend,
          timestamp: Date.now(),
          count: eventsToSend.length
        };
        
        sdk.collectionState.lastEventFlush = Date.now();
        sdk._sendToServer('/api/events', batchData, { sync: useBeacon });
      },
      
      /**
       * Flush resources to the server
       * @param {boolean} useBeacon - Whether to use navigator.sendBeacon
       */
      flushResources: function(useBeacon = false) {
        if (sdk.buffer.resources.length === 0) return;
        
        // Limit number of resources per batch
        const resourcesToSend = sdk.buffer.resources.slice(0, sdk.batchConfig.maxResourcesPerBatch);
        sdk.buffer.resources = sdk.buffer.resources.slice(sdk.batchConfig.maxResourcesPerBatch);
        
        const batchData = {
          session_id: sdk.sessionId,
          resources: resourcesToSend,
          timestamp: Date.now(),
          count: resourcesToSend.length
        };
        
        sdk.collectionState.lastResourceFlush = Date.now();
        sdk._sendToServer('/api/resources', batchData, { sync: useBeacon });
      },
      
      /**
       * Flush web vitals to the server
       * @param {boolean} useBeacon - Whether to use navigator.sendBeacon
       */
      flushWebVitals: function(useBeacon = false) {
        if (sdk.buffer.webVitals.length === 0) {
          return;
        }
        
        // Limit number of web vitals per batch
        const vitalsToSend = sdk.buffer.webVitals.slice(0, sdk.batchConfig.maxWebVitalsPerBatch);
        sdk.buffer.webVitals = sdk.buffer.webVitals.slice(sdk.batchConfig.maxWebVitalsPerBatch);
        
        // Process web vitals before sending - consolidate into an object format
        // This creates a structure that's easier to merge on the server
        const processedVitals = vitalsToSend.reduce((processed, vital) => {
          if (!vital.event_data || !vital.event_data.name) return processed;
          
          const vitalName = vital.event_data.name;
          const vitalValue = vital.event_data.value;
          
          // Create objects for each metric if they don't exist
          processed[vitalName] = processed[vitalName] || [];
          processed[vitalName].push({
            value: vitalValue,
            timestamp: vital.timestamp,
            ...vital.event_data
          });
          
          return processed;
        }, {});
        
        const batchData = {
          session_id: sdk.sessionId,
          web_vitals: vitalsToSend,
          processed_vitals: processedVitals,
          timestamp: Date.now(),
          count: vitalsToSend.length
        };
        
        // Force useBeacon during page visibility changes to ensure data is sent
        const useBeaconForSend = useBeacon || document.visibilityState === 'hidden';
        
        sdk._sendToServer('/api/web-vitals', batchData, { sync: useBeaconForSend });
        
        // If we still have many vitals in the buffer, schedule the next batch
        if (sdk.buffer.webVitals.length >= sdk.batchConfig.maxWebVitalsPerBatch / 2) {
          setTimeout(() => {
            this.flushWebVitals(useBeacon);
          }, 1000);
        }
      },
      
      /**
       * Flush AJAX calls to the server
       * @param {boolean} useBeacon - Whether to use navigator.sendBeacon
       */
      flushAjaxCalls: function(useBeacon = false) {
        if (!sdk.buffer.ajaxCalls || sdk.buffer.ajaxCalls.length === 0) {
          return;
        }
        
        // Limit number of AJAX calls per batch
        const ajaxCallsToSend = sdk.buffer.ajaxCalls.slice(0, sdk.batchConfig.maxAjaxCallsPerBatch);
        sdk.buffer.ajaxCalls = sdk.buffer.ajaxCalls.slice(sdk.batchConfig.maxAjaxCallsPerBatch);
        
        const batchData = {
          session_id: sdk.sessionId,
          ajax_calls: ajaxCallsToSend,
          timestamp: Date.now(),
          count: ajaxCallsToSend.length
        };
        
        sdk.collectionState.lastAjaxCallFlush = Date.now();
        sdk._sendToServer('/api/ajax-calls', batchData, { sync: useBeacon });
      }
    };
  }

  /**
   * Session management module for Optima SDK
   */


  /**
   * Create a new session
   * @param {Object} sdk - Reference to the Optima SDK instance
   * @returns {string} Session ID
   */
  function createSession(sdk) {
    console.log('[Optima Debug] Session: Creating new session');
    
    // Generate unique session ID without exposing API key
    // Use timestamp + random UUID to ensure uniqueness
    const timestamp = Date.now().toString(36);
    const randomPart = generateUUID();
    sdk.sessionId = `${timestamp}-${randomPart}`;
    console.log('[Optima Debug] Session: Generated session ID:', sdk.sessionId);
    
    const navigationTiming = window.performance && window.performance.timing ? 
      window.performance.timing : {};
    
    const sessionData = {
      session_id: sdk.sessionId,
      page_url: window.location.href,
      navigation_start: navigationTiming.navigationStart || Date.now(),
      timestamp: Date.now(),
      user_agent: navigator.userAgent,
      device_type: getDeviceType(),
      connection_type: getConnectionType(),
      referrer: document.referrer || '',
      resources: [], // Resources will be added later with captureResourceData
      meta: {
        pathname: window.location.pathname,
        page_title: document.title,
        navigation_type: window.performance && window.performance.getEntriesByType ?
          (window.performance.getEntriesByType('navigation')[0]?.type || 'unknown') : 'unknown',
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        device_speed: navigator.hardwareConcurrency || null,
        browser: (() => {
          const ua = navigator.userAgent;
          if (/chrome|crios|crmo/i.test(ua)) return 'Chrome';
          if (/firefox|fxios/i.test(ua)) return 'Firefox';
          if (/safari/i.test(ua) && !/chrome|crios|crmo/i.test(ua)) return 'Safari';
          if (/edg/i.test(ua)) return 'Edge';
          if (/opr\//i.test(ua)) return 'Opera';
          return 'Unknown';
        })(),
        os: (() => {
          const ua = navigator.userAgent;
          if (/windows nt/i.test(ua)) return 'Windows';
          if (/mac os x/i.test(ua)) return 'Mac OS';
          if (/android/i.test(ua)) return 'Android';
          if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
          if (/linux/i.test(ua)) return 'Linux';
          return 'Unknown';
        })(),
        connection_downlink: navigator.connection?.downlink || null,
        connection_rtt: navigator.connection?.rtt || null
      }
    };
    
    console.log('[Optima Debug] Session: Session data prepared', 
      'URL:', sessionData.page_url, 
      'Device:', sessionData.device_type,
      'Browser:', sessionData.meta.browser,
      'OS:', sessionData.meta.os
    );
    
    // Handle any AJAX calls captured before session creation
    mergePreSessionAjaxCalls(sdk);
    
    // Send the session data to the server
    console.log('[Optima Debug] Session: Sending session data to server at', sdk.endpoint + '/api/sessions');
    sdk._sendToServer('/api/sessions', sessionData)
      .then(success => {
        if (success) {
          console.log('[Optima Debug] Session: Session created successfully');
          // Session created successfully
          // Now that session is confirmed created, set up listeners and observers
          sdk._setupEventListeners();
          sdk._setupPerformanceObservers();
          // Start batch processing
          sdk._startBatchProcessing();
          sdk.sessionStartTime = Date.now();
          
          // Store in the unified data model too
          sdk.unifiedDataModel.session_id = sdk.sessionId;
          sdk.unifiedDataModel.timestamp = sdk.sessionStartTime;
          console.log('[Optima Debug] Session: Unified data model updated with session ID');
        } else {
          console.error('[Optima Debug] Session: Failed to create session, monitoring disabled');
          // Failed to create session, monitoring disabled
        }
      });
    
    return sdk.sessionId;
  }

  /**
   * Network API module for Optima SDK
   */

  /**
   * Send data to the server
   * @param {string} endpoint - Server endpoint
   * @param {string} path - API path
   * @param {Object} data - Data to send
   * @param {Object} apiKey - API key
   * @param {Object} options - Additional options
   * @returns {Promise} Promise resolving to success status
   */
  function sendToServer(endpoint, path, data, apiKey, options = {}) {
    const url = endpoint + path;
    console.log('[Optima Debug] API: Sending data to', url);
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(data)
    };
    
    if (options.sync) {
      // Use sendBeacon for synchronous sends (like beforeunload)
      if (navigator.sendBeacon) {
        console.log('[Optima Debug] API: Using navigator.sendBeacon for sync request');
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const result = navigator.sendBeacon(url, blob);
        console.log('[Optima Debug] API: sendBeacon result:', result);
        return Promise.resolve(result);
      } else {
        console.warn('[Optima Debug] API: sendBeacon not available, falling back to fetch');
      }
    }
    
    // Otherwise use fetch
    console.log('[Optima Debug] API: Using fetch for request');
    return fetch(url, requestOptions)
      .then(response => {
        console.log('[Optima Debug] API: Response received', response.status, response.statusText);
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('[Optima Debug] API: Request successful', data);
        return true;
      })
      .catch(err => {
        console.error('[Optima Debug] API: Request failed', err);
        return false;
      });
  }

  /**
   * Optima Performance Monitoring SDK
   * v1.0.0
   */


  (function(window) {

    // SDK Constructor
    function Optima(options) {
      console.log('[Optima Debug] Constructor called with options:', options);
      options = options || {};
      
      // Core settings
      this.apiKey = options.apiKey;
      this.endpoint = options.endpoint || 'http://localhost:3000';
      
      // Storage for session details
      this.sessionId = null;
      this.sessionStartTime = null;
      
      // Unified buffer for all data types
      this.buffer = {
        events: [],
        resources: [],
        webVitals: [],
        ajaxCalls: []
      };
      
      // New unified data model - all collected metrics will be merged here before sending
      this.unifiedDataModel = {
        session_id: null,
        timestamp: null,
        web_vitals: {
          LCP: null,
          FID: null,
          CLS: null,
          TTFB: null, // Time to First Byte - new metric
          INP: null   // Interaction to Next Paint - new metric
        },
        resources: [],
        ajax_requests: [],
        errors: [],
        timings: null,
        metrics: {},
        meta: {}
      };
      
      // Batch configuration
      this.batchConfig = {
        maxEventsPerBatch: 50,
        maxResourcesPerBatch: 50,
        maxWebVitalsPerBatch: 20,
        maxAjaxCallsPerBatch: 50,
        flushInterval: options.flushInterval || 5000,
        webVitalsBatchDelay: options.webVitalsBatchDelay || 2000,
        batchBeforeSend: options.batchBeforeSend || true,
        payloadCompressionThreshold: 10 * 1024 // 10KB threshold for compression
      };
      
      // Collection state
      this.collectionState = {
        isFirstLoad: true,
        resourcesCollected: false,
        lastResourceFlush: null,
        lastEventFlush: null,
        lastAjaxCallFlush: null,
        isPerformanceObserverSet: false,
        isBatchProcessingStarted: false,
        unloadSent: false,
        visibilityChangeCount: 0
      };

      // Create manager instances
      this.bufferManager = createBufferManagement(this);
      this.flushManager = createFlushFunctions(this);
      
      // Setup batched collection and sending
      this._setupBatchedCollection();
      
      // Web vital timers
      this._webVitalsBatchTimer = null;
      
      // Initialize on construction
      this._init();
      console.log('[Optima Debug] Constructor completed, instance created');
    }

    // SDK prototype methods
    Optima.prototype = {
      _init: function() {
        console.log('[Optima Debug] Initializing SDK, apiKey present:', !!this.apiKey);
        
        if (!this.apiKey) {
          console.warn('[Optima Debug] No API key provided, SDK will not be fully initialized');
          return;
        }
        
        // Initialize performance metrics
        this._initPerformanceMetrics();
        
        // Set up AJAX monitoring immediately, before session creation
        this._setupAjaxMonitoring();
        
        // Create a new session when the SDK is initialized
        console.log('[Optima Debug] Creating session');
        this.createSession();
        
        // Set up event listeners for page lifecycle events
        this._setupPageLifecycleEvents();
        console.log('[Optima Debug] SDK initialization completed');
      },
      
      _initPerformanceMetrics: function() {
        // Add core web vitals metrics and other performance markers
        if (window.performance && window.performance.mark) {
          // Mark the SDK initialization time
          window.performance.mark('optima_init');
          
          // Clear any existing marks/measures from our SDK to avoid duplicates
          try {
            const entries = window.performance.getEntriesByType('mark')
              .concat(window.performance.getEntriesByType('measure'))
              .filter(entry => entry.name.startsWith('optima_'));
              
            entries.forEach(entry => {
              window.performance.clearMarks(entry.name);
              if (entry.entryType === 'measure') {
                window.performance.clearMeasures(entry.name);
              }
            });
          } catch (e) {
            // Error clearing performance marks
          }
          
          // Add timers for core metrics
          this._setupCoreWebVitals();
          
          // Capture navigation timing metrics
          this._captureNavigationTiming();
        }
      },
      
      // New method for capturing initial navigation timing
      _captureNavigationTiming: function() {
        try {
          console.log('[Optima Debug] Capturing navigation timing');
          const navEntry = performance.getEntriesByType('navigation')[0];
          if (navEntry) {
            // Store navigation timing metrics in our unified model
            this.unifiedDataModel.timings = {
              navigationStart: 0, // relative to timeOrigin
              fetchStart: navEntry.fetchStart,
              domainLookupStart: navEntry.domainLookupStart,
              domainLookupEnd: navEntry.domainLookupEnd,
              connectStart: navEntry.connectStart,
              connectEnd: navEntry.connectEnd,
              requestStart: navEntry.requestStart,
              responseStart: navEntry.responseStart,
              responseEnd: navEntry.responseEnd,
              domInteractive: navEntry.domInteractive,
              domContentLoadedEventStart: navEntry.domContentLoadedEventStart,
              domContentLoadedEventEnd: navEntry.domContentLoadedEventEnd,
              domComplete: navEntry.domComplete,
              loadEventStart: navEntry.loadEventStart,
              loadEventEnd: navEntry.loadEventEnd,
              duration: navEntry.duration,
              type: navEntry.type,
              redirectCount: navEntry.redirectCount,
              nextHopProtocol: navEntry.nextHopProtocol
            };
            
            // Calculate and store TTFB - Time To First Byte
            this.unifiedDataModel.web_vitals.TTFB = {
              value: navEntry.responseStart,
              timestamp: performance.timeOrigin + navEntry.responseStart
            };
            
            console.log('[Optima Debug] TTFB captured:', this.unifiedDataModel.web_vitals.TTFB);
            
            // Also send TTFB as a web vital event to ensure it's included in the array format
            this.sendEvent('core_web_vital', {
              name: 'TTFB',
              value: navEntry.responseStart
            }, { immediate: true });
          } else {
            console.warn('[Optima Debug] No navigation timing entries available');
          }
        } catch (e) {
          console.error('[Optima Debug] Error capturing navigation timing:', e);
        }
      },
      
      // Lifecycle event setup
      _setupPageLifecycleEvents: function() {
        // Track visibility changes
        document.addEventListener('visibilitychange', () => {
          this.collectionState.visibilityChangeCount++;
          
          if (document.visibilityState === 'hidden') {
            // Prepare final data packet including all buffered data
            this._prepareFinalDataAndSend(true);
          } else if (document.visibilityState === 'visible') {
            // Update session details on becoming visible again
            this._refreshVisibleState();
          }
        });
        
        // Handle beforeunload event
        window.addEventListener('beforeunload', () => {
          if (!this.collectionState.unloadSent) {
            this._prepareFinalDataAndSend(true);
            this.collectionState.unloadSent = true;
          }
        });
        
        // Set up a periodic flush to ensure data is sent regularly
        this._setupPeriodicFlush();
      },
      
      // New method to prepare all data and send in one request
      _prepareFinalDataAndSend: function(useBeacon = false) {
        console.log('[Optima Debug] Preparing final data for sending, useBeacon:', useBeacon);
        
        // Merge all buffered data into the unified model
        this._consolidateBufferedData();
        
        // Ensure we have the latest web vitals
        this._updateWebVitalsInUnifiedModel();
        
        // Send the complete data model
        this._sendUnifiedData(useBeacon);
      },
      
      // New method to update unified model with the latest web vitals
      _updateWebVitalsInUnifiedModel: function() {
        // Process each web vital in the buffer and add to unified model
        this.buffer.webVitals.forEach(vital => {
          if (!vital.event_data || !vital.event_data.name) return;
          
          const { name, value } = vital.event_data;
          const timestamp = vital.timestamp;
          
          if (name === 'LCP') {
            // For LCP, keep the largest value
            if (!this.unifiedDataModel.web_vitals.LCP || 
                value > this.unifiedDataModel.web_vitals.LCP.value) {
              this.unifiedDataModel.web_vitals.LCP = { 
                value,
                timestamp,
                element: vital.event_data.element || 'unknown'
              };
            }
          } else if (name === 'FID') {
            // For FID, keep the first value
            if (!this.unifiedDataModel.web_vitals.FID) {
              this.unifiedDataModel.web_vitals.FID = { 
                value,
                timestamp,
                inputType: vital.event_data.inputType
              };
            }
          } else if (name === 'CLS') {
            // For CLS, keep the highest value
            if (!this.unifiedDataModel.web_vitals.CLS || 
                value > this.unifiedDataModel.web_vitals.CLS.value) {
              this.unifiedDataModel.web_vitals.CLS = { 
                value,
                timestamp,
                entries: vital.event_data.entries
              };
            }
          } else if (name === 'INP') {
            // For INP, keep the highest value
            if (!this.unifiedDataModel.web_vitals.INP || 
                value > this.unifiedDataModel.web_vitals.INP.value) {
              this.unifiedDataModel.web_vitals.INP = { 
                value,
                timestamp,
                event: vital.event_data.event
              };
            }
          }
        });
        
        // Clear the buffer after processing
        this.buffer.webVitals = [];
      },
      
      // Consolidate all buffered data into the unified model
      _consolidateBufferedData: function() {
        // Update resources
        if (this.buffer.resources.length > 0) {
          this.unifiedDataModel.resources = [
            ...this.unifiedDataModel.resources,
            ...this.buffer.resources
          ];
          this.buffer.resources = [];
        }
        
        // Update AJAX requests
        if (this.buffer.ajaxCalls.length > 0) {
          this.unifiedDataModel.ajax_requests = [
            ...this.unifiedDataModel.ajax_requests,
            ...this.buffer.ajaxCalls
          ];
          this.buffer.ajaxCalls = [];
        }
        
        // Update events - could be processed into a more structured format here
        // Currently we're not using this directly in the unified model
        this.buffer.events = [];
        
        // Make sure session_id is set
        this.unifiedDataModel.session_id = this.sessionId;
        this.unifiedDataModel.timestamp = Date.now();
        
        // Add metadata
        this._updateMetadata();
      },
      
      // Update metadata in the unified model
      _updateMetadata: function() {
        this.unifiedDataModel.meta = {
          url: window.location.href,
          path: window.location.pathname,
          referrer: document.referrer,
          title: document.title,
          user_agent: navigator.userAgent,
          screen_width: window.screen.width,
          screen_height: window.screen.height,
          viewport_width: window.innerWidth,
          viewport_height: window.innerHeight,
          connection_type: navigator.connection ? navigator.connection.effectiveType : null,
          connection_downlink: navigator.connection ? navigator.connection.downlink : null,
          connection_rtt: navigator.connection ? navigator.connection.rtt : null,
          device_memory: navigator.deviceMemory,
          device_speed: navigator.hardwareConcurrency,
          page_visibility: document.visibilityState,
          visibility_changes: this.collectionState.visibilityChangeCount,
          timestamp: Date.now(),
          browser: this._detectBrowser(),
          os: this._detectOS(),
          navigation_type: performance.getEntriesByType('navigation')[0]?.type || null
        };
      },
      
      // Send the unified data model
      _sendUnifiedData: function(useBeacon = false) {
        // Skip if no data to send
        if (!this.unifiedDataModel.session_id) {
          console.warn('[Optima Debug] Not sending data - no session ID');
          return;
        }
        
        // Make a copy to avoid mutations during sending
        const dataToSend = JSON.parse(JSON.stringify(this.unifiedDataModel));
        console.log('[Optima Debug] Sending unified data model:', 
          'session:', dataToSend.session_id,
          'resources:', dataToSend.resources.length,
          'ajax_requests:', dataToSend.ajax_requests.length,
          'web_vitals:', dataToSend.web_vitals
        );
        
        // Use the sendToServer method with the unified endpoint
        this._sendToServer('/api/collect', dataToSend, { sync: useBeacon });
        
        // Reset volatile parts of the unified model after sending
        this._resetVolatileDataInUnifiedModel();
      },
      
      // Reset volatile parts of the unified model after sending
      _resetVolatileDataInUnifiedModel: function() {
        // Keep web vitals that are cumulative (like CLS)
        // but reset resources and AJAX requests that have been sent
        this.unifiedDataModel.resources = [];
        this.unifiedDataModel.ajax_requests = [];
      },
      
      // Set up batched data collection
      _setupBatchedCollection: function() {
        // Start batch processing
        if (!this.collectionState.isBatchProcessingStarted) {
          this.collectionState.isBatchProcessingStarted = true;
          this._startBatchedCollection();
        }
      },
      
      // Implement batched collection with periodic flushing
      _startBatchedCollection: function() {
        // Set up a periodic flush of resources
        setInterval(() => {
          this._collectResources();
        }, 3000); // Collect resources every 3 seconds
        
        // Set up a periodic flush of the unified data model
        this._setupPeriodicFlush();
      },
      
      // Set up periodic flushing of the unified data model
      _setupPeriodicFlush: function() {
        // Set up a periodic flush on a longer interval
        setInterval(() => {
          // Only send if we have meaningful data
          if (this._hasSignificantData()) {
            this._prepareFinalDataAndSend(false);
          }
        }, this.batchConfig.flushInterval);
      },
      
      // Determine if we have significant data worth sending
      _hasSignificantData: function() {
        return (
          this.unifiedDataModel.resources.length > 0 ||
          this.unifiedDataModel.ajax_requests.length > 0 ||
          this.buffer.webVitals.length > 0 ||
          (this.unifiedDataModel.web_vitals.LCP && this.unifiedDataModel.web_vitals.LCP.value) ||
          (this.unifiedDataModel.web_vitals.FID && this.unifiedDataModel.web_vitals.FID.value) ||
          (this.unifiedDataModel.web_vitals.CLS && this.unifiedDataModel.web_vitals.CLS.value)
        );
      },
      
      // Collect resources from performance entries
      _collectResources: function() {
        try {
          // Get all resource entries
          const resources = performance.getEntriesByType('resource');
          
          // Process each resource
          resources.forEach(resource => {
            // Skip if resource is already processed
            if (this._isResourceProcessed(resource.name)) {
              return;
            }
            
            // Create a simplified resource object
            const processedResource = {
              name: resource.name,
              type: this._getResourceType(resource),
              startTime: Math.round(resource.startTime),
              duration: Math.round(resource.duration),
              size: resource.transferSize || 0,
              protocol: resource.nextHopProtocol,
              encodedSize: resource.encodedBodySize || 0,
              decodedSize: resource.decodedBodySize || 0,
              initiatorType: resource.initiatorType
            };
            
            // Add to the unified model resources array
            this.unifiedDataModel.resources.push(processedResource);
          });
          
          // Mark resources as collected
          this.collectionState.resourcesCollected = true;
        } catch (e) {
          // Error collecting resources
        }
      },
      
      // Check if resource has already been processed
      _isResourceProcessed: function(url) {
        return this.unifiedDataModel.resources.some(resource => resource.name === url);
      },
      
      // Helper to detect resource type
      _getResourceType: function(resource) {
        const initiatorType = resource.initiatorType;
        const url = resource.name;
        
        // Check based on initiator type
        if (initiatorType === 'img' || initiatorType === 'image') return 'image';
        if (initiatorType === 'script') return 'script';
        if (initiatorType === 'link' && resource.nextHopProtocol) return 'stylesheet';
        if (initiatorType === 'css') return 'stylesheet';
        if (initiatorType === 'fetch' || initiatorType === 'xmlhttprequest') return 'xhr';
        
        // Check based on file extension
        if (/\.(?:png|jpg|jpeg|gif|webp|svg|ico)(?:\?|$)/i.test(url)) return 'image';
        if (/\.(?:js)(?:\?|$)/i.test(url)) return 'script';
        if (/\.(?:css)(?:\?|$)/i.test(url)) return 'stylesheet';
        if (/\.(?:woff2?|ttf|otf|eot)(?:\?|$)/i.test(url)) return 'font';
        if (/\.(?:mp4|webm|ogv)(?:\?|$)/i.test(url)) return 'video';
        if (/\.(?:mp3|ogg|wav)(?:\?|$)/i.test(url)) return 'audio';
        
        return 'other';
      },
      
      // Detect browser name
      _detectBrowser: function() {
        const userAgent = navigator.userAgent;
        
        if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
        if (userAgent.indexOf('Safari') > -1) return 'Safari';
        if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
        if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) return 'IE';
        if (userAgent.indexOf('Edge') > -1) return 'Edge';
        if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR/') > -1) return 'Opera';
        
        return 'Unknown';
      },
      
      // Detect operating system
      _detectOS: function() {
        const userAgent = navigator.userAgent;
        
        if (userAgent.indexOf('Win') > -1) return 'Windows';
        if (userAgent.indexOf('Mac') > -1) return 'Mac OS';
        if (userAgent.indexOf('Linux') > -1) return 'Linux';
        if (userAgent.indexOf('Android') > -1) return 'Android';
        if (userAgent.indexOf('iOS') > -1 || userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) return 'iOS';
        
        return 'Unknown';
      },
      
      // Refresh state when page becomes visible again
      _refreshVisibleState: function() {
        // If page has been hidden for a while, we might want to
        // re-initialize some metrics or mark a new session phase
        if (this.collectionState.visibilityChangeCount > 1) {
          // Re-collect resources that might have loaded while hidden
          this._collectResources();
        }
      },
      
      // Core Web Vitals setup
      _setupCoreWebVitals: function() {
        setupCoreWebVitals(this);
      },
      
      // Buffer management
      _setupBufferManagement: function() {
        this.bufferManager.setupBufferManagement();
      },
      
      _shouldCollectResource: function(resource) {
        return this.bufferManager.shouldCollectResource(resource);
      },

      // Batch processing
      _startBatchProcessing: function() {
        this.bufferManager.startBatchProcessing();
      },
      
      // Flush methods - DEPRECATED but kept for backward compatibility
      _flushBuffers: function(trigger, useBeacon = false) {
        // Instead of using old flush methods, prepare and send unified data
        this._prepareFinalDataAndSend(useBeacon);
      },
      
      _flushEvents: function(useBeacon = false) {
        // Deprecated - now handled by unified data model
        this._prepareFinalDataAndSend(useBeacon);
      },
      
      _flushResources: function(useBeacon = false) {
        // Deprecated - now handled by unified data model
        this._prepareFinalDataAndSend(useBeacon);
      },
      
      _flushWebVitals: function(useBeacon = false) {
        // Update web vitals in the unified model
        this._updateWebVitalsInUnifiedModel();
        // Send the unified data
        this._prepareFinalDataAndSend(useBeacon);
      },

      // Event listeners
      _setupEventListeners: function() {
        setupEventListeners(this);
      },

      // Performance observers
      _setupPerformanceObservers: function() {
        this._setupCoreWebVitals();
        
        // Set up resource monitoring (restore this as it was originally)
        this._setupAjaxMonitoring();
        
        // Capture initial resources
        this.captureResourceData('setup');
      },

      // Resource capture
      captureResourceData: function(trigger = 'manual') {
        // Update to use the unified approach
        this._collectResources();
        return true;
      },
      
      _sendResourceBatch: function(resources) {
        // Update resources in the unified model
        if (resources && resources.length > 0) {
          this.unifiedDataModel.resources = [
            ...this.unifiedDataModel.resources,
            ...resources
          ];
        }
        return true;
      },

      // Session management
      createSession: function() {
        console.log('[Optima Debug] Creating a new session');
        return createSession(this);
      },

      // Network communication
      _sendToServer: function(path, data, options = {}) {
        console.log('[Optima Debug] Sending data to server:', path, 'using beacon:', !!options.sync);
        return sendToServer(this.endpoint, path, data, this.apiKey, options);
      },

      // Events
      sendEvent: function(eventType, eventData, options = {}) {
        if (!this.sessionId) {
          return false;
        }
        
        const event = {
          session_id: this.sessionId,
          event_type: eventType,
          event_data: eventData || {},
          timestamp: Date.now()
        };
        
        // Special handling for Core Web Vitals
        if (eventType === 'core_web_vital') {
          this.buffer.webVitals.push(event);
          
          // Instead of scheduling separate batch flushes,
          // update the unified model directly for immediate vitals
          if (options.immediate === true) {
            this._updateWebVitalsInUnifiedModel();
          }
        } else {
          // Add to event buffer
          this.buffer.events.push(event);
        }
        
        return true;
      },

      // Public methods for manual data collection
      collectPerformanceMetrics: function() {
        this._collectResources();
        this._updateWebVitalsInUnifiedModel();
        return true;
      },
      
      // Manual send method
      sendCollectedData: function(useBeacon = false) {
        this._prepareFinalDataAndSend(useBeacon);
        return true;
      },

      // Add a debug method to check state
      debug: function() {
        return {
          sessionId: this.sessionId,
          apiKey: this.apiKey ? `${this.apiKey.substring(0, 4)}...` : 'None',
          endpoint: this.endpoint,
          bufferState: {
            events: this.buffer.events.length,
            resources: this.buffer.resources.length,
            webVitals: this.buffer.webVitals.length
          },
          collectionState: {
            pageLoaded: this.collectionState.pageLoaded,
            interactionCount: this.collectionState.interactionCount,
            lastResourceFlush: new Date(this.collectionState.lastResourceFlush).toISOString(),
            lastEventFlush: new Date(this.collectionState.lastEventFlush).toISOString(),
            resourceHashMapSize: Object.keys(this.collectionState.resourceHashMap).length,
            lastVisibilityChange: new Date(this.collectionState.lastVisibilityChange).toISOString(),
            visibilityState: this.collectionState.visibilityState,
            sentResourceURLsCount: this.collectionState.sentResourceURLs.size
          },
          configuration: this.batchConfig,
          resourceCaptureResult: this.captureResourceData('debug')
        };
      },

      // Add method to set up AJAX monitoring
      _setupAjaxMonitoring: function() {
        setupAjaxMonitoring(this);
      },

      // Add AJAX flushing method
      _flushAjaxCalls: function(useBeacon = false) {
        this.flushManager.flushAjaxCalls(useBeacon);
      }
    };

    // Export to window
    window.Optima = Optima;
    
    // Command queue processor function
    function optimaHandler() {
      var args = Array.prototype.slice.call(arguments);
      var command = args[0];
      
      console.log('[Optima Debug] Command received:', command, args.slice(1));
      
      if (command === 'init') {
        // Initialize Optima with API key and config
        var apiKey = args[1] || null;
        var config = args[2] || {};
        config.apiKey = apiKey;
        console.log('[Optima Debug] Initializing SDK with apiKey:', apiKey?.substring(0, 4) + '***', 'and config:', config);
        window.optimaInstance = new Optima(config);
        return window.optimaInstance;
      }
      
      // Other commands require an instance
      if (!window.optimaInstance) {
        console.warn('[Optima Debug] Command executed before initialization:', command);
        return false;
      }
      
      // Handle other commands
      switch (command) {
        case 'event':
          console.log('[Optima Debug] Sending event:', args[1], args[2]);
          return window.optimaInstance.sendEvent(args[1], args[2], args[3]);
        
        case 'captureResources':
          console.log('[Optima Debug] Capturing resources manually');
          return window.optimaInstance.captureResourceData('manual');
        
        case 'flushBuffers':
          console.log('[Optima Debug] Flushing buffers, useBeacon:', args[1] === true);
          return window.optimaInstance.sendCollectedData(args[1] === true);
        
        case 'debug':
          console.log('[Optima Debug] Debug info requested');
          return window.optimaInstance.debug();
          
        default:
          console.warn('[Optima Debug] Unknown command:', command);
          return false;
      }
    }
    
    // Process any queued commands from the loader
    if (typeof window.optima === 'function') {
      console.log('[Optima Debug] Processing queued commands');
      var originalOptima = window.optima;
      window.optima = optimaHandler;
      
      if (originalOptima.q && originalOptima.q.length) {
        console.log('[Optima Debug] Found', originalOptima.q.length, 'queued commands');
        for (var i = 0; i < originalOptima.q.length; i++) {
          console.log('[Optima Debug] Processing queued command:', originalOptima.q[i][0]);
          optimaHandler.apply(window, originalOptima.q[i]);
        }
      }
    } else {
      console.log('[Optima Debug] No queued commands found, setting up optima handler');
      window.optima = optimaHandler;
    }
    
  })(window);

})();
