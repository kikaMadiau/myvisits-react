export const queryKeys = {
  user: ['user'],
  users: ['users'],
  dashboard: ['dashboard'],
  visits: {
    all: ['visits'],
    detail: (id) => ['visits', id],
  },
};
