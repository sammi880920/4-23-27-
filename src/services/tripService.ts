import { Trip } from '../types';

const STORAGE_KEY = 'voyage_planner_trips';

export const tripService = {
  getTrips: (): Trip[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveTrips: (trips: Trip[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  },

  addTrip: (trip: Trip) => {
    const trips = tripService.getTrips();
    trips.push(trip);
    tripService.saveTrips(trips);
  },

  updateTrip: (updatedTrip: Trip) => {
    const trips = tripService.getTrips();
    const index = trips.findIndex(t => t.id === updatedTrip.id);
    if (index !== -1) {
      trips[index] = updatedTrip;
      tripService.saveTrips(trips);
    }
  },

  deleteTrip: (id: string) => {
    const trips = tripService.getTrips();
    const filtered = trips.filter(t => t.id !== id);
    tripService.saveTrips(filtered);
  }
};
