# Tạo âm thanh tiếng Anh giọng Mỹ (Kokoro af_heart) + 2 âm thưởng: __ok (nhạc vui + "Excellent!") và __no (boing nhẹ + "Oops! Try again.")
import json,sys,subprocess,base64
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
k=Kokoro('kokoro-v1.0.onnx','voices-v1.0.bin'); SR=24000
def tts(t,speed=0.9):
    say=t.replace('___','...').replace('’',"'")
    if len(say.split())==1 and say[-1] not in '.!?': say+='.'
    s,sr=k.create(say,voice='af_heart',speed=speed,lang='en-us'); return s.astype(np.float32)
def note(f,d,vol=.35,kind='bell'):
    t=np.arange(int(SR*d))/SR
    if kind=='bell': w=(np.sin(2*np.pi*f*t)+.4*np.sin(2*np.pi*2*f*t)+.15*np.sin(2*np.pi*3*f*t))*np.exp(-t*6)
    else: w=np.sin(2*np.pi*f*t)*np.exp(-t*4)
    a=np.minimum(1,t/0.005); return (w*a*vol).astype(np.float32)
def mix(parts):
    n=max(o+len(p) for o,p in parts); out=np.zeros(n,np.float32)
    for o,p in parts: out[o:o+len(p)]+=p
    return out
def jingle():
    ps=[]; 
    for i,f in enumerate([523.25,659.25,783.99,1046.5]): ps.append((int(SR*i*.09),note(f,.5)))
    for i,f in enumerate([1568,2093,2637]): ps.append((int(SR*(.42+i*.06)),note(f,.35,.18)))
    return mix(ps)
def boing():
    t=np.arange(int(SR*.45))/SR; f=420*np.exp(-t*2.2); ph=2*np.pi*np.cumsum(f)/SR
    return (np.sin(ph)*np.exp(-t*5)*.3*np.minimum(1,t/0.01)).astype(np.float32)
def enc(s):
    s=np.concatenate([np.zeros(int(SR*.05),np.float32),s,np.zeros(int(SR*.12),np.float32)])
    s=s/max(1e-6,np.abs(s).max())*.9
    sf.write('x.wav',s,SR)
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i','x.wav','-ac','1','-ar','24000','-b:a','56k','x.mp3'],check=True)
    return 'data:audio/mpeg;base64,'+base64.b64encode(open('x.mp3','rb').read()).decode()
ph=json.load(open(sys.argv[1])); out={}
for t in ph: out[t]=enc(tts(t))
j=jingle(); v=tts('Excellent!',0.95); out['__ok']=enc(mix([(0,j),(int(SR*.55),v*1.6)]))
b=boing(); v=tts('Oops! Try again.',0.95); out['__no']=enc(mix([(0,b),(int(SR*.35),v*1.6)]))
json.dump(out,open(sys.argv[2],'w')); print(len(out),'clips')
