-- Add consent_status column to parent_consents table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[parent_consents]') AND name = 'consent_status')
BEGIN
    ALTER TABLE parent_consents ADD consent_status NVARCHAR(50) NOT NULL DEFAULT 'PENDING';
END 