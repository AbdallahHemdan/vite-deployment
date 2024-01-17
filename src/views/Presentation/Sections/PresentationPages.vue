<script setup>
import ExampleCard from "../Components/ExampleCard.vue";
import MaterialBadge from "../../../components/MaterialBadge.vue";

</script>
<template>
  <section class="py-5">
    <div class="container">
      <div class="row">
        <div class="row text-center my-sm-5 mt-5">
          <div class="col-lg-6 mx-auto">
            <MaterialBadge color="danger" class="mb-3"
              >Boost creativity</MaterialBadge
            >
            <h2 class="">Upcoming Events</h2>
            <p class="lead">
              The easiest way to be updated with all the local, regional, and
              international events.
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-8">
          <div class="row mt-4">
            <div class="col-md-6 mt-md-0 mt-5">
              <ExampleCard
                class="shadow-lg"
                title="2024 World Rowing Virtual Coaches Conference"
                subtitle="The 2024 World Rowing Virtual Coaches Conference will take place 26-28 January, 2024."
                image="https://d2cx26qpfwuhvu.cloudfront.net/worldrowing/wp-content/uploads/2023/10/03052215/DSC_0288-1024x640.jpg"
                route="presentation"
              />
            </div>
            <div class="col-md-6 mt-md-0 mt-5">
              <ExampleCard
                class="shadow-lg"
                title="2024 World Rowing Cup I"
                subtitle="The 2024 World Rowing Indoor Championships will take place 23-24 February, 2024 in Prague, Czechia."
                image="https://d2cx26qpfwuhvu.cloudfront.net/worldrowing/wp-content/uploads/2023/06/19021259/Z9D_7211-1-1024x683.jpg"
                route="presentation"
              />
            </div>
          </div>
          <div class="row mt-4">
            <div class="col-md-6 mt-md-0 mt-5">
              <ExampleCard
                classes="mt-5"
                title="2024 World Rowing Championships"
                subtitle="The 2024 World Rowing Cup II will take place 24-26 May 2024 in Lucerne, Switzerland."
                image="https://d2cx26qpfwuhvu.cloudfront.net/worldrowing/wp-content/uploads/2021/08/18101320/DSC_0009-1-1024x683.jpg"
                route="presentation"
              />
            </div>
            <div class="col-md-6 mt-md-0 mt-5">
              <ExampleCard
                classes="shadow-lg"
                title="2024 World Rowing Cup III"
                subtitle="The 2024 World Rowing Championships will take place 18-25 August, 2024 in St Catharines, Canada."
                image="https://d2cx26qpfwuhvu.cloudfront.net/worldrowing/wp-content/uploads/2023/10/16151018/MDS07314-1024x683.jpg"
                route="presentation"
              />
            </div>
          </div>
          <a
            href="#"
            class="btn btn-sm mb-0 bg-gradient-danger px-5 py-3 mt-4"
          >
            Check all events
          </a>
        </div>
        <div class="col-md-3 mx-auto mt-md-0 mt-3">
          <div class="position-sticky" style="top: 100px !important">
            <h3>A collection of top rowing events</h3>
            <h6 class="text-secondary font-weight-normal">
              Details and information for upcoming World Rowing Events including
              Olympics and World Championships and results and details of past
              Events..
            </h6>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
