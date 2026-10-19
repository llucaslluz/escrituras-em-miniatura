"""Portable source + static distribution, no third-party Python dependencies."""
import hashlib,json,zipfile
from pathlib import Path
from datetime import datetime,timezone

root=Path(__file__).resolve().parents[1]
dest=root.parent/'entrega'
dest.mkdir(exist_ok=True)
version=json.loads((root/'package.json').read_text(encoding='utf-8-sig'))['version']
archive=dest/f'escrituras-em-miniatura-{version}.zip'
excluded={'.git','node_modules','.sites-runtime','.sites-checkout','artifacts','__pycache__','.export-check','coverage','.cache'}
files=[]
for file in root.rglob('*'):
    rel=file.relative_to(root)
    if not file.is_file() or any(p in excluded or p.startswith('.sites-checkout-') for p in rel.parts):continue
    if file.name.startswith('.env') or file.suffix in {'.log','.zip','.gz','.tmp','.pyc'}:continue
    if rel.parts[0]=='.openai' and str(rel).replace('\\','/')!='.openai/hosting.json':continue
    if file.name in {'EXPORT-MANIFEST.json','environment-check.cjs','environment-check.txt'}:continue
    files.append(file)
files.sort(key=lambda p:p.relative_to(root).as_posix())
entries=[{'path':p.relative_to(root).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files]
manifest={'name':'Escrituras em Miniatura — Histórias de fé em movimento','version':version,'exported_at_utc':datetime.now(timezone.utc).isoformat(),'scene_count':72,'scenes_by_book':{'bible':32,'mormon':20,'dc':10,'pearl':10},'files':entries,'manifest_file':'EXPORT-MANIFEST.json','excludes':['credentials','tokens','secrets','.env values','node_modules','.git','caches','temporary files'],'runtime_external_services_required':False}
manifest_bytes=(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n').encode('utf-8')
(root/'EXPORT-MANIFEST.json').write_bytes(manifest_bytes)
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in files:z.write(p,p.relative_to(root).as_posix())
    z.writestr('EXPORT-MANIFEST.json',manifest_bytes)
with zipfile.ZipFile(archive) as z:
    bad=z.testzip()
    if bad:raise RuntimeError(f'CRC inválido: {bad}')
    names=z.namelist()
    for required in ['package.json','package-lock.json','dist/index.html','src/engine/kit.js','docs/INVENTARIO.md','docs/VERIFICACOES.md']:
        if required not in names:raise RuntimeError(f'Exportação incompleta: {required}')
digest=hashlib.sha256(archive.read_bytes()).hexdigest()
checksum=archive.with_suffix('.sha256.txt')
checksum.write_text(f'{digest}  {archive.name}\n',encoding='utf-8')
(dest/'EXPORT-MANIFEST.json').write_bytes(manifest_bytes)
print(json.dumps({'archive':str(archive),'sha256':digest,'checksum_file':str(checksum),'entries':len(names),'bytes':archive.stat().st_size,'crc':'OK','scenes':72},ensure_ascii=False,indent=2))
