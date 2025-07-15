/**
 * Test file cho các cải tiến Community mới
 * Test: 1) Token-based storage 2) Author name formatting 3) Pin display logic
 */

console.log('=== TESTING COMMUNITY IMPROVEMENTS ===');

// 1. Test Token-based Storage
function testTokenStorage() {
  console.log('\n🔑 Testing Token-based Storage:');
  
  // Mock token
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  
  // Simulate setting token
  localStorage.setItem('authToken', mockToken);
  
  // Test storage key generation
  function getUserStorageKey(suffix) {
    const token = localStorage.getItem("authToken");
    if (!token) return `guest_${suffix}`;
    
    const tokenSuffix = token.slice(-10);
    return `${tokenSuffix}_${suffix}`;
  }
  
  const likedKey = getUserStorageKey('likedPosts');
  const bookmarkKey = getUserStorageKey('bookmarkedPosts');
  
  console.log('✅ Token suffix:', mockToken.slice(-10));
  console.log('✅ Liked posts key:', likedKey);
  console.log('✅ Bookmarked posts key:', bookmarkKey);
  
  // Test saving/loading data
  const testLikedPosts = [1, 3, 5];
  const testBookmarkedPosts = [2, 4];
  
  localStorage.setItem(likedKey, JSON.stringify(testLikedPosts));
  localStorage.setItem(bookmarkKey, JSON.stringify(testBookmarkedPosts));
  
  const retrievedLiked = JSON.parse(localStorage.getItem(likedKey) || '[]');
  const retrievedBookmarked = JSON.parse(localStorage.getItem(bookmarkKey) || '[]');
  
  console.log('💾 Saved liked posts:', testLikedPosts);
  console.log('📖 Retrieved liked posts:', retrievedLiked);
  console.log('💾 Saved bookmarked posts:', testBookmarkedPosts);
  console.log('📖 Retrieved bookmarked posts:', retrievedBookmarked);
  
  // Cleanup
  localStorage.removeItem(likedKey);
  localStorage.removeItem(bookmarkKey);
  localStorage.removeItem('authToken');
  
  console.log('🧹 Token storage test completed');
}

// 2. Test Author Name Formatting
function testAuthorNameFormatting() {
  console.log('\n👤 Testing Author Name Formatting:');
  
  function formatAuthorName(authorName, role) {
    if (!authorName) return "Người dùng";
    
    const lowerName = authorName.toLowerCase();
    
    if (lowerName.startsWith('nurse')) {
      return "Y tá trường";
    } else if (lowerName.startsWith('admin')) {
      return "Quản trị viên";
    } else if (lowerName.startsWith('parent')) {
      return "Phụ huynh";
    }
    
    return authorName;
  }
  
  const testCases = [
    { input: 'nurse1', expected: 'Y tá trường' },
    { input: 'nurse2', expected: 'Y tá trường' },
    { input: 'admin1', expected: 'Quản trị viên' },
    { input: 'admin2', expected: 'Quản trị viên' },
    { input: 'parent1', expected: 'Phụ huynh' },
    { input: 'parent2', expected: 'Phụ huynh' },
    { input: 'Nguyễn Văn A', expected: 'Nguyễn Văn A' },
    { input: null, expected: 'Người dùng' },
    { input: '', expected: 'Người dùng' }
  ];
  
  testCases.forEach((testCase, index) => {
    const result = formatAuthorName(testCase.input);
    const passed = result === testCase.expected;
    
    console.log(`Test ${index + 1}: "${testCase.input}" => "${result}" ${passed ? '✅' : '❌'}`);
    if (!passed) {
      console.log(`   Expected: "${testCase.expected}"`);
    }
  });
}

