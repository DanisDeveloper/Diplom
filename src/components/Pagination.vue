<template>
  <div class="pagination">
    <button
        v-for="i in totalPages"
        :key="i"
        class="page gradient"
        :class="{'selected': i == this.page, 'dots': i === '...'}"
        @click="typeof i === 'number' && handlePageClick(i)"
        :disabled="i === '...'"
    >
      {{ i }}
    </button>
  </div>
</template>

<script>
export default {
  name: "pagination",
  props:{
    pages:{
      type: Number,
      required: true
    },
    page: {
      type: Number,
      required: true
    }
  },
  methods:{
    handlePageClick(newPage){
      this.$emit('update:page', newPage);
    }
  },
  computed:{
    totalPages() {
      const total = this.pages;
      const current = Number(this.page);

      if (total <= 7) {
        return Array.from({length: total}, (_, i) => i + 1);
      }

      const pages = [];

      pages.push(1);
      if (current > 4) {
        pages.push('...');
      }

      const start = Math.max(2, current - 2);
      const end = Math.min(total - 1, current + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 3) {
        pages.push('...');
      }
      pages.push(total);

      return pages;
    }
  }

}
</script>

<style scoped>
.pagination{
  display: flex;
  gap: 0.5rem;
}
.page{
  padding: 0.7rem;
}
</style>