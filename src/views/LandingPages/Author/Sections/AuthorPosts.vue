<script setup>
// example components
import TransparentBlogCard from "../../../../examples/cards/blogCards/TransparentBlogCard.vue";
import BackgroundBlogCard from "../../../../examples/cards/blogCards/BackgroundBlogCard.vue";

//Vue Material Kit 2 components
import post1 from "@/assets/img/examples/testimonial-6-2.jpg";
import post2 from "@/assets/img/examples/testimonial-6-3.jpg";
import post3 from "@/assets/img/examples/blog-9-4.jpg";
import post4 from "@/assets/img/examples/blog2.jpg";
</script>
<template>
  <section class="py-3">
    <div class="container">
      <div class="row">
        <div class="col-lg-6">
          <h3 class="mb-5">Check my latest blog posts</h3>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-3 col-sm-6">
          <TransparentBlogCard
            image="https://d2cx26qpfwuhvu.cloudfront.net/worldrowing/wp-content/uploads/2023/12/18083454/Z9D_8915-1980x1320.jpg"
            title="Star studded lineup completes podium at 2023 Challenge Prince Albert II"
            description="Finding temporary housing for your dog should be as easy as renting an Airbnb. That’s the idea behind Rover ..."
          />
        </div>
        <div class="col-lg-3 col-sm-6">
          <TransparentBlogCard
            image="https://d2cx26qpfwuhvu.cloudfront.net/worldrowing/wp-content/uploads/2023/11/27095510/DSC_3293-1536x1020.jpg"
            title="The Global Canal Rowing Action concludes in Dubai to join fight for climate change"
            description="If you’ve ever wanted to train a machine learning model and integrate it with IFTTT, you now can with ..."
          />
        </div>
        <div class="col-lg-3 col-sm-6">
          <TransparentBlogCard
            image="https://d2cx26qpfwuhvu.cloudfront.net/worldrowing/wp-content/uploads/2023/12/08153225/Z9D_1683-1-1980x1320.jpg"
            title="Sport Federations support long-term plans for multi-sport European Championships"
            description="If you’ve ever wanted to train a machine learning model and integrate it with IFTTT, you now can with ..."
          />
        </div>
        <div class="col-lg-3 col-md-12 col-12">
          <BackgroundBlogCard
            image="https://d2cx26qpfwuhvu.cloudfront.net/worldrowing/wp-content/uploads/2023/05/05132358/DSC_3472-1536x1161.jpg"
            title="Flexible training hours"
            description="Rather than worrying about switching offices every couple years, you stay in the same place."
          />
        </div>
      </div>
    </div>
  </section>
</template>
