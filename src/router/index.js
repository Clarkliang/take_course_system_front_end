import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true,
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true,
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: { title: '主页' },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index'),
        meta: { title: '主页', icon: 'dashboard' },
      },
    ],
  },

  // {
  //   path: '/example',
  //   component: Layout,
  //   redirect: '/example/table',
  //   name: 'Example',
  //   meta: { title: 'Example', icon: 'example' },
  //   children: [
  //     {
  //       path: 'table',
  //       name: 'Table',
  //       component: () => import('@/views/table/index'),
  //       meta: { title: 'Table', icon: 'table' },
  //     },
  //     {
  //       path: 'tree',
  //       name: 'Tree',
  //       component: () => import('@/views/tree/index'),
  //       meta: { title: 'Tree', icon: 'tree' },
  //     },
  //   ],
  // },

  // {
  //   path: '/form',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'index',
  //       name: 'Form',
  //       component: () => import('@/views/form/index'),
  //       meta: { title: 'Form', icon: 'form' },
  //     },
  //   ],
  // },
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/UserManage',
    component: Layout,
    redirect: '/UserManage/UserInformation',
    name: 'UserManage',
    meta: {
      title: '用户管理',
      icon: 'user',
    },
    children: [
      {
        path: 'UserInformation',
        component: () => import('@/views/userManage/userInformation'),
        name: 'UserInformation',
        meta: { title: '用户信息', icon: 'user' },
      },
      {
        path: 'UpdatePassword',
        component: () => import('@/views/userManage/updatePassword'),
        name: 'UpdatePassword',
        meta: {
          title: '修改密码',
          icon: 'edit',
        },
      },
      {
        path: 'LoginRecords',
        component: () => import('@/views/userManage/loginRecords.vue'),
        name: 'LoginRecords',
        meta: {
          title: '登录日志',
          icon: 'documentation',
        },
      },
      {
        path: 'UpdatePasswordRecords',
        component: () =>
                    import('@/views/userManage/updatePasswordRecords.vue'),
        name: 'UpdatePasswordRecords',
        meta: {
          title: '修改密码日志',
          icon: 'documentation',
        },
      },
      {
        path: 'AllStudentManage',
        component: () =>
                    import('@/views/userManage/allStudentManage.vue'),
        name: 'AllStudentManage',
        meta: {
          title: '所有学生管理',
          icon: 'peoples',
          roles: ['教务员', '系统管理员'],
        },
      },
      {
        path: 'AllTeacherManage',
        component: () =>
                    import('@/views/userManage/allTeacherManage.vue'),
        name: 'AllTeacherManage',
        meta: {
          title: '所有老师管理',
          icon: 'peoples',
          roles: ['教务员', '系统管理员'],
        },
      },
    ],
  },
  {
    path: '/BaseInfoManage',
    component: Layout,
    redirect: '/BaseInfoManage/UserInformation',
    name: 'BaseInfoManage',
    meta: {
      title: '基础信息管理',
      icon: 'example',
      roles: ['教务员', '系统管理员'],
    },
    children: [
      {
        path: 'TitleManage',
        component: () => import('@/views/baseInfoManage/titleManage'),
        name: 'TitleManage',
        meta: { title: '职称信息管理', icon: 'documentation' },
      },
      {
        path: 'CollegeManage',
        component: () => import('@/views/baseInfoManage/collegeManage'),
        name: 'CollegeManage',
        meta: { title: '学院管理', icon: 'documentation' },
      },
    ],
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true },
]

const createRouter = () =>
  new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes,
  })

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
