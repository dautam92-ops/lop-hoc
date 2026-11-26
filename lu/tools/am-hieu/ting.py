# Tiếng "ting" vui tai khi lật đúng một đôi: 3 nốt chuông đi lên (G5-C6-E6) + lấp lánh, tự tổng hợp (không bản quyền bên ngoài).
import numpy as np, wave, sys
sr=44100
def bell(f,d,a=1.0):
    t=np.arange(int(sr*d))/sr
    env=np.exp(-t*7)*(1-np.exp(-t*400))
    s=np.sin(2*np.pi*f*t)+0.45*np.sin(2*np.pi*2*f*t)*np.exp(-t*4)+0.2*np.sin(2*np.pi*3.01*f*t)*np.exp(-t*9)
    return a*env*s
out=np.zeros(int(sr*0.9))
for i,(f,a) in enumerate([(783.99,.8),(1046.5,.85),(1318.5,1.0)]):
    st=int(sr*0.075*i); b=bell(f,0.9-0.075*i,a); out[st:st+len(b)]+=b[:len(out)-st]
rng=np.random.default_rng(3)
for k in range(6):
    st=int(sr*(0.2+0.06*k)); b=bell(2093*(1+0.12*rng.random()),0.25,.18); out[st:st+len(b)]+=b[:len(out)-st]
out=out/np.max(np.abs(out))*0.8
w=wave.open(sys.argv[1],'w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((out*32767).astype('<i2').tobytes()); w.close()
