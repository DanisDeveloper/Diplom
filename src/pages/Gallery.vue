<template>
  <loader v-if="isLoading"/>
  <div v-else-if="this.isError" class="error-page-block">
    <error :status="this.errorStatus"></error>
  </div>
  <div v-else>
    <div class="header">
      <radio-buttons
          v-model="this.sortOption"
          :options="this.sortOptions"
      />
      <pagination v-model:page="page" :pages="totalPages" class="pagination"/>
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
            :code="shader.code"
            :initial-pause="true"
            @mouseenter="handleMouseEnter(index)"
            @mouseleave="handleMouseLeave(index)"
            :disable-mouse-down-event="true"
            :disable-mouse-up-event="true"
            :disable-mouse-move-event="true"
            @click="$router.push(`/new/${shader.id}`)"
        />
        <div class="shader-window-info">
          <div class="shader-window__text">
            <span>{{ truncate(shader.title) }}</span>
            <span>&nbsp;by&nbsp;</span>
            <span
                class="link"
                @click="$router.push(`/profile/${shader.user.name}`)"
            >
              {{ truncate(shader.user.name) }}
            </span>
          </div>
          <div class="shader-window-info__stats">
            <view-icon v-tooltip="'Views'" class="like-icon" :width="20" :height="20" :color="'#282C34'"></view-icon>
            {{ shader.views }}

            <like-icon v-tooltip="'Likes'" class="like-icon" :width="16" :height="16" :color="'#282C34'"></like-icon>
            {{ shader.likes }}

            <comment-icon v-tooltip="'Comments'" class="comment-icon" :width="16" :height="16" :color="'#282C34'"></comment-icon>
            {{ shader.comments }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import truncate from "@/utils/truncate.js";
import Error from "@/components/Error.vue";

export default {
  data() {
    return {
      isError: false,
      errorStatus: 0,
      isLoading: false,
      totalPages: null,
      page: this.$route.query.page || 1,
      pageSize: 12,
      shaders: [],
      sortOption: this.$route.query.sort_option || 'NEWEST',
      sortOptions: ['NEWEST', 'VIEWED', 'LIKED', 'COMMENTED'],
      API_URL: import.meta.env.VITE_API_URL
    }
  },
  methods: {
    truncate,
    handleMouseEnter(index) {
      this.$refs.shaders[index].togglePause();
    },
    handleMouseLeave(index) {
      this.$refs.shaders[index].togglePause()
    }
  },
  watch: {
    sortOption(newOption) {
      this.$router.push({
        path: `/gallery/`,
        query: {
          page: this.page,
          page_size: this.pageSize,
          sort_option: newOption
        }
      })
    },
    page(newPage) {
      this.$router.push({
        path: `/gallery/`,
        query: {
          page: newPage,
          pageSize: this.pageSize,
          sort_option: this.sortOption
        }
      })
    }
  },
  mounted() {
    this.isLoading = true;
    const endpoint = `${this.API_URL}/shaders?page=${this.page - 1}&page_size=${this.pageSize}&sort_option=${this.sortOption}`;
    fetch(endpoint, {
      method: "GET",
      headers: {"Content-Type": "application/json"},
      credentials: 'include',
    }).then(response => {
      if (!response.ok) {
        throw new Error(response.text() || "Server returned an error");
      }
      console.log(response.headers.get("X-Total-Count"));
      this.totalPages = parseInt(response.headers.get('X-Total-Pages'));
      return response.json();
    }).then(shaders => {
      this.shaders = shaders;
    }).catch(error => {
      this.errorStatus = error.status;
      this.isError = true;
    }).finally(() => {
      this.isLoading = false;
    })
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
  transition: all 0.3s ease;
  background: transparent;
  border-radius: 10px;
}

.shader-window:hover {
  transform: scale(1.03);
  box-shadow: 0 0 24px rgba(40, 40, 60, 0.9);
}

.shader-window :deep(canvas) {
  border-radius: 10px;
}

.shader-window-info {
  display: flex;
  color: #282C34;
}

.shader-window__text {
  display: flex;
  flex-wrap: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80%;
}

.shader-window-info__stats {
  margin-left: auto;
}


.like-icon, .comment-icon {
  vertical-align: middle;
  padding-bottom: 2px;
}

.error-page-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
  margin-top: 100px;
  color: #282C34;
}
</style>