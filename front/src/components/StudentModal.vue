<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { allGroupType, allStudentType } from '../@types';
import { useAddStudentStore } from '../store';

const props = defineProps<{
  isOpen: boolean
  groups: allGroupType[]
  student?: allStudentType | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'refresh'): void
}>()

const useAddStudent = useAddStudentStore()

const fullName = ref('')
const phone = ref('')
const parentName = ref('')
const parentPhone = ref('')
const groupId = ref<number | ''>('')

const isEditMode = computed(() => !!props.student?.id)

function resetForm() {
  fullName.value = ''
  phone.value = ''
  parentName.value = ''
  parentPhone.value = ''
  groupId.value = ''
}

function fillForm(student: allStudentType) {
  fullName.value = student.full_name
  phone.value = student.phone ?? ''
  parentName.value = student.parent_name ?? ''
  parentPhone.value = student.parent_phone ?? ''
  groupId.value = student.groups[0]?.id ?? ''
}

watch(
  () => [props.isOpen, props.student] as const,
  ([open, student]) => {
    if (open && student) {
      fillForm(student)
    } else if (!open) {
      resetForm()
    }
  }
)

async function handleSubmit() {
  const studentData = {
    full_name: fullName.value.trim(),
    phone: phone.value.trim() || undefined,
    parent_name: parentName.value.trim() || undefined,
    parent_phone: parentPhone.value.trim() || undefined,
  }

  const success = isEditMode.value && props.student
    ? await useAddStudent.updateStudentFn(
        props.student.id,
        studentData,
        groupId.value || null,
        props.student.groups.map((g) => g.id)
      )
    : await useAddStudent.addStudentFn(studentData, groupId.value || null)

  if (success) {
    emit('refresh')
    emit('close')
    resetForm()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
        @click.self="emit('close')"
      >
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-base font-semibold text-gray-900">
                {{ isEditMode ? "O'quvchini tahrirlash" : "Yangi o'quvchi qo'shish" }}
              </h3>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ isEditMode ? "Ma'lumotlarni yangilang" : "Ma'lumotlarni to'ldiring va guruh tanlang" }}
              </p>
            </div>
            <button
              type="button"
              @click="emit('close')"
              class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
            >
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">To'liq ism *</label>
              <input
                v-model="fullName"
                required
                type="text"
                placeholder="Masalan: Aliyev Sardor"
                class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Telefon raqam</label>
              <input
                v-model="phone"
                type="tel"
                placeholder="+998 90 123 45 67"
                class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Ota-ona ismi</label>
                <input
                  v-model="parentName"
                  type="text"
                  placeholder="Masalan: Aliyev Bobur"
                  class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Ota-ona telefoni</label>
                <input
                  v-model="parentPhone"
                  type="tel"
                  placeholder="+998 91 234 56 78"
                  class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Guruh *</label>
              <select
                v-model="groupId"
                required
                :disabled="groups.length === 0"
                class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition disabled:opacity-60"
              >
                <option value="" disabled>Guruhni tanlang</option>
                <option v-for="group in groups" :key="group.id" :value="group.id">
                  {{ group.name }} — {{ group.subject }}
                </option>
              </select>
              <p v-if="groups.length === 0" class="text-xs text-amber-600 mt-1.5">
                Avval guruh yarating, keyin o'quvchi qo'shing.
              </p>
            </div>

            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="emit('close')"
                class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                :disabled="useAddStudent.isLoading || groups.length === 0"
                :class="useAddStudent.isLoading ? 'bg-blue-200' : 'bg-blue-600 hover:bg-blue-700'"
                class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition disabled:cursor-not-allowed"
              >
                {{
                  useAddStudent.isLoading
                    ? (isEditMode ? 'Saqlanmoqda...' : "Qo'shilmoqda...")
                    : (isEditMode ? 'Saqlash' : "Qo'shish")
                }}
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
