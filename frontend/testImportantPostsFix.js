// Test fixes cho Important Posts
window.importantPostsTest = {
  // Test 1: Debug localStorage merge
  testStorageMerge: () => {
    console.log("🧪 TEST 1: Storage Merge Debug");
    
    const getUserStorageKey = (suffix) => {
      const currentUser = JSON.parse(localStorage.getItem("userData"));
      if (currentUser?.id) {
        return `user_${currentUser.id}_${suffix}`;
      }
      const token = localStorage.getItem("authToken");
      if (token) {
        const tokenSuffix = token.slice(-10);
        return `token_${tokenSuffix}_${suffix}`;
      }
      return `guest_${suffix}`;
    };

    const savedLikedPosts = JSON.parse(
      localStorage.getItem(getUserStorageKey("likedPosts")) || "[]"
    );
    
    console.log("📊 Current localStorage state:", {
      key: getUserStorageKey("likedPosts"),
      savedLikedPosts,
      keyExample: getUserStorageKey("bookmarkedPosts")
    });

    // Giả lập API response với important posts
    const mockApiResponse = {
      data: {
        content: [
          {
            id: "1",
            title: "Thông báo tuyển tình nguyện viên y tế",
            category: "announcement", // hoặc "important"
            liked: false,
            likes: 10,
            likesCount: 10
          },
          {
            id: "2", 
            title: "Thông báo lịch khám sức khỏe định kỳ",
            category: "health",
            liked: false,
            likes: 11,
            likesCount: 11
          }
        ]
      }
    };

    console.log("🔄 Mock API response:", mockApiResponse);

    // Test merge logic
    const mergedLikedPosts = [...savedLikedPosts];
    
    mockApiResponse.data.content.forEach((post) => {
      const postId = parseInt(post.id);
      console.log(`📝 Processing post ${postId}:`, {
        postId,
        apiLiked: post.liked,
        inLocalStorage: savedLikedPosts.includes(postId),
        likes: post.likes,
        likesCount: post.likesCount
      });
      
      if (post.liked && !mergedLikedPosts.includes(postId)) {
        mergedLikedPosts.push(postId);
        console.log(`✅ Added ${postId} to liked posts`);
      }
    });

    console.log("📊 Merge result:", {
      before: savedLikedPosts,
      after: mergedLikedPosts,
      changed: savedLikedPosts.length !== mergedLikedPosts.length
    });
  },

  // Test 2: Simulate like action for important post
  testImportantPostLike: async () => {
    console.log("🧪 TEST 2: Important Post Like Simulation");
    
    // Mock post data
    const importantPost = {
      id: "1",
      title: "Thông báo tuyển tình nguyện viên y tế",
      category: "announcement",
      likes: 9,
      likesCount: 9
    };

    console.log("📝 Before like:", {
      postId: importantPost.id,
      currentLikes: importantPost.likes,
      category: importantPost.category
    });

    // Simulate API response after like
    const mockApiResponse = {
      status: "success",
      data: {
        liked: true,
        likesCount: 10,
        likes: 10
      }
    };

    console.log("🔄 Mock API response after like:", mockApiResponse);

    // Test logic cập nhật
    const { liked, likesCount, likes } = mockApiResponse.data;
    const actualLikesCount = likesCount !== undefined ? likesCount : likes;

    console.log("✅ Expected UI update:", {
      liked,
      actualLikesCount,
      shouldShowRedHeart: liked,
      displayCount: actualLikesCount
    });

    // Test localStorage update
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

    const postId = parseInt(importantPost.id);
    const newLikedPosts = liked 
      ? [...currentLikedPosts.filter(id => id !== postId), postId]
      : currentLikedPosts.filter(id => id !== postId);

    console.log("💾 LocalStorage update:", {
      key: getUserStorageKey("likedPosts"),
      before: currentLikedPosts,
      after: newLikedPosts,
      postId: postId,
      action: liked ? 'ADDED' : 'REMOVED'
    });

    // Thực tế update localStorage để test
    localStorage.setItem(
      getUserStorageKey("likedPosts"), 
      JSON.stringify(newLikedPosts)
    );

    console.log("✅ Test completed - check Community component for updates");
  },

  // Test 3: Check console logs trong handlePostLike
  monitorLikeActions: () => {
    console.log("🧪 TEST 3: Monitor Like Actions");
    console.log("👀 Watching console for handlePostLike logs...");
    console.log("📋 Look for these patterns:");
    console.log("  - '👍 BEFORE Like action:'");
    console.log("  - '👍 AFTER API call:'");
    console.log("  - '👍 Updating likedPosts:'");
    console.log("  - '✅ [Like action] bài viết thành công!'");
    
    console.log("🎯 Now try liking an important post and watch the logs!");
  },

  // Test 4: Compare API vs UI state
  compareApiVsUI: () => {
    console.log("🧪 TEST 4: API vs UI State Comparison");
    
    // Check current DOM state
    const likeButtons = document.querySelectorAll('.like-btn');
    console.log("🔍 Found like buttons:", likeButtons.length);
    
    likeButtons.forEach((btn, index) => {
      const likeCount = btn.textContent.trim().split(' ').pop();
      const isLiked = btn.classList.contains('liked');
      const heartIcon = btn.querySelector('i');
      const isRedHeart = heartIcon?.classList.contains('fas');
      
      console.log(`📊 Button ${index + 1}:`, {
        displayedCount: likeCount,
        isLiked,
        isRedHeart,
        expectedMatch: isLiked === isRedHeart
      });
    });

    // Check localStorage state
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

  // Test 5: Run all tests
  runAllTests: () => {
    console.log("🧪 Running ALL Important Posts Tests");
    console.log("================================");
    
    window.importantPostsTest.testStorageMerge();
    console.log("--------------------------------");
    
    window.importantPostsTest.testImportantPostLike();
    console.log("--------------------------------");
    
    window.importantPostsTest.monitorLikeActions();
    console.log("--------------------------------");
    
    window.importantPostsTest.compareApiVsUI();
    console.log("================================");
    console.log("✅ All tests completed!");
  }
};

console.log("🧪 Important Posts Test Suite Loaded!");
console.log("📋 Available commands:");
console.log("  - window.importantPostsTest.runAllTests()");
console.log("  - window.importantPostsTest.testStorageMerge()");
console.log("  - window.importantPostsTest.testImportantPostLike()"); 
console.log("  - window.importantPostsTest.monitorLikeActions()");
console.log("  - window.importantPostsTest.compareApiVsUI()");
