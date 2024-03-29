<script setup>
import { RouterLink } from "vue-router";
import { ref, watch } from "vue";
import { useWindowsWidth } from "../../assets/js/useWindowsWidth";

// images
import ArrDark from "@/assets/img/down-arrow-dark.svg";
import downArrow from "@/assets/img/down-arrow.svg";
import logoImage from "@/assets/img/egypt-rowing-favicon.png";
import DownArrWhite from "@/assets/img/down-arrow-white.svg";

const props = defineProps({
  action: {
    type: Object,
    route: String,
    color: String,
    label: String,
    default: () => ({
      route: "#",
      color: "bg-gradient-success",
      label: "Log in",
    }),
  },
  transparent: {
    type: Boolean,
    default: false,
  },
  light: {
    type: Boolean,
    default: false,
  },
  dark: {
    type: Boolean,
    default: false,
  },
  sticky: {
    type: Boolean,
    default: false,
  },
  darkText: {
    type: Boolean,
    default: false,
  },
});

// set arrow  color
function getArrowColor() {
  if (props.transparent && textDark.value) {
    return ArrDark;
  } else if (props.transparent) {
    return DownArrWhite;
  } else {
    return ArrDark;
  }
}

// set text color
const getTextColor = () => {
  let color;
  if (props.transparent && textDark.value) {
    color = "text-dark";
  } else if (props.transparent) {
    color = "text-white";
  } else {
    color = "text-dark";
  }

  return color;
};

// set nav color on mobile && desktop

let textDark = ref(props.darkText);
const { type } = useWindowsWidth();

if (type.value === "mobile") {
  textDark.value = true;
} else if (type.value === "desktop" && textDark.value == false) {
  textDark.value = false;
}

