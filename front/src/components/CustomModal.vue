<script setup lang="ts">
import { ref } from 'vue';
import { useAddGroupStore } from '../store';

defineOptions({
  inheritAttrs: false
})

defineProps<{
  isGroupModal?: boolean,
  isOpen?: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'closeGroupModal'): void
}>()

const useAddGroup = useAddGroupStore()

const name = ref<string>('')
const subject = ref<string>('')
const schedule = ref<string>('')

function handleSubmit(){
  const group = {
    name:name.value,
    subject:subject.value,
    schedule:schedule.value
  }
  useAddGroup.addGroupFn(group)
  console.log(group);
  

}

</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
        @click.self="emit('cancel')">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">

          <div class="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>

          <h3 class="text-lg font-bold text-gray-950 text-center">
            Profildan chiqmoqchimisiz?
          </h3>
          <p class="text-sm text-gray-500 text-center mt-1.5">
            Tizimdan chiqsangiz, qayta kirish uchun email va parolingizni kiritishingiz kerak bo'ladi.
          </p>

          <div class="flex gap-3 mt-6">
            <button @click="emit('cancel')"
              class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
              Qolish
            </button>
            <button @click="emit('confirm')"
              class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">
              Chiqish
            </button>
          </div>

        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="isGroupModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
        @click.self="emit('closeGroupModal')">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-base font-semibold text-gray-900">Yangi guruh qo'shish</h3>
            <button @click="emit('closeGroupModal')"
              class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition">
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-4">

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Guruh nomi</label>
              <input v-model="name" required type="text" placeholder="Masalan: Matematika 8-sinf"
                class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Fan</label>
              <input v-model="subject" required type="text" placeholder="Masalan: Matematika"
                class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Jadval</label>
              <input v-model="schedule" required type="text" placeholder="Masalan: Dushanba-Chorshanba 16:00"
                class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" />
            </div>

            <div class="flex gap-3 mt-6">
              <button @click="emit('closeGroupModal')"
                class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition">
                Bekor qilish
              </button>
              <button type="submit"
                class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition">
                Qo'shish
              </button>
            </div>
          </form>

         

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>