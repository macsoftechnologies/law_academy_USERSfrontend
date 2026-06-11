import api from './axios';

const getUserId = () => localStorage.getItem('userId');

export const createTicket = async ({ title, description, ticket_type }) => {
  const res = await api.post('/tickets/create', {
    userId: getUserId(),
    title,
    description,
    ticket_type,
  });
  return res.data;
};

export const getMyTickets = async ({ status, page = 1, limit = 10 } = {}) => {
  const payload = { userId: getUserId(), page, limit };
  if (status) payload.status = status;
  const res = await api.post('/tickets/user-list', payload);
  return res.data;
};

export const getTicketDetails = async (ticketId) => {
  const res = await api.post('/tickets/details', {
    ticketId,
    userId: getUserId(),
  });
  return res.data;
};

export const addMessage = async (ticketId, message) => {
  const res = await api.post('/tickets/add-message', {
    ticketId,
    senderId: getUserId(),
    message,
  });
  return res.data;
};

export const scheduleCallback = async (ticketId, scheduledAt) => {
  const res = await api.post('/tickets/schedule-call', {
    ticketId,
    userId: getUserId(),
    scheduledAt,
  });
  return res.data;
};

export const markMessagesRead = async (ticketId) => {
  const res = await api.post('/tickets/mark-read', {
    ticketId,
    userId: getUserId(),
  });
  return res.data;
};
