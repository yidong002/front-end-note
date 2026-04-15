// router.js
// import { createRouter, createWebHistory } from 'vue-router'
import { createRouter as _createRouter, createWebHistory, createMemoryHistory } from 'vue-router'

import Home from '../views/Home.vue'
import About from '../views/About.vue'
import AddOrEdit from '../views/AddOrEdit.vue'
import Detail from '../views/Detail.vue'
import Email from '../views/Email.vue'
import Tel from '../views/Tel.vue'

const routes = [
  {
    path: '/home',
    component: Home,
    name: 'home'
  },
  {
    path: '/about',
    component: About,
    name: 'about',
    redirect: '/about/email',
    children: [
      {
        path: 'email',
        component: Email,
        name: 'email'
      },
      {
        path: 'tel',
        component: Tel,
        name: 'tel'
      }
    ]
  },
  {
    path: '/add',
    component: AddOrEdit,
    name: 'add'
  },
  {
    path: '/detail/:id',
    name: 'detail',
    component: Detail
  },
  {
    path: '/edit/:id',
    name: 'edit',
    component: AddOrEdit
  },
  {
    path: '/',
    redirect: '/home'
  }
]

// const router = createRouter({
//   history: createWebHistory(),
//   routes
// })

export function createRouter() {
  return _createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes
  })
}
