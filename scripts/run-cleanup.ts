import { purgeExpiredData } from "../src/lib/retention";

purgeExpiredData()
  .then((result) => {
    console.log(`Purged ${result.bookingsDeleted} booking(s), ${result.holdsDeleted} expired hold(s).`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
