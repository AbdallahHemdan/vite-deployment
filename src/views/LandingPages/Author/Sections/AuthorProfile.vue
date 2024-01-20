<script setup>
import { onMounted } from "vue";

import setMaterialInput from "@/assets/js/material-input";

onMounted(() => {
  setMaterialInput();
});
</script>

<template>
  <section class="py-sm-7 py-5 position-relative">
    <div class="container">
      <div class="row">
        <div class="col-12">
          <div class="row">
            <div class="z-index-2 position-relative px-md-2 px-sm-5 mx-auto">
              <div
                class="d-flex justify-content-between align-items-center mb-2"
              >
                <h3 class="mb-0">INDOOR ROWING</h3>
              </div>

              <h5 class="mb-0 mt-4">What is Indoor Rowing?</h5>
              <p class="text-lg mb-0">
                Indoor rowing, or ‘erging’ (named because of the equipment used
                for this type of sport – the ergometer), has been widely used as
                a training tool for rowers since it’s creation. Today, indoor
                rowing has grown to become a competitive sport in its own right.
                Ergometers have been used in rowing training since the 1950s in
                many countries. The earliest examples were huge metal
                contraptions with a solid iron flywheel. <br /><br />
                Indoor rowing competitions take place all over the world. The
                longest running and best known is the C.R.A.S.H-Bs, held every
                year in February in Boston, USA. In 2018, the first World Rowing
                Indoor Championships were held in conjunction with Concept2 in
                Alexandria, USA. <br /><br />

                The 1980s saw the development of lighter, slightly more
                rower-friendly machines. The Dreissigacker brothers, founders of
                Concept2, developed an ergometer using bicycle parts. This
                innovation helped to make the rowing machine light and
                affordable, and allowed rowers to compare their performances
                against one another. This caused indoor rowing to grow rapidly
                in training, and made indoor rowing competitions possible. Just
                like on-water rowing, the most infamous benchmark test on the
                ergometer is 2000 metres for time. Many competitions include
                various race formats, including races for time, for distance,
                for maximum wattage, relay and team competitions, blind races,
                and elimination races. Indoor rowing is also found in other
                sport competitions, such as CrossFit, Functional Fitness, and
                ‘indoor’ triathlon. <br /><br />

                <a href="javascript:;" class="text-danger icon-move-right"
                  >More about indoor rowing
                  <i class="fas fa-arrow-right text-sm ms-1"></i>
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
