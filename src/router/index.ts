import { i18nHelper } from "@/plugins/I18NHelper";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

function loadView(viewPath: string) {
  return () => import(`@/views/${viewPath}.vue`);
}

const routeList: Array<RouteRecordRaw> = [
  {
    path: "",
    name: "Home",
    component: loadView("Home"),
  },
  {
    path: "about",
    name: "About",
    component: loadView("About"),
  },
];

const routes: Array<RouteRecordRaw> = [
  {
    path: "/:locale",
    component: {
      template: "<router-view></router-view>",
    },
    children: routeList,
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// navigation guards
router.beforeEach(async (to, from, next) => {
  const locale: string = !Array.isArray(to.params.locale)
    ? to.params.locale
    : to.params.locale[0];

  console.log(to);
  // use user preferred locale if route link locale is not supported
  if (!i18nHelper.isLocaleSupported(locale)) {
    return next(i18nHelper.userPreferredLocale);
  }

  i18nHelper.changeLocale(locale);

  return next();
});

export default router;
