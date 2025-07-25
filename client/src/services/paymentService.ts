const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function getPayments() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/payments`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function createPayment(data: any) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function updatePayment(id: string, data: any) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/payments/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function deletePayment(id: string) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/payments/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw await res.json();
  return res.json();
}