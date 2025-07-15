/**
 * Test file for Community fixes
 * Test: 1) User-based persistent storage 2) No official pins 3) Correct like count display
 */

console.log('=== TESTING COMMUNITY FIXES ===');

// 1. Test User-based Storage
function testUserBasedStorage() {
  console.log('\n👤 Testing User-based Storage:');
  
  // Mock user
  const mockUser = { id: 'user123', name: 'Test User' };
  const mockToken = 'eyJhbGci...token123';
  
  function getUserStorageKey(suffix, currentUser) {
    if (currentUser?.id) {
      return `user_${currentUser.id}_${suffix}`;
    }
    
    const token = localStorage.getItem("authToken");
    if (token) {
      const tokenSuffix = token.slice(-10);
      return `token_${tokenSuffix}_${suffix}`;
    }
    
    return `guest_${suffix}`;
  }
  
  // Test with user ID
  localStorage.setItem('authToken', mockToken);
  const userKey = getUserStorageKey('likedPosts', mockUser);
  console.log('✅ With user ID:', userKey);
  
  // Test with token only
  const tokenKey = getUserStorageKey('likedPosts', null);
  console.log('✅ With token only:', tokenKey);
  
  // Test guest
  localStorage.removeItem('authToken');
  const guestKey = getUserStorageKey('likedPosts', null);
  console.log('✅ Guest mode:', guestKey);
  
  // Test persistence
  const testLikedPosts = [1, 3, 5];
  localStorage.setItem('authToken', mockToken);
  const finalKey = getUserStorageKey('likedPosts', mockUser);
  localStorage.setItem(finalKey, JSON.stringify(testLikedPosts));
  
  // Simulate logout and login
  localStorage.removeItem('authToken');
  localStorage.setItem('authToken', mockToken);
  
  const retrievedPosts = JSON.parse(localStorage.getItem(finalKey) || '[]');
  console.log('💾 Saved:', testLikedPosts);
  console.log('📖 Retrieved after login:', retrievedPosts);
  
  // Cleanup
  localStorage.removeItem('authToken');
  localStorage.removeItem(finalKey);
  
  console.log('✅ User-based storage test completed');
}

// 2. Test Pin Display Logic (No Official Pins)
function testPinDisplayLogic() {
  console.log('\n📌 Testing Pin Display Logic (Personal Only):');
  
  const mockPosts = [
    { id: 1, title: 'Regular post', pinned: false },
    { id: 2, title: 'User bookmarked post', pinned: false },
    { id: 3, title: 'Old official pinned post', pinned: true }, // Should be ignored
    { id: 4, title: 'Another regular post', pinned: false }
  ];
  
  const bookmarkedPosts = [2]; // User only bookmarked post 2
  
  function getDisplayInfo(post, bookmarkedPosts) {
    const isBookmarked = bookmarkedPosts.includes(parseInt(post.id));
    
    return {
      id: post.id,
      title: post.title,
      showPin: isBookmarked, // Only show pin for bookmarked
      pinType: isBookmarked ? 'personal' : null,
      className: isBookmarked ? 'post-card pinned bookmarked-post' : 'post-card',
      pinText: isBookmarked ? 'Bài viết đã ghim' : null
    };
  }
  
  mockPosts.forEach(post => {
    const info = getDisplayInfo(post, bookmarkedPosts);
    console.log(`Post ${info.id}: ${info.title}`);
    console.log(`  - Show Pin: ${info.showPin ? '✅' : '❌'}`);
    console.log(`  - Pin Type: ${info.pinType || 'none'}`);
    console.log(`  - CSS Class: ${info.className}`);
    console.log(`  - Pin Text: ${info.pinText || 'none'}`);
    console.log('');
  });
}

// 3. Test Like Count Display Logic
function testLikeCountDisplay() {
  console.log('\n❤️ Testing Like Count Display:');
  
  const mockApiResponse = {
    status: 'success',
    data: {
      liked: true,
      likesCount: 11, // API returns correct count
      likes: 11 // Alternative field
    }
  };
  
  function processLikeResponse(response) {
    const { liked, likesCount, likes } = response.data;
    const actualLikesCount = likesCount !== undefined ? likesCount : likes;
    
    console.log('📥 API Response:', { liked, likesCount, likes });
    console.log('🔢 Actual count to display:', actualLikesCount);
    
    return { liked, actualLikesCount };
  }
  
  const result = processLikeResponse(mockApiResponse);
  console.log('✅ Final result:', result);
  
  // Test post update
  const mockPost = { id: 1, title: 'Test Post', likes: 10 };
  console.log('\n📝 Before like:', mockPost);
  
  const updatedPost = {
    ...mockPost,
    likes: result.actualLikesCount,
    likesCount: result.actualLikesCount,
    liked: result.liked
  };
  
  console.log('📝 After like:', updatedPost);
  
  // Test display fallback
  function getDisplayLikes(post) {
    return post.likes || post.likesCount || 0;
  }
  
  console.log('🖥️ UI will show:', getDisplayLikes(updatedPost), 'likes');
}

