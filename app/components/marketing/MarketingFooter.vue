<template>
  <footer class="py-16 px-6 border-t border-glass-border">
    <div class="max-w-7xl mx-auto">
      <div class="grid md:grid-cols-4 gap-12 mb-12">
        <!-- brand -->
        <div class="md:col-span-1">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-7 h-7 rounded-md bg-gradient-to-br from-sky-pastel to-mint flex items-center justify-center">
              <span class="text-[#0a0e1a] font-bold text-[10px]">S</span>
            </div>
            <span class="text-sm font-semibold text-white/80">syntraq</span>
          </div>
          <p class="text-xs text-white/30 leading-relaxed max-w-[200px]">
            the adaptive operations platform for modern field-service companies.
          </p>
        </div>

        <!-- product -->
        <div>
          <h4 class="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">product</h4>
          <div class="space-y-2.5">
            <NuxtLink to="/features" class="block text-sm text-white/35 hover:text-white/70 transition-base">features</NuxtLink>
            <NuxtLink to="/pricing" class="block text-sm text-white/35 hover:text-white/70 transition-base">pricing</NuxtLink>
            <span class="block text-sm text-white/20">integrations (coming soon)</span>
          </div>
        </div>

        <!-- company -->
        <div>
          <h4 class="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">company</h4>
          <div class="space-y-2.5">
            <NuxtLink to="/about" class="block text-sm text-white/35 hover:text-white/70 transition-base">about</NuxtLink>
            <span class="block text-sm text-white/20">blog (coming soon)</span>
            <span class="block text-sm text-white/20">careers (coming soon)</span>
          </div>
        </div>

        <!-- legal -->
        <div>
          <h4 class="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">legal</h4>
          <div class="space-y-2.5">
            <span class="block text-sm text-white/20">privacy policy</span>
            <span class="block text-sm text-white/20">terms of service</span>
          </div>
        </div>
      </div>

      <div class="pt-8 border-t border-glass-border flex flex-col md:flex-row items-center justify-between gap-4">
        <p class="text-xs text-white/20">&copy; {{ new Date().getFullYear() }} syntraq. all rights reserved.</p>
        <div class="flex items-center gap-6 text-white/20">
          <span class="text-xs">built for the field</span>
        </div>
      </div>
    </div>
  </footer>
</template>
