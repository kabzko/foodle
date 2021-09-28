import { createRouter, createWebHistory } from '@ionic/vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/product',
    name: 'Product',
    component: () => import('@/views/Product.vue')
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('@/views/Products.vue')
  },
  {
    path: '/store',
    name: 'Store',
    component: () => import('@/views/Store.vue')
  },
  {
    path: '/stores',
    name: 'Stores',
    component: () => import('@/views/Stores.vue')
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/Cart.vue')
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('@/views/Checkout.vue')
  },
  {
    path: '/coordinator',
    name: 'Coordinator',
    component: () => import('@/views/Coordinator.vue'),
  },
  {
    path: '/checklocation',
    name: 'CheckLocation',
    component: () => import('@/views/CheckLocation.vue'),
    meta: { requiresVisitor: true }
  },
  {
    path: '/payments',
    name: 'Payments',
    component: () => import('@/views/Payments.vue')
  },
  {
    path: '/delivery',
    name: 'Delivery',
    component: () => import('@/views/Delivery.vue')
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/Orders.vue')
  },
  {
    path: '/order',
    name: 'Order',
    component: () => import('@/views/Order.vue')
  },
  {
    path: '/searchshores',
    name: 'SearchShoRes',
    component: () => import('@/views/SearchShoRes.vue')
  },
  {
    path: '/searchprodcat',
    name: 'SearchProdCat',
    component: () => import('@/views/SearchProdCat.vue')
  },
  {
    path: '/verify',
    name: 'Verify',
    component: () => import('@/views/Verify.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/verifycode',
    name: 'VerifyCode',
    component: () => import('@/views/VerifyCode.vue')
  },
  {
    path: '/password',
    name: 'Password',
    component: () => import('@/views/Password.vue')
  },
  {
    path: '/address',
    name: 'Address',
    component: () => import('@/views/Address.vue')
  },
  {
    path: '/location',
    name: 'Location',
    component: () => import('@/views/Location.vue')
  },
  {
    path: '/relocation',
    name: 'Relocation',
    component: () => import('@/views/Relocation.vue')
  },
  {
    path: '/success',
    name: 'Success',
    component: () => import('@/views/Success.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue')
  },
  {
    path: '/verifyaccount',
    name: 'VerifyAccount',
    component: () => import('@/views/VerifyAccount.vue')
  },
  {
    path: '/helpcenter',
    name: 'HelpCenter',
    component: () => import('@/views/HelpCenter.vue')
  },
  {
    path: '/chatbox',
    name: 'ChatBox',
    component: () => import('@/views/ChatBox.vue')
  },
  {
    path: '/verifycodeforgotpassword',
    name: 'VerifyCodeForgotPassword',
    component: () => import('@/views/VerifyCodeForgotPassword.vue')
  },
  {
    path: '/forgotpassword',
    name: 'ForgotPassword',
    component: () => import('@/views/ForgotPassword.vue')
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
