/**
 * Test file for Community Like & Bookmark Features
 * Mở browser console và paste đoạn code này để test
 */

// Test localStorage functions
console.log('=== TESTING COMMUNITY LIKE & BOOKMARK FEATURES ===');

// 1. Test localStorage for liked posts
const testUserId = 'test_user_123';
const testLikedPosts = [1, 3, 5, 7];
const testBookmarkedPosts = [2, 4, 6];

// Save test data
localStorage.setItem(`likedPosts_${testUserId}`, JSON.stringify(testLikedPosts));
localStorage.setItem(`bookmarkedPosts_${testUserId}`, JSON.stringify(testBookmarkedPosts));

console.log('✅ Test data saved to localStorage');

// 2. Read test data
const retrievedLiked = JSON.parse(localStorage.getItem(`likedPosts_${testUserId}`) || '[]');
const retrievedBookmarked = JSON.parse(localStorage.getItem(`bookmarkedPosts_${testUserId}`) || '[]');

console.log('📖 Retrieved liked posts:', retrievedLiked);
console.log('📖 Retrieved bookmarked posts:', retrievedBookmarked);

// 3. Test like toggle simulation
function simulateLikeToggle(postId, currentLiked) {
  console.log(`\n👍 Simulating like toggle for post ${postId}`);
  console.log(`Current liked posts:`, currentLiked);
  
  let newLiked;
  if (currentLiked.includes(postId)) {
    newLiked = currentLiked.filter(id => id !== postId);
    console.log(`❌ Removed like from post ${postId}`);
  } else {
    newLiked = [...currentLiked, postId];
    console.log(`✅ Added like to post ${postId}`);
  }
  
  console.log(`New liked posts:`, newLiked);
  return newLiked;
}

// 4. Test bookmark toggle simulation
function simulateBookmarkToggle(postId, currentBookmarked) {
  console.log(`\n📌 Simulating bookmark toggle for post ${postId}`);
  console.log(`Current bookmarked posts:`, currentBookmarked);
  
  let newBookmarked;
  if (currentBookmarked.includes(postId)) {
    newBookmarked = currentBookmarked.filter(id => id !== postId);
    console.log(`❌ Removed bookmark from post ${postId}`);
  } else {
    newBookmarked = [...currentBookmarked, postId];
    console.log(`✅ Added bookmark to post ${postId}`);
  }
  
  console.log(`New bookmarked posts:`, newBookmarked);
  return newBookmarked;
}

// Run tests
console.log('\n=== RUNNING SIMULATION TESTS ===');

// Test like toggles
let likedState = [...retrievedLiked];
likedState = simulateLikeToggle(1, likedState); // Should remove
likedState = simulateLikeToggle(2, likedState); // Should add
likedState = simulateLikeToggle(1, likedState); // Should add back

// Test bookmark toggles
let bookmarkState = [...retrievedBookmarked];
bookmarkState = simulateBookmarkToggle(2, bookmarkState); // Should remove
bookmarkState = simulateBookmarkToggle(8, bookmarkState); // Should add
bookmarkState = simulateBookmarkToggle(2, bookmarkState); // Should add back

// 5. Test post state merge simulation
function simulatePostStateMerge(posts, likedPosts, bookmarkedPosts) {
  console.log('\n🔄 Simulating post state merge...');
  
  return posts.map(post => {
    const isLiked = likedPosts.includes(parseInt(post.id));
    const isBookmarked = bookmarkedPosts.includes(parseInt(post.id));
    
    return {
      ...post,
      liked: isLiked,
      bookmarked: isBookmarked,
      className: `post-card ${post.pinned ? 'pinned' : ''} ${isBookmarked ? 'bookmarked-post' : ''}`
    };
  });
}

// Mock posts data
const mockPosts = [
  { id: 1, title: 'Post 1', likes: 5, pinned: false },
  { id: 2, title: 'Post 2', likes: 10, pinned: true },
  { id: 3, title: 'Post 3', likes: 3, pinned: false },
  { id: 4, title: 'Post 4', likes: 8, pinned: false },
];

const mergedPosts = simulatePostStateMerge(mockPosts, likedState, bookmarkState);
console.log('📝 Merged posts with state:', mergedPosts);

// 6. Test CSS class generation
console.log('\n🎨 CSS Classes for each post:');
mergedPosts.forEach(post => {
  console.log(`Post ${post.id}: ${post.className}`);
  console.log(`  - Liked: ${post.liked} | Bookmarked: ${post.bookmarked}`);
});

// 7. Cleanup
function cleanupTestData() {
  localStorage.removeItem(`likedPosts_${testUserId}`);
  localStorage.removeItem(`bookmarkedPosts_${testUserId}`);
  console.log('\n🧹 Test data cleaned up');
}

// Export test functions for manual use
window.communityTest = {
  simulateLikeToggle,
  simulateBookmarkToggle,
  simulatePostStateMerge,
  cleanupTestData,
  testUserId,
  mockPosts
};

console.log('\n✅ All tests completed! Use window.communityTest for manual testing.');
console.log('💡 Example: window.communityTest.simulateLikeToggle(1, [1,2,3])');

// Auto cleanup after 30 seconds
setTimeout(() => {
  cleanupTestData();
  console.log('⏰ Auto cleanup completed after 30 seconds');
}, 30000);
