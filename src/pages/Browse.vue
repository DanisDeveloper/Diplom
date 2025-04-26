<template>
  <loader v-if="isLoading"></loader>
  <!--  TODO Сделать обработку, когда сервер недоступен-->
  <div v-else>
    <div class="header">
      <h1>Список шейдеров</h1>
      <div class="pagination">
        <button
            v-for="i in totalPages"
            :key="i"
            class="page"
            :class="{'active-page': i == page}"
            @click="handlePageClick(i)"
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
  async mounted() {
    this.isLoading = true;
    try {
      const endpoint = `http://localhost:8000/shaders/?page=${this.page}`;
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {"Content-Type": "application/json"},
        credentials: 'include',
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
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
  margin: 0 16px;
  align-items: center;
}

.pagination {
  margin: 5px 0 5px auto;
}

.page {

}

.active-page {
  background: red;
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