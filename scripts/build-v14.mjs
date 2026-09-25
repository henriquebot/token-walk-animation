import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const outRoot = process.argv[3] ? path.resolve(process.argv[3]) : path.join(root, 'build-module');
const out = path.join(outRoot, 'aeris-tokens');
fs.rmSync(outRoot,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});

const copyRecursive=(src,dst)=>{
 if(!fs.existsSync(src)) return;
 const st=fs.statSync(src);
 if(st.isDirectory()) {fs.mkdirSync(dst,{recursive:true}); for(const n of fs.readdirSync(src)) copyRecursive(path.join(src,n),path.join(dst,n));}
 else {fs.mkdirSync(path.dirname(dst),{recursive:true}); fs.copyFileSync(src,dst);}
};
for (const name of ['templates','docs','assets','LICENSE.txt','INSTALACAO-PT-BR.txt','V14-COMMUNITY-BETA.md','CHANGELOG.md']) copyRecursive(path.join(root,name),path.join(out,name));

function fixImports(code){
 const add=(spec)=>{ if(!spec.startsWith('.')) return spec; const clean=spec.split('?')[0].split('#')[0]; if(path.extname(clean)) return spec; return spec+'.js'; };
 code=code.replace(/(\bfrom\s*)(["'])(\.\.?\/[^"']+)(\2)/g,(m,a,q,s,end)=>a+q+add(s)+q);
 code=code.replace(/(\bimport\s*)(["'])(\.\.?\/[^"']+)(\2)/g,(m,a,q,s,end)=>a+q+add(s)+q);
 code=code.replace(/(\bimport\s*\(\s*)(["'])(\.\.?\/[^"']+)(\2)(\s*\))/g,(m,a,q,s,end,close)=>a+q+add(s)+q+close);
 code=code.replace(/(\bexport\s+[^;]*?\sfrom\s*)(["'])(\.\.?\/[^"']+)(\2)/g,(m,a,q,s,end)=>a+q+add(s)+q);
 return code;
}

const srcRoot=path.join(root,'src');
function walk(dir){
 for(const n of fs.readdirSync(dir)){
  const p=path.join(dir,n), st=fs.statSync(p);
  if(st.isDirectory()) walk(p);
  else if(n.endsWith('.ts') && !n.endsWith('.d.ts')){
   const rel=path.relative(srcRoot,p).replace(/\.ts$/,'.js');
   const dst=path.join(out,'src',rel);
   const input=fs.readFileSync(p,'utf8');
   const r=ts.transpileModule(input,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,useDefineForClassFields:true}});
   fs.mkdirSync(path.dirname(dst),{recursive:true});
   fs.writeFileSync(dst,fixImports(r.outputText));
  } else if(n.endsWith('.js')) {
   const rel=path.relative(srcRoot,p); copyRecursive(p,path.join(out,'src',rel));
  }
 }
}
walk(srcRoot);

const manifest=JSON.parse(fs.readFileSync(path.join(root,'module.json'),'utf8'));
manifest.url='https://github.com/henriquebot/token-walk-animation';
manifest.manifest='https://github.com/henriquebot/token-walk-animation/releases/latest/download/module.json';
manifest.download='https://github.com/henriquebot/token-walk-animation/releases/latest/download/aeris-tokens.zip';
fs.writeFileSync(path.join(out,'module.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`Built ${out}`);