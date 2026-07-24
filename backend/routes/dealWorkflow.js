const express = require('express');
const pool = require('../config/database');
const policy = require('../domain/dealWorkflow');
const ai = require('../services/ai');
const router = express.Router();
const scope = (req) => ({ tenant: req.user.tenantId || req.user.tenant_id, actor: String(req.user.id) });

router.post('/', async (req, res) => {
  const { tenant, actor } = scope(req); const { dealId, idempotencyKey, inputs = [] } = req.body;
  if (!tenant || !dealId || !idempotencyKey) return res.status(400).json({ error: 'tenant claim, dealId, and idempotencyKey are required' });
  try {
    inputs.forEach(policy.validateInput); const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(`INSERT INTO vc_deal_reviews(tenant_id,deal_id,idempotency_key,created_by) VALUES($1,$2,$3,$4) ON CONFLICT(tenant_id,idempotency_key) DO UPDATE SET idempotency_key=EXCLUDED.idempotency_key RETURNING *, (xmax=0) AS inserted`, [tenant, dealId, idempotencyKey, actor]);
      const row = result.rows[0];
      if(row.inserted){for (const input of inputs) await client.query(`INSERT INTO vc_financial_inputs(tenant_id,review_id,source_type,source_record_id,amount_cents,as_of_date,input_version,payload) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING`, [tenant,row.id,input.source,input.sourceRecordId || input.source,input.amountCents,input.asOfDate,input.version,input.payload || {}]);
      await client.query(`INSERT INTO vc_workflow_audit(tenant_id,review_id,actor_id,action,to_status,record_version,evidence) VALUES($1,$2,$3,'created','intake',$4,$5)`, [tenant,row.id,actor,row.version,{ inputCount: inputs.length }]);}
      await client.query('COMMIT'); res.status(201).json(row);
    } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
  } catch (e) { res.status(400).json({ error: e.message }); }
});
router.post('/ai-brief', async (req, res) => {
  const { tenant, actor } = scope(req);
  if (!tenant) return res.status(400).json({ error: 'tenant claim required' });
  try {
    const body = req.body || {};
    const deal = {
      company_name: body.company_name || 'Unspecified company',
      stage: body.stage || 'unspecified',
      sector: body.sector || 'unspecified',
      round_size_usd: Number(body.round_size_usd || 0),
      valuation_usd: Number(body.valuation_usd || 0),
      notes: String(body.notes || ''),
    };
    const result = await ai.icMemoDraft(deal, { governed: true, tenant, actor });
    if (result?.error) throw new Error(result.error);
    await pool.query(
      'INSERT INTO ai_results(feature,input,output) VALUES($1,$2,$3)',
      ['governed-ai-brief', body, result]
    );
    res.json({ result, feature: 'governed-ai-brief' });
  } catch (error) {
    res.status(502).json({ error: error.message || 'AI brief failed' });
  }
});
router.get('/:id', async (req,res) => { const { tenant }=scope(req); if(!tenant) return res.status(400).json({error:'tenant claim required'}); const r=await pool.query('SELECT * FROM vc_deal_reviews WHERE tenant_id=$1 AND id=$2',[tenant,req.params.id]); if(!r.rows[0]) return res.status(404).json({error:'not found'}); res.json(r.rows[0]); });
router.post('/:id/transition', async (req,res) => { const {tenant,actor}=scope(req); if(!tenant) return res.status(400).json({error:'tenant claim required'}); const client=await pool.connect(); try { await client.query('BEGIN'); const found=await client.query('SELECT * FROM vc_deal_reviews WHERE tenant_id=$1 AND id=$2 FOR UPDATE',[tenant,req.params.id]); if(!found.rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({error:'not found'}); } const current=found.rows[0]; const next=policy.transition({status:current.status,version:current.version,analystId:current.analyst_id,periodLocked:current.period_locked,effectiveDate:current.effective_date},req.body.status,{...req.body,actorId:actor}); const updated=await client.query('UPDATE vc_deal_reviews SET status=$1,version=$2,reviewer_id=COALESCE($3,reviewer_id),explanation=COALESCE($4,explanation),effective_date=COALESCE($5,effective_date),override_reason=COALESCE($6,override_reason),override_approved_by=COALESCE($7,override_approved_by),updated_at=now() WHERE tenant_id=$8 AND id=$9 RETURNING *',[next.status,next.version,req.body.reviewerId,req.body.explanation,req.body.effectiveDate,req.body.overrideReason,req.body.overrideApprovedBy,tenant,req.params.id]); await client.query(`INSERT INTO vc_workflow_audit(tenant_id,review_id,actor_id,action,from_status,to_status,record_version,evidence) VALUES($1,$2,$3,'transition',$4,$5,$6,$7)`,[tenant,req.params.id,actor,current.status,next.status,next.version,{ explanation:req.body.explanation, ledgerReceipt:req.body.ledgerReceipt, overrideReason:req.body.overrideReason, overrideApprovedBy:req.body.overrideApprovedBy }]); await client.query('COMMIT'); res.json(updated.rows[0]); } catch(e){ await client.query('ROLLBACK'); res.status(409).json({error:e.message}); } finally {client.release();} });
router.post('/:id/deliveries', async(req,res)=>{const{tenant}=scope(req);if(!['admin','partner','integration'].includes(req.user.role))return res.status(403).json({error:'financial provider role required'});try{policy.acceptDelivery(req.body);const r=await pool.query(`INSERT INTO vc_integration_deliveries(tenant_id,review_id,provider_type,idempotency_key,status,receipt,last_error) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(tenant_id,provider_type,idempotency_key) DO UPDATE SET status=EXCLUDED.status,receipt=EXCLUDED.receipt,last_error=EXCLUDED.last_error,attempt_count=vc_integration_deliveries.attempt_count+1,updated_at=now() RETURNING *`,[tenant,req.params.id,req.body.provider,req.body.idempotencyKey,req.body.status,req.body.receipt||null,req.body.lastError||null]);res.status(202).json(r.rows[0]);}catch(e){res.status(400).json({error:e.message});}});
module.exports = router;
