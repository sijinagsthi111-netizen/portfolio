/**
 * Application Configuration
 * Replace SPLINE_SCENE_URL with your own Spline scene URL (e.g., from Spline Community).
 * Leave empty or set to placeholder to use the sleek procedural 3D robot fallback.
 */
export const SPLINE_SCENE_URL = "https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode";

/**
 * Optional Formspree or EmailJS endpoint for the contact form.
 * If empty, the contact form will show a local success state.
 */
export const CONTACT_FORM_ENDPOINT = import.meta.env.VITE_CONTACT_FORM_ENDPOINT || "";
