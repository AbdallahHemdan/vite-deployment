<script setup>
defineProps({
  data: {
    type: Object,
    required: true,
    heading: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      required: true,
    },
  },
});
</script>
<template>
  <div class="equipments row align-items-center mb-4">
    <div class="me-auto mt-lg-0 mt-4 mb-4 col-lg-6">
      <h3>{{ data.heading }}</h3>
      <p>
        {{ data.description }}
      </p>
    </div>
    <div class="col-lg-6 ms-auto">
      <img :src="data.img" class="w-100" />
    </div>
  </div>
</template>
