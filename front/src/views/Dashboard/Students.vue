<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { allGroupType, allStudentType } from '../../@types';
import http from '../../utils/http';
import { toast } from 'vue3-toastify';
import { CustomModal, StudentModal } from '../../components';

const students = ref<allStudentType[]>([])
const groups = ref<allGroupType[]>([])

const isStudentModal = ref(false)
const isDeleteModal = ref(false)
const selectedStudent = ref<allStudentType | null>(null)
const studentToDeleteId = ref<number | null>(null)

const totalStudents = computed(() => students.value.length)

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('')
}

async function fetchStudents() {
  try {
    const response = await http.get('/api/students')
    students.value = response.data.data
  } catch (err) {
    console.error("O'quvchilarni yuklashda xatolik:", err)
  }
}

async function fetchGroups() {
  try {
    const response = await http.get('/api/groups')
    groups.value = response.data.data
  } catch (err) {
    console.error('Guruhlarni yuklashda xatolik:', err)
  }
}

onMounted(() => {
  fetchStudents()
  fetchGroups()
})

function openAddModal() {
  selectedStudent.value = null
  isStudentModal.value = true
}

function closeStudentModal() {
  isStudentModal.value = false
  selectedStudent.value = null
}

function handleEditStudent(student: allStudentType) {
  selectedStudent.value = student
  isStudentModal.value = true
}

function openDeleteModal(id: number) {
  studentToDeleteId.value = id
  isDeleteModal.value = true
}

function closeDeleteModal() {
  isDeleteModal.value = false
  studentToDeleteId.value = null
}

async function handleDeleteStudent() {
  if (!studentToDeleteId.value) return

  try {
    await http.delete(`/api/students/${studentToDeleteId.value}`)
    students.value = students.value.filter(s => s.id !== studentToDeleteId.value)
    toast.success("O'quvchi muvaffaqiyatli o'chirildi")
    closeDeleteModal()
  } catch (err) {
    toast.error("O'chirishda xatolik")
    console.log(err)
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-extrabold text-gray-950">O'quvchilar</h1>
        <p class="text-sm text-gray-500 mt-0.5">
          Jami {{ totalStudents }} ta o'quvchi
        </p>
      </div>
      <button
        @click="openAddModal"
        class="cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        O'quvchi qo'shish
      </button>
    </div>

    <StudentModal
      :isOpen="isStudentModal"
      :groups="groups"
      :student="selectedStudent"
      @close="closeStudentModal"
      @refresh="fetchStudents"
    />

    <CustomModal
      :isDeleteModal="isDeleteModal"
      deleteTitle="O'quvchini o'chirmoqchimisiz?"
      @deleteGroup="handleDeleteStudent"
      @cancel="closeDeleteModal"
    />

    <!-- Empty state -->
    <div
      v-if="students.length === 0"
      class="bg-white border border-gray-100 rounded-3xl p-14 flex flex-col items-center text-center shadow-sm"
    >
      <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>
      <p class="text-base font-semibold text-gray-800">Hozircha o'quvchilar yo'q</p>
      <p class="text-sm text-gray-400 mt-1">Yangi o'quvchi qo'shib boshlang</p>
    </div>

    <!-- Students grid -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div
        v-for="student in students"
        :key="student.id"
        class="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center shrink-0">
            <span class="text-sm font-bold text-violet-600">{{ getInitials(student.full_name) }}</span>
          </div>

          <div class="flex-1 min-w-0">
            <h3 class="text-base font-bold text-gray-950 truncate">{{ student.full_name }}</h3>

            <div v-if="student.phone" class="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{{ student.phone }}</span>
            </div>

            <div
              v-if="student.parent_name || student.parent_phone"
              class="mt-3 p-3 bg-gray-50 rounded-2xl border border-gray-100"
            >
              <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Ota-ona</p>
              <p v-if="student.parent_name" class="text-sm font-medium text-gray-800">{{ student.parent_name }}</p>
              <p v-if="student.parent_phone" class="text-sm text-gray-500 mt-0.5">{{ student.parent_phone }}</p>
            </div>

            <div class="flex flex-wrap gap-2 mt-4">
              <span
                v-for="group in student.groups"
                :key="group.id"
                class="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ group.name }}
              </span>
              <span
                v-if="student.groups.length === 0"
                class="inline-block px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full"
              >
                Guruh biriktirilmagan
              </span>
            </div>
          </div>
        </div>

        <div class="flex gap-2 mt-5 pt-4 border-t border-gray-100">
          <button
            @click="handleEditStudent(student)"
            class="cursor-pointer flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Tahrirlash
          </button>
          <button
            @click="openDeleteModal(student.id)"
            class="cursor-pointer flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            O'chirish
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
