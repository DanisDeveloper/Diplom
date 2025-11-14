<template>
  <div class="main">
    <section class="section" v-for="(shaderCode, i) in shaders" :key="i" :class="{ reverse: i === 1 }">
      <div class="shader">
        <shader-window
            :ref="el => shaderRefs[i] = el"
            :code="shaderCode"
            :initial-pause="false"
            :disable-mouse-down-event="true"
            :disable-mouse-up-event="true"
            :disable-mouse-move-event="true"
            @click="goToNew(shaderCode)"
        />
      </div>
      <div class="text">
        <h2>{{ headings[i] }}</h2>
        <p>{{ texts[i] }}</p>
        <button class="gradient" @click="buttons[i].action">{{ buttons[i].label }}</button>
      </div>
    </section>
  </div>
</template>

<script>
import tonnel from "@/shaders/tonnel.js";
import voronoi from "@/shaders/voronoi.js";
import fragment from "@/shaders/fragment.js";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default {
  name: "ShowCase",
  setup() {
    const router = useRouter();

    const shaders = [fragment, voronoi, tonnel];
    const shaderRefs = ref([]);

    const headings = [
      "Build your own shaders",
      "Explore gallery",
      "Get started"
    ];

    const texts = [
      "Create stunning visual effects by writing your own shaders. Experiment with colors, shapes, and animations to bring your ideas to life.",
      "Discover amazing shaders created by the community. Browse through interactive visuals and get inspired for your next project.",
      "Start your journey in the world of shaders. No experience required — just dive in and create beautiful procedural art."
    ];

    const buttons = [
      { label: "Build", action: () => router.push("/new") },
      { label: "Explore", action: () => router.push("/gallery") },
      { label: "Get started", action: () => router.push("/login") }
    ];

    const goToNew = (code) => {
      router.push({ path: "/new", query: { code } });
    };

    onMounted(() => {
      gsap.utils.toArray(".section").forEach((section) => {
        const shader = section.querySelector(".shader");
        const text = section.querySelector(".text");

        gsap.fromTo(shader,
            { opacity: 0, x: section.classList.contains("reverse") ? 100 : -100 },
            {
              opacity: 1,
              duration: 1.2,
              ease: "power2.out",
              x: 0,
              scrollTrigger: {
                trigger: section,
                start: "top 80%",
                end: "bottom 60%",
                toggleActions: "play none none reverse",
                scrub: true
              }
            });

        gsap.fromTo(text,
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              duration: 1,
              ease: "power2.out",
              y: 0,
              delay: 0.2,
              scrollTrigger: {
                trigger: section,
                start: "top 80%",
                end: "bottom 60%",
                toggleActions: "play none none reverse",
                scrub: true
              }
            });

        gsap.to(shader, {
          yPercent: 10,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });
      });
    });

    return {
      shaders,
      shaderRefs,
      headings,
      texts,
      buttons,
      goToNew
    };
  }
};
</script>

<style scoped>
.main {
  width: 100%;
}

.section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: calc(100vh - 7rem);
  padding: 0 6vw;
  gap: 4rem;
  scroll-snap-align: start;
  transition: all 1s ease, transform 1s ease;
}

.section.reverse {
  flex-direction: row-reverse;
}

.shader {
  width: 65%;
  padding: 1em;
}

.shader .shader-window {
  width: 100%;
  height: 60vh;
  object-fit: cover;
  border-radius: 24px;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
  transition: all 0.6s ease;
}

.shader:hover .shader-window {
  transform: scale(1.05);
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.9);
}

.shader-window :deep(canvas) {
  border-radius: 10px;
}

.text {
  width: 45%;
}

.text h2 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.text p {
  font-size: 1.2rem;
  line-height: 1.6;
  opacity: 0.8;
  margin-bottom: 1.5rem;
}
</style>
