# WebteamSharedClient

✨ **This workspace has been generated by [Nx, a Smart, fast and extensible build system.](https://nx.dev)** ✨

## Development server

To serve your application during development, run the command `npm start`. If you want to serve your application with a local backend, use the command `npm run start-local`.

## Understand this workspace

Run `npx nx graph` to see a diagram of the dependencies of the projects.

## Scripts

This workspace uses a variety of scripts for running the development server, building the application, testing, linting, and more:

- `npm start`: Serve the application for development.
- `npm run start-local`: Serve the application with a local backend.
- `npm run start-dev`: Serve the application locally using the development environment backend.
- `npm run start-qa`: Serve the application locally using the QA environment backend.
- `npm run start-test`: Serve the application locally using the test environment backend.
- `npm run build`: Build the application for production.
- `npm run build-dev`: Build the application for development.
- `npm run build-qa`: Build the application for QA.
- `npm run build-test`: Build the application for testing.
- `npm run build-prod`: Build the application for production.
- `npm test`: Run tests.
- `npm run lint`: Lint the project.
- `npm run format:write`: Format the code.
- `npm run format:check`: Check the code formatting.
- `npm run reset`: Reset the Nx cache.
- `npm run affected:apps`: Print affected applications.
- `npm run affected:manifest`: Print affected manifest.

## Dependencies

This workspace uses a variety of libraries and frameworks:

- `fullcalendar`: FullCalendar is a powerful and fully-featured calendar component, highly customizable and includes multiple plugins for varied functionality. It's flexible enough to fetch events on-the-fly and is themeable to match your application style.

- `@fortawesome (Font Awesome)`: Font Awesome provides a collection of scalable vector icons that can be customized with CSS. They are used across the monorepo to standardize the icons used in the UI while keeping the style consistent.

- `bootstrap`: Bootstrap is a widely used HTML and CSS framework for developing responsive, mobile-first projects on the web. This monorepo uses only the CSS part of Bootstrap, while the functionality which requires JS is made available in the `@webteam-shared-client/shared/ui-shared` library.

- `ag-grid`: ag-Grid is a feature-rich datagrid designed for the major JavaScript Frameworks. It provides a generic way to display and interact with data in a tabular format, offering functions like sorting, filtering, grouping, and more out of the box.

- `primeng`: While PrimeNG is a library for Angular with rich UI components, it's preferred to use ag-grid and bootstrap. This is because the PrimeNG upgrade process with each version of Angular can be time-consuming. Both bootstrap and ag-grid were chosen as they have a release cycle that's not tightly coupled with Angular, which makes upgrades more manageable.

## Shared Libraries

This workspace has several shared libraries that are used across applications:

- `@webteam-shared-client/shared/environments`: This library helps manage environment configuration for different settings for your local, development, QA, and production environments. This configuration includes settings like API endpoints, feature flags, and other environment-specific variables.

- `@webteam-shared-client/shared/auth`: This library provides a centralized authentication and authorization service. It contains the required guards, interceptors, components, and services for authentication and authorization.

- `@webteam-shared-client/shared/state`: This library provides a simple state management library. It is pre-configured to store User as CurrentUser using `oidc-client` and also includes an `isLoading` state for tracking loading states across the application.

## Pipeline Deployment and Linting

### Pipeline Deployment

This workspace uses a custom Nx executor named `manifest`. This executor handles the task of building each app in the workspace and deploying it to the correct environment in the pipeline. It ensures that the right environment settings are used during the build process and that each app is built optimally for its target environment.

### Linting

Linting in the project is done using ESLint along with the Prettier formatter. Linting helps in maintaining a consistent code style across the workspace. Use `npm run lint` to check for lint errors, and `npm run format:write` to automatically fix many common formatting issues.

## Further help

I'm Marry Poppins Y'all!