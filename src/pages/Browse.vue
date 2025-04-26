<template>
  <loader v-if="isLoading"></loader>
  <!--  TODO Сделать обработку, когда сервер недоступен-->
  <div v-else>
    <div class="header">
      <h1>Список шейдеров</h1>
<!--      # TODO сделать сортировку по разным параметрам-->
      <div class="pagination">
        <button
            v-for="i in pages"
            :key="i"
            class="page"
            :class="{'active-page': i == this.page, 'dots': i === '...'}"
            @click="typeof i === 'number' && handlePageClick(i)"
            :disabled="i === '...'"
        >
          {{ i }}
        </button>
      </div>
    </div>
    <div class="shader-grid">
      <div
          v-for="(shader, index) in shaders"
          class="shader-cell"
      >
        <shader-window
            class="shader-window"
            ref="shaders"
            :key="index"
            :code="shader['code']"
            :initial-pause="true"
            @mouseenter="handleMouseEnter(index)"
            @mouseleave="handleMouseLeave(index)"
            :disable-mouse-down-event="true"
            :disable-mouse-up-event="true"
            :disable-mouse-move-event="true"
            @click="$router.push(`/new/${shader['id']}`)"
        />
        <div class="shader-window-info">
          <span class="shader-window-text">
            <span class="shader-window-title">{{ shader['title'] }}</span>
            <span>&nbsp;by&nbsp;</span>
            <span
                class="shader-window-author"
                @click="$router.push(`/profile/${shader['user_id']}`)"
            >
              {{ shader['username'] }}
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import ShaderWindow from "@/components/ShaderWindow.vue";
import Loader from "@/components/Loader.vue";

export default {
  components: {Loader, ShaderWindow},
  data() {
    return {
      isLoading: false,
      totalPages: null,
      page: this.$route.query.page || 1,
      shaders: [],
    }
  },
  methods: {
    handleMouseEnter(index) {
      this.$refs.shaders[index].togglePause();
    },
    handleMouseLeave(index) {
      this.$refs.shaders[index].togglePause()
    },
    handlePageClick(newPage) {
      if (this.page === newPage) return;
      this.$router.push({
        path: `/browse/`,
        query: {
          page: newPage
        }
      });
    }
  },
  computed: {
    pages() {
      const total = this.totalPages;
      const current = Number(this.page);

      if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
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
  },
  async mounted() {
    this.isLoading = true;
    try {
      const endpoint = `http://localhost:8000/shaders/?page=${this.page}`;
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {"Content-Type": "application/json"},
        credentials: 'include',
      });

      // await new Promise(resolve => setTimeout(resolve, 1000));
      this.shaders = await response.json();
      console.log(this.shaders)
      this.totalPages = parseInt(response.headers.get('x-total-count'));

    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
    }
  }
}
</script>


<style scoped>
.header {
  display: flex;
  margin: 10px 16px;
  align-items: center;
  color: #282C34;
}

.pagination {
  margin: 5px 0 5px auto;
}

.page {
  padding: 4px 8px;
  margin: 0 4px;
  border-radius: 8px;
  background: transparent;
  font-size: large;
  cursor: pointer;
  color: #282C34;
  transition: border 0.3s ease, color 0.3s ease;
  border: 1px solid #282C34;
}

.page:hover {
  color: lightgray;
  background: #282C34;
  transition: background 0.3s ease, color 0.3s ease;
}

.active-page {
  color: lightgray;
  background: #282C34;
}
button.dots {
  cursor: default;
  background: transparent;
  border: none;
  color: #282C34;
  margin: 0;
}
button.dots:hover{
  background: transparent;
  color: #282C34;
}

.shader-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: repeat(3, auto);
  align-content: space-between;
}

.shader-cell {
  margin: 0 16px 16px;
}

.shader-window {
  cursor: pointer;
}

.shader-window :deep(canvas) {
  border-radius: 10px;
}

.shader-window-info {
  display: flex;
  color: #282C34;
}

.shader-window-text {
  display: flex;
  flex-wrap: wrap;
  max-width: 100%;
}

.shader-window-text > span {
  white-space: nowrap;
}

.shader-window-title, .shader-window-author {
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.shader-window-author {
  cursor: pointer;
}

.shader-window-author:hover {
  text-decoration: underline;
}


</style>