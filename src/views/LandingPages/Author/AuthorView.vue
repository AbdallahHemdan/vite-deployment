<script setup>
import DefaultNavbar from "../../../examples/navbars/NavbarDefault.vue";
import IndoorEquipmentItem from "./Sections/IndoorEquipmentItem.vue"
import Header from "../../../examples/Header.vue";

import Footer from "./Sections/AuthorFooter.vue";
import Profile from "./Sections/AuthorProfile.vue";

const equipmentsData = [
  {
    heading: "[1] Concept2",
    description:
      "In 1981, brothers Dick and Peter Dreissigacker created the Concept2 Indoor Rower, which swiftly became the rowing machine of choice worldwide. Several models later, it’s used every day by Olympic champions and novices alike.",
    img: "https://d2cx26qpfwuhvu.cloudfront.net/worldrowing/wp-content/uploads/2020/12/04183513/ModelD.jpg",
  },
  {
    heading: "[2] Technogym",
    description:
      "Technogym rowers are designed with the latest technology, combining innovative and transformational solutions to push your training to the next level. The ground-breaking technology of SKILLROW features a modal control, allowing you to focus on power or cardiovascular training by shifting from air to magnetic resistance. These rowers are designed to give an authentic experience that exceeds traditional ergometers, by making the resistance more fluid, whilst maintaining a high level of comfort.",
    img: "https://d2cx26qpfwuhvu.cloudfront.net/worldrowing/wp-content/uploads/2020/12/04183511/technogym-768x512.jpg",
  },
  {
    heading: "[3] WaterRower",
    description:
      "WaterRower has been making a wide selection of rowing machines for over 20 years combining stylish design, hand crafted workmanship, and ethically sourced materials. The WaterRower’s unique WaterFlyWheel was invented by former US team oarsman John Duke in 1988 and all the machines are still made in WaterRower’s own factory in Rhode Island, USA.",
    img: "https://d2cx26qpfwuhvu.cloudfront.net/worldrowing/wp-content/uploads/2020/12/04183512/waterrower-768x504.jpg",
  },
];
</script>

<template>
  <DefaultNavbar :sticky="true" />
  <Header>
    <div
      class="page-header min-height-400"
      :style="{
        backgroundImage: `url(https://scontent.fcai20-4.fna.fbcdn.net/v/t39.30808-6/274822926_299778045580049_4710671353581553158_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=3635dc&_nc_eui2=AeFqKVdSsNpSdMIs1BFVxBzwwE0WV1tL5ErATRZXW0vkSnXvvGGOwDRRNQ3yjeZetoFqp4jhI_QZClNK41P8JLA4&_nc_ohc=IBV6UkdVG84AX9NRv-e&_nc_ht=scontent.fcai20-4.fna&oh=00_AfD-2dyg9rNjDiXHv4lZlbq8xE1olOXIPjZmG_RslU-sow&oe=65B047F9)`,
      }"
      loading="lazy"
    >
      <span class="bg-gradient-dark"></span>
    </div>
  </Header>

  <div class="card card-body blur shadow-blur mx-3 mx-md-4 mt-n6 mb-4">
    <Profile />

    <div class="container">
      <h2>Indoor Equipments</h2>
      <IndoorEquipmentItem
        v-for="(item, index) in equipmentsData"
        :key="index"
        :data="item"
      />
      <!-- <div class="equipments row align-items-center mb-4">
        <div class="me-auto mt-lg-0 mt-4 mb-4 col-lg-6">
          <h3>[1] Concept2</h3>
          <p>
            In 1981, brothers Dick and Peter Dreissigacker created the Concept2
            Indoor Rower, which swiftly became the rowing machine of choice
            worldwide. Several models later, it’s used every day by Olympic
            champions and novices alike.
          </p>
        </div>
        <div class="col-lg-6 ms-auto">
          <img
            src="https://d2cx26qpfwuhvu.cloudfront.net/worldrowing/wp-content/uploads/2020/12/04183513/ModelD.jpg"
            class="w-100"
          />
        </div>
      </div> -->
    </div>
  </div>

  <Footer />
</template>
