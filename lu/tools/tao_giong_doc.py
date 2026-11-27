# Tạo giọng đọc cho các câu còn thiếu (content/audio/can-tao.json) và ghi vào content/audio/registry.json.
# Chạy TRÊN MÁY CỦA BẠN (cần mạng tới dịch vụ đọc của Edge):
#   pip install edge-tts
#   node tools/check-content.mjs ; node tools/voice-lines.mjs ; python tools/tao_giong_doc.py
# Giọng edge-tts chỉ dùng thử nội bộ (S06-R02). Trước khi bán phải thay bằng giọng có giấy phép thương mại.
import asyncio, hashlib, json, os, sys
try:
    import edge_tts
except ImportError:
    sys.exit('Chưa có edge-tts. Chạy: pip install edge-tts')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUD = os.path.join(ROOT, 'content', 'audio')
todo = json.load(open(sys.argv[1] if len(sys.argv) > 1 else os.path.join(AUD, 'can-tao.json'), encoding='utf8'))['lines']  # tùy chọn: đường dẫn danh sách khác (vd content/lab/can-tao-giong.json)
reg_path = os.path.join(AUD, 'registry.json')
reg = json.load(open(reg_path, encoding='utf8'))
VOICE = {'vi': ('vi-VN-HoaiMyNeural', '-5%'), 'en': ('en-US-AnaNeural', '-10%'), 'en-cham': ('en-US-AnaNeural', '-40%')}  # en-cham: từ đọc chậm để bé nói theo
LIC = 'CHỈ DÙNG THỬ NỘI BỘ – thay bằng giọng có giấy phép thương mại trước khi bán (S06-R02)'

async def one(text, lang):
    name = hashlib.sha1(text.encode('utf8')).hexdigest()[:12] + '.mp3'
    f = os.path.join(AUD, name)
    if not os.path.exists(f) or os.path.getsize(f) < 500:
        voice, rate = VOICE.get(lang, VOICE['vi'])
        for i in range(4):
            try:
                await edge_tts.Communicate(text, voice, rate=rate).save(f); break
            except Exception as e:
                print('  thử lại:', text[:40], e); await asyncio.sleep(2 + i * 2)
        else:
            return None
    return name

async def main():
    ok = 0
    for it in todo:
        t, lang = it['text'], it.get('lang', 'vi')
        if t in reg['clips']: continue
        name = await one(t, lang)
        if not name: print('KHÔNG TẠO ĐƯỢC:', t); continue
        reg['clips'][t] = name
        reg['entries'] = [e for e in reg['entries'] if e['key'] != t] + [{'key': t, 'file': name, 'lang': lang, 'bytes': os.path.getsize(os.path.join(AUD, name)),
            'voice': VOICE.get(lang, VOICE['vi'])[0], 'provider': 'edge-tts', 'license': LIC}]
        ok += 1; print('OK', t)
        if ok % 10 == 0: json.dump(reg, open(reg_path, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    json.dump(reg, open(reg_path, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    print(f'XONG: thêm {ok} câu. Chạy lại node tools/check-content.mjs để kiểm tra.')
asyncio.run(main())
