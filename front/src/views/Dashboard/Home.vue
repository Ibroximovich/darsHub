<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import http from '../../utils/http';

const isSidebarOpen = ref(false)
const allGroup = ref<number>(0)

const stats = computed(() => [
  { 
    label: 'Jami guruhlar', 
    value: allGroup.value,
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' 
  },
  { 
    label: "Jami o'quvchilar", 
    value: '0', 
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' 
  },
  { 
    label: 'Bu oylik daromad', 
    value: "0 so'm", 
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' 
  },
])
 onMounted(async() =>{
  try{
    const response = await http.get("/api/groups")
     allGroup.value = response.data.data.length
    
  }catch(err){
    console.log(err);
    
  }
  
})


</script>

<template>
  <div class="h-screen bg-gray-50 flex overflow-hidden">
    <!-- Overlay mobile -->
    <div
      v-if="isSidebarOpen"
      @click="isSidebarOpen = false"
      class="fixed inset-0 bg-black/40 z-20 lg:hidden"
    />
    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col h-screen overflow-hidden">

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
              <p class="text-2xl font-medium text-black mt-0.5">{{ stat.value }} ta</p>
            </div>
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