<script setup>
import CountTo from "vue-count-to/src";
import DefaultReviewCard from "@/examples/cards/reviewCards/DefaultReviewCard.vue";
</script>
<template>
  <section class="py-7">
    <div class="container">
      <div class="row">
        <div class="col-lg-6 mx-auto text-center">
          <h2 class="mb-0">Trusted by over</h2>
          <h2 class="text-gradient text-danger mb-3">
            <CountTo :start-val="0" :end-val="179477" :duration="4000" />+ rower
          </h2>
          <p class="lead">
            Many Fortune 500 club, startups, universities and governmental
            institutions love Egypt Rowing's organization.
          </p>
        </div>
      </div>
      <div class="row mt-6">
        <DefaultReviewCard
          name="Olli Zeidler"
          date="1 day ago"
          review='"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged."'
          :rating="5.0"
        />
        <DefaultReviewCard
          class="ms-md-auto"
          color="bg-gradient-danger"
          name="Abdallah Hemdan"
          date="1 week ago"
          review='"It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to"'
          :rating="5.0"
        />

        <DefaultReviewCard
          name="Alaa Hussien"
          date="3 weeks ago"
          review='"Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words."'
          :rating="5.0"
        />
      </div>
      <hr class="horizontal dark my-5" />
      <div class="row justify-content-center">
        <div class="col-lg-3 col-md-3 col-6">
          <img
            class="max-width-300 opacity-6"
            src="https://i0.wp.com/i3lmny.com/wp-content/uploads/2022/07/nbe1.png?fit=400%2C208&ssl=1"
            alt="Logo"
          />
        </div>
      </div>
    </div>
  </section>
</template>
