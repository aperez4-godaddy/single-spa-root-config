import { registerApplication, start } from "single-spa";
import {
  constructApplications,
  constructRoutes,
  constructLayoutEngine,
} from "single-spa-layout";
import microfrontendLayout from "./microfrontend-layout.html";
import "systemjs";
import { oktaAuth } from "./okta-oauth";
import { toRelativeUrl } from "@okta/okta-auth-js";
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

async function handleOktaLoginCallback() {
  try {
    await oktaAuth.handleLoginRedirect();
    const tokens = await oktaAuth.tokenManager.getTokens();

    if (tokens) {
      window.history.replaceState({}, document.title, "/");
    } else {
      window.history.replaceState({}, document.title, "/");
    }
  } catch (error) {
    console.error("Okta login callback error:", error);
    window.history.replaceState({}, document.title, "/");
  }
}

// Function to initialize Okta and start single-spa conditionally
async function initializeApp() {
  try {
    const isAuthenticated = await oktaAuth.isAuthenticated();

    if (isAuthenticated) {
      start();
    } else if (window.location.pathname.startsWith("/login/callback")) {
      await handleOktaLoginCallback();
      start();
    } else {
      const originalUri = toRelativeUrl(
        window.location.href,
        window.location.origin
      );
      oktaAuth.setOriginalUri(originalUri);
      oktaAuth.signInWithRedirect();
      return;
    }
  } catch (error) {
    console.error("Error initializing Okta:", error);
  }
}

initializeApp();
