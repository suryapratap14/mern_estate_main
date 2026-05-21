import React, { useEffect, useState } from "react";
import API_BASE_URL from "../api.js";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      const res = await fetch(`${API_BASE_URL}/api/payment/all`);
      const data = await res.json();
      if (data.success) setPayments(data.data);
    };
    fetchPayments();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Payments (Admin)</h1>
      {payments.length === 0 ? <p>No payments yet.</p> : (
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Payment ID</th>
              <th className="p-2 border">User</th>
              <th className="p-2 border">Listing</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p._id}>
                <td className="p-2 border">{p.paymentId}</td>
                <td className="p-2 border">{p.userId}</td>
                <td className="p-2 border">{p.listingId}</td>
                <td className="p-2 border">₹{p.amount}</td>
                <td className="p-2 border">{new Date(p.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
