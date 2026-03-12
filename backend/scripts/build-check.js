import("../src/server.js")
  .then(() => {
    console.log("Backend module graph loaded successfully.");
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
