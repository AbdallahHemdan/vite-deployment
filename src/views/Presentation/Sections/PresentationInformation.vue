<script setup>
import RotatingCard from "../../../examples/cards/rotatingCards/RotatingCard.vue";
import RotatingCardFront from "../../../examples/cards/rotatingCards/RotatingCardFront.vue";
import RotatingCardBack from "../../../examples/cards/rotatingCards/RotatingCardBack.vue";
import DefaultInfoCard from "../../../examples/cards/infoCards/DefaultInfoCard.vue";
</script>
<template>
  <section class="my-5 py-5">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-lg-4 ms-auto me-auto p-lg-4 mt-lg-0 mt-4 mb-4">
          <RotatingCard>
            <RotatingCardFront
              image="https://scontent.fcai20-4.fna.fbcdn.net/v/t39.30808-6/417134218_714512540773262_811397112796543676_n.jpg?stp=c51.0.206.206a_dst-jpg_p206x206&_nc_cat=102&ccb=1-7&_nc_sid=3d9721&_nc_eui2=AeH23u8pz42ssJnOsmd6C66HCyO1XlGuyPgLI7VeUa7I-MUs71fq3rrk7L_9bWcPmlncmdNoid1Bijv7e3BmkKQk&_nc_ohc=3OGQACttPxwAX8uGoHc&_nc_oc=AQl7ta3BtUePFl2tOLm__SfHUh6WFGb_vTScKIRk7sCSyccqDSq9kWnejxH_gvLs6ZQ&_nc_ht=scontent.fcai20-4.fna&oh=00_AfCuKnYZRWOIcB0EwLmxbHvgLElBnUOKO-LO03Anzi-ClA&oe=65ABFCCE"
              icon="touch_app"
              title="Coaching a Rower's Mind"
              description="The Dutch National Rowing Team Men’s Sculling Coach, Francesco Fossi, has some firm ideas on coaching. The recent recipient of the 2023 World Rowing."
            />

            <RotatingCardBack
              image="https://scontent.fcai20-4.fna.fbcdn.net/v/t39.30808-6/413006407_706461761578340_5499230487392229750_n.jpg?stp=c0.23.206.206a_dst-jpg_p206x206&_nc_cat=105&ccb=1-7&_nc_sid=3d9721&_nc_eui2=AeF9topgWsnRZ5xcVIWQlhb5yS8u1swpDyPJLy7WzCkPIziMA7TkEIqKzFENONYnT2KkGPSKccmer--yFUwr10Xk&_nc_ohc=39uzBoTkieAAX-oACpJ&_nc_ht=scontent.fcai20-4.fna&oh=00_AfDl__d9XueYVseJIIeBlD72oqaBi0MSGR2h5h2jUoXShA&oe=65ACC32E"
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
