// Storage Adapter (D30): mọi module chỉ gọi giao diện này, không gọi thẳng localStorage hay database.
// Hiện có: LocalStorageAdapter (trình duyệt), MemoryAdapter (kiểm thử).
// Sau này: HttpAdapter tới máy chủ trên máy (SQLite), rồi PostgresAdapter khi lên cloud – không đổi code engine.
//
// Giao diện:
//   appendEvents(events[])            sự kiện học tập, chỉ ghi thêm (S10-R06)
//   listEvents({skill_id, child_id})  đọc sự kiện
//   appendObservation(obs)            quan sát của bố mẹ, lưu RIÊNG với kết quả game (S10-R04, D28)
//   listObservations({skill_id, child_id})
//   getSession(key) / setSession(key, val)
//   exportAll() -> object ; importAll(object)   sao lưu và khôi phục

export class MemoryAdapter {
  constructor(data) { this.d = data || { events: [], observations: [], kv: {} }; }
  _filter(list, f = {}) { return list.filter(x => Object.entries(f).every(([k, v]) => v === undefined || x[k] === v)); }
  appendEvents(evts) { const ids = new Set(this.d.events.map(e => e.event_id)); for (const e of evts) if (!ids.has(e.event_id)) { ids.add(e.event_id); this.d.events.push(e); } this._save(); }
  listEvents(f) { return this._filter(this.d.events, f); }
  appendObservation(o) { this.d.observations.push(o); this._save(); }
  listObservations(f) { return this._filter(this.d.observations, f); }
  getSession(k) { return this.d.kv[k]; }
  setSession(k, v) { this.d.kv[k] = v; this._save(); }
  exportAll() { return JSON.parse(JSON.stringify({ format: 'lu-backup', version: 1, exported_at: new Date().toISOString(), ...this.d })); }
  importAll(o) {
    if (!o || o.format !== 'lu-backup') throw new Error('Tệp sao lưu không đúng định dạng');
    this.d = { events: [], observations: [], kv: {} }; this.appendEvents(o.events || []);
    this.d.observations = o.observations || []; this.d.kv = o.kv || {}; this._save();
  }
  _save() {}
}

export class LocalStorageAdapter extends MemoryAdapter {
  constructor(ns = 'lu') {
    let d = null; try { d = JSON.parse(localStorage.getItem(ns + ':data')); } catch (e) {}
    super(d); this.ns = ns;
  }
  _save() { try { localStorage.setItem(this.ns + ':data', JSON.stringify(this.d)); } catch (e) {} }
}

// HttpAdapter: đọc toàn bộ dữ liệu của MỘT bé từ máy chủ trên máy khi mở, sau đó giữ trong bộ nhớ (engine đọc đồng bộ).
// Mỗi lần ghi: lưu ngay vào hàng đợi trong trình duyệt rồi gửi lên máy chủ; mất kết nối thì giữ lại và gửi khi có mạng (không mất tiến độ).
export class HttpAdapter extends MemoryAdapter {
  static async open(base, child_id, { onStatus = () => {} } = {}) {
    const a = new HttpAdapter(); a.base = base; a.cid = child_id; a.onStatus = onStatus; a.qkey = 'lu-queue:' + child_id;
    try { a.queue = JSON.parse(localStorage.getItem(a.qkey)) || []; } catch { a.queue = []; }
    const r = await fetch(`${base}/api/progress/${child_id}`); if (!r.ok) throw new Error('Không đọc được tiến độ');
    const d = await r.json(); a.d = { events: d.events || [], observations: d.observations || [], kv: d.kv || {} };
    for (const job of a.queue) a._applyLocal(job);   // việc chưa gửi lần trước vẫn hiện ngay
    a.flush(); addEventListener('online', () => a.flush());
    return a;
  }
  _applyLocal(job) {
    if (job.t === 'events') { const ids = new Set(this.d.events.map(e => e.event_id)); for (const e of job.body.events) if (!ids.has(e.event_id)) this.d.events.push(e); }
    if (job.t === 'observations' && !this.d.observations.find(o => o.obs_id === job.body.obs_id)) this.d.observations.push(job.body);
    if (job.t === 'kv') this.d.kv[job.body.k] = job.body.v;
  }
  _push(t, body) { this.queue.push({ t, body }); try { localStorage.setItem(this.qkey, JSON.stringify(this.queue)); } catch {} this.flush(); }
  async flush() {
    if (this.busy) return; this.busy = true;
    try {
      while (this.queue.length) {
        const job = this.queue[0];
        const r = await fetch(`${this.base}/api/progress/${this.cid}/${job.t}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(job.body) });
        if (!r.ok) throw new Error(r.status);
        this.queue.shift(); try { localStorage.setItem(this.qkey, JSON.stringify(this.queue)); } catch {}
      }
      this.onStatus(true);
    } catch { this.onStatus(false); setTimeout(() => { this.busy = false; this.flush(); }, 4000); return; }
    this.busy = false;
  }
  appendEvents(evts) { const fresh = evts.map(e => ({ ...e, child_id: this.cid })); super.appendEvents(fresh); this._push('events', { events: fresh }); }
  appendObservation(o) { super.appendObservation(o); this._push('observations', o); }
  setSession(k, v) { super.setSession(k, v); this._push('kv', { k, v }); }
  importAll(o) { super.importAll(o); fetch(`${this.base}/api/progress/${this.cid}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(o) }); }
  pending() { return this.queue.length; }
}
