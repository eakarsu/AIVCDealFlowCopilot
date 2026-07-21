const test = require('node:test');
const assert = require('node:assert/strict');
const p = require('../domain/dealWorkflow');

test('requires reconciled versioned inputs', () => assert.throws(() => p.validateInput({ source: 'crm', asOfDate: '2026-01-01', amountCents: 1, version: 0 }), /version/));
test('accepts integer-cent input', () => assert.equal(p.validateInput({ source: 'ledger', asOfDate: '2026-01-01', amountCents: 99, version: 1 }), true));
test('rejects invalid state jumps', () => assert.throws(() => p.transition({ status: 'intake', version: 1 }, 'approved'), /invalid/));
test('enforces segregation of duties', () => assert.throws(() => p.transition({ status: 'analyst_review', version: 1, analystId: 'u1' }, 'partner_review', { actorId: 'u1' }), /segregation/));
test('requires booking receipt', () => assert.throws(() => p.transition({ status: 'approved', version: 2 }, 'booked', {}), /receipt/));
test('models retries and dead letters', () => assert.equal(p.acceptDelivery({ provider: 'ledger', idempotencyKey: 't:1', status: 'dead_letter' }), true));
test('tenant access matches',()=>assert.equal(p.assertScope({tenantId:'t1'},{tenantId:'t1'}),true));
test('cross-tenant access fails',()=>assert.throws(()=>p.assertScope({tenantId:'t1'},{tenantId:'t2'}),/tenant/));
test('locked correction needs independent override',()=>assert.throws(()=>p.transition({status:'booked',version:2,periodLocked:true},'corrected',{actorId:'a'}),/override/));
