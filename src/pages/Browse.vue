<template>
  <loader v-if="isLoading"/>
  <!--  TODO Сделать обработку, когда сервер недоступен-->
  <div v-else>
    <div class="header">
      <sort-radio-buttons
          v-model="this.ordering"
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
          <span class="shader-window__text">
            <span class="shader-window__title">{{ shader['title'] }}</span>
            <span>&nbsp;by&nbsp;</span>
            <span
                class="shader-window__author"
                @click="$router.push(`/profile/${shader['user_id']}`)"
            >
              {{ shader['username'] }}
            </span>
          </span>
          <span class="shader-window-info__comments">
            {{ shader['comments'] }}
            <comment-icon class="comment-icon" :width="16" :height="16" :color="'#282C34'"></comment-icon>
          </span>
          <span class="shader-window-info__likes">
            {{ shader['likes'] }}
            <like-icon class="like-icon" :width="16" :height="16" :color="'#282C34'"></like-icon>
          </span>

        </div>
      </div>
    </div>
  </div>
</template>


<script>
import ShaderWindow from "@/components/ShaderWindow.vue";
import Loader from "@/components/Loader.vue";
import LikeIcon from "@/components/UI/Icons/LikeIcon.vue";
import SortRadioButtons from "@/components/RadioButtons.vue";
import CommentIcon from "@/components/UI/Icons/CommentIcon.vue";
import Pagination from "@/components/pagination.vue";

export default {
  components: {Pagination, CommentIcon, SortRadioButtons, LikeIcon, Loader, ShaderWindow},
  data() {
    return {
      isLoading: false,
      totalPages: null,
      page: this.$route.query.page || 1,
      shaders: [],
      ordering: this.$route.query.sort || 'Newest',
      sortOptions: ['Newest', 'Liked', 'Commented'],
      API_URL: import.meta.env.VITE_API_URL

    }
  },
  methods: {
    handleMouseEnter(index) {
      this.$refs.shaders[index].togglePause();
    },
    handleMouseLeave(index) {
      this.$refs.shaders[index].togglePause()
    },
  },
  watch: {
    ordering(newOption) {
      this.$router.push({
        path: `/browse/`,
        query: {
          page: this.page,
          sort: newOption
        }
      })
    },
    page(newPage) {
      this.$router.push({
        path: `/browse/`,
        query: {
          page: newPage,
          sort: this.ordering
        }
      })
    }
  },
  async mounted() {
    this.isLoading = true;
    try {
      const endpoint = `${this.API_URL}/shaders/?page=${this.page}&sort=${this.ordering}`;
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {"Content-Type": "application/json"},
        credentials: 'include',
      });

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
  flex-wrap: wrap;
  max-width: 100%;
}

.shader-window__text > span {
  white-space: nowrap;
}

.shader-window__title, .shader-window__author {
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.shader-window__author {
  cursor: pointer;
  font-weight: bold;
}

.shader-window__author:hover {
  text-decoration: underline;
}

.shader-window-info__comments {
  margin-left: auto;
}

.like-icon, .comment-icon {
  vertical-align: middle;
  padding-bottom: 2px;
}
</style>