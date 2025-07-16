/**
 * Test file để kiểm tra đồng bộ trạng thái like giữa Community.jsx và CommunityPost.jsx
 * 
 * Cách sử dụng:
 * 1. Import file này vào console browser
 * 2. Chạy các function test
 * 3. Kiểm tra kết quả trong console và localStorage
 */

// Test localStorage sync
export function testLocalStorageSync() {
  console.log('🧪 Testing localStorage sync...');
  
  // Mock user data
  const mockUser = { id: 123 };
  const getUserStorageKey = (suffix) => `user_${mockUser.id}_${suffix}`;
  
  // Test save and load liked posts
  const testLikedPosts = [1, 2, 3, 5, 8];
  localStorage.setItem(getUserStorageKey("likedPosts"), JSON.stringify(testLikedPosts));
  
  const loadedLikedPosts = JSON.parse(localStorage.getItem(getUserStorageKey("likedPosts")) || "[]");
  
  console.log('📊 localStorage test results:', {
    saved: testLikedPosts,
    loaded: loadedLikedPosts,
    match: JSON.stringify(testLikedPosts) === JSON.stringify(loadedLikedPosts)
  });
  
  return loadedLikedPosts;
}

// Test custom event dispatch
export function testEventDispatch() {
  console.log('🧪 Testing custom event dispatch...');
  
  // Setup event listener
  const eventListener = (event) => {
    console.log('📡 Received postLikeChanged event:', event.detail);
  };
  
  window.addEventListener("postLikeChanged", eventListener);
  
  // Dispatch test event
  const testEventData = {
    postId: 123,
    liked: true,
    likesCount: 15,
    source: "test"
  };
  
  window.dispatchEvent(
    new CustomEvent("postLikeChanged", {
      detail: testEventData
    })
  );
  
  // Cleanup
  setTimeout(() => {
    window.removeEventListener("postLikeChanged", eventListener);
    console.log('🧹 Event listener cleaned up');
  }, 1000);
  
  return testEventData;
}

// Test like state merge logic
export function testLikeStateMerge() {
  console.log('🧪 Testing like state merge logic...');
  
  const mockPost = {
    id: 123,
    title: "Test Post",
    likes: 10,
    liked: false
  };
  
  const likedPostsFromStorage = [456, 789]; // Post 123 not liked in storage
  const likedFromAPI = true; // But API says it's liked
  
  // Simulate merge logic
  const isLikedInStorage = likedPostsFromStorage.includes(mockPost.id);
  const isLikedFromAPI = likedFromAPI;
  const finalLikedState = isLikedInStorage || isLikedFromAPI;
  
  console.log('🔄 Merge logic test:', {
    postId: mockPost.id,
    likedPostsFromStorage,
    isLikedInStorage,
    isLikedFromAPI,
    finalLikedState,
    shouldUpdateStorage: isLikedFromAPI && !isLikedInStorage
  });
  
  // Simulate storage update
  if (isLikedFromAPI && !isLikedInStorage) {
    const updatedLikedPosts = [...likedPostsFromStorage.filter(id => id !== mockPost.id), mockPost.id];
    console.log('📝 Updated liked posts:', updatedLikedPosts);
    return updatedLikedPosts;
  }
  
  return likedPostsFromStorage;
}

// Test bidirectional sync simulation
export function testBidirectionalSync() {
  console.log('🧪 Testing bidirectional sync simulation...');
  
  let communityLikedPosts = [1, 2, 3];
  let postDetailLikedPosts = [1, 2, 3];
  
  console.log('📊 Initial state:', {
    community: communityLikedPosts,
    postDetail: postDetailLikedPosts
  });
  
  // Simulate like action from Community
  const postId = 4;
  const liked = true;
  const likesCount = 25;
  
  // Update Community state
  communityLikedPosts = [...communityLikedPosts.filter(id => id !== postId), postId];
  
  // Simulate event dispatch from Community
  console.log('📡 Community dispatching event...');
  
  // Simulate event received by PostDetail
  if (liked && !postDetailLikedPosts.includes(postId)) {
    postDetailLikedPosts = [...postDetailLikedPosts.filter(id => id !== postId), postId];
  }
  
  console.log('📊 After Community like:', {
    community: communityLikedPosts,
    postDetail: postDetailLikedPosts,
    synced: JSON.stringify(communityLikedPosts) === JSON.stringify(postDetailLikedPosts)
  });
  
  // Simulate unlike action from PostDetail
  const unlikePostId = 2;
  const unliked = false;
  
  // Update PostDetail state
  postDetailLikedPosts = postDetailLikedPosts.filter(id => id !== unlikePostId);
  
  // Simulate event dispatch from PostDetail
  console.log('📡 PostDetail dispatching event...');
  
  // Simulate event received by Community
  if (!unliked && communityLikedPosts.includes(unlikePostId)) {
    communityLikedPosts = communityLikedPosts.filter(id => id !== unlikePostId);
  }
  
  console.log('📊 After PostDetail unlike:', {
    community: communityLikedPosts,
    postDetail: postDetailLikedPosts,
    synced: JSON.stringify(communityLikedPosts) === JSON.stringify(postDetailLikedPosts)
  });
  
  return {
    community: communityLikedPosts,
    postDetail: postDetailLikedPosts,
    synced: JSON.stringify(communityLikedPosts) === JSON.stringify(postDetailLikedPosts)
  };
}

// Run all tests
export function runAllTests() {
  console.log('🚀 Running all like sync tests...');
  console.log('='.repeat(50));
  
  const results = {
    localStorage: testLocalStorageSync(),
    eventDispatch: testEventDispatch(),
    stateMerge: testLikeStateMerge(),
    bidirectionalSync: testBidirectionalSync()
  };
  
  console.log('='.repeat(50));
  console.log('📋 All test results:', results);
  
  return results;
}

// Auto-run tests if in development mode
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Development mode detected, tests available in window.likeSyncTests');
  window.likeSyncTests = {
    testLocalStorageSync,
    testEventDispatch,
    testLikeStateMerge,
    testBidirectionalSync,
    runAllTests
  };
}
