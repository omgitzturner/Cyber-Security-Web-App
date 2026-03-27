-- Cyber Security Training Web App Seed Data
-- Password for all users: 'password' (bcrypt hash with 10 rounds)

-- ============================================================
-- USERS
-- ============================================================
INSERT INTO users (email, password_hash, full_name, role, department) VALUES
  ('admin@company.com',    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyH4P7V2S', 'Admin User',      'admin',    'IT Department'),
  ('manager1@company.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyH4P7V2S', 'Sales Manager',   'manager',  'Sales Department'),
  ('manager2@company.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyH4P7V2S', 'HR Manager',      'manager',  'HR Department'),
  ('emp1@company.com',     '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyH4P7V2S', 'Alice Johnson',   'employee', 'Sales Department'),
  ('emp2@company.com',     '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyH4P7V2S', 'Bob Smith',       'employee', 'Sales Department'),
  ('emp3@company.com',     '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyH4P7V2S', 'Carol White',     'employee', 'HR Department'),
  ('emp4@company.com',     '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyH4P7V2S', 'David Brown',     'employee', 'HR Department'),
  ('emp5@company.com',     '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyH4P7V2S', 'Eva Davis',       'employee', 'Finance Department'),
  ('emp6@company.com',     '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyH4P7V2S', 'Frank Wilson',    'employee', 'Finance Department'),
  ('emp7@company.com',     '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyH4P7V2S', 'Grace Lee',       'employee', 'IT Department')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- LESSONS  (4 tracks × 4 lessons)
-- ============================================================
INSERT INTO lessons (title, track, duration_minutes, order_index, content) VALUES

-- Track 1: Phishing
('Recognizing Phishing Attacks', 'phishing', 20, 1,
 '{"sections":[{"title":"What Is Phishing?","body":"Phishing is a form of social engineering where attackers impersonate trusted entities via email, SMS, or fake websites to steal credentials, financial data, or install malware. Campaigns are highly targeted and increasingly convincing."},{"title":"Common Warning Signs","body":"Look for misspelled sender domains (e.g. ''paypa1.com''), urgent language demanding immediate action, generic greetings like ''Dear Customer'', and links whose hover-URL does not match the displayed text. Attachments from unknown senders should always be treated with suspicion."}],"summary_prompt":"Describe three specific warning signs you would look for in a suspected phishing email and explain why each is significant."}'
),
('Identifying Spoofed Emails', 'phishing', 15, 2,
 '{"sections":[{"title":"Email Spoofing Explained","body":"Attackers forge the ''From'' field of an email to make it appear to originate from a trusted source. Inspecting the raw message headers reveals the true originating IP and mail server, exposing the deception."},{"title":"Using SPF, DKIM, and DMARC","body":"SPF authorises which mail servers may send on behalf of a domain. DKIM adds a cryptographic signature to each message. DMARC ties these together and instructs receiving servers on how to handle failures. Together they drastically reduce spoofing success rates."}],"summary_prompt":"Explain how you would verify whether an email is genuinely from your company''s domain using SPF, DKIM, and DMARC records."}'
),
('Safe Email Practices', 'phishing', 20, 3,
 '{"sections":[{"title":"Think Before You Click","body":"Hover over any hyperlink before clicking to preview the destination URL. When in doubt, navigate directly to the website via your browser instead of following email links. Never enter credentials on a page reached through an unsolicited email."},{"title":"Handling Attachments Securely","body":"Enable macro execution warnings in Microsoft Office. Open attachments from unknown senders inside a sandboxed environment or online scanner. Compress and password-protect sensitive files before emailing, and share the password via a separate channel."}],"summary_prompt":"Outline a personal checklist of at least four steps you will take every time you receive an unexpected email containing a link or attachment."}'
),
('Reporting Suspicious Emails', 'phishing', 10, 4,
 '{"sections":[{"title":"Why Reporting Matters","body":"Every unreported phishing attempt gives attackers data on what succeeds. Prompt reporting enables the security team to block malicious domains, warn colleagues, and improve filters before others fall victim."},{"title":"How to Report","body":"Use the built-in ''Report Phishing'' button in your email client. Forward suspicious messages as an attachment (not inline) to security@company.com. Include the full headers and any context about why you found it suspicious. Never forward phishing emails to colleagues as a warning — use official channels instead."}],"summary_prompt":"Write a step-by-step guide you would share with a new colleague explaining exactly how to report a suspicious email in our organisation."}'
),

-- Track 2: Passwords
('Creating Strong Passwords', 'passwords', 20, 1,
 '{"sections":[{"title":"Password Strength Fundamentals","body":"A strong password is long (16+ characters), unpredictable, and unique to every account. Using a passphrase — four or more random words joined together — is both memorable and highly resistant to brute-force attacks. Avoid dictionary words, dates, or personal information."},{"title":"Checking Your Password Strength","body":"Tools such as ''Have I Been Pwned'' let you check whether a password has appeared in known data breaches without exposing the full password. Many password managers include built-in strength meters. Aim for an entropy of at least 60 bits."}],"summary_prompt":"Generate an example strong passphrase, explain your method for creating it, and describe how you would remember it without writing it down insecurely."}'
),
('Password Storage Best Practices', 'passwords', 15, 2,
 '{"sections":[{"title":"Why Password Managers Are Essential","body":"Reusing passwords is the single biggest account-security mistake. A dedicated password manager (Bitwarden, 1Password, KeePassXC) generates, stores, and auto-fills unique credentials for every site. Your master password and a hardware security key are the only things you need to remember."},{"title":"Secure Storage on the Backend","body":"Systems should never store plain-text passwords. The correct approach is to hash passwords with a modern, slow algorithm such as bcrypt, scrypt, or Argon2id with an appropriate work factor and a per-user salt. MD5 and SHA-1 are not acceptable for password storage."}],"summary_prompt":"Compare storing passwords in plain text, with MD5, and with bcrypt. Explain the risks of each approach and why bcrypt (or similar) is the recommended choice."}'
),
('Multi-Factor Authentication', 'passwords', 20, 3,
 '{"sections":[{"title":"What Is MFA?","body":"Multi-factor authentication requires users to provide two or more independent proofs of identity: something you know (password), something you have (authenticator app or hardware key), and something you are (biometrics). Even if a password is compromised, MFA prevents unauthorised access."},{"title":"Choosing the Right Second Factor","body":"TOTP apps (Google Authenticator, Authy) are significantly more secure than SMS OTPs, which are vulnerable to SIM-swapping. Hardware security keys (YubiKey, FIDO2) are the gold standard. Avoid security questions — they are effectively a second, weaker password."}],"summary_prompt":"Explain why SMS-based two-factor authentication is considered weaker than TOTP or hardware keys, and describe a scenario where each weakness could be exploited."}'
),
('Password Reset Procedures', 'passwords', 10, 4,
 '{"sections":[{"title":"Secure Reset Flow","body":"A secure password reset sends a time-limited, single-use token to a verified email or phone. The token should expire within 15–60 minutes and be invalidated immediately after use. The reset page must be served over HTTPS and should not leak whether an email address exists in the system."},{"title":"Common Pitfalls","body":"Security questions are easily guessable or researched via social media. Knowledge-based authentication (KBA) is deprecated by NIST. Never reset a password over the phone without robust identity verification. Always log and alert on password reset attempts for security monitoring."}],"summary_prompt":"Design a secure password reset flow for a web application. Identify at least three security controls you would implement and explain the threat each control mitigates."}'
),

-- Track 3: Data Protection
('Classifying Data', 'data_protection', 20, 1,
 '{"sections":[{"title":"Why Data Classification Matters","body":"Not all data carries equal risk. A classification policy assigns every piece of information a sensitivity tier — typically Public, Internal, Confidential, and Restricted — so employees know how to handle, store, share, and dispose of it appropriately."},{"title":"Classification in Practice","body":"Label documents with their classification in the header/footer. Store Restricted data only on approved, encrypted systems. Avoid emailing Confidential data without encryption. Review classifications periodically — data sensitivity often changes over time (e.g. after a product launch or legal proceedings conclude)."}],"summary_prompt":"Describe how you would classify three real-world data types found in our organisation and explain the handling requirements for each classification tier."}'
),
('Secure Data Handling', 'data_protection', 20, 2,
 '{"sections":[{"title":"Data in Transit","body":"All sensitive data transmitted over a network must be encrypted using TLS 1.2 or higher. Avoid unencrypted protocols (HTTP, FTP, Telnet). Use a VPN when accessing company resources from untrusted networks. Encrypted email (S/MIME or PGP) should be used for sharing Restricted information externally."},{"title":"Data at Rest","body":"Laptops and removable media must use full-disk encryption (BitLocker, FileVault, LUKS). Databases storing sensitive information should use column-level encryption for the most critical fields. Cloud storage must be configured with appropriate access controls and server-side encryption enabled."}],"summary_prompt":"A colleague asks you to email them a spreadsheet containing employee salary information. Describe every step you would take to handle this request securely."}'
),
('Encryption Basics', 'data_protection', 25, 3,
 '{"sections":[{"title":"Symmetric vs Asymmetric Encryption","body":"Symmetric encryption (AES-256) uses the same key to encrypt and decrypt data — it is fast and ideal for bulk data. Asymmetric encryption (RSA, ECC) uses a public key to encrypt and a private key to decrypt — it solves the key-distribution problem and underpins TLS and email encryption."},{"title":"How TLS Works","body":"TLS performs a handshake: the server presents its certificate, the client verifies it against a trusted CA, and both parties negotiate a shared symmetric session key using asymmetric cryptography. All subsequent communication uses the faster symmetric key. Certificate pinning can further protect against man-in-the-middle attacks."}],"summary_prompt":"Explain in plain language how HTTPS protects your data when you log into a website, covering certificate verification, key exchange, and data encryption."}'
),
('Data Breach Response', 'data_protection', 15, 4,
 '{"sections":[{"title":"Identifying a Breach","body":"Indicators of a breach include unusual account activity, unexpected data exports, alerts from DLP tools, ransom notes, or reports from external parties. Speed of detection is critical — the longer a breach goes undetected the greater the damage and regulatory exposure."},{"title":"Responding to a Breach","body":"Follow your Incident Response Plan: contain the breach (isolate affected systems), assess the scope, notify the Data Protection Officer within the required timeframe (72 hours under GDPR), preserve forensic evidence, remediate the root cause, and conduct a post-incident review. Never attempt a cover-up — regulatory penalties for concealment far exceed those for prompt disclosure."}],"summary_prompt":"Draft a brief incident report template for a data breach that includes: discovery timeline, data types affected, containment actions taken, and notification obligations."}'
),

-- Track 4: Social Engineering
('Understanding Social Engineering', 'social_engineering', 20, 1,
 '{"sections":[{"title":"The Human Firewall","body":"Social engineering exploits human psychology rather than technical vulnerabilities. Attackers manipulate targets using trust, authority, urgency, fear, or reciprocity to bypass even the most sophisticated technical defences. Security awareness training is the primary defence."},{"title":"Common Attack Types","body":"Phishing (email), vishing (voice/phone), smishing (SMS), tailgating (physical), and watering-hole attacks (compromised websites frequented by targets) are the most prevalent forms. Spear-phishing targets specific individuals using personalised information gathered from social media."}],"summary_prompt":"Describe a realistic social engineering scenario targeting someone in your department. Identify the psychological principles the attacker is exploiting and how you would counter each one."}'
),
('Pretexting and Baiting', 'social_engineering', 20, 2,
 '{"sections":[{"title":"What Is Pretexting?","body":"Pretexting involves fabricating a scenario (a ''pretext'') to manipulate a victim into revealing information or taking an action. Classic examples include impersonating IT support asking for a password to ''fix an urgent issue'', or posing as an auditor requesting access to financial systems."},{"title":"Baiting Attacks","body":"Baiting relies on curiosity or greed. Physical baiting uses USB drives labelled ''Payroll Q4'' left in car parks or reception areas, knowing curious employees will plug them in. Digital baiting offers free software downloads or prize notifications that install malware. Never plug in found USB devices."}],"summary_prompt":"You find a USB drive in the company car park labelled ''Executive Salaries 2024''. Describe every step you would take, explaining the security reasoning behind each decision."}'
),
('Protecting Personal Information', 'social_engineering', 15, 3,
 '{"sections":[{"title":"Your Digital Footprint","body":"Publicly available information — LinkedIn profiles, social media posts, company websites, public records — is the primary reconnaissance resource for social engineers. Oversharing your role, projects, travel plans, or organisational structure makes targeted attacks far easier."},{"title":"Limiting Exposure","body":"Audit your privacy settings on all social platforms annually. Avoid posting about internal projects, system names, or organisational changes publicly. Be cautious about accepting connections from unknown people on professional networks — attackers build rapport over weeks before striking."}],"summary_prompt":"Conduct a mock audit of your own public digital footprint. List what information an attacker could find and propose three specific steps to reduce your exposure."}'
),
('Verification Protocols', 'social_engineering', 15, 4,
 '{"sections":[{"title":"Always Verify Identity","body":"Never perform a sensitive action — transferring funds, resetting a password, granting access — based solely on an email or phone call, even if it appears to come from a senior executive. Attackers specifically impersonate authority figures to trigger compliance. Always verify through a separate, pre-established channel."},{"title":"Building a Verification Culture","body":"Establish a company-wide call-back verification procedure for any out-of-band request involving money, credentials, or data. Make it culturally safe to question requests, even from senior staff. Publish and rehearse verification protocols so employees default to them under pressure."}],"summary_prompt":"Write a verification protocol for your team to follow whenever someone (internal or external) requests access to sensitive systems or data via phone or email."}'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- QUIZZES (one per lesson, 3 questions each)
-- ============================================================
INSERT INTO quizzes (lesson_id, questions, passing_score)
SELECT l.id,
       q.questions::jsonb,
       80
FROM (
  VALUES
    ('Recognizing Phishing Attacks',
     '[{"id":1,"type":"multiple_choice","question":"Which of the following is the most reliable indicator of a phishing email?","options":["The email contains a company logo","The sender domain is subtly misspelled","The email has no attachments","The email arrives during business hours"],"correct_answer":1},{"id":2,"type":"true_false","question":"Phishing attacks only occur via email.","correct_answer":false,"explanation":"Phishing also occurs via SMS (smishing), voice calls (vishing), and fake websites."},{"id":3,"type":"multiple_choice","question":"What should you do FIRST when you receive an unexpected email asking you to click a link?","options":["Click the link to verify it is safe","Hover over the link to preview the destination URL","Forward it to colleagues to ask their opinion","Reply to the sender asking if it is legitimate"],"correct_answer":1}]'),
    ('Identifying Spoofed Emails',
     '[{"id":1,"type":"multiple_choice","question":"Which email authentication protocol adds a cryptographic signature to messages?","options":["SPF","DKIM","DMARC","TLS"],"correct_answer":1},{"id":2,"type":"true_false","question":"DMARC can instruct receiving mail servers to reject messages that fail SPF and DKIM checks.","correct_answer":true,"explanation":"DMARC policies can specify reject, quarantine, or none actions for authentication failures."},{"id":3,"type":"multiple_choice","question":"Where would you look to find the true originating server of a suspicious email?","options":["The visible From field","The email subject line","The raw message headers","The email body footer"],"correct_answer":2}]'),
    ('Safe Email Practices',
     '[{"id":1,"type":"multiple_choice","question":"What is the safest way to visit a website mentioned in an email?","options":["Click the link in the email","Reply to the email asking for the correct link","Type the website address directly into your browser","Search for the website on Google and click the first result"],"correct_answer":2},{"id":2,"type":"true_false","question":"It is safe to open a Microsoft Word attachment from an unknown sender as long as you do not enable macros.","correct_answer":false,"explanation":"Even without macros, malicious documents can exploit vulnerabilities in the rendering engine."},{"id":3,"type":"multiple_choice","question":"When sharing a password-protected file via email, how should you send the password?","options":["Include it in the same email as the file","Write it in the email subject line","Send it via a completely separate communication channel","Store it in the filename of the attachment"],"correct_answer":2}]'),
    ('Reporting Suspicious Emails',
     '[{"id":1,"type":"multiple_choice","question":"What is the correct way to report a phishing email to your security team?","options":["Forward it inline to all colleagues as a warning","Delete it immediately so it cannot cause harm","Use the Report Phishing button or forward as an attachment to the security team","Reply to the sender demanding they stop"],"correct_answer":2},{"id":2,"type":"true_false","question":"Forwarding a phishing email inline to colleagues to warn them is a safe practice.","correct_answer":false,"explanation":"Forwarding inline can propagate malicious links and make the phishing content appear legitimate."},{"id":3,"type":"multiple_choice","question":"Why is prompt reporting of phishing attempts important?","options":["It guarantees the attacker will be prosecuted","It allows the security team to block domains and warn others before more people are targeted","It automatically removes the email from all inboxes","It is required by law in all jurisdictions"],"correct_answer":1}]'),
    ('Creating Strong Passwords',
     '[{"id":1,"type":"multiple_choice","question":"Which of the following is the strongest password?","options":["P@ssword1","correct-horse-battery-staple-mountain","MyDog2015!","Admin123"],"correct_answer":1},{"id":2,"type":"true_false","question":"Using the same strong password across multiple websites is acceptable security practice.","correct_answer":false,"explanation":"A breach on one site immediately compromises all other accounts using the same password."},{"id":3,"type":"multiple_choice","question":"What is the minimum recommended length for a strong password according to current NIST guidelines?","options":["6 characters","8 characters","12 characters","At least 15 characters"],"correct_answer":3}]'),
    ('Password Storage Best Practices',
     '[{"id":1,"type":"multiple_choice","question":"Which hashing algorithm is recommended for storing passwords?","options":["MD5","SHA-1","bcrypt","Base64 encoding"],"correct_answer":2},{"id":2,"type":"true_false","question":"Storing passwords as plain text is acceptable if the database server is behind a firewall.","correct_answer":false,"explanation":"Defence-in-depth requires passwords to be hashed regardless of network controls."},{"id":3,"type":"multiple_choice","question":"What is the purpose of a salt in password hashing?","options":["To make the hash shorter","To ensure each password hash is unique even if two users have the same password","To encrypt the hash for extra security","To speed up the hashing process"],"correct_answer":1}]'),
    ('Multi-Factor Authentication',
     '[{"id":1,"type":"multiple_choice","question":"Which MFA method is considered the most secure?","options":["SMS one-time password","Email one-time password","TOTP authenticator app","Hardware security key (FIDO2)"],"correct_answer":3},{"id":2,"type":"true_false","question":"SMS-based two-factor authentication is immune to SIM-swapping attacks.","correct_answer":false,"explanation":"SIM-swapping allows attackers to redirect SMS messages to their own device, bypassing SMS OTP."},{"id":3,"type":"multiple_choice","question":"What does MFA protect against even when a password is compromised?","options":["Brute-force attacks on the MFA code","Unauthorised account access using the stolen password alone","Malware installed on the user device","All forms of cyber attack"],"correct_answer":1}]'),
    ('Password Reset Procedures',
     '[{"id":1,"type":"multiple_choice","question":"How long should a password reset token remain valid?","options":["24 hours","7 days","15 to 60 minutes","Until the user resets their password regardless of time"],"correct_answer":2},{"id":2,"type":"true_false","question":"Security questions are a recommended method for verifying identity during a password reset.","correct_answer":false,"explanation":"NIST deprecated knowledge-based authentication (KBAs/security questions) due to their guessability."},{"id":3,"type":"multiple_choice","question":"A secure password reset endpoint should NOT reveal which of the following?","options":["That the reset email has been sent","Whether the submitted email address exists in the system","That the token has expired","That HTTPS is required"],"correct_answer":1}]'),
    ('Classifying Data',
     '[{"id":1,"type":"multiple_choice","question":"Which data classification tier typically includes customer financial records?","options":["Public","Internal","Confidential","Restricted"],"correct_answer":3},{"id":2,"type":"true_false","question":"Data classification levels should remain fixed once assigned and never need to be reviewed.","correct_answer":false,"explanation":"Sensitivity can change over time; for example after a product launches, previously confidential roadmap data may become public."},{"id":3,"type":"multiple_choice","question":"What is the PRIMARY purpose of a data classification policy?","options":["To reduce storage costs","To ensure employees know how to handle data according to its sensitivity","To comply with a single specific regulation","To prevent all data from leaving the organisation"],"correct_answer":1}]'),
    ('Secure Data Handling',
     '[{"id":1,"type":"multiple_choice","question":"What is the minimum TLS version that should be used to protect sensitive data in transit?","options":["TLS 1.0","TLS 1.1","TLS 1.2","SSL 3.0"],"correct_answer":2},{"id":2,"type":"true_false","question":"It is acceptable to send confidential employee data via unencrypted email if it is sent internally.","correct_answer":false,"explanation":"Internal networks can be compromised; sensitive data should be encrypted regardless of whether it is sent internally or externally."},{"id":3,"type":"multiple_choice","question":"Which technology should be enabled on all laptops to protect data if the device is lost or stolen?","options":["Screen lock","Full-disk encryption","Antivirus software","VPN client"],"correct_answer":1}]'),
    ('Encryption Basics',
     '[{"id":1,"type":"multiple_choice","question":"Which encryption type uses different keys for encryption and decryption?","options":["Symmetric encryption","Stream cipher","Asymmetric encryption","Hashing"],"correct_answer":2},{"id":2,"type":"true_false","question":"AES-256 is an example of asymmetric encryption.","correct_answer":false,"explanation":"AES-256 is a symmetric encryption algorithm; it uses the same key for both encryption and decryption."},{"id":3,"type":"multiple_choice","question":"During a TLS handshake, what is asymmetric cryptography primarily used for?","options":["Encrypting all transmitted data","Securely exchanging the symmetric session key","Compressing data before transmission","Verifying the user is human"],"correct_answer":1}]'),
    ('Data Breach Response',
     '[{"id":1,"type":"multiple_choice","question":"Under GDPR, within how many hours must a personal data breach be reported to the supervisory authority?","options":["24 hours","48 hours","72 hours","7 days"],"correct_answer":2},{"id":2,"type":"true_false","question":"The first priority after discovering a data breach is to identify and punish the person responsible.","correct_answer":false,"explanation":"The first priority is containment — isolating affected systems to prevent further data loss."},{"id":3,"type":"multiple_choice","question":"Which of the following should be preserved immediately after a breach is discovered?","options":["The marketing collateral for the affected product","Forensic evidence such as logs and system snapshots","The personal contact details of affected users","The attacker''s IP address only"],"correct_answer":1}]'),
    ('Understanding Social Engineering',
     '[{"id":1,"type":"multiple_choice","question":"What is the primary target of social engineering attacks?","options":["Firewalls and network infrastructure","Human psychology and behaviour","Database encryption keys","Software vulnerabilities"],"correct_answer":1},{"id":2,"type":"true_false","question":"Spear-phishing uses the same generic message for all recipients.","correct_answer":false,"explanation":"Spear-phishing is targeted and personalised using information gathered about the specific victim."},{"id":3,"type":"multiple_choice","question":"Which psychological principle do attackers most commonly exploit to pressure victims into acting without thinking?","options":["Curiosity","Urgency and fear","Generosity","Boredom"],"correct_answer":1}]'),
    ('Pretexting and Baiting',
     '[{"id":1,"type":"multiple_choice","question":"What should you do if you find a USB drive in the company car park?","options":["Plug it in to find out who it belongs to","Hand it to IT security without plugging it in","Leave it where it is","Take it home in case it contains useful data"],"correct_answer":1},{"id":2,"type":"true_false","question":"A pretexting attack always involves the attacker being physically present at your location.","correct_answer":false,"explanation":"Pretexting frequently occurs via phone calls, emails, or messaging platforms."},{"id":3,"type":"multiple_choice","question":"An attacker calls claiming to be from IT support and asks for your password to fix an urgent issue. What should you do?","options":["Provide the password because IT legitimately needs it","Refuse and report the call to your real IT security team","Give only the first half of your password","Ask the caller to verify themselves by email first then provide the password"],"correct_answer":1}]'),
    ('Protecting Personal Information',
     '[{"id":1,"type":"multiple_choice","question":"Which type of information should you AVOID posting publicly on professional networking sites?","options":["Your job title","Names of internal systems or projects you are working on","The industry you work in","The city you are based in"],"correct_answer":1},{"id":2,"type":"true_false","question":"Accepting a LinkedIn connection request from an unknown person poses no security risk.","correct_answer":false,"explanation":"Attackers build rapport over weeks via professional networks before launching targeted social engineering attacks."},{"id":3,"type":"multiple_choice","question":"How often should you review the privacy settings on your social media accounts?","options":["Never — once set they do not change","Only when you hear about a breach","At least annually, as platform defaults and features change regularly","Every day"],"correct_answer":2}]'),
    ('Verification Protocols',
     '[{"id":1,"type":"multiple_choice","question":"An email from the CEO urgently requests a bank transfer to a new supplier. What should you do?","options":["Process the transfer immediately as it is from the CEO","Ignore it because CEOs do not send emails like this","Verify the request through a separate, pre-established communication channel before acting","Reply to the email asking for confirmation"],"correct_answer":2},{"id":2,"type":"true_false","question":"Verifying a caller''s identity by calling back on the number they provided during the call is sufficient.","correct_answer":false,"explanation":"Attackers can provide spoofed call-back numbers. Always use a number obtained independently from a verified directory."},{"id":3,"type":"multiple_choice","question":"Why is it important to make it culturally acceptable to question requests from senior staff?","options":["It reduces the workload on senior staff","It prevents attackers who impersonate authority figures from exploiting deference and compliance","It is required by employment law","It improves team morale"],"correct_answer":1}]')
) AS q(lesson_title, questions)
JOIN lessons l ON l.title = q.lesson_title
ON CONFLICT (lesson_id) DO NOTHING;

-- ============================================================
-- BADGES  (16 lesson + 4 track + 1 master)
-- ============================================================

-- Lesson badges
INSERT INTO badges (name, description, badge_type, requirement_id)
SELECT
  'Lesson Complete: ' || l.title,
  'Awarded for successfully completing the lesson "' || l.title || '" including passing the quiz and submitting a summary.',
  'lesson',
  l.id
FROM lessons l
ON CONFLICT DO NOTHING;

-- Track badges
INSERT INTO badges (name, description, badge_type, requirement_id) VALUES
  ('Phishing Defence Expert',      'Awarded for completing all four lessons in the Phishing track.',            'track',  NULL),
  ('Password Security Pro',        'Awarded for completing all four lessons in the Passwords track.',           'track',  NULL),
  ('Data Guardian',                'Awarded for completing all four lessons in the Data Protection track.',     'track',  NULL),
  ('Social Engineering Defender',  'Awarded for completing all four lessons in the Social Engineering track.',  'track',  NULL)
ON CONFLICT DO NOTHING;

-- Update track badge names to include the track identifier for programmatic lookup
UPDATE badges SET name = 'Phishing Defence Expert'     WHERE badge_type = 'track' AND name = 'Phishing Defence Expert';
UPDATE badges SET name = 'passwords Password Security Pro'    WHERE badge_type = 'track' AND name = 'Password Security Pro';
UPDATE badges SET name = 'data_protection Data Guardian'      WHERE badge_type = 'track' AND name = 'Data Guardian';
UPDATE badges SET name = 'social_engineering Social Engineering Defender' WHERE badge_type = 'track' AND name = 'Social Engineering Defender';

-- Re-insert with proper naming convention for ILIKE lookup used in progress route
DELETE FROM badges WHERE badge_type = 'track';
INSERT INTO badges (name, description, badge_type, requirement_id) VALUES
  ('phishing Phishing Defence Expert',                          'Awarded for completing all four lessons in the Phishing track.',            'track', NULL),
  ('passwords Password Security Pro',                           'Awarded for completing all four lessons in the Passwords track.',           'track', NULL),
  ('data_protection Data Guardian',                             'Awarded for completing all four lessons in the Data Protection track.',     'track', NULL),
  ('social_engineering Social Engineering Defender',            'Awarded for completing all four lessons in the Social Engineering track.',  'track', NULL)
ON CONFLICT DO NOTHING;

-- Master badge
INSERT INTO badges (name, description, badge_type, requirement_id) VALUES
  ('Cyber Security Champion',
   'Awarded for completing every lesson across all four tracks. The highest honour in our cyber security training programme.',
   'master',
   NULL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- ASSIGNMENTS
-- ============================================================
-- Phishing track → Sales Department
INSERT INTO lesson_assignments (lesson_id, assigned_to_department, assigned_by, deadline)
SELECT l.id, 'Sales Department', (SELECT id FROM users WHERE role='admin' LIMIT 1), CURRENT_DATE + INTERVAL '30 days'
FROM lessons l WHERE l.track = 'phishing'
ON CONFLICT DO NOTHING;

-- Phishing track → HR Department
INSERT INTO lesson_assignments (lesson_id, assigned_to_department, assigned_by, deadline)
SELECT l.id, 'HR Department', (SELECT id FROM users WHERE role='admin' LIMIT 1), CURRENT_DATE + INTERVAL '30 days'
FROM lessons l WHERE l.track = 'phishing'
ON CONFLICT DO NOTHING;

-- Passwords track → all employees (assigned by department)
INSERT INTO lesson_assignments (lesson_id, assigned_to_department, assigned_by, deadline)
SELECT l.id, dept.department, (SELECT id FROM users WHERE role='admin' LIMIT 1), CURRENT_DATE + INTERVAL '45 days'
FROM lessons l
CROSS JOIN (VALUES ('Sales Department'),('HR Department'),('Finance Department'),('IT Department')) AS dept(department)
WHERE l.track = 'passwords'
ON CONFLICT DO NOTHING;

-- Data protection track → Finance and IT
INSERT INTO lesson_assignments (lesson_id, assigned_to_department, assigned_by, deadline)
SELECT l.id, dept.department, (SELECT id FROM users WHERE role='admin' LIMIT 1), CURRENT_DATE + INTERVAL '60 days'
FROM lessons l
CROSS JOIN (VALUES ('Finance Department'),('IT Department')) AS dept(department)
WHERE l.track = 'data_protection'
ON CONFLICT DO NOTHING;

-- Social engineering track → managers individually
INSERT INTO lesson_assignments (lesson_id, assigned_to_user_id, assigned_by, deadline)
SELECT l.id, u.id, (SELECT id FROM users WHERE role='admin' LIMIT 1), CURRENT_DATE + INTERVAL '21 days'
FROM lessons l
CROSS JOIN (SELECT id FROM users WHERE role='manager') u
WHERE l.track = 'social_engineering'
ON CONFLICT DO NOTHING;
