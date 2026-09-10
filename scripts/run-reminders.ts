import { dispatchDueReminders } from "../src/lib/reminders";

dispatchDueReminders()
  .then((sent) => {
    console.log(`Dispatched ${sent} reminder(s).`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
