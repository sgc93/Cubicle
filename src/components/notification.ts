
let notifBox: HTMLDivElement | null = null;
let notifMsgBox: HTMLSpanElement | null = null;

export const addNotification = (msg: string) => {
  if (notifBox && notifMsgBox) {
    notifMsgBox.innerHTML = "";
    notifMsgBox.innerHTML = msg;
    notifBox.classList.remove("notif-hidden");
    notifBox.classList.add("notif-shown");

    const timeoutId = setTimeout(() => {
      if (notifBox && notifMsgBox) {
        notifMsgBox.innerHTML = "";

        notifBox.classList.remove("notif-shown");
        notifBox.classList.add("notif-hidden");
      }
    }, 4000);

    () => clearTimeout(timeoutId);
  }
};

const initNotifUi = () => {
  notifBox = document.getElementById("notif-box") as HTMLDivElement;
  notifMsgBox = document.getElementById("notif-msg-box") as HTMLDivElement;
};

initNotifUi();
