const fs = require('fs');
const path = require('path');

// 1. JobReportsManagement.tsx
const jrPath = path.join(__dirname, '..', 'src', 'components', 'admin', 'JobReportsManagement.tsx');
let jr = fs.readFileSync(jrPath, 'utf8');
if (!jr.includes("@/lib/adminAuthClient")) {
  jr = jr.replace(
    /const getAdminHeaders = \(\): HeadersInit => \{[\s\S]*?\};\n/,
    "import { getAdminHeaders } from '@/lib/adminAuthClient';\n"
  );
  fs.writeFileSync(jrPath, jr, 'utf8');
  console.log('Updated JobReportsManagement.tsx');
}

// 2. SupportTicketsManagement.tsx
const stPath = path.join(__dirname, '..', 'src', 'components', 'admin', 'SupportTicketsManagement.tsx');
let st = fs.readFileSync(stPath, 'utf8');
if (!st.includes("@/lib/adminAuthClient")) {
  st = st.replace(
    /const getAdminHeaders = \(\): HeadersInit => \{[\s\S]*?\};\n/,
    "import { getAdminHeaders } from '@/lib/adminAuthClient';\n"
  );
  fs.writeFileSync(stPath, st, 'utf8');
  console.log('Updated SupportTicketsManagement.tsx');
}

// 3. SmsNotificationsManagement.tsx
const smsPath = path.join(__dirname, '..', 'src', 'components', 'admin', 'SmsNotificationsManagement.tsx');
let sms = fs.readFileSync(smsPath, 'utf8');
if (!sms.includes("@/lib/adminAuthClient")) {
  sms = sms.replace(
    "import React, { useState } from 'react';",
    "import React, { useState } from 'react';\nimport { getAdminHeaders } from '@/lib/adminAuthClient';"
  );
  sms = sms.replace(/headers: \{\s*'Content-Type': 'application\/json',\s*\},/g, "headers: getAdminHeaders(),");
  fs.writeFileSync(smsPath, sms, 'utf8');
  console.log('Updated SmsNotificationsManagement.tsx');
}

// 4. PlatformGovernanceOverview.tsx
const govPath = path.join(__dirname, '..', 'src', 'components', 'admin', 'PlatformGovernanceOverview.tsx');
let gov = fs.readFileSync(govPath, 'utf8');
if (!gov.includes("@/lib/adminAuthClient")) {
  gov = gov.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport { getAdminHeaders } from '@/lib/adminAuthClient';"
  );
  gov = gov.replace(/headers: \{\s*\}/g, "headers: getAdminHeaders()");
  fs.writeFileSync(govPath, gov, 'utf8');
  console.log('Updated PlatformGovernanceOverview.tsx');
}

// 5. SystemSettingsDiagnostics.tsx
const diagPath = path.join(__dirname, '..', 'src', 'components', 'admin', 'SystemSettingsDiagnostics.tsx');
let diag = fs.readFileSync(diagPath, 'utf8');
if (!diag.includes("@/lib/adminAuthClient")) {
  diag = diag.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport { getAdminHeaders } from '@/lib/adminAuthClient';"
  );
  diag = diag.replace(/headers: \{\s*'Content-Type': 'application\/json',\s*\}/g, "headers: getAdminHeaders()");
  fs.writeFileSync(diagPath, diag, 'utf8');
  console.log('Updated SystemSettingsDiagnostics.tsx');
}

