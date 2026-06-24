export const routes = {
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  verifyEmail: '/verify-email',
  profile: '/profile',
  home: '/',
  dashboard: '/dashboard',
  project: '/project',
  invite: '/invite/',
  boards:'/boards',
 view:'/view',
 superadmin:'/super-admin',
  // ** Sprints
  workspace: '/workspace/',
  workspaceItem: (id: string, item: string) => `/workspace/${id}/${item}`,
  workspaceSprints: (id: string) => `/workspace/${id}/sprints`,
  workspaceTasks: (id: string) => `/workspace/${id}/sprint-tasks`,
  workspaceBugs: (id: string) => `/workspace/${id}/bug-queue`
}
