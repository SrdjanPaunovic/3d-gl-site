<template>
  <footer class="footer">
    <p>&copy; 2025 3D Gadgets Lab. {{ t('footer.rights') }}</p>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from '@/i18n'

const { t } = useI18n()
</script>
