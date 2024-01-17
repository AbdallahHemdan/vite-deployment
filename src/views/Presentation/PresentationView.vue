<script setup>
import { onMounted, onUnmounted } from "vue";

//example components
import NavbarDefault from "../..//examples/navbars/NavbarDefault.vue";
import DefaultFooter from "../../examples/footers/FooterDefault.vue";
import Header from "../../examples/Header.vue";
import FilledInfoCard from "../../examples/cards/infoCards/FilledInfoCard.vue";

import MaterialSocialButton from "@/components/MaterialSocialButton.vue";

// sections
import PresentationCounter from "./Sections/PresentationCounter.vue";
import PresentationPages from "./Sections/PresentationPages.vue";
import PresentationExample from "./Sections/PresentationExample.vue";
import data from "./Sections/Data/designBlocksData";
import BuiltByDevelopers from "./Components/BuiltByDevelopers.vue";
import PresentationTestimonials from "./Sections/PresentationTestimonials.vue";
import PresentationInformation from "./Sections/PresentationInformation.vue";
import Posts from "./../LandingPages/Author/Sections/AuthorPosts.vue";

//images
import vueMkHeader from "@/assets/img/landing-header.jpg";

//hooks
const body = document.getElementsByTagName("body")[0];
onMounted(() => {
  body.classList.add("presentation-page");
  body.classList.add("bg-gray-200");
});
onUnmounted(() => {
  body.classList.remove("presentation-page");
  body.classList.remove("bg-gray-200");
});
</script>

<template>
  <div class="position-sticky z-index-sticky top-0">
    <div class="row">
      <div class="col-12">
        <NavbarDefault :sticky="true" />
      </div>
    </div>
  </div>
  <Header>
    <div
      class="page-header min-vh-75"
      :style="`background-image: url(${vueMkHeader})`"
      loading="lazy"
    >
      <div class="container">
        <div class="row">
          <div class="col-lg-7 text-center mx-auto position-relative">
            <h1
              class="display-5 text-white pt-3 mt-n5 me-2"
              :style="{ display: 'inline-block ' }"
            >
              Making waves: A Preview of the 2024 World Rowing calendar
            </h1>
            <p class="lead text-white px-5 mt-3" :style="{ fontWeight: '500' }">
              Egyptian Rowing Federation Since 1907 - The oldest federation in Egypt.
            </p>
          </div>
        </div>
      </div>
    </div>
  </Header>

  <div class="card card-body blur shadow-blur mx-3 mx-md-4 mt-n6">
    <PresentationCounter />
    <PresentationInformation />
    <PresentationExample :data="data" />
    <PresentationPages />
    <Posts />
    <BuiltByDevelopers />

    <div class="container">
      <div class="row">
        <div class="col-lg-4">
          <FilledInfoCard
            class="p-4"
            :color="{ text: 'white', background: 'bg-gradient-danger' }"
            :icon="{ component: 'flag', color: 'white' }"
            title="Getting Started"
            description="Check the possible ways of joining our teams wedew dewdewde dwedeew."
            :action="{
              route:
                '#',
              label: { text: 'Let\'s start', color: 'white' }
            }"
          />
        </div>
        <div class="col-lg-4">
          <FilledInfoCard
            class="px-lg-1 mt-lg-0 mt-4 p-4"
            height="h-100"
            :icon="{ component: 'help', color: 'danger' }"
            title="Ask Question"
            description="Get a full support from a list of best coaches in the world dewdwe dwe dw dweedw."
            :action="{
              route:
                '#',
              label: { text: 'Read more' },
            }"
          />
        </div>
        <div class="col-lg-4">
          <FilledInfoCard
            class="px-lg-1 mt-lg-0 mt-4 p-4"
            :icon="{ component: 'rowing', color: 'danger' }"
            title="Updated trainings"
            description="Egypt Rowing is giving you a lot of pre-made training. For those
                who want flexibility, we included many techniques."
            :action="{
              route:
                '#',
              label: { text: 'Read more' },
            }"
          />
        </div>
      </div>
    </div>

    <PresentationTestimonials />


    <div class="container">
      <div class="row">
        <div class="d-flex flex-column w-100 text-center p-5 mb-8">
          <h3>Available on these channels</h3>
          <div class="d-flex justify-content-center mt-3 flex-wrap">
            <a
              href="#"
              data-bs-toggle="tooltip"
              data-bs-placement="bottom"
              title="Facebook page"
            >
              <img
                src="data:image/png;base64,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"
                alt="title"
                loading="lazy"
                :style="{ height: '90px' }"
              />
            </a>
            <a
              class="opacity-9 ms-3"
              href="#"
              data-bs-toggle="tooltip"
              data-bs-placement="bottom"
              title="Twitter"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/292px-Logo_of_Twitter.svg.png"
                alt="title"
                loading="lazy"
                :style="{ height: '90px' }"
              />
            </a>
            <a
              href="#"
              class="mx-3"
              data-bs-toggle="tooltip"
              data-bs-placement="bottom"
              title="Youtube"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/YouTube_social_red_circle_%282017%29.svg/2048px-YouTube_social_red_circle_%282017%29.svg.png"
                alt="title"
                loading="lazy"
                :style="{ height: '90px' }"
              />
            </a>
            <a
              class="opacity-5"
              href="#"
              data-bs-toggle="tooltip"
              data-bs-placement="bottom"
              title="Twitch"
            >
              <img
                src="https://www.edigitalagency.com.au/wp-content/uploads/Twitch-icon-purple.png"
                alt="title"
                loading="lazy"
                :style="{ height: '90px' }"
              />
            </a>
            <a
              href="#"
              class="mx-3"
              data-bs-toggle="tooltip"
              data-bs-placement="bottom"
              title="Instagram"
            >
              <img
                src="https://i0.wp.com/bodybeyondlimits.com.au/wp-content/uploads/2022/07/instagram-circle-icon-png-4.png?ssl=1"
                alt="title"
                loading="lazy"
                :style="{ height: '90px' }"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
    <div class="py-5">
      <div class="container">
        <div class="row">
          <div class="col-lg-5 ms-auto">
            <h4 class="mb-1">Thank you for your support!</h4>
            <p class="lead mb-0">We deliver the best rowing support</p>
          </div>
          <div class="col-lg-5 me-lg-auto my-lg-auto text-lg-end mt-5">
            <MaterialSocialButton
              route="http://localhost:3000/"
              component="twitter"
              color="twitter"
              label="Tweet"
            />
            <MaterialSocialButton
              route="http://localhost:3000/"
              component="facebook-square"
              color="facebook"
              label="Share"
            />
            <MaterialSocialButton
              route="http://localhost:3000/"
              component="pinterest"
              color="pinterest"
              label="Pin it"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <DefaultFooter />
</template>
