"""Compress screenshots from the application's ?capture=ID route. Pillow is a dev-only tool."""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

root=Path(__file__).resolve().parents[1]
output=root/'public'/'thumbnails'
output.mkdir(parents=True,exist_ok=True)
for file in (root/'artifacts'/'raw-thumbnails').glob('*.png'):
    image=Image.open(file).convert('RGB').crop((0,0,800,600))
    image.resize((600,450),Image.Resampling.LANCZOS).save(output/(file.stem+'.jpg'),quality=85,optimize=True)
ids=['B17','B11','B28','B29','B30','M15','D09','P09']
sheet=Image.new('RGB',(1200,960),'#faf9f4')
d=ImageDraw.Draw(sheet)
for i,id in enumerate(ids):
    f=output/(id+'.jpg')
    if f.exists():
        x=(i%3)*400;y=(i//3)*320
        sheet.paste(Image.open(f).resize((400,300)),(x,y))
        d.text((x+12,y+303),id,fill='#284d40')
sheet.save(root/'artifacts'/'priority-scenes.jpg',quality=90)
print(f'{len(list(output.glob("*.jpg")))} miniaturas geradas a partir dos dioramas reais.')
