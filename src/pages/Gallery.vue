<template>
  <div v-show="!$store.state.ui.isLoadingPage" class="header">
    <radio-buttons v-model="sortOption" :options="sortOptions"/>
    <pagination v-model:page="currentPage" :pages="totalPages" class="pagination"/>
  </div>

  <div class="shader-grid">
    <div v-for="(shader, index) in shaders" :key="index" class="shader-cell">
      <shader-window
          ref="shaderRefs"
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
          <span class="link" @click="$router.push(`/profile/${shader.user.name}`)">
            {{ truncate(shader.user.name) }}
          </span>
        </div>
        <div class="shader-window-info__stats">
          <view-icon v-tooltip="`${shader.views} Views`" class="like-icon" :width="20" :height="20" :color="'#282C34'"/>
          {{ shader.views }}
          <like-icon v-tooltip="`${shader.likes} Likes`" class="like-icon" :width="16" :height="16" :color="'#282C34'"/>
          {{ shader.likes }}
          <comment-icon v-tooltip="`${shader.comments} Comments`" class="comment-icon" :width="16" :height="16" :color="'#282C34'"/>
          {{ shader.comments }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { truncate } from "@/utils/truncate.js";

export default {
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();

    const shaders = ref([]);
    const totalPages = ref(0);
    const currentPage = ref(Number(route.query.currentPage) || 1);
    const pageSize = ref(12);
    const sortOption = ref(route.query.sort_option || "NEWEST");
    const sortOptions = ref(["NEWEST", "VIEWED", "LIKED", "COMMENTED"]);
    const isLoading = ref(false);
    const shaderRefs = ref([]);

    const fetchShaders = async () => {
      try {
        isLoading.value = true;
        store.commit("ui/setLoading", true);

        const query = route.query.query || store.state.search.query || "";
        const endpoint = `${store.state.api.API_URL}/shaders/public?query=${query}&page=${currentPage.value - 1}&page_size=${pageSize.value}&sort_option=${sortOption.value}`;

        const response = await fetch(endpoint, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Server returned an error");
        }

        totalPages.value = parseInt(response.headers.get("X-Total-Pages")) || 0;
        shaders.value = await response.json();
      } catch (error) {
        console.error(error);
        store.commit("ui/setError", error.status || 500);
      } finally {
        isLoading.value = false;
        store.commit("ui/setLoading", false);
      }
    };

    const handleMouseEnter = (index) => {
      shaderRefs.value[index]?.togglePause();
    };

    const handleMouseLeave = (index) => {
      shaderRefs.value[index]?.togglePause();
    };

    watch(sortOption, () => {
      router.push({
        path: "/gallery",
        query: {
          query: route.query.query || store.state.search.query,
          currentPage: currentPage.value,
          page_size: pageSize.value,
          sort_option: sortOption.value,
        },
      });
      fetchShaders();
    });

    watch(currentPage, () => {
      router.push({
        path: "/gallery",
        query: {
          query: route.query.query || store.state.search.query,
          currentPage: currentPage.value,
          page_size: pageSize.value,
          sort_option: sortOption.value,
        },
      });
      fetchShaders();
    });

    onMounted(fetchShaders);

    return {
      shaders,
      totalPages,
      currentPage,
      pageSize,
      sortOption,
      sortOptions,
      isLoading,
      shaderRefs,
      fetchShaders,
      handleMouseEnter,
      handleMouseLeave,
      truncate,
    };
  },
};
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