// Debug Unlike Action - Kiểm tra lỗi khi bỏ tim bài viết
window.debugUnlikeError = {
  
  // Test 1: Monitor unlike action với detailed logging
  monitorUnlikeAction: () => {
    console.log("🔍 UNLIKE DEBUG: Monitoring unlike actions...");
    console.log("📋 Steps to debug:");
    console.log("1. Click unlike on a post");
    console.log("2. Watch console for error patterns");
    console.log("3. Check API response structure");
    
    // Hook vào console.error để catch unlike errors
    const originalError = console.error;
    console.error = function(...args) {
      if (args[0] && args[0].includes('Error liking post')) {
        console.log("🚨 UNLIKE ERROR DETECTED:", ...args);
        console.log("📊 Error analysis:", {
          timestamp: new Date().toLocaleTimeString(),
          args: args,
          stack: new Error().stack
        });
      }
      originalError.apply(console, args);
    };
    
    console.log("✅ Error monitoring activated!");
  },

  // Test 2: Simulate unlike với different scenarios
  testUnlikeScenarios: () => {
    console.log("🧪 UNLIKE SCENARIOS TEST");
    
    const mockScenarios = [
      {
        name: "Normal Unlike",
        beforeState: { likes: 2, liked: true },
        apiResponse: { status: "success", data: { liked: false, likesCount: 1 } },
        expected: { likes: 1, liked: false }
      },
      {
        name: "Unlike to Zero",
        beforeState: { likes: 1, liked: true },
        apiResponse: { status: "success", data: { liked: false, likesCount: 0 } },
        expected: { likes: 0, liked: false }
      },
      {
        name: "API Error Response",
        beforeState: { likes: 2, liked: true },
        apiResponse: { status: "error", message: "User not found" },
        expected: { likes: 2, liked: true } // Should remain unchanged
      },
      {
        name: "Network Error",
        beforeState: { likes: 2, liked: true },
        apiResponse: null, // Network error
        expected: { likes: 2, liked: true } // Should remain unchanged
      }
    ];

    mockScenarios.forEach((scenario, index) => {
      console.log(`📝 Scenario ${index + 1}: ${scenario.name}`);
      console.log("  Before:", scenario.beforeState);
      console.log("  API Response:", scenario.apiResponse);
      console.log("  Expected:", scenario.expected);
      console.log("  ---");
    });
  },

  // Test 3: Check current posts state
  checkCurrentPostsState: () => {
    console.log("📊 CURRENT POSTS STATE CHECK");
    
    // Try to access React state (if available)
    const likeButtons = document.querySelectorAll('.like-btn');
    console.log(`🔍 Found ${likeButtons.length} like buttons`);
    
    likeButtons.forEach((btn, index) => {
      const isLiked = btn.classList.contains('liked');
      const likeCount = btn.textContent.trim().match(/\d+/)?.[0] || '0';
      const heartIcon = btn.querySelector('i');
      const isRedHeart = heartIcon?.classList.contains('fas');
      
      console.log(`📌 Post ${index + 1}:`, {
        isLiked,
        likeCount,
        isRedHeart,
        consistent: isLiked === isRedHeart,
        buttonElement: btn
      });
    });
    
    // Check localStorage
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

    console.log("💾 LocalStorage state:", {
      key: getUserStorageKey("likedPosts"),
      likedPosts: savedLikedPosts
    });
  },

  // Test 4: Manual unlike simulation
  simulateUnlike: (postId = 1) => {
    console.log(`🎭 SIMULATING UNLIKE for Post ID: ${postId}`);
    
    const numericPostId = parseInt(postId);
    
    // Get current state
    const getUserStorageKey = (suffix) => {
      const currentUser = JSON.parse(localStorage.getItem("userData"));
      if (currentUser?.id) {
        return `user_${currentUser.id}_${suffix}`;
      }
      return `guest_${suffix}`;
    };

    const currentLikedPosts = JSON.parse(
      localStorage.getItem(getUserStorageKey("likedPosts")) || "[]"
    );

    console.log("👍 BEFORE Unlike simulation:", {
      postId: numericPostId,
      currentLikedPosts,
      isCurrentlyLiked: currentLikedPosts.includes(numericPostId)
    });

    // Simulate API response scenarios
    const scenarios = [
      {
        name: "Success Response",
        response: {
          status: "success",
          data: {
            liked: false,
            likesCount: 1,
            likes: 1
          }
        }
      },
      {
        name: "Error Response",
        response: {
          status: "error",
          message: "Database error"
        }
      },
      {
        name: "Invalid Response Structure",
        response: {
          success: true, // Wrong field name
          result: { liked: false, count: 1 } // Wrong structure
        }
      }
    ];

    scenarios.forEach((scenario) => {
      console.log(`🔄 Testing: ${scenario.name}`);
      
      try {
        const { status, data } = scenario.response;
        
        if (status === "success") {
          const { liked, likesCount, likes } = data;
          const actualLikesCount = likesCount !== undefined ? likesCount : likes;
          
          // Update logic
          const newLikedPosts = liked 
            ? [...currentLikedPosts.filter(id => id !== numericPostId), numericPostId]
            : currentLikedPosts.filter(id => id !== numericPostId);
          
          console.log("  ✅ Success scenario result:", {
            liked,
            actualLikesCount,
            newLikedPosts,
            action: liked ? 'ADDED' : 'REMOVED'
          });
        } else {
          console.log("  ❌ Error scenario:", scenario.response);
        }
      } catch (error) {
        console.log("  🚨 Scenario caused error:", error.message);
      }
      
      console.log("  ---");
    });
  },

  // Test 5: Check API service
  testCommunityService: async () => {
    console.log("🔌 TESTING COMMUNITY SERVICE");
    
    // Check if communityService is available
    if (typeof communityService !== 'undefined') {
      console.log("✅ communityService is available");
      console.log("📋 Available methods:", Object.keys(communityService));
    } else {
      console.log("❌ communityService not found in global scope");
    }
    
    // Try to check toggleLike method structure
    try {
      console.log("🔍 Checking toggleLike method...");
      // Don't actually call it, just check if it exists
      console.log("toggleLike exists:", typeof communityService?.toggleLike === 'function');
    } catch (error) {
      console.log("❌ Error checking communityService:", error.message);
    }
  },

  // Test 6: Check network tab for API calls
  checkNetworkCalls: () => {
    console.log("🌐 NETWORK CALLS CHECK");
    console.log("📋 Manual steps:");
    console.log("1. Open DevTools → Network tab");
    console.log("2. Filter by 'like' or 'toggle'");
    console.log("3. Click unlike on a post");
    console.log("4. Check API call details:");
    console.log("   - Request URL");
    console.log("   - Request method (POST/PUT/DELETE)");
    console.log("   - Request payload");
    console.log("   - Response status");
    console.log("   - Response body");
    console.log("5. Look for error patterns:");
    console.log("   - 400: Bad Request");
    console.log("   - 401: Unauthorized");
    console.log("   - 404: Not Found");
    console.log("   - 500: Server Error");
  },

  // Run all tests
  runAllTests: () => {
    console.log("🧪 RUNNING ALL UNLIKE DEBUG TESTS");
    console.log("===================================");
    
    window.debugUnlikeError.monitorUnlikeAction();
    console.log("---");
    
    window.debugUnlikeError.testUnlikeScenarios();
    console.log("---");
    
    window.debugUnlikeError.checkCurrentPostsState();
    console.log("---");
    
    window.debugUnlikeError.simulateUnlike(1);
    console.log("---");
    
    window.debugUnlikeError.testCommunityService();
    console.log("---");
    
    window.debugUnlikeError.checkNetworkCalls();
    console.log("===================================");
    console.log("✅ All tests completed!");
    console.log("📝 Now try to unlike a post and watch the console");
  }
};

console.log("🚨 Unlike Error Debug Suite Loaded!");
console.log("📋 Available commands:");
console.log("  - window.debugUnlikeError.runAllTests()");
console.log("  - window.debugUnlikeError.monitorUnlikeAction()");
console.log("  - window.debugUnlikeError.checkCurrentPostsState()");
console.log("  - window.debugUnlikeError.simulateUnlike(postId)");
console.log("");
console.log("🎯 Quick start: window.debugUnlikeError.runAllTests()");
