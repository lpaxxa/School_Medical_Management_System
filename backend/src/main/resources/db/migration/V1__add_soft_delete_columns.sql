-- Add is_deleted column to posts table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[posts]') AND name = 'is_deleted')
BEGIN
    ALTER TABLE posts ADD is_deleted BIT NOT NULL DEFAULT 0;
END

-- Add is_deleted column to post_likes table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[post_likes]') AND name = 'is_deleted')
BEGIN
    ALTER TABLE post_likes ADD is_deleted BIT NOT NULL DEFAULT 0;
END

-- Add is_deleted column to post_bookmarks table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[post_bookmarks]') AND name = 'is_deleted')
BEGIN
    ALTER TABLE post_bookmarks ADD is_deleted BIT NOT NULL DEFAULT 0;
END

-- Add is_deleted column to post_comments table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[post_comments]') AND name = 'is_deleted')
BEGIN
    ALTER TABLE post_comments ADD is_deleted BIT NOT NULL DEFAULT 0;
END
