const fs = require('fs');
const path = require('path');

const files = [
  "app/dashboard/upload/page.tsx",
  "app/dashboard/review/page.tsx",
  "app/dashboard/reports/page.tsx",
  "app/dashboard/report-builder/page.tsx",
  "app/dashboard/entries/page.tsx",
  "app/dashboard/draft/page.tsx",
  "components/dashboards/reviewer-dashboard.tsx",
  "components/dashboards/faculty-dashboard.tsx",
  "components/dashboards/dept-head-dashboard.tsx",
  "components/dashboards/admin-dashboard.tsx"
];

for (const file of files) {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/\bAPPROVED\b/g, "APPROVED_FINAL");
    content = content.replace(/\bPENDING\b/g, "PENDING_HOD");
    content = content.replace(/\bREJECTED\b/g, "REJECTED_NEEDS_REVIEW");
    content = content.replace(/\bSUBMITTED\b/g, "PENDING_OFFICE");
    content = content.replace(/\bUNDER_REVIEW\b/g, "PENDING_ADMIN");
    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${file}`);
  }
}
console.log("Status strings have been updated.");