// 3. Test Pin Display Logic
function testPinDisplayLogic() {
  console.log('\n📌 Testing Pin Display Logic:');
  
  const mockPosts = [
    { id: 1, title: 'Official pinned post', pinned: true },
    { id: 2, title: 'User bookmarked post', pinned: false },
    { id: 3, title: 'Both pinned and bookmarked', pinned: true },
    { id: 4, title: 'Regular post', pinned: false }
  ];
  
  const bookmarkedPosts = [2, 3]; // User bookmarked posts 2 and 3
  
  function getPinDisplayInfo(post, bookmarkedPosts) {
    const isBookmarked = bookmarkedPosts.includes(parseInt(post.id));
    
    let pinInfo = null;
    let className = `post-card`;
    
    if (post.pinned) {
      pinInfo = {
        type: 'official',
        icon: 'fas fa-thumbtack',
        text: 'Ghim chính thức',
        className: 'pin-indicator official'
      };
      className += ' pinned';
    } else if (isBookmarked) {
      pinInfo = {
        type: 'personal',
        icon: 'fas fa-bookmark',
        text: 'Bài viết đã ghim',
        className: 'pin-indicator personal'
      };
      className += ' pinned bookmarked-post';
    }
    
    return { pinInfo, className };
  }
  
  mockPosts.forEach(post => {
    const { pinInfo, className } = getPinDisplayInfo(post, bookmarkedPosts);
    
    console.log(`Post ${post.id}: "${post.title}"`);
    console.log(`  - CSS Class: ${className}`);
    console.log(`  - Pin Info: ${pinInfo ? `${pinInfo.text} (${pinInfo.type})` : 'No pin'}`);
    
    if (post.pinned && bookmarkedPosts.includes(post.id)) {
      console.log(`  - Note: Official pin takes priority over personal bookmark`);
    }
    console.log('');
  });
}

// 4. Test Complete Integration
function testCompleteIntegration() {
  console.log('\n🔗 Testing Complete Integration:');
  
  // Mock complete scenario
  const mockToken = 'token123456789abc';
  const mockUser = { id: 'user1', name: 'nurse1', role: 'NURSE' };
  const mockPosts = [
    {
      id: 1,
      title: 'Health Guidelines',
      author: { name: 'nurse1', role: 'NURSE' },
      pinned: true,
      likes: 15
    },
    {
      id: 2, 
      title: 'Parent Question',
      author: { name: 'parent2', role: 'PARENT' },
      pinned: false,
      likes: 8
    }
  ];
  
  // Simulate login with token
  localStorage.setItem('authToken', mockToken);
  
  // User likes post 1 and bookmarks post 2
  const likedPosts = [1];
  const bookmarkedPosts = [2];
  
  // Save to localStorage with token-based keys
  const tokenSuffix = mockToken.slice(-10);
  localStorage.setItem(`${tokenSuffix}_likedPosts`, JSON.stringify(likedPosts));
  localStorage.setItem(`${tokenSuffix}_bookmarkedPosts`, JSON.stringify(bookmarkedPosts));
  
  console.log('🎭 Mock scenario created:');
  console.log(`- User: nurse1 (formatted: "Y tá trường")`);
  console.log(`- Token suffix: ${tokenSuffix}`);
  console.log(`- Liked posts: [${likedPosts}]`);
  console.log(`- Bookmarked posts: [${bookmarkedPosts}]`);
  
  // Test the complete flow
  mockPosts.forEach(post => {
    const isLiked = likedPosts.includes(post.id);
    const isBookmarked = bookmarkedPosts.includes(post.id);
    const formattedAuthor = post.author.name.startsWith('nurse') ? 'Y tá trường' : 
                           post.author.name.startsWith('parent') ? 'Phụ huynh' : post.author.name;
    
    console.log(`\nPost ${post.id}: ${post.title}`);
    console.log(`- Author: ${formattedAuthor} (${post.author.role})`);
    console.log(`- Pinned: ${post.pinned ? 'Official pin' : 'No'}`);
    console.log(`- Liked: ${isLiked ? '❤️ Yes' : '♡ No'} (${post.likes} total)`);
    console.log(`- Bookmarked: ${isBookmarked ? '🔖 Yes' : '⚑ No'}`);
    
    if (post.pinned) {
      console.log(`- Display: "Ghim chính thức" indicator`);
    } else if (isBookmarked) {
      console.log(`- Display: "Bài viết đã ghim" indicator`);
    }
  });
  
  // Cleanup
  localStorage.removeItem('authToken');
  localStorage.removeItem(`${tokenSuffix}_likedPosts`);
  localStorage.removeItem(`${tokenSuffix}_bookmarkedPosts`);
  
  console.log('\n✅ Integration test completed');
}

// Run all tests
testTokenStorage();
testAuthorNameFormatting();
testPinDisplayLogic();
testCompleteIntegration();

console.log('\n🎉 All Community improvement tests completed!');

// Export for manual testing
window.communityImprovementTest = {
  testTokenStorage,
  testAuthorNameFormatting,
  testPinDisplayLogic,
  testCompleteIntegration
};
