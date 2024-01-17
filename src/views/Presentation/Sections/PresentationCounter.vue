<script setup>
import DefaultCounterCard from "../../../examples/cards/counterCards/DefaultCounterCard.vue";
</script>

<template>
  <section class="pt-3 pb-4" id="count-stats">
    <div class="container">
      <div class="row">
        <div class="col-lg-9 z-index-2 border-radius-xl mx-auto py-3">
          <div class="row">
            <div class="col-md-4 position-relative">
              <DefaultCounterCard
                color="danger"
                title="Egyptian Athletes"
                description="From all ages, genders, and"
                :count="170"
                suffix="+"
                :duration="6000"
                divider="vertical"
              />
            </div>
            <div class="col-md-4 position-relative">
              <DefaultCounterCard
                color="danger"
                title="Hosted Competitions"
                description="Mix of lorem founders of Concept2, developed"
                :count="145"
                suffix="+"
                :duration="6000"
                divider="vertical"
              />
            </div>
            <div class="col-md-4">
              <DefaultCounterCard
                color="danger"
                title="Trainings"
                description="Mix of lorem markee dewdwej ldle morkgin"
                :count="236"
                :duration="6000"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
