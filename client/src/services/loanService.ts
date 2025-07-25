const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function getLoans() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/loans`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function createLoan(data: any) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/loans`, {
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

export async function updateLoan(id: string, data: any) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/loans/${id}`, {
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

export async function deleteLoan(id: string) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/loans/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw await res.json();
  return res.json();
}