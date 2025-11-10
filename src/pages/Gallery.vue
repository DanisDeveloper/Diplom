<template>
  <div v-show="!this.$store.state.ui.isLoadingPage" class="header">
    <radio-buttons
        v-model="this.sortOption"
        :options="this.sortOptions"
    />
    <pagination v-model:page="this.currentPage" :pages="totalPages" class="pagination"/>
  </div>
  <div class="shader-grid">
    <div v-for="(shader, index) in shaders" class="shader-cell">
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
          <view-icon v-tooltip="`${shader.views} Views`"
                     class="like-icon"
                     :width="20"
                     :height="20"
                     :color="'#282C34'"/>
          {{ shader.views }}

          <like-icon v-tooltip="`${shader.likes} Likes`"
                     class="like-icon"
                     :width="16"
                     :height="16"
                     :color="'#282C34'"/>
          {{ shader.likes }}

          <comment-icon v-tooltip="`${shader.comments} Comments`"
                        class="comment-icon"
                        :width="16"
                        :height="16"
                        :color="'#282C34'"/>
          {{ shader.comments }}
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
      isLoading: false,
      totalPages: 0,
      currentPage: Number(this.$route.query.currentPage) || 1,
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
        path: `/gallery`,
        query: {
          query: this.$route.query.query || this.$store.state.search.query ,
          currentPage: this.currentPage,
          page_size: this.pageSize,
          sort_option: newOption
        }
      })
    },
    currentPage(newPage) {
      this.$router.push({
        path: `/gallery`,
        query: {
          query: this.$route.query.query || this.$store.state.search.query ,
          currentPage: newPage,
          pageSize: this.pageSize,
          sort_option: this.sortOption
        }
      })
    }
  },
  mounted() {
    this.$store.commit("ui/setLoading", true);
    const endpoint = `${this.API_URL}/shaders/public?query=${this.$route.query.query || this.$store.state.search.query}&page=${this.currentPage - 1}&page_size=${this.pageSize}&sort_option=${this.sortOption}`;
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
      this.$store.commit("ui/setError", error.status);
    }).finally(() => {
      this.$store.commit("ui/setLoading", false);
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
  padding: 0.5em;
}

.shader-window {
  cursor: pointer;
  transition: all 0.3s ease;
  background: transparent;
  border-radius: 10px;
  aspect-ratio: 14 / 10;
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

</style>