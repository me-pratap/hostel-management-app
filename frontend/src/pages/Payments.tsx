import React, { useEffect, useState } from 'react';
import { IndianRupee, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import apiClient from '../api/client';

interface PaymentSummary {
  month: string;
  total_due: number;
  total_collected: number;
  total_pending: number;
  paid_count: number;
  unpaid_count: number;
  partial_count: number;
  overdue_tenants: any[];
}

interface PaymentRecord {
  payment_id: string;
  tenant_id: string;
  tenant_name: string;
  room_id: string;
  room_number?: string;
  contact_number: string;
  amount_due: number;
  amount_paid: number;
  status: string;
  due_date: string;
}

export const Payments = () => {
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [ledger, setLedger] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchPaymentsData = async () => {
    try {
      setLoading(true);
      const [summaryRes, ledgerRes] = await Promise.all([
        apiClient.get<PaymentSummary>('/payments/summary'),
        apiClient.get<PaymentRecord[]>('/payments/current-month')
      ]);
      setSummary(summaryRes.data);
      setLedger(ledgerRes.data);
    } catch (err) {
      console.error('Failed to fetch payments data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  const handleGenerateInvoices = async () => {
    try {
      setGenerating(true);
      await apiClient.post('/payments/generate-monthly');
      await fetchPaymentsData();
      alert('Monthly invoices generated successfully for all active tenants.');
    } catch (err) {
      console.error('Failed to generate invoices', err);
      alert('Failed to generate invoices.');
    } finally {
      setGenerating(false);
    }
  };

  const handleRecordPayment = async (payment: PaymentRecord) => {
    // Basic prompt for quick demo - can be replaced with a modal later
    const amountStr = prompt(`Enter amount paid (Total due: ₹${payment.amount_due}):`, payment.amount_due.toString());
    if (amountStr === null) return;
    
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount < 0) {
      alert('Invalid amount');
      return;
    }

    try {
      await apiClient.post(`/payments/${payment.payment_id}/record`, {
        amount_paid: amount
      });
      fetchPaymentsData(); // refresh data

      // Free WhatsApp Confirmation Link
      if (confirm('Payment recorded successfully! Do you want to send a WhatsApp confirmation?')) {
        const phone = payment.contact_number.replace(/\D/g, '');
        const waNumber = phone.length === 10 ? `91${phone}` : phone;
        const message = `Hi ${payment.tenant_name}, we have received your rent payment of ₹${amount}. Thank you!`;
        const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error('Failed to record payment', err);
      alert('Failed to record payment.');
    }
  };

  if (loading && !summary) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading payments...</div>;
  }

  const groupedLedger = ledger.reduce((acc, record) => {
    const room = record.room_number || 'Unknown';
    if (!acc[room]) acc[room] = [];
    acc[room].push(record);
    return acc;
  }, {} as Record<string, PaymentRecord[]>);

  return (
    <div>
      <div className="header-actions">
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem' }}>Payments & Billing</h1>
          <p style={{ color: 'var(--text-muted)' }}>Overview for {summary?.month || 'Current Month'}</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={handleGenerateInvoices} 
          disabled={generating}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
        >
          <RefreshCw size={18} className={generating ? 'spin' : ''} />
          {generating ? 'Generating...' : 'Generate Monthly Invoices'}
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid-cards" style={{ marginBottom: '40px' }}>
        
        <div className="stat-card" style={{ borderTop: '4px solid #38bdf8' }}>
          <div className="stat-title">Total Due</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IndianRupee size={28} color="var(--text-secondary)" />
            <span className="stat-value">{summary?.total_due.toLocaleString()}</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '4px solid #10b981' }}>
          <div className="stat-title">Total Collected</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IndianRupee size={28} color="#10b981" />
            <span className="stat-value">{summary?.total_collected.toLocaleString()}</span>
          </div>
          <div style={{ fontSize: '0.875rem', color: '#10b981', marginTop: '8px' }}>
            {summary?.paid_count} Fully Paid
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '4px solid #f43f5e' }}>
          <div className="stat-title">Pending</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IndianRupee size={28} color="#f43f5e" />
            <span className="stat-value">{summary?.total_pending.toLocaleString()}</span>
          </div>
          <div style={{ fontSize: '0.875rem', color: '#f43f5e', marginTop: '8px' }}>
            {summary?.unpaid_count} Unpaid, {summary?.partial_count} Partial
          </div>
        </div>
      </div>

      {/* Overdue Alerts */}
      {summary?.overdue_tenants && summary.overdue_tenants.length > 0 && (
        <div style={{ padding: '20px', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid #f43f5e', borderRadius: 'var(--radius-md)', marginBottom: '40px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <AlertCircle color="#f43f5e" size={24} style={{ flexShrink: 0 }} />
          <div>
            <h3 style={{ margin: '0 0 8px 0', color: '#f43f5e', fontSize: '1.125rem' }}>Overdue Payments Detected</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {summary.overdue_tenants.length} tenant(s) are past their due date by more than 5 days.
            </p>
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Current Month Ledger</h2>
      
      {ledger.length === 0 ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No invoices generated for this month yet.
        </div>
      ) : (
        Object.entries(groupedLedger)
          .sort(([roomA], [roomB]) => roomA.localeCompare(roomB, undefined, { numeric: true }))
          .map(([roomNumber, records]) => (
            <div key={roomNumber} className="glass-panel" style={{ marginBottom: '24px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
              <div style={{ padding: '16px 24px', background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Room {roomNumber}</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-strong)', color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '16px 24px' }}>Tenant</th>
                      <th style={{ padding: '16px 24px' }}>Due Date</th>
                      <th style={{ padding: '16px 24px' }}>Amount Due</th>
                      <th style={{ padding: '16px 24px' }}>Status</th>
                      <th style={{ padding: '16px 24px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.payment_id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ fontWeight: 600 }}>{record.tenant_name}</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{record.contact_number}</div>
                        </td>
                        <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{record.due_date}</td>
                        <td style={{ padding: '16px 24px', fontWeight: 600 }}>₹{record.amount_due}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            background: record.status === 'paid' ? 'rgba(16, 185, 129, 0.1)' : record.status === 'partial' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                            color: record.status === 'paid' ? '#10b981' : record.status === 'partial' ? '#f59e0b' : '#f43f5e'
                          }}>
                            {record.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          {record.status === 'paid' ? (
                            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', fontWeight: 500 }}>
                              <CheckCircle2 size={16} /> Settled
                            </span>
                          ) : (
                            <button 
                              onClick={() => handleRecordPayment(record)}
                              style={{
                                background: 'transparent',
                                border: '1px solid var(--accent-primary)',
                                color: 'var(--accent-primary)',
                                padding: '6px 16px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.875rem',
                                fontWeight: 600
                              }}
                            >
                              Record Payment
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
      )}
      
      {/* Add spin keyframes to index.css if not there, for the button icon */}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};
