import { i18nHelper } from "@/plugins/I18NHelper";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

function loadView(viewPath: string) {
  return () => import(`@/views/${viewPath}.vue`);
}

const routes: Array<RouteRecordRaw> = [
  {
    path: "/:locale",
    component: {
      template: "<router-view></router-view>",
    },
    children: [
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
    ],
  },
  // {
  //   path: "/",
  //   name: "Home",
  //   component: loadView("Home"),
  // },
  // {
  //   path: "/about",
  //   name: "About",
  //   component: loadView("About"),
  // },
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

  // use default locale if param locale is not in SUPPORT_LOCALES
  if (!i18nHelper.isLocaleSupported(locale)) {
    return next(i18nHelper.defaultLocale);
  }

  i18nHelper.changeLocale(locale);

  return next();
});

export default router;
