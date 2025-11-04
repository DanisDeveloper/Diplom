<template>
  <button>
    <slot></slot>
  </button>
</template>
<script>
export default {
  name: "GradientButton"
}
</script>



<style scoped>
button {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #0d1b2a, #1b263b, #415a77, #0d1b2a);
  background-size: 300% 300%;
  color: #e8e8e8;
  border: none;
  border-radius: 16px;
  padding: 0.75rem 2rem;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  animation: gradientMove 5s ease infinite;
}

button:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}

@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

</style>