<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-brand">
        <i class="fas fa-cube"></i>
        <span>3D Gadgets Lab</span>
      </div>
      <div class="footer-links">
        <RouterLink to="/">{{ t('nav.home') }}</RouterLink>
        <RouterLink to="/shop">{{ t('nav.shop') }}</RouterLink>
        <RouterLink to="/cart">{{ t('nav.cart') || 'Cart' }}</RouterLink>
      </div>
      <div class="footer-social">
        <a href="https://instagram.com/3d_gadgets_lab_ns" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
        <a href="https://facebook.com/3dgadgetslab" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
        <!-- <a href="https://tiktok.com/@3dgadgetslab" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><i class="fab fa-tiktok"></i></a> -->
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2025 3D Gadgets Lab. {{ t('footer.rights') }}</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from '@/i18n'

const { t } = useI18n()
</script>

<style lang="scss" scoped>
.footer {
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid var(--border-color);
  padding: 3rem 2rem 1.5rem;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 1.5rem;
  }
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  
  i {
    font-size: 1.5rem;
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  @media (max-width: 768px) {
    justify-content: center;
  }
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 2rem;
  
  a {
    color: var(--muted-color);
    text-decoration: none;
    transition: color 0.3s ease;
    
    &:hover {
      color: var(--primary-color);
    }
  }
  
  @media (max-width: 768px) {
    justify-content: center;
  }
}

.footer-social {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: flex-end;
  
  a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 50%;
    color: var(--muted-color);
    font-size: 1rem;
    transition: all 0.3s ease;
    
    &:hover {
      background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
      border-color: transparent;
      color: white;
      transform: translateY(-3px);
    }
  }
  
  @media (max-width: 768px) {
    justify-content: center;
  }
}

.footer-bottom {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  
  p {
    color: var(--muted-color);
    font-size: 0.875rem;
    margin: 0;
  }
}
</style>
