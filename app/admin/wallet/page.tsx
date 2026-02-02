'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

interface WalletBalance {
  cash: number;
  bank: number;
  easyPaisa: number;
  jazzCash: number;
  card: number;
  totalBalance: number;
}

interface Transaction {
  _id: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  amount: number;
  source: string;
  description: string;
  createdAt: string;
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transferAmount, setTransferAmount] = useState('');
  const [fromMethod, setFromMethod] = useState('cash');
  const [toMethod, setToMethod] = useState('bank');

  const fetchWallet = async () => {
    try {
      const res = await fetch('/api/admin/wallet');
      if (res.ok) {
        const data = await res.json();
        setWallet(data.wallet);
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('[v0] Wallet fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleTransfer = async () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      alert('Enter valid amount');
      return;
    }

    try {
      const res = await fetch('/api/admin/wallet/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(transferAmount),
          fromMethod,
          toMethod,
        }),
      });

      if (res.ok) {
        alert('Transfer successful');
        setTransferAmount('');
        fetchWallet();
      } else {
        alert('Transfer failed');
      }
    } catch (error) {
      console.error('[v0] Transfer error:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading wallet...</div>;
  }

  const walletData = wallet || {
    cash: 0,
    bank: 0,
    easyPaisa: 0,
    jazzCash: 0,
    card: 0,
    totalBalance: 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wallet & Finance</h1>
        <p className="text-gray-600 mt-2">Manage wallet balances and transactions</p>
      </div>

      {/* Total Balance */}
      <Card className="p-6 border-0 shadow-md bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="opacity-90">Total Balance</p>
            <p className="text-4xl font-bold mt-2">
              Rs. {walletData.totalBalance.toLocaleString()}
            </p>
          </div>
          <Wallet className="h-16 w-16 opacity-20" />
        </div>
      </Card>

      {/* Wallet Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 border-0 shadow-md">
          <p className="text-sm text-gray-600">Cash</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            Rs. {walletData.cash.toLocaleString()}
          </p>
        </Card>
        <Card className="p-4 border-0 shadow-md">
          <p className="text-sm text-gray-600">Bank</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            Rs. {walletData.bank.toLocaleString()}
          </p>
        </Card>
        <Card className="p-4 border-0 shadow-md">
          <p className="text-sm text-gray-600">EasyPaisa</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">
            Rs. {walletData.easyPaisa.toLocaleString()}
          </p>
        </Card>
        <Card className="p-4 border-0 shadow-md">
          <p className="text-sm text-gray-600">JazzCash</p>
          <p className="text-2xl font-bold text-orange-600 mt-2">
            Rs. {walletData.jazzCash.toLocaleString()}
          </p>
        </Card>
        <Card className="p-4 border-0 shadow-md">
          <p className="text-sm text-gray-600">Card</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            Rs. {walletData.card.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Transfer */}
      <Card className="p-6 border-0 shadow-md">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Transfer Between Wallets</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
            <select
              value={fromMethod}
              onChange={(e) => setFromMethod(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="easypaisa">EasyPaisa</option>
              <option value="jazzcash">JazzCash</option>
              <option value="card">Card</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
            <select
              value={toMethod}
              onChange={(e) => setToMethod(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="easypaisa">EasyPaisa</option>
              <option value="jazzcash">JazzCash</option>
              <option value="card">Card</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <Input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleTransfer}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Transfer
            </Button>
          </div>
        </div>
      </Card>

      {/* Transaction History */}
      <Card className="p-6 border-0 shadow-md">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Transaction History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Wallet</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {tx.type === 'income' ? (
                        <ArrowDownLeft className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                      )}
                      <span className="capitalize text-sm">{tx.type}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">{tx.category}</td>
                  <td className="py-3 px-4 text-sm capitalize">{tx.source}</td>
                  <td className="py-3 px-4 text-sm font-medium text-right">
                    <span
                      className={tx.type === 'income' ? 'text-green-600' : 'text-red-600'}
                    >
                      {tx.type === 'income' ? '+' : '-'} Rs. {tx.amount.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
