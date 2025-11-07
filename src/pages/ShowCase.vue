<template>
  <div class="main">
    <section class="section">
      <div class="shader">
        <shader-window
            ref="shaderWindow0"
            :code="this.shaders[0]"
            :initial-pause="false"
            @click="this.$router.push({ path: '/new', query: { code: this.shaders[0] } })"
            :disable-mouse-down-event="true"
            :disable-mouse-up-event="true"
            :disable-mouse-move-event="true"
        />
      </div>
      <div class="text">
        <h2>Build your own shaders</h2>
        <p>Create stunning visual effects by writing your own shaders. Experiment with colors, shapes, and animations to
          bring your ideas to life.</p>
        <button class="gradient" @click="this.$router.push('/new')">Build</button>
      </div>
    </section>
    <section class="section reverse">
      <div class="text">
        <h2>Explore gallery</h2>
        <p>Discover amazing shaders created by the community. Browse through interactive visuals and get inspired for
          your next project.</p>
        <button class="gradient" @click="this.$router.push('/gallery')">Explore</button>
      </div>
      <div class="shader">
        <shader-window
            ref="shaderWindow1"
            :code="this.shaders[1]"
            :initial-pause="false"
            @click="this.$router.push({ path: '/new', query: { code: this.shaders[1] } })"
            :disable-mouse-down-event="true"
            :disable-mouse-up-event="true"
            :disable-mouse-move-event="true"
        />
      </div>
    </section>
    <section class="section">
      <div class="shader">
        <shader-window
            ref="shaderWindow2"
            :code="this.shaders[2]"
            :initial-pause="false"
            @click="this.$router.push({ path: '/new', query: { code: this.shaders[2] } })"
            :disable-mouse-down-event="true"
            :disable-mouse-up-event="true"
            :disable-mouse-move-event="true"
        />
      </div>
      <div class="text">
        <h2>Get started</h2>
        <p>Start your journey in the world of shaders. No experience required — just dive in and create beautiful
          procedural art.</p>
        <button class="gradient" @click="this.$router.push('/login')">Get started</button>
      </div>
    </section>
  </div>
</template>


<script>
import tonnel from "@/shaders/tonnel.js"
import voronoi from "@/shaders/voronoi.js"
import fragment from "@/shaders/fragment.js"
import {gsap} from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default {
  name: "ShowCase",
  data() {
    return {
      shaders: [fragment, voronoi, tonnel],
    }
  },
  mounted() {
    gsap.utils.toArray(".section").forEach((section, index) => {
      const shader = section.querySelector(".shader");
      const text = section.querySelector(".text");
      gsap.fromTo(shader,
          {
            opacity: 0,
            x: section.classList.contains("reverse") ? 100 : -100
          },
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
          {
            opacity: 0,
            y: 50
          },
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
        yPercent: 10, // сдвигаем на 10% вниз при прокрутке
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true // плавный параллакс
        }
      });
    })
  }
}
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