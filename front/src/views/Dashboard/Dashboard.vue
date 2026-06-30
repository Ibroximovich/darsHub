<script setup lang="ts">
import { computed, ref } from 'vue'
import { dataType } from '../../@types'
import { CustomModal } from '../../components'
import Cookies from 'js-cookie'
import router from '../../routes'


const isSidebarOpen = ref(false)

const stats = [
  { label: 'Jami guruhlar', value: '0', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { label: "Jami o'quvchilar", value: '0', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { label: 'Bu oylik daromad', value: "0 so'm", icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
]

const menuItems = [
  { label: 'Bosh sahifa', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', active: true },
  { label: 'Guruhlar', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', active: false },
  { label: "O'quvchilar", icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', active: false },
  { label: "To'lovlar", icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', active: false },
]

const raw = localStorage.getItem('data');
const data: dataType | null = raw ? JSON.parse(raw) : null;

const showLogoutModal = ref(false)



const initials = computed(() => {
  if (!data?.full_name) return ''
  
  const parts = data.full_name.trim().split(' ').filter(Boolean)
  
  if (parts.length >= 2) {
    // Ism va familiyaning bosh harflari: "Sarvar Aliyev" -> "SA"
    return (parts[0][0] + parts[1][0]).toUpperCase()
  } else if (parts.length === 1) {
    // Faqat bitta so'z bo'lsa, uning birinchi 2 harfi: "Sarvar" -> "SA"
    return parts[0].slice(0, 2).toUpperCase()
  }
  
  return ''
})

// logout 

function handleLogout(){
  Cookies.remove("token")
    showLogoutModal.value = false
    router.push("/")
}
</script>

<template>
  <div class="h-screen bg-gray-50 flex overflow-hidden">

    <!-- Overlay mobile -->
    <div
      v-if="isSidebarOpen"
      @click="isSidebarOpen = false"
      class="fixed inset-0 bg-black/40 z-20 lg:hidden"
    />

    <!-- Sidebar -->
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
        <a 
          v-for="item in menuItems"
          :key="item.label"
          href="#"
          :class="item.active
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-700 hover:bg-gray-100'"
          class="flex items-center gap-3.5 px-4 py-3 rounded-xl text-base font-medium transition-colors"
        >
          <svg class="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" :class="item.active ? 'text-blue-600' : 'text-gray-500'">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="item.icon" />
          </svg>
          <span>{{ item.label }}</span>
        </a>
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
        <button @click="showLogoutModal = true" class="w-full flex items-center gap-3.5 px-4 py-3 mt-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-colors">
          <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Profildan chiqish</span>
          <CustomModal 
          :isOpen ='showLogoutModal'
           @confirm="handleLogout"
           @cancel="showLogoutModal = false"
          />
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col h-screen overflow-hidden">

      <!-- Header / Navbar -->
      <header class="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 shrink-0">
        <button
          @click="isSidebarOpen = true"
          class="lg:hidden p-2.5 -ml-2.5 rounded-lg hover:bg-gray-100 transition"
        >
          <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div class="flex-1">
          <h1 class="text-2xl font-extrabold text-gray-950">Bosh sahifa</h1>
          <p class="text-sm text-gray-600">Xush kelibsiz, <span class="capitalize">{{ data?.full_name }}!</span></p>
        </div>
      </header>

      <!-- Scrollable Content -->
      <main class="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto">

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="bg-white border border-gray-100 rounded-3xl p-6 flex items-center gap-5 shadow-sm shadow-blue-50/50"
          >
            <div class="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
              <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="stat.icon" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-600">{{ stat.label }}</p>
              <p class="text-3xl font-extrabold text-gray-950 mt-0.5">{{ stat.value }}</p>
            </div>
          </div>
        </div>

        <!-- Yaqin darslar (Qaytarilgan qism) -->
        <div class="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 class="text-base font-bold text-gray-900">Yaqin darslar</h2>
            <a href="#" class="text-sm font-medium text-blue-600 hover:underline">Barchasi</a>
          </div>

          <div class="flex flex-col items-center justify-center py-14 text-center px-4">
            <div class="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
              <svg class="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p class="text-base font-semibold text-gray-800">Hozircha darslar yo'q</p>
            <p class="text-sm text-gray-400 mt-1">Guruh ochib dars qo'shing</p>
            <button class="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-blue-500/10">
              Guruh qo'shish
            </button>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>


<style>
aside nav::-webkit-scrollbar,
main::-webkit-scrollbar {
    width: 6px;
}
aside nav::-webkit-scrollbar-thumb,
main::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
}
aside nav::-webkit-scrollbar-track,
main::-webkit-scrollbar-track {
    background-color: transparent;
}
</style>