watch(
  () => type.value,
  (newValue) => {
    if (newValue === "mobile") {
      textDark.value = true;
    } else {
      textDark.value = false;
    }
  }
);
</script>
<template>
  <nav
    class="navbar navbar-expand-lg top-0"
    :class="{
      'z-index-3 w-100 shadow-none navbar-transparent position-absolute':
        props.transparent,
      'blur z-index-3 shadow py-2 start-0 end-0 position-absolute':
        props.sticky,
      'navbar-light bg-white py-3': props.light,
      ' navbar-dark bg-gradient-dark z-index-3 py-3': props.dark
    }"
  >
    <div
      :class="
        props.transparent || props.light || props.dark
          ? 'container'
          : 'container-fluid px-0'
      "
    >
      <RouterLink
        class="navbar-brand d-none d-md-flex"
        :class="[
          (props.transparent && textDark.value) || !props.transparent
            ? 'text-dark font-weight-bolder ms-sm-3'
            : 'text-white font-weight-bolder ms-sm-3'
        ]"
        :to="{ name: 'presentation' }"
        rel="tooltip"
        title="Designed and Coded by Creative Tim"
        data-placement="bottom"
      >
        <img
          class="img-logo w-md-15 me-2"
          alt="logoCt"
          loading="lazy"
          :src="logoImage"
        />
        <div class="d-flex flex-column justify-content-center">
          <span>EGYPT ROWING</span>
          <span>الأتحاد المصري للتجديف</span>
        </div>
      </RouterLink>

      <RouterLink
        class="navbar-brand d-flex d-md-none"
        :class="
          props.transparent || props.dark
            ? 'text-white'
            : 'font-weight-bolder ms-sm-3'
        "
        to="/"
        rel="tooltip"
        title="Designed and Coded by Creative Tim"
        data-placement="bottom"
      >
        <img
          class="img-logo height-100 me-2"
          alt="logoCt"
          loading="lazy"
          :src="logoImage"
        />
        <div class="d-flex flex-column justify-content-center">
          <span>EGYPT ROWING</span>
          <span>الأتحاد المصري للتجديف</span>
        </div>
      </RouterLink>
      <!-- <a
        href="#"
        class="btn btn-sm bg-gradient-success mb-0 ms-auto d-lg-none d-block"
        >Log in</a
      > -->
      <button
        class="navbar-toggler shadow-none ms-2"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navigation"
        aria-controls="navigation"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon mt-2">
          <span class="navbar-toggler-bar bar1"></span>
          <span class="navbar-toggler-bar bar2"></span>
          <span class="navbar-toggler-bar bar3"></span>
        </span>
      </button>
      <div
        class="collapse navbar-collapse w-100 pt-3 pb-2 py-lg-0"
        id="navigation"
      >
        <ul class="navbar-nav navbar-nav-hover">
          <li class="nav-item dropdown dropdown-hover mx-2">
            <a
              role="button"
              class="nav-link ps-2 d-flex cursor-pointer align-items-center"
              :class="getTextColor()"
              id="dropdownMenuPages"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i
                class="material-icons opacity-6 me-2 text-md"
                :class="getTextColor()"
                >dashboard</i
              >
              Rowing and Events
              <img
                :src="getArrowColor()"
                alt="down-arrow"
                class="arrow ms-2 d-lg-block d-none"
              />
              <img
                :src="getArrowColor()"
                alt="down-arrow"
                class="arrow ms-1 d-lg-none d-block ms-auto"
              />
            </a>
            <div
              class="dropdown-menu dropdown-menu-animation ms-n3 dropdown-md p-3 border-radius-xl mt-0 mt-lg-3"
              aria-labelledby="dropdownMenuPages"
            >
              <div class="row d-none d-lg-block">
                <div class="col-12 px-4 py-2">
                  <div class="row">
                    <div class="position-relative">
                      <div
                        class="dropdown-header text-dark font-weight-bolder d-flex align-items-center px-1"
                      >
                        Rowing
                      </div>
                      <RouterLink
                        :to="{ name: 'author' }"
                        class="dropdown-item border-radius-md"
                      >
                        <span>Indoor Rowing</span>
                      </RouterLink>
                      <RouterLink
                        :to="{ name: 'presentation' }"
                        class="dropdown-item border-radius-md"
                      >
                        <span>Coastal Rowing</span>
                      </RouterLink>
                      <RouterLink
                        :to="{ name: 'presentation' }"
                        class="dropdown-item border-radius-md"
                      >
                        <span>Masters Rowing</span>
                      </RouterLink>
                      <div
                        class="dropdown-header text-dark font-weight-bolder d-flex align-items-center px-0 mt-3"
                      >
                        Events and Results
                      </div>
                      <RouterLink
                        :to="{ name: 'presentation' }"
                        class="dropdown-item border-radius-md"
                      >
                        <span>Calender</span>
                      </RouterLink>
                      <RouterLink
                        :to="{ name: 'presentation' }"
                        class="dropdown-item border-radius-md"
                      >
                        <span>Events List</span>
                      </RouterLink>
                    </div>
                  </div>
                </div>
              </div>
              <div class="d-lg-none">
                <div
                  class="dropdown-header text-dark font-weight-bolder d-flex align-items-center px-0"
                >
                  Rowing
                </div>
                <RouterLink
                  :to="{ name: 'author' }"
                  class="dropdown-item border-radius-md"
                >
                  <span>Indoor Rowing</span>
                </RouterLink>
                <RouterLink
                  :to="{ name: 'presentation' }"
                  class="dropdown-item border-radius-md"
                >
                  <span>Coastal Rowing</span>
                </RouterLink>
                <RouterLink
                  :to="{ name: 'presentation' }"
                  class="dropdown-item border-radius-md"
                >
                  <span>Masters Rowing</span>
                </RouterLink>
                <div
                  class="dropdown-header text-dark font-weight-bolder d-flex align-items-center px-0 mt-3"
                >
                  Events and Results
                </div>
                <RouterLink
                  :to="{ name: 'presentation' }"
                  class="dropdown-item border-radius-md"
                >
                  <span>Calender</span>
                </RouterLink>
                <RouterLink
                  :to="{ name: 'presentation' }"
                  class="dropdown-item border-radius-md"
                >
                  <span>Events List</span>
                </RouterLink>
              </div>
            </div>
          </li>
          <li class="nav-item dropdown dropdown-hover mx-2">
            <a
              role="button"
              class="nav-link ps-2 d-flex cursor-pointer align-items-center"
              :class="getTextColor()"
              id="dropdownMenuBlocks"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i
                class="material-icons opacity-6 me-2 text-md"
                :class="getTextColor()"
                >view_day</i
              >
              About
              <img
                :src="getArrowColor()"
                alt="down-arrow"
                class="arrow ms-2 d-lg-block d-none"
              />
              <img
                :src="getArrowColor()"
                alt="down-arrow"
                class="arrow ms-1 d-lg-none d-block ms-auto"
              />
            </a>
            <div
              class="dropdown-menu dropdown-menu-end dropdown-menu-animation dropdown-md dropdown-md-responsive p-3 border-radius-lg mt-0 mt-lg-3"
              aria-labelledby="dropdownMenuBlocks"
            >
              <div class="d-none d-lg-block">
                <ul class="list-group">
                  <li
                    class="nav-item dropdown dropdown-hover dropdown-subitem list-group-item border-0 p-0"
                  >
                    <a
                      class="dropdown-item py-2 ps-3 border-radius-md"
                      href="javascript:;"
                    >
                      <div class="d-flex">
                        <div
                          class="w-100 d-flex align-items-center justify-content-between"
                        >
                          <div>
                            <h6
                              class="dropdown-header text-dark font-weight-bolder d-flex justify-content-cente align-items-center p-0"
                            >
                              Organizations
                            </h6>
                            <span class="text-sm">See all sections</span>
                          </div>
                          <img
                            :src="downArrow"
                            alt="down-arrow"
                            class="arrow"
                          />
                        </div>
                      </div>
                    </a>
                    <div class="dropdown-menu mt-0 py-3 px-2 mt-3">
                      <RouterLink
                        class="dropdown-item ps-3 border-radius-md mb-1"
                        :to="{ name: 'presentation' }"
                      >
                        Governance
                      </RouterLink>
                      <RouterLink
                        class="dropdown-item ps-3 border-radius-md mb-1"
                        :to="{ name: 'presentation' }"
                      >
                        President and Honorary President
                      </RouterLink>
                      <RouterLink
                        class="dropdown-item ps-3 border-radius-md mb-1"
                        :to="{ name: 'presentation' }"
                      >
                        Council
                      </RouterLink>
                      <RouterLink
                        class="dropdown-item ps-3 border-radius-md mb-1"
                        :to="{ name: 'presentation' }"
                      >
                        Commissions
                      </RouterLink>
                    </div>
                  </li>
                  <li
                    class="nav-item dropdown dropdown-hover dropdown-subitem list-group-item border-0 p-0"
                  >
                    <a
                      class="dropdown-item py-2 ps-3 border-radius-md"
                      href="javascript:;"
                    >
                      <div class="d-flex">
                        <div
                          class="w-100 d-flex align-items-center justify-content-between"
                        >
                          <div>
                            <h6
                              class="dropdown-header text-dark font-weight-bolder d-flex justify-content-cente align-items-center p-0"
                            >
                              Awards
                            </h6>
                            <span class="text-sm">See all awards</span>
                          </div>
                          <img
                            :src="downArrow"
                            alt="down-arrow"
                            class="arrow"
                          />
                        </div>
                      </div>
                    </a>
                    <div class="dropdown-menu mt-0 py-3 px-2 mt-3">
                      <RouterLink
                        class="dropdown-item ps-3 border-radius-md mb-1"
                        :to="{ name: 'presentation' }"
                      >
                        World Rowing Awards
                      </RouterLink>
                      <RouterLink
                        class="dropdown-item ps-3 border-radius-md mb-1"
                        :to="{ name: 'presentation' }"
                      >
                        Thomas Keller Medal
                      </RouterLink>
                      <RouterLink
                        class="dropdown-item ps-3 border-radius-md mb-1"
                        :to="{ name: 'presentation' }"
                      >
                        Filippi Spirit Award
                      </RouterLink>
                      <RouterLink
                        class="dropdown-item ps-3 border-radius-md mb-1"
                        :to="{ name: 'presentation' }"
                      >
                        Distinguished Service to International Rowing
                      </RouterLink>
                      <RouterLink
                        class="dropdown-item ps-3 border-radius-md mb-1"
                        :to="{ name: 'presentation' }"
                      >
                        Sustainability Award
                      </RouterLink>
                    </div>
                  </li>
                </ul>
              </div>
              <div class="row d-lg-none">
                <div class="col-md-12">
                  <div class="d-flex mb-2">
                    <div
                      class="w-100 d-flex align-items-center justify-content-between"
                    >
                      <div>
                        <h6
                          class="dropdown-header text-dark font-weight-bolder d-flex justify-content-cente align-items-center p-0"
                        >
                          Organizations
                        </h6>
                      </div>
                    </div>
                  </div>
                  <RouterLink
                    class="dropdown-item ps-3 border-radius-md mb-1"
                    :to="{ name: 'presentation' }"
                  >
                    Governance
                  </RouterLink>
                  <RouterLink
                    class="dropdown-item ps-3 border-radius-md mb-1"
                    :to="{ name: 'presentation' }"
                  >
                    President and Honorary President
                  </RouterLink>
                  <RouterLink
                    class="dropdown-item ps-3 border-radius-md mb-1"
                    :to="{ name: 'presentation' }"
                  >
                    Council
                  </RouterLink>
                  <RouterLink
                    class="dropdown-item ps-3 border-radius-md mb-1"
                    :to="{ name: 'presentation' }"
                  >
                    Commissions
                  </RouterLink>
                  <div class="d-flex mb-2 mt-3">
                    <div
                      class="w-100 d-flex align-items-center justify-content-between"
                    >
                      <div>
                        <h6
                          class="dropdown-header text-dark font-weight-bolder d-flex justify-content-cente align-items-center p-0"
                        >
                          Awards
                        </h6>
                      </div>
                    </div>
                  </div>
                  <RouterLink
                    class="dropdown-item ps-3 border-radius-md mb-1"
                    :to="{ name: 'presentation' }"
                  >
                    World Rowing Awards
                  </RouterLink>
                  <RouterLink
                    class="dropdown-item ps-3 border-radius-md mb-1"
                    :to="{ name: 'presentation' }"
                  >
                    Thomas Keller Medal
                  </RouterLink>
                  <RouterLink
                    class="dropdown-item ps-3 border-radius-md mb-1"
                    :to="{ name: 'presentation' }"
                  >
                    Filippi Spirit Award
                  </RouterLink>
                  <RouterLink
                    class="dropdown-item ps-3 border-radius-md mb-1"
                    :to="{ name: 'presentation' }"
                  >
                    Distinguished Service to International Rowing
                  </RouterLink>
                  <RouterLink
                    class="dropdown-item ps-3 border-radius-md mb-1"
                    :to="{ name: 'presentation' }"
                  >
                    Sustainability Award
                  </RouterLink>
                </div>
              </div>
            </div>
          </li>
          <li class="nav-item dropdown dropdown-hover mx-2">
            <a
              role="button"
              class="nav-link ps-2 d-flex cursor-pointer align-items-center"
              :class="getTextColor()"
              id="dropdownMenuDocs"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i
                class="material-icons opacity-6 me-2 text-md"
                :class="getTextColor()"
                >article</i
              >
              News
              <img
                :src="getArrowColor()"
                alt="down-arrow"
                class="arrow ms-2 d-lg-block d-none"
              />
              <img
                :src="getArrowColor()"
                alt="down-arrow"
                class="arrow ms-1 d-lg-none d-block ms-auto"
              />
            </a>
            <div
              class="dropdown-menu dropdown-menu-end dropdown-menu-animation dropdown-md mt-0 mt-lg-3 p-3 border-radius-lg"
              aria-labelledby="dropdownMenuDocs"
            >
              <div class="d-none d-lg-block">
                <ul class="list-group">
                  <li class="nav-item list-group-item border-0 p-0">
                    <a
                      class="dropdown-item py-2 ps-3 border-radius-md"
                      href="#"
                    >
                      <h6
                        class="dropdown-header text-dark font-weight-bolder d-flex justify-content-cente align-items-center p-0"
                      >
                        World News
                      </h6>
                      <span class="text-sm"
                        >All world news from World Rowing</span
                      >
                    </a>
                  </li>
                  <li class="nav-item list-group-item border-0 p-0">
                    <a
                      class="dropdown-item py-2 ps-3 border-radius-md"
                      href="#"
                    >
                      <h6
                        class="dropdown-header text-dark font-weight-bolder d-flex justify-content-cente align-items-center p-0"
                      >
                        Egypt News
                      </h6>
                      <span class="text-sm"
                        >All local news about events, athletes, and more</span
                      >
                    </a>
                  </li>
                  <li class="nav-item list-group-item border-0 p-0">
                    <a
                      class="dropdown-item py-2 ps-3 border-radius-md"
                      href="#"
                    >
                      <h6
                        class="dropdown-header text-dark font-weight-bolder d-flex justify-content-cente align-items-center p-0"
                      >
                        Regional
                      </h6>
                      <span class="text-sm"
                        >Explore our region news about events, competitions, and
                        athletes</span
                      >
                    </a>
                  </li>
                </ul>
              </div>
              <div class="row d-lg-none">
                <div class="col-md-12 g-0">
                  <a class="dropdown-item py-2 ps-3 border-radius-md" href="#">
                    <h6
                      class="dropdown-header text-dark font-weight-bolder d-flex justify-content-cente align-items-center p-0"
                    >
                      World News
                    </h6>
                    <span class="text-sm"
                      >All world news from World Rowing</span
                    >
                  </a>
                  <a class="dropdown-item py-2 ps-3 border-radius-md" href="#">
                    <h6
                      class="dropdown-header text-dark font-weight-bolder d-flex justify-content-cente align-items-center p-0"
                    >
                      Egypt News
                    </h6>
                    <span class="text-sm"
                      >All local news about events, athletes, and more</span
                    >
                  </a>
                  <a class="dropdown-item py-2 ps-3 border-radius-md" href="#">
                    <h6
                      class="dropdown-header text-dark font-weight-bolder d-flex justify-content-cente align-items-center p-0"
                    >
                      Regional
                    </h6>
                    <span class="text-sm"
                      >Explore our region news about events, competitions, and
                      athletes</span
                    >
                  </a>
                </div>
              </div>
            </div>
          </li>
        </ul>
        <!-- <ul class="navbar-nav d-lg-block d-none">
          <li class="nav-item">
            <a
              :href="action.route"
              class="btn btn-sm mb-0"
              :class="action.color"
              onclick="smoothToPricing('pricing-soft-ui')"
              >{{ action.label }}</a
            >
          </li>
        </ul> -->
      </div>
    </div>
  </nav>
  <!-- End Navbar -->
</template>