// 4. Test Complete Flow
function testCompleteFlow() {
  console.log('\n🔗 Testing Complete Flow:');
  
  // Setup
  const mockUser = { id: 'user456', name: 'Test User' };
  const mockToken = 'token123456789';
  localStorage.setItem('authToken', mockToken);
  
  function getUserStorageKey(suffix, currentUser) {
    if (currentUser?.id) {
      return `user_${currentUser.id}_${suffix}`;
    }
    return `token_${mockToken.slice(-10)}_${suffix}`;
  }
  
  // User likes and bookmarks posts
  const likedPosts = [1, 3];
  const bookmarkedPosts = [2];
  
  // Save to localStorage
  localStorage.setItem(getUserStorageKey('likedPosts', mockUser), JSON.stringify(likedPosts));
  localStorage.setItem(getUserStorageKey('bookmarkedPosts', mockUser), JSON.stringify(bookmarkedPosts));
  
  console.log('💾 User state saved to localStorage');
  
  // Simulate logout
  localStorage.removeItem('authToken');
  console.log('🚪 User logged out');
  
  // Simulate login with same user
  localStorage.setItem('authToken', mockToken);
  
  // Load state
  const retrievedLiked = JSON.parse(localStorage.getItem(getUserStorageKey('likedPosts', mockUser)) || '[]');
  const retrievedBookmarked = JSON.parse(localStorage.getItem(getUserStorageKey('bookmarkedPosts', mockUser)) || '[]');
  
  console.log('🔐 User logged back in');
  console.log('📖 Liked posts restored:', retrievedLiked);
  console.log('📖 Bookmarked posts restored:', retrievedBookmarked);
  
  // Test post display
  const mockPosts = [
    { id: 1, title: 'Liked post', likes: 15 },
    { id: 2, title: 'Bookmarked post', likes: 8 },
    { id: 3, title: 'Liked and bookmarked post', likes: 22 }
  ];
  
  console.log('\n📱 Post display states:');
  mockPosts.forEach(post => {
    const isLiked = retrievedLiked.includes(post.id);
    const isBookmarked = retrievedBookmarked.includes(post.id);
    
    console.log(`Post ${post.id}: ${post.title}`);
    console.log(`  - Like button: ${isLiked ? '❤️ (red)' : '♡ (white)'}`);
    console.log(`  - Like count: ${post.likes}`);
    console.log(`  - Pin indicator: ${isBookmarked ? '📌 Bài viết đã ghim' : 'none'}`);
    console.log(`  - CSS class: ${isBookmarked ? 'post-card pinned bookmarked-post' : 'post-card'}`);
    console.log('');
  });
  
  // Cleanup
  localStorage.removeItem('authToken');
  localStorage.removeItem(getUserStorageKey('likedPosts', mockUser));
  localStorage.removeItem(getUserStorageKey('bookmarkedPosts', mockUser));
  
  console.log('✅ Complete flow test completed');
}

// 5. Test API Integration
function testAPIIntegration() {
  console.log('\n🌐 Testing API Integration:');
  
  // Mock API responses
  const mockLikeResponse = {
    status: 'success',
    data: {
      liked: true,
      likesCount: 12,
      likes: 12
    }
  };
  
  const mockBookmarkResponse = {
    status: 'success', 
    data: {
      bookmarked: true
    }
  };
  
  console.log('📥 Mock like API response:', mockLikeResponse);
  console.log('📥 Mock bookmark API response:', mockBookmarkResponse);
  
  // Process responses
  function handleLikeResponse(response, postId) {
    const { liked, likesCount, likes } = response.data;
    const actualCount = likesCount !== undefined ? likesCount : likes;
    
    console.log(`👍 Post ${postId} like result:`);
    console.log(`  - Is liked: ${liked}`);
    console.log(`  - New count: ${actualCount}`);
    
    return { liked, actualCount };
  }
  
  function handleBookmarkResponse(response, postId) {
    const { bookmarked } = response.data;
    
    console.log(`📌 Post ${postId} bookmark result:`);
    console.log(`  - Is bookmarked: ${bookmarked}`);
    
    return { bookmarked };
  }
  
  const likeResult = handleLikeResponse(mockLikeResponse, 1);
  const bookmarkResult = handleBookmarkResponse(mockBookmarkResponse, 1);
  
  console.log('✅ API integration test completed');
}

// Run all tests
testUserBasedStorage();
testPinDisplayLogic();
testLikeCountDisplay();
testCompleteFlow();
testAPIIntegration();

console.log('\n🎉 All Community fixes tests completed!');

// Export for manual testing
window.communityFixesTest = {
  testUserBasedStorage,
  testPinDisplayLogic,
  testLikeCountDisplay,
  testCompleteFlow,
  testAPIIntegration
};
