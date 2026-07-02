<script setup lang="ts">
import { computed, inject, type Ref, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Cookies from 'js-cookie'
import CustomModal from '../CustomModal.vue'
import { dataType } from '../../@types'

const route = useRoute()
const router = useRouter()
const showLogoutModal = ref(false)
const isSidebarOpen = inject('isSidebarOpen', ref(false)) as Ref<boolean>

const raw = localStorage.getItem('data')
const data: dataType | null = raw ? JSON.parse(raw) : null

const menuItems = [
  { label: 'Bosh sahifa', to: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Guruhlar', to: '/dashboard/groups', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { label: "O'quvchilar", to: '/dashboard/students', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { label: "To'lovlar", to: '/dashboard/payments', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
]

const initials = computed(() => {
  if (!data?.full_name) return ''
  const parts = data.full_name.trim().split(' ').filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return ''
})

function handleLogout() {
  Cookies.remove('token')
  showLogoutModal.value = false
  router.push('/')
}
</script>

<template>
  <!-- Overlay mobile -->
  <div
    v-if="isSidebarOpen"
    @click="isSidebarOpen = false"
    class="fixed inset-0 bg-black/40 z-20 lg:hidden"
  />

  <aside
    :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    class="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-30 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static shrink-0"
  >
    <!-- Logo -->
    <div class="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
      <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <span class="text-xl font-bold text-gray-950">DarsHub</span>
    </div>

    <!-- Menu -->
    <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
      <RouterLink
        v-for="item in menuItems"
        :key="item.label"
        :to="item.to"
        :class="route.path === item.to
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-700 hover:bg-gray-100'"
        class="flex items-center gap-3.5 px-4 py-3 rounded-xl text-base font-medium transition-colors"
      >
        <svg
          class="w-6 h-6 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          :class="route.path === item.to ? 'text-blue-600' : 'text-gray-500'"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="item.icon" />
        </svg>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <!-- User & Logout -->
    <div class="px-4 py-5 border-t border-gray-100 bg-white">
      <div class="flex items-center gap-3.5 px-4 py-3">
        <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
          <span class="text-blue-700 text-sm font-semibold">{{ initials }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-base font-semibold text-gray-950 truncate">{{ data?.full_name }}</p>
          <p class="text-xs text-gray-500 truncate">{{ data?.email }}</p>
        </div>
      </div>
      <button
        @click="showLogoutModal = true"
        class="w-full flex items-center gap-3.5 px-4 py-3 mt-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
      >
        <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span>Profildan chiqish</span>
      </button>
    </div>

    <!-- Logout Modal -->
    <CustomModal
      :isOpen="showLogoutModal"
      @confirm="handleLogout"
      @cancel="showLogoutModal = false"
    />
  </aside>
</template>