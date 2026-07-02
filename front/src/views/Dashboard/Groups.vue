<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { allGroupType } from '../../@types';
import http from '../../utils/http';
import { toast } from 'vue3-toastify';
import { CustomModal } from '../../components';


const groups = ref<allGroupType[]>([])

const isGroupModal = ref<boolean>(false)
const isDeleteModal = ref<boolean>(false)

async function fetchGroups() {
  try {
    const response = await http.get('/api/groups')
    groups.value = response.data.data
    
  } catch (err) {
    console.error("Guruhlarni yuklashda xatolik:", err)
  }
}

onMounted(() => {
  fetchGroups()
})



 async function handleDeleteGroup(id:number){
    try{
         await http.delete(`/api/groups/${id}`)
         groups.value = groups.value.filter(group => group.id !== id)
         toast.success("Muvaffaqqiyatli o'chirildi")
         isDeleteModal.value = false
    }catch(err){

        toast.error("O'chirishda xatolik")

        console.log(err);
        
    }


       
}

function handleEditGroup(id:number){
  alert(id)



}
</script>

<template>
  <div  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-extrabold text-gray-950">Guruhlar</h1>
        <p class="text-sm text-gray-500 mt-0.5">Barcha guruhlaringiz</p>
      </div>
      <button @click="isGroupModal = true" class="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Guruh qo'shish
      </button>
      <CustomModal 
      :isGroupModal="isGroupModal" 
      @closeGroupModal="isGroupModal = false"
      @refresh="fetchGroups"
    />
    
    </div>

    <!-- Empty state -->
    <div v-if="groups.length === 0" class="bg-white border border-gray-100 rounded-3xl p-14 flex flex-col items-center text-center shadow-sm">
      <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <p class="text-base font-semibold text-gray-800">Hozircha guruhlar yo'q</p>
      <p class="text-sm text-gray-400 mt-1">Yangi guruh qo'shib boshlang</p>
    </div>

    <!-- Groups grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="group in groups"
        :key="group.id"
        class="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow"
      >
        <!-- Group icon + name -->
        <div class="flex items-start gap-4 mb-4">
          <div class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-base font-bold text-gray-950 truncate">{{ group.name }}</h3>
            <span class="inline-block mt-1 px-2.5 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
              {{ group.subject }}
            </span>
          </div>
        </div>

        <!-- Schedule -->
        <div class="flex items-center gap-2 text-sm text-gray-500 mb-5">
          <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{{ group.schedule }}</span>
        </div>

        <!-- Buttons -->
        <div class="flex gap-2">
          <button @click="handleEditGroup(group.id)" class="cursor-pointer flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Tahrirlash
          </button>
          <button  @click="isDeleteModal = true" class="cursor-pointer flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <CustomModal 
            :isDeleteModal ="isDeleteModal"
            @deleteGroup="handleDeleteGroup(group.id)"
            @cancel="isDeleteModal = false"
            />
            O'chirish
          </button>
        </div>

      </div>
    </div>

  </div>
</template>