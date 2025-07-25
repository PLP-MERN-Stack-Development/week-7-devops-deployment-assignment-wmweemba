// client/src/services/borrowerService.ts
import api from './api'; // Import the configured Axios instance
import { Borrower } from '@/types'; // Import your updated Borrower type

// The API_URL is now managed by the 'api' instance's baseURL, so we don't need it here.
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Fetch all borrowers from the backend
export async function getBorrowers(): Promise<Borrower[]> {
    try {
        // Use api.get. The JWT token will be automatically attached by the interceptor.
        const response = await api.get<Borrower[]>('/borrowers');
        // MongoDB returns _id, but your frontend type might still expect 'id' if not updated.
        // If your frontend Borrower type uses '_id', no mapping is needed here.
        // If it still uses 'id', you'd map it: .map(b => ({ ...b, id: b._id }))
        return response.data;
    } catch (error) {
        // Axios errors are typically caught here.
        // The response interceptor in api.ts handles 401s globally.
        // For other errors, you can re-throw or handle specifically.
        console.error('Error fetching borrowers:', error);
        throw error; // Re-throw to be caught by AppContext or component
    }
}

// Create a new borrower
export async function createBorrower(data: Omit<Borrower, '_id' | 'createdAt' | 'updatedAt' | 'totalLoans' | 'totalOutstanding'>): Promise<Borrower> {
    try {
        // Use api.post. Content-Type and Authorization headers are handled by interceptors.
        const response = await api.post<Borrower>('/borrowers', data);
        return response.data;
    } catch (error) {
        console.error('Error creating borrower:', error);
        throw error;
    }
}

// Update an existing borrower
export async function updateBorrower(_id: string, data: Partial<Borrower>): Promise<Borrower> {
    try {
        // Use api.put with the borrower's _id in the URL.
        const response = await api.put<Borrower>(`/borrowers/${_id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating borrower:', error);
        throw error;
    }
}

// Delete a borrower
export async function deleteBorrower(_id: string): Promise<void> {
    try {
        // Use api.delete with the borrower's _id in the URL.
        await api.delete(`/borrowers/${_id}`);
    } catch (error) {
        console.error('Error deleting borrower:', error);
        throw error;
    }
}
