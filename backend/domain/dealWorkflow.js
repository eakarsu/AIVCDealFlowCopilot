const transitions = Object.freeze({
  intake: ['reconciled'], reconciled: ['calculated'], calculated: ['analyst_review'],
  analyst_review: ['partner_review'], partner_review: ['approved'], approved: ['booked'],
  booked: ['corrected', 'reversed', 'closed'], corrected: ['partner_review', 'booked'],
  reversed: ['closed'], closed: [],
});

function validateInput(input) {
  if (!input || !input.source || !input.asOfDate || !Number.isInteger(input.amountCents)) throw new Error('reconciled source, as-of date, and integer amountCents are required');
  if (!Number.isInteger(input.version) || input.version < 1) throw new Error('positive input version is required');
  return true;
}

function transition(record, next, context = {}) {
  if (!(transitions[record.status] || []).includes(next)) throw new Error(`invalid transition ${record.status} -> ${next}`);
  if (record.periodLocked && !['corrected', 'reversed'].includes(next)) throw new Error('period is locked');
  if (record.periodLocked && ['corrected','reversed'].includes(next) && (!context.overrideReason || !context.overrideApprovedBy || context.overrideApprovedBy === context.actorId)) throw new Error('independent permissioned override is required');
  if (['partner_review', 'approved'].includes(next) && context.actorId === record.analystId) throw new Error('segregation of duties violation');
  if (next === 'approved' && (!context.explanation || !context.reviewerId)) throw new Error('reviewer and explanation are required');
  if (['booked', 'reversed'].includes(next) && (!context.ledgerReceipt || !context.effectiveDate)) throw new Error('ledger receipt and effective date are required');
  return { ...record, status: next, version: record.version + 1, effectiveDate: context.effectiveDate || record.effectiveDate };
}

function acceptDelivery(delivery) {
  if (!delivery || !delivery.provider || !delivery.idempotencyKey) throw new Error('typed provider and idempotency key are required');
  if (!['pending', 'acknowledged', 'retrying', 'dead_letter'].includes(delivery.status)) throw new Error('invalid delivery status');
  return true;
}
function assertScope(record,identity){if(!record?.tenantId||record.tenantId!==identity?.tenantId)throw new Error('tenant scope violation');return true;}

module.exports = { transitions, validateInput, transition, acceptDelivery, assertScope };
