import re, json, subprocess, sys
root="/home/claude/work/v3/mission-mars/site/dune/"
subprocess.run(["python3","tools/gen_base.py","/tmp/base.svg"],check=True,stdout=open("/tmp/pins.json","w"))
pins=json.load(open("/tmp/pins.json")); svg=open("/tmp/base.svg").read()
h=open(root+"hub.html").read()
h2=re.sub(r'<svg\s+id="mars-base-svg".*?</svg>',lambda m:svg,h,count=1,flags=re.S)
assert h2!=h or svg in h
for k,(x,y) in pins.items():
    h2=re.sub(r'(class="dept-pin"\s+style=")left:[^;]*;\s*top:[^;]*;(\s*"\s+data-dept="%s")'%k,lambda m:'%sleft: %.1f%%; top: %.1f%%;%s'%(m.group(1),x,y-3,m.group(2)),h2)
open(root+"hub.html","w").write(h2)
print("ok",len(h2))
