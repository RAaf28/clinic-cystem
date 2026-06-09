const app = require("./app");
const { testConnection } = require("./src/config/db");
require("dotenv").config();
const PORT = process.env.PORT || 5000;
/**
 * Start server setelah koneksi database berhasil
 */
const startServer = async () => {
  // Test koneksi database terlebih dahulu
  await testConnection();
  app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`http://localhost:${PORT}/api/health`);
  });
};
startServer();
