import { registerApplication, start } from "single-spa";
import {
  constructApplications,
  constructRoutes,
  constructLayoutEngine,
} from "single-spa-layout";
import microfrontendLayout from "./microfrontend-layout.html";
import "systemjs";
import { oktaAuth } from "./okta-oauth";
import "regenerator-runtime/runtime";

System.addImportMap({
  imports: {
    "vite-mfe": "http://localhost:5173/microfrontend.js",
  },
});

const routes = constructRoutes(microfrontendLayout);

const applications = constructApplications({
  routes,
  loadApp({ name }) {
    return System.import(/* webpackIgnore: true */ name);
  },
});

const layoutEngine = constructLayoutEngine({ routes, applications });

applications.forEach(registerApplication);

layoutEngine.activate();

const handleRedirect = async () => {
  const redirectUri = oktaAuth.getOriginalUri();
  await oktaAuth.handleRedirect();
  window.location.replace(redirectUri || window.location.origin + "/");
};

const redirectToCallback = () => {
  const originalUri = oktaAuth.getOriginalUri();
  oktaAuth.setOriginalUri(originalUri);
  oktaAuth.signInWithRedirect({
    redirectUri: window.location.origin + "/login/callback",
  });
};

// Function to initialize Okta and start single-spa conditionally
async function initializeApp() {
  try {
    const isAuthenticated = await oktaAuth.isAuthenticated();

    if (isAuthenticated) {
      start();
    } else if (window.location.pathname.startsWith("/login/callback")) {
      handleRedirect();
    } else {
      redirectToCallback();
    }
  } catch (error) {
    console.error("Error initializing Okta:", error);
  }
}

initializeApp();
