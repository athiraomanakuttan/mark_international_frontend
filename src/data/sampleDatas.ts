import {  Event } from '../types/event-types';



export const sampleEvents: Event[] = [
  {
    id: 1,
    name: 'Annual Conference 2024',
    location: 'Convention Center, New York',
    date: '2024-12-15',
    assignedUsers: [1, 2, 3],
    createdAt: '2024-01-10',
    category: 'Conference',
    priority: 'high'
  },
  {
    id: 2,
    name: 'Team Building Workshop',
    location: 'Corporate Office, Floor 5',
    date: '2024-12-20',
    assignedUsers: [2, 4],
    createdAt: '2024-01-12',
    category: 'Workshop',
    priority: 'medium'
  },
  {
    id: 3,
    name: 'Product Launch Event',
    location: 'Grand Hotel, Downtown',
    date: '2024-12-25',
    assignedUsers: [1, 3, 4, 5],
    createdAt: '2024-01-15',
    category: 'Launch',
    priority: 'high'
  },
  {
    id: 4,
    name: 'Client Meeting',
    location: 'Board Room A',
    date: '2025-01-05',
    assignedUsers: [1, 2],
    createdAt: '2024-01-18',
    category: 'Meeting',
    priority: 'low'
  },
  {
    id: 5,
    name: 'Training Session',
    location: 'Training Center',
    date: '2025-01-10',
    assignedUsers: [3, 4, 5],
    createdAt: '2024-01-20',
    category: 'Training',
    priority: 'medium'
  }
];