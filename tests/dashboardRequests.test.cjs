const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../src/lib/dashboardRequests.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
const loaded = { exports: {} };
new Function('exports', compiled.outputText)(loaded.exports);
const { fetchJson, parseKstTimestamp, validateRows } = loaded.exports;

test('HTTP failure is rejected while an independent request succeeds', async (t) => {
    const original = global.fetch;
    t.after(() => { global.fetch = original; });
    global.fetch = async url => url === '/missing'
        ? new Response('{}', { status: 404 })
        : new Response('{"value":42}', { status: 200 });
    const [bad, good] = await Promise.allSettled([fetchJson('/missing'), fetchJson('/healthy')]);
    assert.equal(bad.status, 'rejected');
    assert.match(bad.reason.message, /데이터 없음/);
    assert.equal(good.status, 'fulfilled');
    assert.equal(good.value.data.value, 42);
});

test('timeout aborts a hanging request', async (t) => {
    const original = global.fetch;
    t.after(() => { global.fetch = original; });
    global.fetch = (url, { signal }) => new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    });
    await assert.rejects(fetchJson('/slow', undefined, 15), /응답 시간 초과/);
});

test('caller cancellation also aborts response body parsing', async (t) => {
    const original = global.fetch;
    t.after(() => { global.fetch = original; });
    global.fetch = async (url, { signal }) => ({ ok: true, json: () => new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    }) });
    const controller = new AbortController();
    const pending = fetchJson('/body', controller.signal);
    await new Promise(resolve => setImmediate(resolve));
    controller.abort();
    await assert.rejects(pending, { name: 'AbortError' });
});

test('KST timestamps and payload validation preserve real zeroes', () => {
    assert.equal(parseKstTimestamp('202609081200'), Date.parse('2026-09-08T03:00:00Z'));
    assert.ok(Number.isNaN(parseKstTimestamp('invalid')));
    const rows = [{ tm: '202609081200', power: 0 }];
    assert.deepEqual(validateRows(rows, 'tm', ['power']), rows);
    assert.throws(() => validateRows([{ tm: '202609081200', power: null }], 'tm', ['power']), /수치/);
    assert.throws(() => validateRows({}, 'tm', ['power']), /형식/);
});