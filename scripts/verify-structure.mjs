import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const required = [
  'app/layout.tsx','app/globals.css','app/page.tsx','app/browse/page.tsx','app/report/page.tsx',
  'app/login/page.tsx','app/signup/page.tsx','app/forgot-password/page.tsx','app/reset-password/page.tsx',
  'app/dashboard/page.tsx','app/claims/page.tsx','app/admin/page.tsx','app/items/[id]/page.tsx',
  'contexts/AuthContext.tsx','contexts/SavedContext.tsx','components/layout/SiteShell.tsx',
  'components/ui/Primitives.tsx','components/items/ItemCard.tsx','hooks/useItems.ts',
  'lib/supabase.ts','supabase/schema.sql','.env.example','README.md',
];
let failed=false;
for(const file of required){const full=path.join(root,file);if(!fs.existsSync(full)){console.error('MISSING:',file);failed=true;}}
for(const file of required.filter(f=>f.endsWith('.tsx')||f.endsWith('.ts'))){
  const body=fs.readFileSync(path.join(root,file),'utf8');
  const imports=[...body.matchAll(/from ['"](@\/[^'"]+)['"]/g)].map(m=>m[1]);
  for(const imp of imports){const stem=imp.replace(/^@\//,'');const existing=['.tsx','.ts','.jsx','.js','/index.ts','/index.tsx'].some(ext=>fs.existsSync(path.join(root,stem+ext)));
    if(!existing){console.error(`BROKEN IMPORT ${file}: ${imp}`);failed=true;}
  }
}
const sql=fs.readFileSync(path.join(root,'supabase/schema.sql'),'utf8');
for(const tbl of ['profiles','items','claims','status_history','admin_logs'])if(!sql.includes(`public.${tbl}`)){console.error('MISSING DB TABLE:',tbl);failed=true;}
if(failed)process.exit(1);console.log(`PASS: ${required.length} required files, internal imports, and core database declarations`);
