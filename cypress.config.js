const {defineConfig} = require("cypress");

module.exports = defineConfig({
    projectId: 'kzi7g7',
    e2e: {
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
    },
});