import { toast } from "react-toastify";
import usePrefersDarkMode from "@/hooks/usePrefersDarkMode";

// Additional Configs (opts)
// You can also pass valid ReactToast params to override the defaults.
// clear: false, // Will dismiss all visible toasts before rendering next toast
const showToast = (message, type = "default", opts = {}) => {
  const prefersDarkMode = usePrefersDarkMode();
  const options = {
    position: "bottom-right", // Sie können dies ändern, z.B. "top-right"
    autoClose: 5000, // Dauer in Millisekunden
    hideProgressBar: false, // Auf true setzen, um die Fortschrittsleiste auszublenden
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: prefersDarkMode ? "dark" : "light",
    // Fügen Sie hier benutzerdefinierte Stile hinzu
    style: {
      backgroundColor: prefersDarkMode ? "#333" : "#fff",
      color: prefersDarkMode ? "#fff" : "#333",
      borderRadius: "8px",
      // Weitere CSS-Eigenschaften...
    },
    ...opts,
  };

  if (opts?.clear === true) toast.dismiss();

  switch (type) {
    case "success":
      toast.success(message, options);
      break;
    case "error":
      toast.error(message, options);
      break;
    case "info":
      toast.info(message, options);
      break;
    case "warning":
      toast.warn(message, options);
      break;
    default:
      toast(message, options);
  }
};

export default showToast;
