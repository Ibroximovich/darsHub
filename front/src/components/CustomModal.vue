<script setup lang="ts">
defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
        @click.self="emit('cancel')"
      >
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
          
          <!-- Icon -->
          <div class="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>

          <!-- Title -->
          <h3 class="text-lg font-bold text-gray-950 text-center">
            Profildan chiqmoqchimisiz?
          </h3>
          <p class="text-sm text-gray-500 text-center mt-1.5">
            Tizimdan chiqsangiz, qayta kirish uchun email va parolingizni kiritishingiz kerak bo'ladi.
          </p>

          <!-- Buttons -->
          <div class="flex gap-3 mt-6">
            <button
              @click="emit('cancel')"
              class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Qolish
            </button>
            <button
              @click="emit('confirm')"
              class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              Chiqish
            </button>
          </div>

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