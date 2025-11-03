<template>

  <div class="shader-metadata">
    <div>
            <span v-if="this.shader.id && this.shader.origin?.id">
              forked from
              <span class="link"
                    @click="$router.push(`/new/${this.shader.origin.id}`)">{{
                  truncate(this.shader.origin?.title ? this.shader.origin.title : "")
                }}</span>
            </span>
      <span v-else-if="this.shader.id">
              Created
            </span>
      <span v-if="this.shader.id">
              by
              <span class="link" @click="$router.push(`/profile/${shader.user.id}`)">{{ this.shader.user.name }}</span>
              in {{ formatDate(this.shader.createdAt) }}
            </span>
    </div>
    <div class="shader-metadata__stats">
      <view-icon v-tooltip="'Views'" :width="16" :height="16" :color="'#282C34'"/>
      {{ shader.views }}

      <like-icon v-tooltip="'Likes'" :width="16" :height="16" :color="'#282C34'"/>
      {{ shader.likes }}

      <comment-icon v-tooltip="'Comments'" :width="16" :height="16" :color="'#282C34'"/>
      {{ shader.comments }}
    </div>

  </div>
</template>

<script>
import truncate from "@/utils/truncate.js";
import formatDate from "@/utils/formatDate.js";

export default {
  name: "shader-metadata",
  methods: {formatDate, truncate},
  props: {
    shader: {
      type: Object,
      required: true
    },
  }
}
</script>


<style scoped>
.shader-metadata {
  display: flex;
  margin-left: auto;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  white-space: nowrap;
  font-size: smaller;
}

.shader-metadata__stats {
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: 2px;
}

</style>