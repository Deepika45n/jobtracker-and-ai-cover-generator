import { create } from 'zustand';

const API_URL = import.meta.env.DEV ? 'http://localhost:8080/api' : (import.meta.env.VITE_API_URL || '/api');

const useJobStore = create((set, get) => ({
  jobs: [],
  loadJobs: async (userId) => {
    if (!userId) {
      set({ jobs: [] });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/jobs/user/${userId}`);
      if (res.ok) {
        const userJobs = await res.json();
        set({ jobs: userJobs });
      }
    } catch (error) {
      console.error('Failed to load jobs', error);
    }
  },
  addJob: async (userId, jobData) => {
    try {
      const res = await fetch(`${API_URL}/jobs/user/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });
      if (res.ok) {
        const newJob = await res.json();
        set({ jobs: [newJob, ...get().jobs] });
      }
    } catch (error) {
      console.error('Failed to add job', error);
    }
  },
  updateJob: async (userId, jobId, updates) => {
    try {
      const res = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updatedJob = await res.json();
        const updatedJobs = get().jobs.map(j => j.id === jobId ? updatedJob : j);
        set({ jobs: updatedJobs });
      }
    } catch (error) {
      console.error('Failed to update job', error);
    }
  },
  deleteJob: async (userId, jobId) => {
    try {
      const res = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const updatedJobs = get().jobs.filter(j => j.id !== jobId);
        set({ jobs: updatedJobs });
      }
    } catch (error) {
      console.error('Failed to delete job', error);
    }
  }
}));

export default useJobStore;
