// Debug Like Count Issues - Test suite for debugging số like hiển thị sai
window.debugLikeCountIssues = {

  // Test 1: Check current posts data và like counts
  analyzeLikeCounts: () => {
    console.log("🔍 ANALYZING LIKE COUNT ISSUES");
    
    // Get DOM elements
    const likeButtons = document.querySelectorAll('.like-btn');
    
    console.log(`📊 Found ${likeButtons.length} like buttons in DOM`);
    
    likeButtons.forEach((btn, index) => {
      const postCard = btn.closest('.post-card');
      const postTitle = postCard?.querySelector('.post-title')?.textContent?.trim();
      
      // Extract like count from button text
      const buttonText = btn.textContent.trim();
      const likeCount = buttonText.match(/\d+/)?.[0];
      
      // Check if liked
      const isLiked = btn.classList.contains('liked');
      const heartIcon = btn.querySelector('i');
      const isRedHeart = heartIcon?.classList.contains('fas');
      
      console.log(`📌 Post ${index + 1}:`, {
        title: postTitle?.substring(0, 40) + '...',
        displayedLikeCount: likeCount,
        isLiked: isLiked,
        isRedHeart: isRedHeart,
        consistent: isLiked === isRedHeart,
        fullButtonText: buttonText
      });
    });
  },

  // Test 2: Check localStorage state vs DOM state
  checkStorageVsDOM: () => {
    console.log("💾 CHECKING LOCALSTORAGE VS DOM STATE");
    
    const getUserStorageKey = (suffix) => {
      const currentUser = JSON.parse(localStorage.getItem("userData"));
      if (currentUser?.id) {
        return `user_${currentUser.id}_${suffix}`;
      }
      return `guest_${suffix}`;
    };

    const savedLikedPosts = JSON.parse(
      localStorage.getItem(getUserStorageKey("likedPosts")) || "[]"
    );

    console.log("💾 LocalStorage liked posts:", savedLikedPosts);

    // Compare with DOM
    const likeButtons = document.querySelectorAll('.like-btn');
    const domLikedPosts = [];
    
    likeButtons.forEach((btn, index) => {
      if (btn.classList.contains('liked')) {
        // Try to extract post ID somehow - this is tricky from DOM
        domLikedPosts.push(index + 1); // Fallback to index
      }
    });

    console.log("🌐 DOM liked posts (by index):", domLikedPosts);
    console.log("🔄 Storage vs DOM match:", savedLikedPosts.length === domLikedPosts.length);
  },

  // Test 3: Simulate like action tracking
  simulateLikeAction: (postIndex = 0) => {
    console.log(`🎭 SIMULATING LIKE ACTION FOR POST ${postIndex + 1}`);
    
    const likeButtons = document.querySelectorAll('.like-btn');
    if (!likeButtons[postIndex]) {
      console.error("❌ Post not found at index:", postIndex);
      return;
    }

    const btn = likeButtons[postIndex];
    const beforeLikeCount = btn.textContent.trim().match(/\d+/)?.[0];
    const beforeLiked = btn.classList.contains('liked');

    console.log("👍 BEFORE click:", {
      postIndex,
      beforeLikeCount,
      beforeLiked,
      buttonClasses: btn.className
    });

    // Click the button
    btn.click();

    // Check after a delay
    setTimeout(() => {
      const afterLikeCount = btn.textContent.trim().match(/\d+/)?.[0];
      const afterLiked = btn.classList.contains('liked');

      console.log("👍 AFTER click:", {
        postIndex,
        afterLikeCount,
        afterLiked,
        changeInCount: parseInt(afterLikeCount) - parseInt(beforeLikeCount),
        expectedChange: beforeLiked ? -1 : +1,
        correctChange: (parseInt(afterLikeCount) - parseInt(beforeLikeCount)) === (beforeLiked ? -1 : +1)
      });

      // Additional analysis
      if ((parseInt(afterLikeCount) - parseInt(beforeLikeCount)) !== (beforeLiked ? -1 : +1)) {
        console.warn("🚨 LIKE COUNT ISSUE DETECTED!");
        console.warn("Expected change:", beforeLiked ? -1 : +1);
        console.warn("Actual change:", parseInt(afterLikeCount) - parseInt(beforeLikeCount));
      }
    }, 1000);
  },

  // Test 4: Check API response monitoring
  monitorAPIResponses: () => {
    console.log("🌐 MONITORING API RESPONSES");
    
    // Hook into fetch to monitor toggleLike API calls
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const [url, options] = args;
      
      if (url.includes('like') || url.includes('toggle')) {
        console.log("🔌 API CALL DETECTED:", {
          url: url,
          method: options?.method,
          body: options?.body
        });
      }
      
      return originalFetch.apply(this, args).then(response => {
        if (url.includes('like') || url.includes('toggle')) {
          response.clone().json().then(data => {
            console.log("📨 API RESPONSE:", {
              url: url,
              status: response.status,
              data: data
            });
          }).catch(() => {
            console.log("📨 API RESPONSE (no JSON):", {
              url: url,
              status: response.status
            });
          });
        }
        return response;
      });
    };

    console.log("✅ API monitoring activated. Try liking a post now.");
  },

  // Test 5: Check initial data load
  checkInitialDataLoad: () => {
    console.log("📥 CHECKING INITIAL DATA LOAD");
    
    // Monitor console for merge state logs
    const originalLog = console.log;
    let mergeStateDetected = false;
    
    console.log = function(...args) {
      const message = args[0];
      if (typeof message === 'string' && message.includes('Enhanced Merge state')) {
        mergeStateDetected = true;
        console.warn("🔍 MERGE STATE DETECTED:", ...args);
      }
      if (typeof message === 'string' && message.includes('Post') && message.includes('like analysis')) {
        console.warn("🔍 POST ANALYSIS DETECTED:", ...args);
      }
      originalLog.apply(console, args);
    };

    if (!mergeStateDetected) {
      console.log("💡 No merge state detected yet. Try refreshing the page.");
    }

    // Restore after 10 seconds
    setTimeout(() => {
      console.log = originalLog;
      console.log("🔄 Console monitoring stopped");
    }, 10000);
  },

  // Test 6: Check for date errors
  checkDateErrors: () => {
    console.log("📅 CHECKING DATE ERRORS");
    
    const originalWarn = console.warn;
    const originalError = console.error;
    const dateErrors = [];
    
    console.warn = function(...args) {
      if (args[0] && args[0].includes('Invalid date')) {
        dateErrors.push({
          type: 'warn',
          message: args[0],
          args: args
        });
      }
      originalWarn.apply(console, args);
    };

    console.error = function(...args) {
      if (args[0] && args[0].includes('date')) {
        dateErrors.push({
          type: 'error',
          message: args[0],
          args: args
        });
      }
      originalError.apply(console, args);
    };

    setTimeout(() => {
      console.warn = originalWarn;
      console.error = originalError;
      
      console.log("📅 Date errors found:", dateErrors.length);
      if (dateErrors.length > 0) {
        console.table(dateErrors);
      }
    }, 5000);

    console.log("📅 Date error monitoring activated for 5 seconds...");
  },

  // Run all tests
  runAllTests: () => {
    console.log("🧪 RUNNING ALL LIKE COUNT DEBUG TESTS");
    console.log("=====================================");
    
    window.debugLikeCountIssues.analyzeLikeCounts();
    console.log("-------------------------------------");
    
    window.debugLikeCountIssues.checkStorageVsDOM();
    console.log("-------------------------------------");
    
    window.debugLikeCountIssues.monitorAPIResponses();
    console.log("-------------------------------------");
    
    window.debugLikeCountIssues.checkInitialDataLoad();
    console.log("-------------------------------------");
    
    window.debugLikeCountIssues.checkDateErrors();
    console.log("=====================================");
    
    console.log("✅ All tests completed!");
    console.log("💡 Now try these manual actions:");
    console.log("1. Like/unlike a post and watch console");
    console.log("2. Use: window.debugLikeCountIssues.simulateLikeAction(0)");
    console.log("3. Refresh page and check merge logs");
  }
};

console.log("🔍 Like Count Debug Suite Loaded!");
console.log("📋 Available commands:");
console.log("  - window.debugLikeCountIssues.runAllTests()");
console.log("  - window.debugLikeCountIssues.analyzeLikeCounts()");
console.log("  - window.debugLikeCountIssues.simulateLikeAction(0)");
console.log("  - window.debugLikeCountIssues.monitorAPIResponses()");
console.log("");
console.log("🎯 Quick start: window.debugLikeCountIssues.runAllTests()");
