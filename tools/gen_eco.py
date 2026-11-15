import re,sys,json
# win vector builder: main idx, secondary idx, cost idx
def v(main,sec,cost,m,s,c):
    o=[0,0,0]; o[main]+=m; o[sec]+=s; o[cost]-=c; return o
H=dict(m=32,s=4,c=6)
L=dict(m=22,s=5,c=2)
def pair(mainH,secH,costH,mainL,secL,costL,var=0):
    dm=0 if var==0 else -2
    h=v(mainH,secH,costH,H['m']+dm,H['s']+(2 if var else 0),H['c'])
    l=v(mainL,secL,costL,L['m']+dm,L['s']+(1 if var else 0),L['c'])
    return [h,l]
LIFE,EN,SH=0,1,2
ECO={
 # greenhouse: food -> life, biogas -> energy; filters/consumables -> shield cost
 "1A":pair(LIFE,EN,SH, LIFE,EN,SH,0),
 "1B":pair(LIFE,EN,SH, LIFE,SH,EN,1),
 # medbay: treats life or reinforces shield; uses power
 "2A":pair(LIFE,SH,EN, SH,LIFE,EN,0),
 "2B":pair(SH,LIFE,EN, LIFE,SH,EN,1),
 # lab: shield research, saves power; crew fatigue costs life
 "3A":pair(SH,EN,LIFE, SH,EN,LIFE,0),
 "3B":pair(SH,EN,LIFE, SH,LIFE,EN,1),
 # airlock: power from EVA, costs crew life
 "4A":pair(EN,SH,LIFE, EN,SH,LIFE,0),
 "4B":pair(EN,LIFE,SH, EN,SH,LIFE,1),
}
txt="  var ECO = {\n"+",\n".join('    "%s": %s'%(k,json.dumps(x).replace('],','], ')) for k,x in ECO.items())+"\n  };"
p='site/dune/dune-bridge.js'
s=open(p,encoding='utf8').read()
s=re.sub(r"  var ECO = \{.*?\n  \};",txt,s,flags=re.S)
ev='var EVENTS = { 3: { k: "storm", d: [-3, -15, -6] }, 6: { k: "flare", d: [-6, -4, -14] }, 9: { k: "blackout", d: [-7, -12, -5] }, 12: { k: "cold", d: [-8, -12, -4] } };'
s=re.sub(r"var EVENTS = \{.*?\n?\};",ev,s,count=1,flags=re.S) if 'var EVENTS' in s else s
open(p,'w',encoding='utf8').write(s)
for k,x in ECO.items(): print(k,x,[sum(a for a in r if a>0)+sum(a for a in r if a<0) for r in x])
