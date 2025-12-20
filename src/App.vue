<template>
  <div id="app" :class="{ 'admin-layout': isAdminRoute }">
    <AppHeader v-if="!isAdminRoute" />
    <router-view />
    <AppFooter v-if="!isAdminRoute" />
    <AppToast />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppToast from '@/components/layout/AppToast.vue'

const route = useRoute()
const authStore = useAuthStore()

const isAdminRoute = computed(() => route.path.startsWith('/admin'))

onMounted(() => {
  authStore.initAuth()
})
</script>
