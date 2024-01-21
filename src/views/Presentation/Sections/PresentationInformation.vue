<script setup>
import RotatingCard from "../../../examples/cards/rotatingCards/RotatingCard.vue";
import RotatingCardFront from "../../../examples/cards/rotatingCards/RotatingCardFront.vue";
import RotatingCardBack from "../../../examples/cards/rotatingCards/RotatingCardBack.vue";
import DefaultInfoCard from "../../../examples/cards/infoCards/DefaultInfoCard.vue";

import coachRowing1 from "@/assets/img/examples/coaching-rower-1.jpg";
import coachRowing2 from "@/assets/img/examples/coaching-rower-2.jpg";

</script>
<template>
  <section class="my-5 py-5">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-lg-4 ms-auto me-auto p-lg-4 mt-lg-0 mt-4 mb-4">
          <RotatingCard>
            <RotatingCardFront
              :image="coachRowing1"
              icon="touch_app"
              title="Coaching a Rower's Mind"
              description="The Dutch National Rowing Team Men’s Sculling Coach, Francesco Fossi, has some firm ideas on coaching. The recent recipient of the 2023 World Rowing."
            />

            <RotatingCardBack
              :image="coachRowing2"
              title="Discover More"
              description="Breaking the world record in one of the most arduous distances: the marathon."
              :action="[
                {
                  route: '#',
                  label: 'Start with US',
                },
              ]"
            />
          </RotatingCard>
        </div>
        <div class="col-lg-6 ms-auto">
          <div class="row justify-content-start">
            <DefaultInfoCard
              icon="content_copy"
              title="About World Rowing"
              description="What is World Rowing ? World Rowing, previously named FISA (from the French, Fédération Internationale des Sociétés d’Aviron)"
            />
            <DefaultInfoCard
              icon="flip_to_front"
              title="Rowing and Events"
              description="World Rowing Women’s Crew of the Year This award is dedicated to a woman or women’s crew who was successful."
            />
          </div>
          <div class="row justify-content-start mt-5">
            <DefaultInfoCard
              class="mt-3"
              icon="price_change"
              title="Sustainability"
              description="As the international federation and global custodian of the sport of rowing, World Rowing is dedicated to use the power."
            />
            <DefaultInfoCard
              class="mt-3"
              icon="devices"
              title="Rower of the Month"
              description="There are many ways to become part of the rowing community. As a rower, a coach, an official or a supporter."
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
